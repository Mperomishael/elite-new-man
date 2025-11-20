"use client"

import { useState } from "react"
import { User, Mail, Phone, MapPin, Lock, Bell, Shield, Eye, EyeOff } from "lucide-react"
import type { UserProfile } from "@/lib/auth-service"

interface SettingsViewProps {
  userName: string
  userProfile?: UserProfile
}

export function SettingsView({ userName, userProfile }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: userName,
    email: userProfile?.email || "loading...",
    phone: "+1 (555) 123-4567",
    address: "123 Trading Street, New York, NY 10001",
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificationToggle = (field: string) => {
    setNotifications((prev) => ({ ...prev, [field]: !prev[field as keyof typeof prev] }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Settings</h2>
        <p className="text-slate-400 text-sm">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "profile" ? "text-emerald-400" : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Profile
          {activeTab === "profile" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "security" ? "text-emerald-400" : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Security
          {activeTab === "security" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "notifications" ? "text-emerald-400" : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Notifications
          {activeTab === "notifications" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-2xl font-bold text-slate-900">
                {userName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{userName}</h3>
                <p className="text-sm text-slate-400">Professional Trader</p>
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-300 flex items-center">
                <p>{formData.email}</p>
                <span className="text-xs text-slate-500 ml-2">(Verified)</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
            Save Changes
          </button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="font-bold">Change Password</h3>
                <p className="text-xs text-slate-400">Update your account password</p>
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-cyan-400" />
              <div>
                <h3 className="font-bold">Two-Factor Authentication</h3>
                <p className="text-xs text-slate-400">Add an extra layer of security</p>
              </div>
            </div>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-lg transition-colors">
              Enable 2FA
            </button>
          </div>

          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
            Update Password
          </button>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="font-bold">Notification Preferences</h3>
                <p className="text-xs text-slate-400">Manage how you receive updates</p>
              </div>
            </div>

            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                <div>
                  <p className="font-medium text-sm">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim()}
                  </p>
                  <p className="text-xs text-slate-400">
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
                    value ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      value ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
            Save Preferences
          </button>
        </div>
      )}
    </div>
  )
}
