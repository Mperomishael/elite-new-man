"use client"

import { Menu, Bell } from "lucide-react"
import { useEffect, useState } from "react"
import type { UserProfile } from "@/lib/auth-service"
import { getMessageCount } from "@/lib/news-service"

interface TopBarProps {
  onMenuClick: () => void
  userName: string
  onNavigateToKyc: () => void
  userProfile?: UserProfile
  userId?: string
}

export function TopBar({ onMenuClick, userName, onNavigateToKyc, userProfile, userId }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    const updateCount = async () => {
      if (userId) {
        const count = await getMessageCount(userId)
        setMessageCount(count)
      }
    }
    updateCount()
  }, [userId])

  return (
    <header className="sticky top-0 z-40 bg-black border-b border-neutral-800 backdrop-blur-sm px-3 py-2 md:py-3">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuClick}
            className="text-white hover:text-lime-400 transition-colors p-2 -ml-2 active:scale-95 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="https://i.ibb.co/DPWT64HW/file-00000000899871f49095bc51ed0ef7c0.png"
              alt="Elite Block Market"
              className="w-7 h-7 md:w-10 md:h-10 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-xs md:text-sm font-bold text-white leading-tight">Elite Block</h1>
              <p className="text-[10px] md:text-xs text-lime-400 leading-none">Market</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-white hover:text-lime-400 transition-colors p-2 -mr-2 active:scale-95"
          >
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
            {messageCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex items-center justify-center bg-lime-400 text-black text-xs font-bold w-5 h-5 rounded-full">
                {messageCount > 99 ? "99+" : messageCount}
              </span>
            )}
            {messageCount === 0 && (
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-lime-400 ring-2 ring-black"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-neutral-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">Notifications</h3>
                  {messageCount > 0 && (
                    <span className="text-xs bg-lime-400/20 text-lime-400 px-2 py-1 rounded-full font-semibold">
                      {messageCount} new
                    </span>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {/* Welcome Message */}
                <div className="p-4 border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-lime-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">👋</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">Welcome, {userName}!</p>
                      <p className="text-xs text-neutral-400">
                        Welcome to Elite Block Market. Start trading crypto and forex today!
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">Just now</p>
                    </div>
                  </div>
                </div>

                {userProfile?.kycStatus !== "approved" && (
                  <div className="p-4 border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-lime-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🔐</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">Complete KYC Verification</p>
                        <p className="text-xs text-neutral-400 mb-2">
                          Verify your identity to unlock higher trading limits and withdrawal amounts.
                        </p>
                        <button
                          onClick={() => {
                            setShowNotifications(false)
                            onNavigateToKyc()
                          }}
                          className="text-xs bg-lime-400 hover:bg-lime-500 text-black px-3 py-1.5 rounded-lg transition-colors font-semibold"
                        >
                          Verify Now
                        </button>
                        <p className="text-xs text-neutral-500 mt-2">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trading Activity */}
                <div className="p-4 border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-lime-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📈</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">Market Update</p>
                      <p className="text-xs text-neutral-400">
                        Bitcoin is up 5.2% today. Great time to review your portfolio!
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 border-t border-neutral-800 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-lime-400 hover:text-lime-300 font-medium"
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
