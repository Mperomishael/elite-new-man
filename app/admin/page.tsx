"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged, signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { isAdminByEmail, createAdminRecord } from "@/lib/admin-service"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { Button } from "@/components/ui/button"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminId, setAdminId] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const adminStatus = await isAdminByEmail(user.email)
        if (adminStatus) {
          // Create admin record in Firestore if doesn't exist
          await createAdminRecord(user.uid, user.email)
          setIsAdminUser(true)
          setAdminId(user.uid)
          setIsAuthenticated(true)
        } else {
          setIsAdminUser(false)
          setIsAuthenticated(true)
        }
      } else {
        setIsAuthenticated(false)
        setIsAdminUser(false)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      if (user.email && (await isAdminByEmail(user.email))) {
        await createAdminRecord(user.uid, user.email)
        setIsAdminUser(true)
        setAdminId(user.uid)
        setIsAuthenticated(true)
      } else {
        setError("Access denied. Your email is not authorized for admin access.")
        await auth.signOut()
      }
    } catch (error: any) {
      console.error("[v0] Google sign-in error:", error)
      setError("Failed to sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-amber-500/20 rounded-lg p-8 max-w-md w-full text-center">
          <img
            src="/images/design-mode/Whats-App-Image-2025-10-10-at-8-45-37-AM-1-removebg-preview-1.png"
            alt="UltimateStckTrader Logo"
            className="w-32 h-32 mx-auto mb-6 object-contain"
          />
          <h2 className="text-2xl font-bold text-white mb-2">Admin Login</h2>
          <p className="text-slate-400 mb-6">Sign in with your authorized Google account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 text-slate-900 font-semibold px-6 py-6 rounded-lg transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </div>
      </div>
    )
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-500/20 rounded-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-6">You do not have permission to access the admin panel</p>
          <Button
            onClick={() => auth.signOut()}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Sign Out
          </Button>
        </div>
      </div>
    )
  }

  return <AdminDashboard adminId={adminId} />
}
