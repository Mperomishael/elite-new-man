"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Mail, DollarSign, Send, MessageCircle, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { signUpWithEmail, signInWithEmail } from "@/lib/auth-service"

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
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Denmark",
  "Egypt",
  "Finland",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Kenya",
  "Liberia",
  "Madagascar",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Russia",
  "Saudi Arabia",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Thailand",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Vietnam",
].sort()

interface AuthPageProps {
  onLogin: (userProfile: any) => void
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [formData, setFormData] = useState({
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!isLogin) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
      if (!formData.username.trim()) newErrors.username = "Username is required"
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
      if (!formData.currency) newErrors.currency = "Please select a currency"
      if (!formData.country) newErrors.country = "Please select a country"
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
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
      if (isLogin) {
        const result = await signInWithEmail(formData.email, formData.password)

        if (result.success && result.userProfile) {
          setMessage({ type: "success", text: "Login successful!" })
          setTimeout(() => {
            onLogin(result.userProfile)
          }, 1000)
        } else {
          setMessage({ type: "error", text: result.error || "Login failed" })
        }
      } else {
        const result = await signUpWithEmail(formData.email, formData.password, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          phone: formData.phone,
          currency: formData.currency || "USD - US Dollar",
          country: formData.country || "United States",
        })

        if (result.success) {
          setRegisteredEmail(formData.email)
          setShowEmailVerification(true)
        } else {
          setMessage({ type: "error", text: result.error || "Sign up failed" })
        }
      }
    } catch (error: any) {
      console.error("[v0] Auth error:", error)
      setMessage({ type: "error", text: "An unexpected error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-[#0A2E3C] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <img
              src="/images/design-mode/Whats-App-Image-2025-10-10-at-8-45-37-AM-1-removebg-preview-1.png"
              alt="UltimateStckTrader Logo"
              className="w-24 h-24 mx-auto mb-4 object-contain"
            />
            <h1 className="text-2xl font-bold text-white">UltimateStckTrader</h1>
          </div>

          <div className="bg-[#0A2E3C] border-2 border-teal-700/50 rounded-xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Mail className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>

            <p className="text-teal-200 text-base mb-6 leading-relaxed">
              We've sent a verification link to
              <br />
              <span className="font-semibold text-white">{registeredEmail}</span>
            </p>

            <div className="bg-teal-900/30 border border-teal-700/50 rounded-lg p-4 mb-6">
              <p className="text-teal-200 text-sm leading-relaxed">
                Please check your email and click the verification link to activate your account. Once verified, you can
                log in to access your dashboard.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setShowEmailVerification(false)
                  setIsLogin(true)
                  setFormData({
                    firstName: "",
                    lastName: "",
                    username: "",
                    email: registeredEmail,
                    password: "",
                    confirmPassword: "",
                    currency: "",
                    country: "",
                    phone: "",
                  })
                }}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Go to Login
              </Button>

              <p className="text-teal-300 text-sm">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setShowEmailVerification(false)}
                  className="text-amber-500 hover:text-amber-400 font-semibold underline"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
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
            <h2 className="text-xl font-semibold text-white text-center mb-6">
              {isLogin ? "Welcome Back" : "Create an account"}
            </h2>

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
              {!isLogin && (
                <div className={`transition-all duration-300 ${focusedField === "firstName" ? "scale-[1.01]" : ""}`}>
                  <Label htmlFor="firstName" className="text-white text-sm mb-1.5 block font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
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
              )}

              {!isLogin && (
                <div className={`transition-all duration-300 ${focusedField === "lastName" ? "scale-[1.01]" : ""}`}>
                  <Label htmlFor="lastName" className="text-white text-sm mb-1.5 block font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
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
              )}

              {!isLogin && (
                <div className={`transition-all duration-300 ${focusedField === "username" ? "scale-[1.01]" : ""}`}>
                  <Label htmlFor="username" className="text-white text-sm mb-1.5 block font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
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
              )}

              {!isLogin && (
                <div className={`transition-all duration-300 ${focusedField === "phone" ? "scale-[1.01]" : ""}`}>
                  <Label htmlFor="phone" className="text-white text-sm mb-1.5 block font-medium">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
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
              )}

              <div className={`transition-all duration-300 ${focusedField === "email" ? "scale-[1.01]" : ""}`}>
                <Label htmlFor="email" className="text-white text-sm mb-1.5 block font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
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

              {!isLogin && (
                <div className={`transition-all duration-300 ${focusedField === "currency" ? "scale-[1.01]" : ""}`}>
                  <Label htmlFor="currency" className="text-white text-sm mb-1.5 block font-medium">
                    Account Currency
                  </Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange("currency", value)}
                    onOpenChange={(open) => setFocusedField(open ? "currency" : null)}
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
              )}

              {!isLogin && (
                <div className={`transition-all duration-300 ${focusedField === "country" ? "scale-[1.01]" : ""}`}>
                  <Label htmlFor="country" className="text-white text-sm mb-1.5 block font-medium">
                    Country
                  </Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleInputChange("country", value)}
                    onOpenChange={(open) => setFocusedField(open ? "country" : null)}
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      className={`bg-white border-0 text-slate-900 h-11 rounded-lg transition-all duration-300 ${
                        focusedField === "country" ? "ring-2 ring-amber-500 shadow-lg shadow-amber-500/20" : ""
                      } ${errors.country ? "ring-2 ring-red-500" : ""}`}
                    >
                      <SelectValue placeholder="Afghanistan" />
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
              )}

              <div className={`transition-all duration-300 ${focusedField === "password" ? "scale-[1.01]" : ""}`}>
                <Label htmlFor="password" className="text-white text-sm mb-1.5 block font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
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

              {!isLogin && (
                <div
                  className={`transition-all duration-300 ${focusedField === "confirmPassword" ? "scale-[1.01]" : ""}`}
                >
                  <Label htmlFor="confirmPassword" className="text-white text-sm mb-1.5 block font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
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
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>{isLogin ? "Login" : "Register"}</>
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <span className="text-white text-sm">{isLogin ? "Don't have an account? " : "Already registered? "}</span>
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setMessage(null)
                  setErrors({})
                }}
                disabled={isLoading}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-sm ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-[#0A2E3C] border-t border-teal-700/30 py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-start gap-3 mb-6 pb-6 border-b border-teal-700/30">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Live Chat</h3>
              <p className="text-teal-200 text-sm mb-2">
                Quick support, use our live chat button at the bottom of your screen.
              </p>
              <div className="flex items-center gap-2 text-teal-200 text-sm">
                <Mail className="w-4 h-4" />
                <span>support@ultimatestocktrade.com</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">UltimateStockTrade</h2>
            </div>
            <p className="text-teal-200 text-sm leading-relaxed">
              From exceptional customer service to excellent trading experience, we have it all. Our goal is to deliver
              the top quality. As a company, we strive to continue our standards to the highest level of customer
              satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-teal-200 text-sm">
                <li>
                  <a href="#" className="hover:text-amber-500 transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500 transition-colors">
                    Latest News
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500 transition-colors">
                    Referral Program
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500 transition-colors">
                    Market Screener
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Resources</h4>
              <ul className="space-y-2 text-teal-200 text-sm">
                <li>
                  <a href="#" className="hover:text-amber-500 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500 transition-colors">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500 transition-colors">
                    Join our Academy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500 transition-colors">
                    Technical Analysis
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500 transition-colors">
                    Crypto Market Cap
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Subscribe</h4>
            <p className="text-teal-200 text-sm mb-3">
              Don't miss to subscribe to our new feeds, kindly fill the form below.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email Address"
                className="bg-white border-0 text-slate-900 h-11 rounded-lg flex-1 placeholder:text-slate-400"
              />
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 h-11 px-4 rounded-lg">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
