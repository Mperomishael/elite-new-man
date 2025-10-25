"use client"

import { useState, useEffect } from "react"
import { getAdminWalletSettings, updateAdminWalletSettings, type AdminWalletSettings } from "@/lib/admin-service"
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
    lastUpdated: "",
    updatedBy: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const data = await getAdminWalletSettings()
    if (data) {
      setSettings(data)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage("")

    const result = await updateAdminWalletSettings({
      ...settings,
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
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Wallet Settings</h2>
        <p className="text-slate-400">Configure deposit wallet addresses for BTC and USDT</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${message.includes("Error") ? "bg-red-500/10 border border-red-500/20 text-red-500" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"}`}
        >
          {message}
        </div>
      )}

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

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
        >
          {saving ? "Saving..." : "Save Wallet Settings"}
        </Button>

        {settings.lastUpdated && (
          <p className="text-xs text-slate-500 text-center">
            Last updated: {new Date(settings.lastUpdated).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}
