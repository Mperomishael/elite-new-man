"use client"

import { useState } from "react"
import { updateUserProfile } from "@/lib/auth-service"
import type { UserProfile } from "@/lib/auth-service"
import { X, CheckCircle2, AlertCircle } from "lucide-react"

interface OnboardingModalProps {
  userProfile: UserProfile
  isOpen: boolean
  onClose: (updated?: boolean) => void
}

export function OnboardingModal({ userProfile, isOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState<"info" | "confirm">("info")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    phone: userProfile.phone || "",
    address: userProfile.address || "",
    country: userProfile.country || "",
    currency: userProfile.currency || "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    // Validation
    if (!formData.phone.trim()) {
      setError("Phone number is required")
      setLoading(false)
      return
    }
    if (!formData.address.trim()) {
      setError("Address is required")
      setLoading(false)
      return
    }
    if (!formData.country.trim()) {
      setError("Country is required")
      setLoading(false)
      return
    }
    if (!formData.currency.trim()) {
      setError("Currency is required")
      setLoading(false)
      return
    }

    try {
      const result = await updateUserProfile(userProfile.uid, {
        phone: formData.phone,
        address: formData.address,
        country: formData.country,
        currency: formData.currency,
        onboardingCompleted: true,
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onClose(true)
        }, 1500)
      } else {
        setError(result.error || "Failed to save profile")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Complete Your Profile</h2>
            <p className="text-sm text-slate-400 mt-1">Add your personal information to get started</p>
          </div>
          <button
            onClick={() => onClose()}
            className="text-slate-400 hover:text-white transition-colors p-1"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="bg-emerald-500/20 rounded-full p-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-center text-white font-semibold">Profile Updated Successfully!</p>
              <p className="text-center text-sm text-slate-400">You're all set to start trading</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main Street, Apt 4B"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="United States"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Trading Currency</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                  placeholder="USD, EUR, GBP"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <p className="text-xs text-slate-500 pt-2">
                This information is required for compliance and to process your transactions securely.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex gap-3 p-6 border-t border-slate-800 bg-slate-800/30">
            <button
              onClick={() => onClose()}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Complete Profile"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
