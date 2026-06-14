"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { isAdminByEmail, createAdminRecord } from "@/lib/admin-service"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  const router = useRouter()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminId, setAdminId] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in - redirect to admin login
        router.push("/admin/login")
        setIsLoading(false)
        return
      }

      if (!user.email) {
        setError("Email not found on user account")
        setIsLoading(false)
        return
      }

      const adminStatus = await isAdminByEmail(user.email)
      if (adminStatus) {
        // Create/update admin record
        await createAdminRecord(user.uid, user.email, user.displayName || user.email)
        setIsAdminUser(true)
        setAdminId(user.uid)
        setError("")
      } else {
        // Not an admin - redirect to user dashboard
        setError("Access denied. Redirecting to dashboard...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-red-500/20 rounded-lg p-8 max-w-md text-center">
          <p className="text-neutral-400 mb-6">{error}</p>
        </div>
      </div>
    )
  }

  if (!isAdminUser) {
    return null
  }

  return <AdminDashboard adminId={adminId} />
}
