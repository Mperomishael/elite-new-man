"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle, TrendingUp } from "lucide-react"
import type { UserProfile } from "@/lib/auth-service"
import { addTradingNewsNotification, type TradingNews } from "@/lib/news-service"

const activities = [
 [
  { country: "South Africa", action: "made", amount: 2898, type: "profit" },
  { country: "USA", action: "is trading with", amount: 10800, type: "trading" },
  { country: "Madagascar", action: "just withdrew", amount: 6615, type: "withdrawal" },
  { country: "", action: "made", amount: 4050, type: "profit" },
  { country: "United Kingdom", action: "is trading with", amount: 22500, type: "trading" },
  { country: "Canada", action: "just withdrew", amount: 8010, type: "withdrawal" },
  { country: "Australia", action: "made", amount: 10350, type: "profit" },
  { country: "Germany", action: "is trading with", amount: 28800, type: "trading" },
  { country: "Brazil", action: "just withdrew", amount: 5040, type: "withdrawal" },
  { country: "India", action: "made", amount: 7020, type: "profit" },
  { country: "France", action: "is trading with", amount: 16200, type: "trading" },
  { country: "Japan", action: "just withdrew", amount: 8280, type: "withdrawal" },
  { country: "Mexico", action: "made", amount: 5760, type: "profit" },
  { country: "Spain", action: "is trading with", amount: 13500, type: "trading" },
  { country: "Italy", action: "just withdrew", amount: 9900, type: "withdrawal" },
  { country: "Singapore", action: "made", amount: 18900, type: "profit" },
  { country: "UAE", action: "is trading with", amount: 40500, type: "trading" },
  { country: "South Korea", action: "just withdrew", amount: 12150, type: "withdrawal" },
  { country: "Netherlands", action: "made", amount: 8010, type: "profit" },
  { country: "Sweden", action: "is trading with", amount: 14850, type: "trading" },
  { country: "Switzerland", action: "just withdrew", amount: 11808, type: "withdrawal" },
  { country: "Norway", action: "made", amount: 23877, type: "profit" },
  { country: "Denmark", action: "made", amount: 20052, type: "profit" },
  { country: "Belgium", action: "made", amount: 11151, type: "profit" },
  { country: "Austria", action: "just withdrew", amount: 43803, type: "withdrawal" },
  { country: "Poland", action: "made", amount: 34704, type: "profit" },
  { country: "Portugal", action: "made", amount: 5796, type: "profit" },
  { country: "Ireland", action: "made", amount: 19719, type: "profit" },
  { country: "Finland", action: "made", amount: 40851, type: "profit" },
  { country: "Greece", action: "just withdrew", amount: 5553, type: "withdrawal" },
  { country: "Czech Republic", action: "just withdrew", amount: 18252, type: "withdrawal" },
  { country: "Romania", action: "just withdrew", amount: 43776, type: "withdrawal" },
  { country: "Hungary", action: "is trading with", amount: 19845, type: "trading" },
  { country: "Croatia", action: "is trading with", amount: 24102, type: "trading" },
  { country: "Luxembourg", action: "made", amount: 15363, type: "profit" },
]

const mockTradingNews: Omit<TradingNews, "id" | "timestamp" | "isRead">[] = [
 [
  {
    title: "Bitcoin Rebounds Above $65,700",
    description: "BTC recovers from weekly lows near $60K as volatility persists amid broader crypto market uncertainty",
    source: "Yahoo Finance",
    category: "crypto",
    symbol: "BTC",
    changePercent: -1.0,
  },
  {
    title: "EUR/USD Holds Above 1.16",
    description: "Euro strengthens against dollar on ECB policy expectations, trading at 1.1606",
    source: "Trading Economics",
    category: "forex",
    symbol: "EURUSD",
    changePercent: 0.16,
  },
  {
    title: "S&P 500 Trades Near Record Highs",
    description: "Index hovers around 7,528 after hitting all-time high of 7,620 earlier in June",
    source: "Yahoo Finance",
    category: "stocks",
    symbol: "SPX",
    changePercent: -0.35,
  },
  {
    title: "Ethereum Price Update",
    description: "ETH follows Bitcoin's volatile path as DeFi sector shows mixed signals",
    source: "CoinGecko",
    category: "crypto",
    symbol: "ETH",
    changePercent: -1.5,
  },
  {
    title: "Oil Prices Plunge to $77",
    description: "Crude oil crashes over 4% to $77.05/barrel on demand concerns and oversupply fears",
    source: "Trading Economics",
    category: "commodity",
    symbol: "CL",
    changePercent: -4.59,
  },
  {
    title: "Gold Hits New All-Time High",
    description: "Safe-haven demand surges as geopolitical tensions and recession fears drive gold above $3,400/oz",
    source: "Kitco",
    category: "commodity",
    symbol: "XAU",
    changePercent: 2.8,
  },
  {
    title: "Nasdaq 100 Extends Gains",
    description: "Tech-heavy index pushes higher on AI optimism and strong semiconductor earnings",
    source: "Bloomberg",
    category: "stocks",
    symbol: "NDX",
    changePercent: 1.2,
  },
  {
    title: "US 10-Year Treasury Yields Drop",
    description: "Bond yields fall below 4.2% as markets price in potential Fed rate cuts later this year",
    source: "Reuters",
    category: "bonds",
    symbol: "US10Y",
    changePercent: -0.8,
  },
  {
    title: "Solana Network Activity Surges",
    description: "SOL gains momentum as DeFi and NFT volumes on the network hit multi-month highs",
    source: "CoinDesk",
    category: "crypto",
    symbol: "SOL",
    changePercent: 3.5,
  },
  {
    title: "Japanese Yen Weakens Further",
    description: "USD/JPY approaches 158 as BoJ maintains ultra-loose monetary policy stance",
    source: "Financial Times",
    category: "forex",
    symbol: "USDJPY",
    changePercent: 0.9,
  },
]
interface ActivityNotificationsProps {
  userProfile?: UserProfile
  userId?: string
}

export function ActivityNotifications({ userProfile, userId }: ActivityNotificationsProps) {
  const [currentActivity, setCurrentActivity] = useState<any>(activities[0])
  const [currentNews, setCurrentNews] = useState<any>(mockTradingNews[0])
  const [isVisible, setIsVisible] = useState(false)
  const [notificationType, setNotificationType] = useState<"activity" | "news">("activity")
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    const showNotification = () => {
      const shouldShowNews = Math.random() < 0.5

      if (shouldShowNews) {
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
      } else {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)]
        setCurrentActivity(randomActivity)
        setNotificationType("activity")
      }

      setIsVisible(true)

      setTimeout(() => {
        setIsVisible(false)
      }, 5000)
    }

    showNotification()
    const interval = setInterval(showNotification, 30000)

    return () => clearInterval(interval)
  }, [userId])

  if (!isVisible) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300 w-[calc(100%-2rem)] max-w-md px-0">
      {notificationType === "news" ? (
        <div className="bg-gradient-to-r from-amber-900 to-orange-900 border border-amber-500/50 rounded-xl shadow-2xl p-4 pr-12">
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-neutral-400 hover:text-white transition-colors"
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
              <p className="text-xs text-neutral-200 mb-2">{currentNews.description}</p>
              {currentNews.changePercent && (
                <p
                  className={`text-xs font-semibold mb-1 ${currentNews.changePercent > 0 ? "text-lime-400" : "text-red-400"}`}
                >
                  {currentNews.changePercent > 0 ? "+" : ""}
                  {currentNews.changePercent}%
                </p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-400">{currentNews.source}</p>
                <span className="text-xs bg-amber-600/50 text-amber-200 px-2 py-0.5 rounded-full font-semibold">
                  Message #{messageCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-4 pr-12">
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-sm">
            Someone from <span className="text-lime-400 font-semibold">{currentActivity.country}</span>{" "}
            {currentActivity.action} <span className="text-lime-400 font-semibold">${currentActivity.amount}</span>
            {currentActivity.type === "profit" && " profit"}
          </p>
        </div>
      )}

      {notificationType !== "news" && (
        <div className="mt-4 bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
          <div id="tradingview-news-ticker" className="tradingview-widget-container">
            <div className="tradingview-widget-container__widget"></div>
          </div>
        </div>
      )}
    </div>
  )
}
