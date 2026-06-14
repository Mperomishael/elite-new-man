"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signInWithRedirect, getRedirectResult } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { isAdminByEmail, createAdminRecord, ADMIN_EMAILS } from "@/lib/admin-service"
import { Button } from "@/components/ui/button"
import { DollarSign, Loader2, AlertCircle, CheckCircle } from "lucide-react"

const APPROVED_ADMIN_EMAILS = ADMIN_EMAILS

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check for redirect result on page load
  useEffect(() => {
    let isMounted = true

    const checkRedirectResult = async () => {
      try {
        console.log("[v0] Checking redirect result...")
        const result = await getRedirectResult(auth)
        console.log("[v0] Redirect result:", result?.user?.email || "No user")
        
        if (!isMounted) return
        
        if (result && result.user) {
          console.log("[v0] User authenticated:", result.user.email)
          setIsLoading(true)
          await handleAuthSuccess(result.user)
        } else {
          console.log("[v0] No redirect result, user not authenticated yet")
        }
      } catch (error: any) {
        console.error("[v0] Redirect result error:", error.message || error)
        if (isMounted) {
          setMessage({ type: "error", text: `Error: ${error.message || "Authentication failed"}` })
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false)
        }
      }
    }

    checkRedirectResult()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleAuthSuccess = async (user: any) => {
    try {
      if (!user.email) {
        console.error("[v0] No email in user object")
        setMessage({ type: "error", text: "Could not retrieve email from Google account" })
        setIsLoading(false)
        return
      }

      console.log("[v0] Google user authenticated:", user.email)

      // Check if email is in approved admin list
      console.log("[v0] Checking if user is admin...")
      const isAdmin = await isAdminByEmail(user.email)
      console.log("[v0] isAdmin result:", isAdmin)

      if (!isAdmin) {
        console.log("[v0] User not authorized as admin:", user.email)
        setMessage({
          type: "error",
          text: `Access denied. Email ${user.email} is not authorized as an admin.`,
        })
        // Sign out the user since they're not approved
        await auth.signOut()
        setIsLoading(false)
        return
      }

      console.log("[v0] User is admin, creating admin record...")
      // Create/update admin record
      const result = await createAdminRecord(user.uid, user.email, user.displayName || user.email)
      console.log("[v0] Admin record creation result:", result)

      if (!result.success) {
        throw new Error(result.error || "Failed to create admin record")
      }

      console.log("[v0] Admin record created successfully, redirecting to dashboard...")
      setMessage({ type: "success", text: "Admin authentication successful! Redirecting..." })
      
      // Use router.push without timeout for immediate redirect
      router.push("/admin")
    } catch (error: any) {
      console.error("[v0] Auth success error:", error.message || error)
      setMessage({ type: "error", text: error.message || "An error occurred" })
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    setIsLoading(true)
    setMessage(null)

    try {
      // Use redirect instead of popup - bypasses popup blockers completely
      // User will be redirected to Google, then back to this page
      // The useEffect hook above will handle the redirect result
      signInWithRedirect(auth, googleProvider)
    } catch (error: any) {
      console.error("[v0] Google redirect error:", error)
      let errorMessage = "Failed to initiate Google Sign-In"

      if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection and try again."
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Google Sign-In is not enabled. Contact support."
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`
      }

      setMessage({ type: "error", text: errorMessage })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-logo-bounce-in">
            <img
              src="https://i.ibb.co/DPWT64HW/file-00000000899871f49095bc51ed0ef7c0.png"
              alt="Elite Block Market"
              className="w-20 h-20 mx-auto"
            />
          </div>

          {/* Login Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm animate-form-scale-in">
            {isCheckingAuth ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-lime-400 mb-4" />
                <p className="text-neutral-400 text-sm">Checking authentication...</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white text-center mb-2">Admin Portal</h2>
                <p className="text-neutral-400 text-center text-sm mb-8">
                  Sign in with your approved Google account to access the admin dashboard
                </p>
              </>
            )}

            {!isCheckingAuth && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
