"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { isAdminByEmail, createAdminRecord } from "@/lib/admin-service"
import { Button } from "@/components/ui/button"
import { DollarSign, Loader2, AlertCircle, CheckCircle } from "lucide-react"

const APPROVED_ADMIN_EMAILS = ["empiredigitalsworldwide@gmail.com", "bigdrem35@gmail.com"]

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      if (!user.email) {
        setMessage({ type: "error", text: "Could not retrieve email from Google account" })
        setIsLoading(false)
        return
      }

      // Check if email is in approved admin list
      const isAdmin = await isAdminByEmail(user.email)

      if (!isAdmin) {
        setMessage({
          type: "error",
          text: `Access denied. Email ${user.email} is not authorized as an admin.`,
        })
        // Sign out the user since they're not approved
        await auth.signOut()
        setIsLoading(false)
        return
      }

      // Create/update admin record
      await createAdminRecord(user.uid, user.email)

      setMessage({ type: "success", text: "Admin authentication successful! Redirecting..." })
      setTimeout(() => {
        router.push("/admin")
      }, 1000)
    } catch (error: any) {
      console.error("[v0] Google admin login error:", error)
      let errorMessage = "Failed to sign in with Google"

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in popup was closed"
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "Sign-in request was cancelled"
      }

      setMessage({ type: "error", text: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <img
                src="https://i.ibb.co/DPWT64HW/file-00000000899871f49095bc51ed0ef7c0.png"
                alt="Elite Block Market"
                className="w-14 h-14 object-contain"
              />
              <h1 className="text-3xl font-bold text-white">
                Elite Block<br /><span className="text-lime-400">Market</span>
              </h1>
            </div>
            <p className="text-neutral-400">Admin Dashboard Access</p>
          </div>

          {/* Login Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white text-center mb-2">Admin Portal</h2>
            <p className="text-neutral-400 text-center text-sm mb-8">
              Sign in with your approved Google account to access the admin dashboard
            </p>

            {/* Message Display */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                  message.type === "success"
                    ? "bg-lime-400/10 border border-lime-400/30"
                    : "bg-red-500/10 border border-red-500/30"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-lime-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
                )}
                <p className={`text-sm ${message.type === "success" ? "text-lime-300" : "text-red-300"}`}>
                  {message.text}
                </p>
              </div>
            )}

            {/* Google Login Button */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-lime-400 hover:bg-lime-500 text-black font-semibold text-base rounded-lg transition-all duration-300 hover:shadow-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
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
                  Sign in with Google
                </>
              )}
            </Button>
            <div className="mt-6 text-center">
              <a href="/" className="text-sm text-lime-400 hover:text-lime-300 transition-colors">
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
