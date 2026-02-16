"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Mail, DollarSign, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { signUpWithEmail } from "@/lib/auth-service"

const currencies = [
  "USD - US Dollar",
  "EUR - Euro",
  "GBP - British Pound",
  "JPY - Japanese Yen",
  "AUD - Australian Dollar",
  "CAD - Canadian Dollar",
  "CHF - Swiss Franc",
  "CNY - Chinese Yuan",
  "INR - Indian Rupee",
  "MXN - Mexican Peso",
  "BRL - Brazilian Real",
  "ZAR - South African Rand",
  "RUB - Russian Ruble",
  "KRW - South Korean Won",
  "SGD - Singapore Dollar",
  "HKD - Hong Kong Dollar",
  "NOK - Norwegian Krone",
  "SEK - Swedish Krona",
  "DKK - Danish Krone",
  "NZD - New Zealand Dollar",
]

const countries = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", 
  "Brazil", "Canada", "Chile", "China", "Colombia", "Denmark", "Egypt", "Finland", "France", "Germany",
  "Ghana", "Greece", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan",
  "Kenya", "Liberia", "Madagascar", "Malaysia", "Mexico", "Morocco", "Netherlands", "New Zealand",
  "Nigeria", "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Russia",
  "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland",
  "Thailand", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Vietnam"
].sort()

