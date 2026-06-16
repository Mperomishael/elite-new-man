"use client"

import { useState, useEffect, useCallback } from "react"
import { X, TrendingUp } from "lucide-react"

// Define types locally since we are troubleshooting build errors
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
  { country: "South Korea", action: "just withdrew", amount: 12150, type: "withdrawal" }
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
    title: "EUR/USD Holds Above 1.16",
    description: "Euro strengthens against dollar on ECB policy expectations.",
    source: "Trading Economics",
    category: "forex",
    symbol: "EURUSD",
    changePercent: 0.16,
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
      audio.play().catch(() => console.log("Audio play blocked by browser"));
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
            <div>
              <h4 className="text-white text-sm font-bold">{currentNews.title}</h4>
              <p className="text-zinc-400 text-xs mt-1">{currentNews.description}</p>
              <div className="flex justify-between mt-2 items-center">
                <span className="text-[10px] text-amber-500 font-mono">{currentNews.symbol}</span>
                <span className="text-[10px] text-zinc-500">{currentNews.source}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-2xl relative">
          <button onClick={() => setIsVisible(false)} className="absolute top-2 right-2 text-zinc-500"><X size={16}/></button>
          <p className="text-sm text-zinc-200">
            Someone from <span className="text-lime-400 font-bold">{currentActivity.country}</span> {currentActivity.action} 
            <span className="text-white font-mono ml-1">${currentActivity.amount.toLocaleString()}</span>
            {currentActivity.type === "profit" && <span className="text-lime-500 ml-1">profit</span>}
          </p>
        </div>
      )}
    </div>
  );
}
