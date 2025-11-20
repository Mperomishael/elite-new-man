"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle } from "lucide-react"
import type { UserProfile } from "@/lib/auth-service"

const activities = [
  { country: "South Africa", action: "made", amount: 322, type: "profit" },
  { country: "USA", action: "is trading with", amount: 1200, type: "trading" },
  { country: "Madagascar", action: "just withdrew", amount: 735, type: "withdrawal" },
  { country: "", action: "made", amount: 450, type: "profit" },
  { country: "United Kingdom", action: "is trading with", amount: 2500, type: "trading" },
  { country: "Canada", action: "just withdrew", amount: 890, type: "withdrawal" },
  { country: "Australia", action: "made", amount: 1150, type: "profit" },
  { country: "Germany", action: "is trading with", amount: 3200, type: "trading" },
  { country: "Brazil", action: "just withdrew", amount: 560, type: "withdrawal" },
  { country: "India", action: "made", amount: 780, type: "profit" },
  { country: "France", action: "is trading with", amount: 1800, type: "trading" },
  { country: "Japan", action: "just withdrew", amount: 920, type: "withdrawal" },
  { country: "Mexico", action: "made", amount: 640, type: "profit" },
  { country: "Spain", action: "is trading with", amount: 1500, type: "trading" },
  { country: "Italy", action: "just withdrew", amount: 1100, type: "withdrawal" },
  { country: "Singapore", action: "made", amount: 2100, type: "profit" },
  { country: "UAE", action: "is trading with", amount: 4500, type: "trading" },
  { country: "South Korea", action: "just withdrew", amount: 1350, type: "withdrawal" },
  { country: "Netherlands", action: "made", amount: 890, type: "profit" },
  { country: "Sweden", action: "is trading with", amount: 1650, type: "trading" },
]

const kycNotification = {
  type: "kyc",
  message: "Complete your KYC verification to unlock higher trading limits",
}

interface ActivityNotificationsProps {
  userProfile?: UserProfile
}

export function ActivityNotifications({ userProfile }: ActivityNotificationsProps) {
  const [currentActivity, setCurrentActivity] = useState(activities[0])
  const [isVisible, setIsVisible] = useState(false)
  const [showKyc, setShowKyc] = useState(false)

  useEffect(() => {
    const showNotification = () => {
      const shouldShowKyc = Math.random() < 0.2 && userProfile?.kycStatus !== "approved"

      if (shouldShowKyc) {
        setShowKyc(true)
      } else {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)]
        setCurrentActivity(randomActivity)
        setShowKyc(false)
      }

      setIsVisible(true)

      setTimeout(() => {
        setIsVisible(false)
      }, 5000)
    }

    showNotification()
    const interval = setInterval(showNotification, 30000)

    return () => clearInterval(interval)
  }, [userProfile?.kycStatus])

  if (!isVisible) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300 max-w-md w-full px-4">
      {showKyc ? (
        <div className="bg-gradient-to-r from-emerald-900 to-cyan-900 border border-emerald-500/50 rounded-xl shadow-2xl p-4 pr-12">
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white mb-1">KYC Verification Required</p>
              <p className="text-xs text-slate-300 mb-2">{kycNotification.message}</p>
              <button className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg transition-colors">
                Verify Now
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Regular Activity Notification
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 pr-12">
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-sm">
            Someone from <span className="text-emerald-400 font-semibold">{currentActivity.country}</span>{" "}
            {currentActivity.action} <span className="text-emerald-400 font-semibold">${currentActivity.amount}</span>
            {currentActivity.type === "profit" && " profit"}
          </p>
        </div>
      )}
    </div>
  )
}
