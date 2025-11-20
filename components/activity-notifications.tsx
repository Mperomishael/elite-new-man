"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle, TrendingUp } from "lucide-react"
import type { UserProfile } from "@/lib/auth-service"
import { addTradingNewsNotification, type TradingNews } from "@/lib/news-service"

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

const mockTradingNews: Omit<TradingNews, "id" | "timestamp" | "isRead">[] = [
  {
    title: "Bitcoin Surges Past $45,000",
    description: "Bitcoin reaches highest level in months amid market optimism",
    source: "TradingView",
    category: "crypto",
    symbol: "BTC",
    changePercent: 5.2,
  },
  {
    title: "US Dollar Weakens Against Euro",
    description: "EUR/USD breaks above 1.10 level on inflation concerns",
    source: "TradingView",
    category: "forex",
    symbol: "EURUSD",
    changePercent: 2.1,
  },
  {
    title: "S&P 500 Reaches New High",
    description: "Tech stocks lead gains as earnings season heats up",
    source: "TradingView",
    category: "stocks",
    symbol: "SPX",
    changePercent: 1.8,
  },
  {
    title: "Ethereum Breaks Resistance",
    description: "ETH hits $3,000 on growing DeFi adoption",
    source: "TradingView",
    category: "crypto",
    symbol: "ETH",
    changePercent: 4.5,
  },
  {
    title: "Oil Prices Rally",
    description: "Crude oil reaches $85/barrel on supply concerns",
    source: "TradingView",
    category: "market",
    symbol: "CL",
    changePercent: 3.2,
  },
]

const kycNotification = {
  type: "kyc",
  message: "Complete your KYC verification to unlock higher trading limits",
}

interface ActivityNotificationsProps {
  userProfile?: UserProfile
  userId?: string
}

export function ActivityNotifications({ userProfile, userId }: ActivityNotificationsProps) {
  const [currentActivity, setCurrentActivity] = useState<any>(activities[0])
  const [currentNews, setCurrentNews] = useState<any>(mockTradingNews[0])
  const [isVisible, setIsVisible] = useState(false)
  const [showKyc, setShowKyc] = useState(false)
  const [notificationType, setNotificationType] = useState<"activity" | "news" | "kyc">("activity")
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    const showNotification = () => {
      const shouldShowKyc = Math.random() < 0.15 && userProfile?.kycStatus !== "approved"
      const shouldShowNews = Math.random() < 0.5 && !shouldShowKyc

      if (shouldShowKyc) {
        setShowKyc(true)
        setNotificationType("kyc")
      } else if (shouldShowNews) {
        const randomNews = mockTradingNews[Math.floor(Math.random() * mockTradingNews.length)]
        setCurrentNews(randomNews)
        setNotificationType("news")
        setMessageCount((prev) => prev + 1)

        // Save to Firebase if userId provided
        if (userId) {
          addTradingNewsNotification(userId, {
            title: randomNews.title,
            description: randomNews.description,
            source: randomNews.source,
            category: randomNews.category,
            symbol: randomNews.symbol,
            changePercent: randomNews.changePercent,
          })
        }
        setShowKyc(false)
      } else {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)]
        setCurrentActivity(randomActivity)
        setNotificationType("activity")
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
  }, [userProfile?.kycStatus, userId])

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
      ) : notificationType === "news" ? (
        <div className="bg-gradient-to-r from-amber-900 to-orange-900 border border-amber-500/50 rounded-xl shadow-2xl p-4 pr-12">
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-white">{currentNews.title}</p>
                {currentNews.symbol && (
                  <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full">{currentNews.symbol}</span>
                )}
              </div>
              <p className="text-xs text-slate-200 mb-2">{currentNews.description}</p>
              {currentNews.changePercent && (
                <p
                  className={`text-xs font-semibold mb-1 ${currentNews.changePercent > 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {currentNews.changePercent > 0 ? "+" : ""}
                  {currentNews.changePercent}%
                </p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">{currentNews.source}</p>
                <span className="text-xs bg-amber-600/50 text-amber-200 px-2 py-0.5 rounded-full font-semibold">
                  Message #{messageCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
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

      {notificationType !== "news" && (
        <div className="mt-4 bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
          <div id="tradingview-news-ticker" className="tradingview-widget-container">
            <div className="tradingview-widget-container__widget"></div>
          </div>
        </div>
      )}
    </div>
  )
}