export default function SignUpPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  type SignupForm = {
    firstName: string
    lastName: string
    username: string
    email: string
    password: string
    confirmPassword: string
    currency: string
    country: string
    phone: string
  }

  const [formData, setFormData] = useState<SignupForm>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    currency: "",
    country: "",
    phone: "",
  })
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof SignupForm, value: string) => {
    setFormData((prev: SignupForm) => ({ ...(prev as SignupForm), [field]: value } as SignupForm))
    if (errors[field as string]) {
      setErrors((prev: Record<string, string>) => ({ ...(prev as Record<string, string>), [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.username.trim()) newErrors.username = "Username is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.currency) newErrors.currency = "Please select a currency"
    if (!formData.country) newErrors.country = "Please select a country"
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await signUpWithEmail(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        phone: formData.phone,
        currency: formData.currency || "USD - US Dollar",
        country: formData.country || "United States",
      })

      if (result.success) {
        setShowSuccessMessage(true)
        setMessage({ type: "success", text: "Account created successfully! Redirecting to dashboard..." })
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        let errorMessage = result.error || "Sign up failed. Please try again."
        
        if (result.error?.includes("email-already-in-use")) {
          errorMessage = "This email is already registered. Please sign in or use a different email."
        } else if (result.error?.includes("weak-password")) {
          errorMessage = "Password is too weak. Use at least 6 characters with letters and numbers."
        } else if (result.error?.includes("invalid-email")) {
          errorMessage = "Please enter a valid email address."
        } else if (result.error?.includes("network")) {
          errorMessage = "Network error. Please check your connection and try again."
        }
        
        setMessage({ type: "error", text: errorMessage })
      }
    } catch (error: any) {
      console.error("[v0] Auth error:", error)
      let errorMessage = "An unexpected error occurred. Please try again."
      
      if (error.message?.includes("Firebase")) {
        errorMessage = "Firebase connection error. Check your internet connection."
      }
      
      setMessage({ type: "error", text: errorMessage })
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
            <h2 className="text-xl font-semibold text-white text-center mb-2">Create an account</h2>
            <p className="text-xs text-slate-400 text-center mb-6">Join UltimateStockTrade and start trading today</p>

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

            {/* Tips Section */}
            <div className="mb-6 bg-blue-900/20 border border-blue-800/50 rounded-lg p-3">
              <p className="text-xs text-blue-300 font-semibold mb-2">Setup Tips:</p>
              <ul className="text-xs text-blue-200 space-y-1">
                <li>• Use a unique username you'll remember</li>
                <li>• Password must be at least 6 characters</li>
                <li>• Phone number will help with account recovery</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={`transition-all duration-300 ${focusedField === "firstName" ? "scale-[1.01]" : ""}`}>
                <Label htmlFor="firstName" className="text-white text-sm mb-1.5 block font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("firstName", e.target.value)}
                  onFocus={() => setFocusedField("firstName")}
                  onBlur={() => setFocusedField(null)}
                  className={`bg-white border-0 text-slate-900 h-11 rounded-lg transition-all duration-300 placeholder:text-slate-400 ${
                    focusedField === "firstName" ? "ring-2 ring-amber-500 shadow-lg shadow-amber-500/20" : ""
                  } ${errors.firstName ? "ring-2 ring-red-500" : ""}`}
                  placeholder="First name"
                  disabled={isLoading}
                />
                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div className={`transition-all duration-300 ${focusedField === "lastName" ? "scale-[1.01]" : ""}`}>
                <Label htmlFor="lastName" className="text-white text-sm mb-1.5 block font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("lastName", e.target.value)}
                  onFocus={() => setFocusedField("lastName")}
                  onBlur={() => setFocusedField(null)}
                  className={`bg-white border-0 text-slate-900 h-11 rounded-lg transition-all duration-300 placeholder:text-slate-400 ${
                    focusedField === "lastName" ? "ring-2 ring-amber-500 shadow-lg shadow-amber-500/20" : ""
                  } ${errors.lastName ? "ring-2 ring-red-500" : ""}`}
                  placeholder="Last name"
                  disabled={isLoading}
                />
                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
              </div>

              <div className={`transition-all duration-300 ${focusedField === "username" ? "scale-[1.01]" : ""}`}>
                <Label htmlFor="username" className="text-white text-sm mb-1.5 block font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("username", e.target.value)}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  className={`bg-white border-0 text-slate-900 h-11 rounded-lg transition-all duration-300 placeholder:text-slate-400 ${
                    focusedField === "username" ? "ring-2 ring-amber-500 shadow-lg shadow-amber-500/20" : ""
                  } ${errors.username ? "ring-2 ring-red-500" : ""}`}
                  placeholder="Username"
                  disabled={isLoading}
                />
                {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
              </div>

              <div className={`transition-all duration-300 ${focusedField === "phone" ? "scale-[1.01]" : ""}`}>
                <Label htmlFor="phone" className="text-white text-sm mb-1.5 block font-medium">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("phone", e.target.value)}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  className={`bg-white border-0 text-slate-900 h-11 rounded-lg transition-all duration-300 placeholder:text-slate-400 ${
                    focusedField === "phone" ? "ring-2 ring-amber-500 shadow-lg shadow-amber-500/20" : ""
                  } ${errors.phone ? "ring-2 ring-red-500" : ""}`}
                  placeholder="Phone"
                  disabled={isLoading}
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

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

              <div className={`transition-all duration-300 ${focusedField === "currency" ? "scale-[1.01]" : ""}`}>
                <Label htmlFor="currency" className="text-white text-sm mb-1.5 block font-medium">
                  Account Currency
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value: string) => handleInputChange("currency", value)}
                  onOpenChange={(open: boolean) => setFocusedField(open ? "currency" : null)}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className={`bg-white border-0 text-slate-900 h-11 rounded-lg transition-all duration-300 ${
                      focusedField === "currency" ? "ring-2 ring-amber-500 shadow-lg shadow-amber-500/20" : ""
                    } ${errors.currency ? "ring-2 ring-red-500" : ""}`}
                  >
                    <SelectValue placeholder="US Dollar" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900 max-h-60">
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency} className="hover:bg-slate-100">
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && <p className="text-red-400 text-xs mt-1">{errors.currency}</p>}
              </div>

              <div className={`transition-all duration-300 ${focusedField === "country" ? "scale-[1.01]" : ""}`}>
                <Label htmlFor="country" className="text-white text-sm mb-1.5 block font-medium">
                  Country
                </Label>
                <Select
                  value={formData.country}
                  onValueChange={(value: string) => handleInputChange("country", value)}
                  onOpenChange={(open: boolean) => setFocusedField(open ? "country" : null)}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className={`bg-white border-0 text-slate-900 h-11 rounded-lg transition-all duration-300 ${
                      focusedField === "country" ? "ring-2 ring-amber-500 shadow-lg shadow-amber-500/20" : ""
                    } ${errors.country ? "ring-2 ring-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900 max-h-60">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country} className="hover:bg-slate-100">
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country}</p>}
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
              </div>

              <div className={`transition-all duration-300 ${focusedField === "confirmPassword" ? "scale-[1.01]" : ""}`}>
                <Label htmlFor="confirmPassword" className="text-white text-sm mb-1.5 block font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("confirmPassword", e.target.value)}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    className={`bg-white border-0 text-slate-900 h-11 rounded-lg pr-10 transition-all duration-300 placeholder:text-slate-400 ${
                      focusedField === "confirmPassword" ? "ring-2 ring-amber-500 shadow-lg shadow-amber-500/20" : ""
                    } ${errors.confirmPassword ? "ring-2 ring-red-500" : ""}`}
                    placeholder="Confirm password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <span className="text-white text-sm">Already registered? </span>
              <Link
                href="/auth/login"
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-sm ml-2 inline-block"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
