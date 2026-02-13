"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Settings, CheckCircle2, AlertCircle, Loader2, UserCheck } from "lucide-react"
import type { UserProfile } from "@/lib/auth-service"

export function SetupControls({ adminId }: { adminId: string }) {
  const [setupStats, setSetupStats] = useState({
    totalUsers: 0,
    onboardingCompleted: 0,
    onboardingPending: 0,
  })
  const [pendingUsers, setPendingUsers] = useState<(UserProfile & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    loadSetupStats()
  }, [])

  const loadSetupStats = async () => {
    try {
      setLoading(true)
      // Get all users
      const usersSnapshot = await getDocs(collection(db, "users"))
      const allUsers = usersSnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile & { id: string }))

      const completed = allUsers.filter((u) => u.onboardingCompleted).length
      const pending = allUsers.filter((u) => !u.onboardingCompleted).length

      setSetupStats({
        totalUsers: allUsers.length,
        onboardingCompleted: completed,
        onboardingPending: pending,
      })

      setPendingUsers(allUsers.filter((u) => !u.onboardingCompleted))
    } catch (error: any) {
      console.error("[v0] Error loading setup stats:", error)
      setMessage({ type: "error", text: "Failed to load setup statistics" })
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteOnboarding = async (userId: string, userName: string) => {
    setActionLoading(userId)
    try {
      // Get user's current profile
      const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", userId)))
      if (userDoc.empty) {
        setMessage({ type: "error", text: "User not found" })
        return
      }

      const userRef = doc(db, "users", userDoc.docs[0].id)
      await updateDoc(userRef, {
        onboardingCompleted: true,
      })

      setMessage({ type: "success", text: `Onboarding marked complete for ${userName}` })
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId))
      setSetupStats((prev) => ({
        ...prev,
        onboardingPending: prev.onboardingPending - 1,
        onboardingCompleted: prev.onboardingCompleted + 1,
      }))
    } catch (error: any) {
      console.error("[v0] Error completing onboarding:", error)
      setMessage({ type: "error", text: "Failed to complete onboarding" })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-white">Setup Controls</h2>
        </div>
        <p className="text-slate-400">Manage user onboarding and profile completion status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white mt-1">{setupStats.totalUsers}</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Onboarding Complete</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{setupStats.onboardingCompleted}</p>
            </div>
            <div className="bg-emerald-500/20 p-3 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Pending Setup</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">{setupStats.onboardingPending}</p>
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`rounded-lg p-4 flex items-start gap-3 ${
            message.type === "success"
              ? "bg-emerald-500/20 border border-emerald-500/50"
              : "bg-red-500/20 border border-red-500/50"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <p className={message.type === "success" ? "text-emerald-400" : "text-red-400"}>{message.text}</p>
        </div>
      )}

      {/* Pending Users List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Users Awaiting Onboarding</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            <span className="ml-2 text-slate-400">Loading users...</span>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-white font-semibold">All users have completed onboarding!</p>
            <p className="text-slate-400 text-sm mt-1">Great job keeping your platform up to date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{user.displayName || user.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>Email: {user.email}</span>
                    {user.phone && <span>Phone: {user.phone}</span>}
                    {user.country && <span>Country: {user.country}</span>}
                  </div>
                  <p className="text-xs text-yellow-500 mt-2 font-medium">Missing address and phone</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-yellow-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-yellow-400">
                    Pending
                  </div>
                  <button
                    onClick={() => handleCompleteOnboarding(user.uid, user.displayName || user.email)}
                    disabled={actionLoading === user.id}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                  >
                    {actionLoading === user.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Marking...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Complete
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <p className="text-slate-300 text-sm">
          <span className="font-semibold">Note:</span> Users should complete their onboarding through the onboarding modal
          when they first access the dashboard. Use the "Mark Complete" button only for testing or to manually assist users
          who have already provided their information.
        </p>
      </div>
    </div>
  )
}
