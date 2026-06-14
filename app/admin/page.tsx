"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { isAdminByEmail } from "@/lib/admin-service"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  const [status, setStatus] = useState<"loading" | "ok" | "denied" | "nouser">("loading")
  const [adminId, setAdminId] = useState("")

  useEffect(() => {
    // Hard timeout — if Firebase takes more than 5s, show denied rather than spin forever
    const timeout = setTimeout(() => {
      setStatus((s) => (s === "loading" ? "nouser" : s))
    }, 5000)

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeout)

      if (!user || !user.email) {
        setStatus("nouser")
        return
      }

      console.log("[admin] Auth user:", user.email)

      // Check entirely in memory — no Firestore round-trip needed here
      const ok = await isAdminByEmail(user.email)
      console.log("[admin] isAdmin:", ok)

      if (ok) {
        setAdminId(user.uid)
        setStatus("ok")
      } else {
        setStatus("denied")
      }
    })

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/30" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
          </div>
          <p className="text-neutral-400 text-sm tracking-wide">Loading Admin Panel…</p>
        </div>
      </div>
    )
  }

  if (status === "nouser") {
    // Not signed in — hard redirect to admin login
    if (typeof window !== "undefined") window.location.href = "/admin/login"
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-neutral-400 text-sm">Redirecting to login…</p>
      </div>
    )
  }

  if (status === "denied") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-red-500/30 rounded-2xl p-8 max-w-md text-center space-y-4">
          <p className="text-red-400 font-semibold">Access Denied</p>
          <p className="text-neutral-400 text-sm">Your account is not authorised to access the admin panel.</p>
          <a
            href="/auth/login"
            className="inline-block mt-2 px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm transition-colors"
          >
            Go to User Login
          </a>
        </div>
      </div>
    )
  }

  return <AdminDashboard adminId={adminId} />
}
