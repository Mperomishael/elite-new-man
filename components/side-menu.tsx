"use client"

import {
  X, Home, History, Clock, ArrowDownToLine, ArrowUpFromLine,
  TrendingUp, TrendingDown, FileCheck, Users, Mail,
  Settings, LogOut, Repeat, ScrollText,
} from "lucide-react"
import type { AppView } from "@/lib/views"

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
  activeView: string
  onNavigate: (view: AppView) => void
  onLogout?: () => void
}

export function SideMenu({ isOpen, onClose, activeView, onNavigate, onLogout }: SideMenuProps) {
  const menuItems: { id: AppView; label: string; icon: any }[] = [
    { id: "dashboard",   label: "Dashboard",          icon: Home },
    { id: "history",     label: "Transaction History", icon: History },
    { id: "activity",    label: "Activity Log",        icon: Clock },
    { id: "deposit",     label: "Deposit",             icon: ArrowDownToLine },
    { id: "withdraw",    label: "Withdraw",            icon: ArrowUpFromLine },
    { id: "buy",         label: "Buying",              icon: TrendingUp },
    { id: "sell",        label: "Selling",             icon: TrendingDown },
    { id: "kyc",         label: "KYC Verification",    icon: FileCheck },
    { id: "referrals",   label: "Referrals",           icon: Users },
    { id: "copytrading", label: "Copy Trading",        icon: Repeat },
    { id: "terms",       label: "Terms & Conditions",  icon: ScrollText },
    { id: "support",     label: "Email Support",       icon: Mail },
    { id: "settings",    label: "Settings",            icon: Settings },
  ]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-neutral-950 border-r border-neutral-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <img
              src="https://i.ibb.co/DPWT64HW/file-00000000899871f49095bc51ed0ef7c0.png"
              alt="Elite Block Market"
              className="w-10 h-10 object-contain"
            />
            <div>
              <p className="text-sm font-bold text-white">Elite Block</p>
              <p className="text-xs text-lime-400">Market</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose() }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                  isActive
                    ? "bg-lime-400/15 text-lime-400"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Footer Sign Out */}
        <div className="p-3 border-t border-neutral-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )
}
