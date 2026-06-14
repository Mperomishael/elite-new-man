"use client"

import { Mail, Send, MessageSquare, Clock, MessageCircle, Loader, Phone } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { collection, query, where, onSnapshot, addDoc, Timestamp, type Unsubscribe } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getAdminWalletSettings } from "@/lib/admin-service"

interface Message {
  id: string
  userId: string
  username: string
  message: string
  timestamp: number
  isAdminReply: boolean
}

interface SupportViewProps {
  userId?: string
  username?: string
}

export function SupportView({ userId, username }: SupportViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [subject, setSubject] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [supportPhone, setSupportPhone] = useState("")

  useEffect(() => {
    const loadContactSettings = async () => {
      try {
        const settings = await getAdminWalletSettings()
        if (settings?.whatsappNumber) setWhatsappNumber(settings.whatsappNumber)
        if (settings?.supportPhone) setSupportPhone(settings.supportPhone)
      } catch (err) {
        console.error("[v0] Error loading support contact settings:", err)
      }
    }
    loadContactSettings()
  }, [])

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null

    if (userId) {
      try {
        const q = query(
          collection(db, "supportMessages"),
          where("userId", "==", userId)
        )
        unsubscribe = onSnapshot(q, (snapshot) => {
          const msgs: Message[] = []
          snapshot.forEach((doc) => {
            const data = doc.data()
            msgs.push({
              id: doc.id,
              userId: data.userId,
              username: data.username,
              message: data.message,
              timestamp: data.timestamp?.toMillis?.() || data.timestamp || Date.now(),
              isAdminReply: data.isAdminReply || false,
            })
          })
          msgs.sort((a, b) => a.timestamp - b.timestamp)
          setMessages(msgs)
          setLoading(false)
        })
      } catch (err) {
        console.error("[v0] Error loading messages:", err)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !username) {
      alert("Please enter a message")
      return
    }

    setSending(true)
    try {
      await addDoc(collection(db, "supportMessages"), {
        userId,
        username,
        message: newMessage,
        timestamp: Timestamp.now(),
        isAdminReply: false,
        subject: subject || "General Inquiry",
      })
      setNewMessage("")
      setSubject("")
    } catch (err) {
      console.error("[v0] Error sending message:", err)
      alert("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const whatsappMessage = "Hello, USTrader, I need help"

  const handleWhatsAppClick = () => {
    if (!whatsappNumber) return
    const encodedMessage = encodeURIComponent(whatsappMessage)
    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodedMessage}`, "_blank")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-8 h-8 text-lime-400" />
        <div>
          <h2 className="text-2xl font-bold">Customer Support</h2>
          <p className="text-sm text-neutral-400">Chat with our support team in real-time</p>
        </div>
      </div>

      {/* Chat Interface */}
      {userId ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 flex flex-col h-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="w-6 h-6 text-amber-500 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-neutral-400">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Send a message to get started!</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isAdminReply ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.isAdminReply
                        ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                        : "bg-lime-500 text-white"
                    }`}
                  >
                    {msg.isAdminReply && (
                      <p className="text-xs font-semibold text-lime-400 mb-1">Support Team</p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="space-y-3 border-t border-neutral-800 pt-4">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (optional)"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="bg-lime-400 hover:bg-lime-500 disabled:bg-neutral-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
              >
                {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center text-neutral-400">
          <p>Please log in to access chat support</p>
        </div>
      )}

      {/* Contact Info */}
      <div className="grid grid-cols-1 gap-3">
        {whatsappNumber && (
          <button
            onClick={handleWhatsAppClick}
            className="bg-gradient-to-br from-green-600 to-lime-500 hover:from-green-700 hover:to-lime-700 rounded-2xl p-5 flex items-center gap-4 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs text-green-100">WhatsApp Support</p>
              <p className="font-semibold text-white">{whatsappNumber}</p>
            </div>
          </button>
        )}

        {supportPhone && (
          <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-100">Call Us</p>
              <p className="font-semibold text-white">{supportPhone}</p>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-blue-100">Email Us</p>
            <p className="font-semibold text-white">support@Elite Block Market.online</p>
          </div>
        </div>

        <div className="bg-neutral-700/50 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-lime-400/20 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <p className="text-xs text-neutral-400">Response Time</p>
            <p className="font-semibold text-white">Within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  )
}
