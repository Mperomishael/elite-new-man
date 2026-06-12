"use client"

import { useState, useEffect } from "react"
import { User, Mail, Phone, MapPin, Lock, Bell, Shield, Eye, EyeOff, Wallet, Check, AlertCircle } from "lucide-react"
import { updateUserProfile } from "@/lib/auth-service"
import type { UserProfile } from "@/lib/auth-service"

interface SettingsViewProps {
  userName: string
  userProfile?: UserProfile
}

export function SettingsView({ userName, userProfile }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState({
    fullName: userName,
    username: userProfile?.username || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone || "",
    address: userProfile?.address || "",
    country: userProfile?.country || "",
    currency: userProfile?.currency || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    tradeAlerts: true,
    priceAlerts: false,
    newsAlerts: true,
    marketingEmails: false,
  })

  // Update form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData((prev) => ({
        ...prev,
        fullName: userName,
        username: userProfile.username || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        address: userProfile.address || "",
        country: userProfile.country || "",
        currency: userProfile.currency || "",
      }))
    }
  }, [userProfile, userName])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificationToggle = (field: string) => {
    setNotifications((prev) => ({ ...prev, [field]: !prev[field as keyof typeof prev] }))
  }

  const handleSaveProfile = async () => {
    if (!userProfile?.uid) return
    
    setIsSaving(true)
    setSaveMessage(null)
    
    try {
      const result = await updateUserProfile(userProfile.uid, {
        firstName: formData.fullName.split(" ")[0] || "",
        lastName: formData.fullName.split(" ").slice(1).join(" ") || "",
        username: formData.username,
        phone: formData.phone,
        address: formData.address,
        country: formData.country,
        currency: formData.currency,
      })

      if (result.success) {
        setSaveMessage({ type: "success", text: "Profile updated successfully!" })
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage({ type: "error", text: result.error || "Failed to update profile" })
      }
    } catch (error) {
      setSaveMessage({ type: "error", text: "An error occurred while saving" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Settings</h2>
        <p className="text-neutral-400 text-sm">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-800">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "profile" ? "text-lime-400" : "text-neutral-400 hover:text-neutral-300"
          }`}
        >
          Profile
          {activeTab === "profile" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "security" ? "text-lime-400" : "text-neutral-400 hover:text-neutral-300"
          }`}
        >
          Security
          {activeTab === "security" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "notifications" ? "text-lime-400" : "text-neutral-400 hover:text-neutral-300"
          }`}
        >
          Notifications
          {activeTab === "notifications" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-4">
          {/* Account Balance Card */}
          <div className="bg-gradient-to-r from-lime-500/20 to-lime-500/20 border border-lime-400/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400 mb-1">Account Balance</p>
                <p className="text-3xl font-bold text-lime-400">
                  ${(userProfile?.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <Wallet className="w-12 h-12 text-lime-400 opacity-50" />
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <p className="text-xs text-neutral-400">Profit Balance</p>
                <p className="text-lg font-semibold text-lime-400">
                  ${(userProfile?.profitBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-neutral-400">Account Status</p>
                <p className="text-lg font-semibold">
                  {userProfile?.kycStatus === "approved" ? (
                    <span className="text-lime-400">✓ Verified</span>
                  ) : (
                    <span className="text-yellow-400">— Pending</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-lime-400 rounded-full flex items-center justify-center text-2xl font-bold text-neutral-900">
                {userName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{userName}</h3>
                <p className="text-sm text-neutral-400">Account ID: {userProfile?.uid?.slice(0, 8)}...</p>
              </div>
            </div>

            {saveMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                saveMessage.type === "success"
                  ? "bg-lime-400/20 border border-lime-400/50 text-lime-400"
                  : "bg-red-500/20 border border-red-500/50 text-red-400"
              }`}>
                {saveMessage.type === "success" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{saveMessage.text}</span>
              </div>
            )}

            <div>
              <label className="text-sm text-neutral-400 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2.5 text-neutral-300 flex items-center">
                <p>{formData.email}</p>
                <span className="text-xs text-neutral-500 ml-2">(Verified)</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-neutral-400 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="Enter your street address"
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="Your country"
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Currency
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => handleInputChange("currency", e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="USD, EUR, etc."
              />
            </div>
          </div>

          <button 
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full bg-lime-400 hover:bg-lime-500 disabled:bg-lime-400/50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all active:scale-95"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-lime-400" />
              <div>
                <h3 className="font-bold">Change Password</h3>
                <p className="text-xs text-neutral-400">Update your account password</p>
              </div>
            </div>

            <div>
              <label className="text-sm text-neutral-400 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                  className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -tranneutral-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-neutral-400 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-lime-400" />
              <div>
                <h3 className="font-bold">Two-Factor Authentication</h3>
                <p className="text-xs text-neutral-400">Add an extra layer of security</p>
              </div>
            </div>
            <button className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-2.5 rounded-lg transition-colors">
              Enable 2FA
            </button>
          </div>

          <button className="w-full bg-lime-400 hover:bg-lime-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
            Update Password
          </button>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-lime-400" />
              <div>
                <h3 className="font-bold">Notification Preferences</h3>
                <p className="text-xs text-neutral-400">Manage how you receive updates</p>
              </div>
            </div>

            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-0">
                <div>
                  <p className="font-medium text-sm">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim()}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {key === "emailAlerts" && "Receive important account updates via email"}
                    {key === "tradeAlerts" && "Get notified when your trades are executed"}
                    {key === "priceAlerts" && "Alerts when assets reach target prices"}
                    {key === "newsAlerts" && "Market news and analysis updates"}
                    {key === "marketingEmails" && "Promotional offers and newsletters"}
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationToggle(key)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    value ? "bg-lime-400" : "bg-neutral-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      value ? "tranneutral-x-6" : "tranneutral-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <button className="w-full bg-lime-400 hover:bg-lime-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
            Save Preferences
          </button>
        </div>
      )}
    </div>
  )
}
