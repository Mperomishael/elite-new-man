"use client"

import { Menu, Bell } from "lucide-react"
import { useState } from "react"

interface TopBarProps {
  onMenuClick: () => void
  userName: string
  onNavigateToKyc: () => void
}

export function TopBar({ onMenuClick, userName, onNavigateToKyc }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-900 backdrop-blur-sm px-4 py-3 md:py-4">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <button
          onClick={onMenuClick}
          className="text-white hover:text-cyan-400 transition-colors p-2 -ml-2 active:scale-95"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <h1 className="text-base md:text-lg font-bold tracking-wide">DASHBOARD</h1>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-white hover:text-cyan-400 transition-colors p-2 -mr-2 active:scale-95"
          >
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-slate-950"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-slate-800">
                <h3 className="font-bold text-sm">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {/* Welcome Message */}
                <div className="p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">👋</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">Welcome, {userName}!</p>
                      <p className="text-xs text-slate-400">
                        Welcome to UltimateStckTrader. Start trading crypto and forex today!
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Just now</p>
                    </div>
                  </div>
                </div>

                {/* KYC Notification */}
                <div className="p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🔐</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">Complete KYC Verification</p>
                      <p className="text-xs text-slate-400 mb-2">
                        Verify your identity to unlock higher trading limits and withdrawal amounts.
                      </p>
                      <button
                        onClick={() => {
                          setShowNotifications(false)
                          onNavigateToKyc()
                        }}
                        className="text-xs bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Verify Now
                      </button>
                      <p className="text-xs text-slate-500 mt-2">2 hours ago</p>
                    </div>
                  </div>
                </div>

                {/* Trading Activity */}
                <div className="p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📈</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">Market Update</p>
                      <p className="text-xs text-slate-400">
                        Bitcoin is up 5.2% today. Great time to review your portfolio!
                      </p>
                      <p className="text-xs text-slate-500 mt-1">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 border-t border-slate-800 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
