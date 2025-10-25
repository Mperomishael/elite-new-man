"use client"

import {
  X,
  Home,
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  TrendingDown,
  FileCheck,
  Users,
  Mail,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react"

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
  activeView: string
  onNavigate: (
    view:
      | "dashboard"
      | "history"
      | "deposit"
      | "withdraw"
      | "buy"
      | "sell"
      | "kyc"
      | "referrals"
      | "support"
      | "settings",
  ) => void
}

export function SideMenu({ isOpen, onClose, activeView, onNavigate }: SideMenuProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "history", label: "Transaction History", icon: History },
    { id: "deposit", label: "Deposit", icon: ArrowDownToLine },
    { id: "withdraw", label: "Withdraw", icon: ArrowUpFromLine },
    { id: "buy", label: "Buying", icon: TrendingUp },
    { id: "sell", label: "Selling", icon: TrendingDown },
    { id: "kyc", label: "KYC Verification", icon: FileCheck },
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "support", label: "Email Support", icon: Mail },
    { id: "settings", label: "Settings", icon: Settings }, // Added "settings" to the menu items
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[#0D3A4D] z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <img
                src="/images/design-mode/Whats-App-Image-2025-10-10-at-8-45-37-AM-1-removebg-preview-1.png"
                alt="UltimateStckTrader Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h2 className="font-bold text-sm text-white">UltimateStckTrader</h2>
                <p className="text-xs text-slate-300">Professional Trading</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors p-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as any)}
                  className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                    isActive
                      ? "bg-lime-400/10 text-lime-400 border-r-2 border-lime-400"
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-700 p-4 space-y-2">
            <button
              onClick={() => onNavigate("settings")}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                activeView === "settings"
                  ? "bg-lime-400/10 text-lime-400"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors">
              <HelpCircle className="w-5 h-5" />
              <span>Help & Support</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
