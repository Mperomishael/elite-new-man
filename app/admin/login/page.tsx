"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup, onAuthStateChanged } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { isAdminByEmail, createAdminRecord, ADMIN_EMAILS } from "@/lib/admin-service"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  // Start false — don't block UI while checking
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const didRedirect = useRef(false)

  // Only check once on mount — if already a verified admin, skip login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.email && !didRedirect.current) {
        const ok = await isAdminByEmail(user.email)
        if (ok) {
          didRedirect.current = true
          router.replace("/admin")
          return
        }
      }
      setIsCheckingAuth(false)
      // Unsubscribe after first check — we don't want ongoing listener here
      unsubscribe()
    })
    // Safety: show login form after 3s even if Firebase is slow
    const timer = setTimeout(() => setIsCheckingAuth(false), 3000)
    return () => {
      clearTimeout(timer)
    }
  }, [router])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      if (!user.email) {
        setMessage({ type: "error", text: "Could not retrieve email from Google account." })
        await auth.signOut()
        setIsLoading(false)
        return
      }

      console.log("[admin-login] Signed in as:", user.email)
      console.log("[admin-login] Approved emails:", ADMIN_EMAILS)

      const isAdmin = await isAdminByEmail(user.email)
      console.log("[admin-login] isAdmin result:", isAdmin)

      if (!isAdmin) {
        setMessage({
          type: "error",
          text: `Access denied. "${user.email}" is not an approved admin.`,
        })
        await auth.signOut()
        setIsLoading(false)
        return
      }

      // Write admin record — fire and don't await to avoid blocking redirect
      createAdminRecord(user.uid, user.email, user.displayName || user.email).catch(console.error)

      setMessage({ type: "success", text: "Admin verified! Entering dashboard…" })
      didRedirect.current = true
      // Small delay so user sees the success message, then hard navigate
      setTimeout(() => {
        window.location.href = "/admin"
      }, 600)

    } catch (error: any) {
      console.error("[admin-login] Error:", error)

      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        setIsLoading(false)
        return
      }

      let msg = "Authentication failed. Please try again."
      if (error.code === "auth/popup-blocked") msg = "Popup was blocked. Please allow popups for this site and try again."
      else if (error.code === "auth/network-request-failed") msg = "Network error. Check your connection."
      else if (error.code === "auth/operation-not-allowed") msg = "Google Sign-In is not enabled in Firebase Console."
      else if (error.message) msg = error.message

      setMessage({ type: "error", text: msg })
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <p className="text-neutral-400 text-sm">Checking session…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://i.ibb.co/DPWT64HW/file-00000000899871f49095bc51ed0ef7c0.png"
            alt="Elite Block Market"
            className="w-28 h-28 mx-auto drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]"
          />
          <p className="text-amber-500 text-xs mt-3 uppercase tracking-widest font-semibold">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 justify-center mb-1">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-white">Secure Admin Login</h2>
          </div>
          <p className="text-neutral-400 text-sm text-center mb-8">
            Sign in with your approved Google account
          </p>

          {message && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                message.type === "success"
                  ? "bg-lime-400/10 border border-lime-400/30"
                  : "bg-red-500/10 border border-red-500/30"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${message.type === "success" ? "text-lime-300" : "text-red-300"}`}>
                {message.text}
              </p>
            </div>
          )}

          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-neutral-700" />
                Signing in…
              </>
            ) : (
              <>
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <div className="mt-6 text-center">
            <a href="/auth/login" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
              ← Back to user login
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-600 mt-4">
          Only pre-approved email addresses can access this panel.
        </p>
      </div>
    </div>
  )
}
