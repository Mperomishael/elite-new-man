"use client"

import { useState, useEffect, useRef } from "react"
import { collection, query, onSnapshot, addDoc, Timestamp, where, type Unsubscribe } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Send, MessageSquare, Loader, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SupportMessage {
  id: string
  userId: string
  username: string
  message: string
  timestamp: number
  isAdminReply: boolean
  subject?: string
}

interface AdminMessagesProps {
  adminId: string
}

export function AdminMessages({ adminId }: AdminMessagesProps) {
  const [conversations, setConversations] = useState<Record<string, SupportMessage[]>>({})
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null

    try {
      const q = query(collection(db, "supportMessages"))
      unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs: Record<string, SupportMessage[]> = {}

        snapshot.forEach((doc) => {
          const data = doc.data()
          const userId = data.userId

          if (!msgs[userId]) {
            msgs[userId] = []
          }

          msgs[userId].push({
            id: doc.id,
            userId: data.userId,
            username: data.username,
            message: data.message,
            timestamp: data.timestamp?.toMillis?.() || data.timestamp || Date.now(),
            isAdminReply: data.isAdminReply || false,
            subject: data.subject,
          })
        })

        // Sort messages within each conversation
        Object.keys(msgs).forEach((userId) => {
          msgs[userId].sort((a, b) => a.timestamp - b.timestamp)
        })

        setConversations(msgs)
        setLoading(false)
      })
    } catch (err) {
      console.error("[v0] Error loading messages:", err)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversations, selectedUser])

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedUser) {
      return
    }

    setSending(true)
    try {
      // Find the user's last message to get their username
      const userMessages = conversations[selectedUser] || []
      const username = userMessages[0]?.username || "Unknown User"

      await addDoc(collection(db, "supportMessages"), {
        userId: selectedUser,
        username,
        message: replyMessage,
        timestamp: Timestamp.now(),
        isAdminReply: true,
        sentBy: adminId,
      })

      setReplyMessage("")
    } catch (err) {
      console.error("[v0] Error sending reply:", err)
      alert("Failed to send reply")
    } finally {
      setSending(false)
    }
  }

  const selectedMessages = selectedUser ? conversations[selectedUser] || [] : []
  const unreadCount = Object.values(conversations).reduce(
    (count, msgs) => count + msgs.filter((m) => !m.isAdminReply).length,
    0
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 lime-400 border-t-transparent rounded-full animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Customer Messages</h2>
        <p className="text-sm text-slate-400">
          {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}` : "No new messages"}
        </p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-96 lg:h-96">
        {/* Conversations List */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-auto">
          {Object.entries(conversations).length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {Object.entries(conversations).map(([userId, msgs]) => {
                const hasUnread = msgs.some((m) => !m.isAdminReply)
                const lastMsg = msgs[msgs.length - 1]
                const username = msgs[0]?.username || "Unknown User"

                return (
                  <button
                    key={userId}
                    onClick={() => setSelectedUser(userId)}
                    className={`w-full p-4 text-left transition-colors ${
                      selectedUser === userId
                        ? "bg-emerald-500/20 border-l-2 border-emerald-500"
                        : "hover:bg-slate-800"
                    }`}
                  >
                    <p className="font-semibold text-white flex items-center justify-between">
                      {username}
                      {hasUnread && (
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 truncate">
                      {lastMsg?.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(lastMsg?.timestamp || 0).toLocaleTimeString()}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Messages Chat */}
        {selectedUser ? (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div>
                <p className="font-semibold text-white">{selectedMessages[0]?.username}</p>
                <p className="text-xs text-slate-400">{selectedMessages.length} messages</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isAdminReply ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.isAdminReply
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 text-slate-100 border border-slate-700"
                    }`}
                  >
                    {msg.isAdminReply && (
                      <p className="text-xs font-semibold text-lime-200 mb-1">You</p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendReply()}
                placeholder="Type your reply..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSendReply}
                disabled={sending || !replyMessage.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-slate-400">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
