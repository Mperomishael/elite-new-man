"use client"

import { useState, useEffect, useCallback } from "react"
import { X, TrendingUp } from "lucide-react"

interface TradingNews {
  title: string
  description: string
  source: string
  category: string
  symbol?: string
  changePercent?: number
}

const activities = [
  { country: "South Africa", action: "made", amount: 2898, type: "profit" },
  { country: "USA", action: "is trading with", amount: 10800, type: "trading" },
  { country: "Madagascar", action: "just withdrew", amount: 6615, type: "withdrawal" },
  { country: "United Kingdom", action: "is trading with", amount: 22500, type: "trading" },
  { country: "Germany", action: "is trading with", amount: 28800, type: "trading" },
  { country: "Brazil", action: "just withdrew", amount: 5040, type: "withdrawal" }
];

const mockTradingNews: TradingNews[] = [
  {
    title: "Bitcoin Rebounds Above $65,700",
    description: "BTC recovers from weekly lows near $60K as volatility persists.",
    source: "Yahoo Finance",
    category: "crypto",
    symbol: "BTC",
    changePercent: -1.0,
  },
  {
    title: "Gold Hits New All-Time High",
    description: "Safe-haven demand surges as geopolitical tensions drive gold above $3,400/oz.",
    source: "Kitco",
    category: "commodity",
    symbol: "XAU",
    changePercent: 2.8,
  }
];

export function ActivityNotifications() {
  const [currentActivity, setCurrentActivity] = useState<any>(activities[0])
  const [currentNews, setCurrentNews] = useState<any>(mockTradingNews[0])
  const [isVisible, setIsVisible] = useState(false)
  const [notificationType, setNotificationType] = useState<"activity" | "news">("activity")
  const [messageCount, setMessageCount] = useState(0)

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/audio/notification.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => console.log("Audio play blocked"));
    } catch (e) {
      console.error("Audio error", e);
    }
  }, []);

  useEffect(() => {
    const trigger = () => {
      const shouldShowNews = Math.random() < 0.5;
      if (shouldShowNews) {
        setCurrentNews(mockTradingNews[Math.floor(Math.random() * mockTradingNews.length)]);
        setNotificationType("news");
        setMessageCount(prev => prev + 1);
      } else {
        setCurrentActivity(activities[Math.floor(Math.random() * activities.length)]);
        setNotificationType("activity");
      }
      
      setIsVisible(true);
      playNotificationSound();
      setTimeout(() => setIsVisible(false), 4000);
    };

    const interval = setInterval(trigger, 15000);
    return () => clearInterval(interval);
  }, [playNotificationSound]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md animate-in slide-in-from-top duration-500">
      {notificationType === "news" ? (
        <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-4 shadow-2xl relative">
          <button onClick={() => setIsVisible(false)} className="absolute top-2 right-2 text-zinc-500"><X size={16}/></button>
          <div className="flex gap-3">
            <div className="bg-amber-500 p-2 rounded-full h-fit"><TrendingUp size={16} className="text-white"/></div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="text-white text-sm font-bold">{currentNews.title}</h4>
                <span className="text-[10px] text-zinc-600 ml-2">ID: {messageCount}</span>
              </div>
              <p className="text-zinc-400 text-xs mt-1">{currentNews.description}</p>
              <div className="flex justify-between mt-2 items-center">
                <span className="text-[10px] text-amber-500 font-mono">{currentNews.symbol}</span>
                <span className="text-[10px] text-zinc-500">{currentNews.source}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-2xl relative flex items-center justify-between">
          <p className="text-sm text-zinc-200">
            Someone from <span className="text-lime-400 font-bold">{currentActivity.country}</span> {currentActivity.action} 
            <span className="text-white font-bold mx-1">
              ${currentActivity.amount.toLocaleString()}
            </span>
            {currentActivity.type === "profit" && <span className="text-lime-500 font-bold">profit</span>}
            {currentActivity.type === "withdrawal" && <span className="text-orange-500 font-bold">withdrawal</span>}
          </p>
          <button onClick={() => setIsVisible(false)} className="text-zinc-500 ml-4"><X size={16}/></button>
        </div>
      )}
    </div>
  );
}
