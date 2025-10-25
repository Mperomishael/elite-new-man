"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, DollarSign, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { signInWithEmail, auth } from "@/lib/auth-service"
import { sendPasswordResetEmail } from "firebase/auth"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  type LoginForm = { email: string; password: string }
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  })
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setFormData((prev: LoginForm) => ({ ...(prev as LoginForm), [field]: value } as LoginForm))
    if (errors[field as string]) {
      setErrors((prev: Record<string, string>) => ({ ...(prev as Record<string, string>), [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleForgotPassword = async () => {
    // Use the email value in the form; prompt user if empty
    if (!formData.email || !formData.email.trim()) {
      setMessage({ type: "error", text: "Please enter your email above to receive a password reset link." })
      return
    }

    setIsLoading(true)
    setMessage(null)
    try {
      await sendPasswordResetEmail(auth, formData.email)
      setMessage({ type: "success", text: "Password reset email sent. Check your inbox." })
    } catch (error: any) {
      console.error("[v0] Password reset error:", error)
      let errText = "Failed to send password reset email."
      if (error?.code === "auth/user-not-found") errText = "No account found with this email."
      setMessage({ type: "error", text: errText })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await signInWithEmail(formData.email, formData.password)

      if (result.success && result.userProfile) {
        setMessage({ type: "success", text: "Login successful!" })
        setTimeout(() => {
          router.push("/")
        }, 1000)
      } else {
        setMessage({ type: "error", text: result.error || "Login failed" })
      }
    } catch (error: any) {
      console.error("[v0] Auth error:", error)
      setMessage({ type: "error", text: "An unexpected error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A2E3C] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 py-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">UltimateStockTrade</h1>
            </div>
          </div>

          <div className="bg-[#0A2E3C] border-2 border-teal-700/50 rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white text-center mb-6">Welcome Back</h2>

            {message && (
              <div
                className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  message.type === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={`transition-all duration-300 ${focusedField === "email" ? "scale-[1.01]" : ""}`}>
                <Label htmlFor="email" className="text-white text-sm mb-1.5 block font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className={`bg-white border-0 text-slate-900 h-11 rounded-lg transition-all duration-300 placeholder:text-slate-400 ${
                    focusedField === "email" ? "ring-2 ring-amber-500 shadow-lg shadow-amber-500/20" : ""
                  } ${errors.email ? "ring-2 ring-red-500" : ""}`}
                  placeholder="Email"
                  disabled={isLoading}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className={`transition-all duration-300 ${focusedField === "password" ? "scale-[1.01]" : ""}`}>
                <Label htmlFor="password" className="text-white text-sm mb-1.5 block font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("password", e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className={`bg-white border-0 text-slate-900 h-11 rounded-lg pr-10 transition-all duration-300 placeholder:text-slate-400 ${
                      focusedField === "password" ? "ring-2 ring-amber-500 shadow-lg shadow-amber-500/20" : ""
                    } ${errors.password ? "ring-2 ring-red-500" : ""}`}
                    placeholder="Password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className="text-sm text-amber-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <span className="text-white text-sm">Don't have an account? </span>
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-sm ml-2 inline-block"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}