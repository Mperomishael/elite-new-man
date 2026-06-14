"use client"

import { useState } from "react"
import { Repeat, TrendingUp, Users, Star, Shield, CheckCircle2 } from "lucide-react"

interface ProTrader {
  id: string
  name: string
  avatar: string
  winRate: number
  profitShare: string
  followers: number
  monthlyReturn: number
  risk: "Low" | "Medium" | "High"
  tags: string[]
}

const proTraders: ProTrader[] = [
  {
    id: "1",
    name: "Alex Carter",
    avatar: "🧑‍💼",
    winRate: 87,
    profitShare: "10%",
    followers: 4820,
    monthlyReturn: 14.6,
    risk: "Medium",
    tags: ["Crypto", "Swing"],
  },
  {
    id: "2",
    name: "Maria Chen",
    avatar: "👩‍💻",
    winRate: 92,
    profitShare: "12%",
    followers: 7310,
    monthlyReturn: 21.3,
    risk: "High",
    tags: ["Forex", "Scalping"],
  },
  {
    id: "3",
    name: "David Okafor",
    avatar: "🧑‍🚀",
    winRate: 79,
    profitShare: "8%",
    followers: 2940,
    monthlyReturn: 9.8,
    risk: "Low",
    tags: ["Crypto", "Long-term"],
  },
  {
    id: "4",
    name: "Sofia Russo",
    avatar: "👩‍🔬",
    winRate: 85,
    profitShare: "10%",
    followers: 5510,
    monthlyReturn: 17.2,
    risk: "Medium",
    tags: ["Stocks", "Forex"],
  },
]

const riskColor = (risk: ProTrader["risk"]) => {
  switch (risk) {
    case "Low":
      return "text-lime-400 bg-lime-400/10 border-lime-400/30"
    case "Medium":
      return "text-amber-400 bg-amber-400/10 border-amber-400/30"
    case "High":
      return "text-red-400 bg-red-400/10 border-red-400/30"
  }
}

export function CopyTradingView() {
  const [copied, setCopied] = useState<Record<string, boolean>>({})

  const handleCopy = (id: string) => {
    setCopied((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Repeat className="w-6 h-6 text-lime-400" />
          <h1 className="text-3xl font-bold">Copy Trading</h1>
        </div>
        <p className="text-neutral-400">
          Automatically mirror the trades of top-performing traders and grow your portfolio passively.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-lime-400/10 border border-lime-400/30 rounded-lg p-4 flex gap-3">
        <Shield className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-lime-400 mb-1">How Copy Trading Works</p>
          <p className="text-xs text-neutral-300">
            Choose a verified trader, set how much of your balance you want to allocate, and every trade they open
            will be mirrored proportionally on your account in real time.
          </p>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{proTraders.length}</p>
          <p className="text-xs text-neutral-400 mt-1">Top Traders</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-lime-400">+15.7%</p>
          <p className="text-xs text-neutral-400 mt-1">Avg. Monthly</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">20K+</p>
          <p className="text-xs text-neutral-400 mt-1">Copiers</p>
        </div>
      </div>

      {/* Traders List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Featured Traders</h3>
        {proTraders.map((trader) => (
          <div key={trader.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-2xl">
                  {trader.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-white text-sm">{trader.name}</p>
                    <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                    <Users className="w-3 h-3" />
                    <span>{trader.followers.toLocaleString()} copiers</span>
                  </div>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${riskColor(trader.risk)}`}>
                {trader.risk} Risk
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-black/40 rounded-lg p-2 text-center">
                <p className="text-xs text-neutral-500">Win Rate</p>
                <p className="text-sm font-bold text-white mt-0.5">{trader.winRate}%</p>
              </div>
              <div className="bg-black/40 rounded-lg p-2 text-center">
                <p className="text-xs text-neutral-500">Monthly Return</p>
                <p className="text-sm font-bold text-lime-400 mt-0.5 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {trader.monthlyReturn}%
                </p>
              </div>
              <div className="bg-black/40 rounded-lg p-2 text-center">
                <p className="text-xs text-neutral-500">Profit Share</p>
                <p className="text-sm font-bold text-white mt-0.5">{trader.profitShare}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              {trader.tags.map((tag) => (
                <span key={tag} className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
              <div className="flex items-center gap-0.5 ml-auto text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.round(trader.winRate / 20) ? "fill-amber-400" : "fill-transparent"}`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => handleCopy(trader.id)}
              className={`w-full mt-4 font-bold py-3 rounded-xl transition-all active:scale-95 text-sm flex items-center justify-center gap-2 ${
                copied[trader.id]
                  ? "bg-neutral-800 border-2 border-lime-400 text-lime-400"
                  : "bg-lime-400 hover:bg-lime-500 text-black"
              }`}
            >
              <Repeat className="w-4 h-4" />
              {copied[trader.id] ? "Copying Active" : "Copy This Trader"}
            </button>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="text-center text-xs text-neutral-500 bg-neutral-900/30 rounded-lg p-3">
        <p>
          Copy trading carries risk. Past performance is not indicative of future results. Only allocate funds you
          are comfortable trading with.
        </p>
      </div>
    </div>
  )
}
