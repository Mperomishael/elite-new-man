"use client"

import {
  X,
  Home,
  History,
  Clock,
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
      | "activity"
      | "deposit"
      | "withdraw"
      | "buy"
      | "sell"
      | "kyc"
      | "referrals"
      | "support"
      | "settings"
      | "license"
      | "terms",
  ) => void
}

export function SideMenu({ isOpen, onClose, activeView, onNavigate }: SideMenuProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "history", label: "Transaction History", icon: History },
    { id: "activity", label: "Activity Log", icon: Clock },
    { id: "deposit", label: "Deposit", icon: ArrowDownToLine },
    { id: "withdraw", label: "Withdraw", icon: ArrowUpFromLine },
    { id: "buy", label: "Buying", icon: TrendingUp },
    { id: "sell", label: "Selling", icon: TrendingDown },
    { id: "kyc", label: "KYC Verification", icon: FileCheck },
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "license", label: "Company License", icon: FileCheck },
    { id: "terms", label: "Terms & Conditions", icon: FileCheck },
    { id: "support", label: "Email Support", icon: Mail },
    { id: "settings", label: "Settings", icon: Settings },
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
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-black border-r border-neutral-800 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <img
                src="https://i.ibb.co/DPWT64HW/file-00000000899871f49095bc51ed0ef7c0.png"
                alt="Elite Block Market Logo"
                className="w-16 h-16 object-contain"
              />
              <div>
                <h2 className="font-bold text-sm text-white">Elite Block</h2>
                <p className="text-xs text-lime-400">Market</p>
              </div>
            </div>
            <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors p-2">
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
                      : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-neutral-800 p-4 space-y-2">
            <button
              onClick={() => onNavigate("settings")}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                activeView === "settings"
                  ? "bg-lime-400/10 text-lime-400"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-neutral-400 hover:bg-neutral-900 hover:text-white rounded-lg transition-colors">
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
