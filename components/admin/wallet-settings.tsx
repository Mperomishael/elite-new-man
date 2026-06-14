"use client"

import { useState, useEffect } from "react"
import {
  getAdminWalletSettings,
  updateAdminWalletSettings,
  type AdminWalletSettings,
  type BankDetails,
} from "@/lib/admin-service"
import { Button } from "@/components/ui/button"

interface WalletSettingsProps {
  adminId: string
}

export function WalletSettings({ adminId }: WalletSettingsProps) {
  const [settings, setSettings] = useState<AdminWalletSettings>({
    btcAddress: "",
    btcTag: "",
    usdtAddress: "",
    usdtTag: "",
    xrpAddress: "",
    xrpTag: "",
    ethAddress: "",
    ethTag: "",
    whatsappNumber: "",
    supportPhone: "",
    lastUpdated: "",
    updatedBy: "",
  })
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    iban: "",
    country: "United States",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState<"crypto" | "bank" | "support">("crypto")

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const data = await getAdminWalletSettings()
    if (data) {
      setSettings(data)
      if (data.bankDetails) {
        setBankDetails(data.bankDetails)
      }
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage("")

    const result = await updateAdminWalletSettings({
      ...settings,
      bankDetails,
      updatedBy: adminId,
    })

    if (result.success) {
      setMessage("Wallet settings updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } else {
      setMessage(`Error: ${result.error}`)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 lime-400 border-t-transparent rounded-full animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Wallet Settings</h2>
        <p className="text-slate-400">Configure deposit wallet addresses and bank details</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${message.includes("Error") ? "bg-red-500/10 border border-red-500/20 text-red-500" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"}`}
        >
          {message}
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("crypto")}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "crypto"
              ? "text-amber-500 border-amber-500"
              : "text-slate-400 border-transparent hover:text-white"
          }`}
        >
          Cryptocurrency
        </button>
        <button
          onClick={() => setActiveTab("bank")}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "bank"
              ? "text-amber-500 border-amber-500"
              : "text-slate-400 border-transparent hover:text-white"
          }`}
        >
          Bank Details
        </button>
        <button
          onClick={() => setActiveTab("support")}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "support"
              ? "text-amber-500 border-amber-500"
              : "text-slate-400 border-transparent hover:text-white"
          }`}
        >
          Support Contact
        </button>
      </div>

      {activeTab === "crypto" && (
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 space-y-6">
          {/* BTC Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">₿</span>
              Bitcoin (BTC)
            </h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">BTC Wallet Address</label>
              <input
                type="text"
                value={settings.btcAddress}
                onChange={(e) => setSettings({ ...settings, btcAddress: e.target.value })}
                placeholder="Enter BTC wallet address"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">BTC Memo/Tag (Optional)</label>
              <input
                type="text"
                value={settings.btcTag}
                onChange={(e) => setSettings({ ...settings, btcTag: e.target.value })}
                placeholder="Enter BTC memo/tag if required"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-800"></div>

          {/* USDT Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">₮</span>
              Tether (USDT)
            </h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">USDT Wallet Address</label>
              <input
                type="text"
                value={settings.usdtAddress}
                onChange={(e) => setSettings({ ...settings, usdtAddress: e.target.value })}
                placeholder="Enter USDT wallet address"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">USDT Memo/Tag (Optional)</label>
              <input
                type="text"
                value={settings.usdtTag}
                onChange={(e) => setSettings({ ...settings, usdtTag: e.target.value })}
                placeholder="Enter USDT memo/tag if required"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-800"></div>

          {/* XRP Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">✕</span>
              Ripple (XRP)
            </h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">XRP Wallet Address</label>
              <input
                type="text"
                value={settings.xrpAddress}
                onChange={(e) => setSettings({ ...settings, xrpAddress: e.target.value })}
                placeholder="Enter XRP wallet address"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">XRP Destination Tag (Optional)</label>
              <input
                type="text"
                value={settings.xrpTag}
                onChange={(e) => setSettings({ ...settings, xrpTag: e.target.value })}
                placeholder="Enter XRP destination tag if required"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-800"></div>

          {/* ETH Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">Ξ</span>
              Ethereum (ETH)
            </h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">ETH Wallet Address</label>
              <input
                type="text"
                value={settings.ethAddress}
                onChange={(e) => setSettings({ ...settings, ethAddress: e.target.value })}
                placeholder="Enter ETH wallet address (0x...)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">ETH Memo/Tag (Optional)</label>
              <input
                type="text"
                value={settings.ethTag}
                onChange={(e) => setSettings({ ...settings, ethTag: e.target.value })}
                placeholder="Enter memo/tag if required by exchange"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
          >
            {saving ? "Saving..." : "Save Cryptocurrency Settings"}
          </Button>

          {settings.lastUpdated && (
            <p className="text-xs text-slate-500 text-center">
              Last updated: {new Date(settings.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {activeTab === "bank" && (
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Bank Account Details</h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Bank Name</label>
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                placeholder="e.g., Bank of America"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Account Holder Name</label>
              <input
                type="text"
                value={bankDetails.accountHolderName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                placeholder="Full name on bank account"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Account Number / IBAN</label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                placeholder="Account number or IBAN"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Routing Number (Optional)</label>
                <input
                  type="text"
                  value={bankDetails.routingNumber || ""}
                  onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                  placeholder="US Routing Number"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">SWIFT Code (Optional)</label>
                <input
                  type="text"
                  value={bankDetails.swiftCode || ""}
                  onChange={(e) => setBankDetails({ ...bankDetails, swiftCode: e.target.value })}
                  placeholder="SWIFT/BIC Code"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Country</label>
              <select
                value={bankDetails.country}
                onChange={(e) => setBankDetails({ ...bankDetails, country: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
                <option value="India">India</option>
                <option value="UAE">United Arab Emirates</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-blue-300">
                These bank details will be displayed to users when they choose bank deposit option. Make sure all
                information is accurate and verified.
              </p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
          >
            {saving ? "Saving..." : "Save Bank Details"}
          </Button>

          {settings.lastUpdated && (
            <p className="text-xs text-slate-500 text-center">
              Last updated: {new Date(settings.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {activeTab === "support" && (
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Support Contact Details</h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">WhatsApp Number</label>
              <input
                type="text"
                value={settings.whatsappNumber || ""}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="e.g. +27715403179"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Include the country code (e.g. +1, +44, +234). Used for the WhatsApp Support button in the user app.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Support Phone Number</label>
              <input
                type="text"
                value={settings.supportPhone || ""}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                placeholder="e.g. +1 (800) 123-4567"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                This number will be displayed to users on the Contact / Support page.
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-blue-300">
                These numbers update instantly across the app, including the Support page&apos;s WhatsApp button and
                contact phone display.
              </p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
          >
            {saving ? "Saving..." : "Save Support Contact"}
          </Button>

          {settings.lastUpdated && (
            <p className="text-xs text-slate-500 text-center">
              Last updated: {new Date(settings.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
