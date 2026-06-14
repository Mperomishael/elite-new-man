"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Eye, Check, MoreVertical } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { doc, onSnapshot, collection, query, where, orderBy, limit, onSnapshot as firestoreOnSnapshot } from "firebase/firestore"

interface Transaction {
  id: string
  userId: string
  type: "deposit" | "withdraw" | "profit"
  amount: number
  description?: string
  status: "pending" | "completed" | "failed"
  timestamp: number
}

interface DashboardViewProps {
  userName: string
  onNavigate: (view: "deposit" | "withdraw") => void
}

export function DashboardView({ userName, onNavigate }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily")
  const [balance, setBalance] = useState(0)
  const [profitBalance, setProfitBalance] = useState(0)
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [kycStatus, setKycStatus] = useState("pending")

  // TradingView crypto price widget - same widget used in the Buying section
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js"
    script.async = true
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: 400,
      defaultColumn: "overview",
      screener_type: "crypto_mkt",
      displayCurrency: "USD",
      colorTheme: "dark",
      locale: "en",
    })

    const widgetContainer = document.getElementById("tradingview-dashboard-screener")
    if (widgetContainer) {
      widgetContainer.innerHTML = ""
      widgetContainer.appendChild(script)
    }

    return () => {
      if (widgetContainer && widgetContainer.contains(script)) {
        widgetContainer.removeChild(script)
      }
    }
  }, [])
  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const docRef = doc(db, "users", user.uid)
    const unsubscribe = onSnapshot(docRef, (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setBalance(data.balance || 0)
        setProfitBalance(data.profitBalance || 0)
        setSelectedCurrency(data.currency || "USD")
        setKycStatus(data.kycStatus || "pending")
      }
    })

    return () => unsubscribe()
  }, [])

  // Load recent transactions from Firestore
  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    try {
      const transactionsRef = collection(db, "transactions")
      const q = query(
        transactionsRef,
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(5)
      )

      const unsubscribe = firestoreOnSnapshot(q, (snapshot) => {
        const txs: Transaction[] = []
        snapshot.forEach((doc) => {
          txs.push({
            id: doc.id,
            ...doc.data(),
          } as Transaction)
        })
        setTransactions(txs)
      })

      return () => unsubscribe()
    } catch (error) {
      console.log("[v0] Error loading transactions:", error)
    }
  }, [])

  return (
    <div className="relative max-w-2xl mx-auto space-y-5 pb-24 px-4">
      {/* Faint background image */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: "url('https://i.ibb.co/xKZFTHJW/hero-image.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          filter: "blur(1px) saturate(0.6)",
        }}
      />

      {/* Welcome Section with Status Badge */}
      <div className="pt-3">
        <p className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">Welcome back,</p>
        <div className="flex items-center gap-2 mt-1">
          <h1 className="text-3xl font-bold text-white">{userName}</h1>
          {kycStatus === "approved" && (
            <div className="flex items-center gap-1 bg-lime-400/20 px-2 py-1 rounded-full">
              <Check className="w-4 h-4 text-lime-400" />
              <span className="text-xs font-semibold text-lime-400">Verified</span>
            </div>
          )}
        </div>
        <p className="text-neutral-400 text-sm mt-2">Here&apos;s what&apos;s happening with your account today.</p>
      </div>

      {/* Total Balance Card - Full Width with Icon */}
      <div className="bg-gradient-to-br from-lime-400/10 to-lime-400/5 rounded-2xl p-6 border border-lime-400/30">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-neutral-400 text-sm font-semibold">Total Balance</p>
              <Eye className="w-4 h-4 text-neutral-400" />
            </div>
            <h2 className="text-4xl font-bold text-white">${(balance + profitBalance).toFixed(2)}</h2>
            <p className="text-neutral-500 text-xs mt-2">≈ {((balance + profitBalance) / 40000).toFixed(6)} BTC</p>
          </div>
          <div className="text-5xl">💰</div>
        </div>
      </div>

      {/* Balance Cards Grid - 2 Column with Icons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Main Balance */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-neutral-400 text-xs font-semibold">Main Balance</p>
            <span className="text-xl">👜</span>
          </div>
          <h3 className="text-2xl font-bold text-white">${balance.toFixed(2)}</h3>
          <p className="text-neutral-500 text-xs mt-2">≈ {(balance / 40000).toFixed(6)} BTC</p>
        </div>
        
        {/* Profit Balance */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 rounded-2xl p-4 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-neutral-400 text-xs font-semibold">Profit Balance</p>
            <span className="text-xl">🏆</span>
          </div>
          <h3 className="text-2xl font-bold text-white">${profitBalance.toFixed(2)}</h3>
          <p className="text-neutral-500 text-xs mt-2">≈ {(profitBalance / 40000).toFixed(6)} BTC</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate("deposit")}
          className="bg-lime-400 hover:bg-lime-500 text-black font-bold py-4 rounded-2xl transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
        >
          <span>+</span> Fund Wallet
        </button>
        <button
          onClick={() => onNavigate("withdraw")}
          className="bg-transparent border-2 border-lime-400 hover:bg-lime-400/10 text-lime-400 font-bold py-4 rounded-2xl transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
        >
          <span>↗</span> Withdraw
        </button>
      </div>

      {/* Live Crypto Prices - same widget used in the Buying section */}
      <div className="bg-neutral-900 rounded-2xl p-3 sm:p-4 border border-neutral-800 overflow-hidden">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider px-2 pt-1 pb-2">Live Crypto Prices</h3>
        <div id="tradingview-dashboard-screener" className="tradingview-widget-container w-full overflow-hidden">
          <div className="tradingview-widget-container__widget"></div>
        </div>
      </div>

      {/* Portfolio Performance Section */}
      <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Portfolio Performance</h3>
          <select
            onChange={(e) => setActiveTab(e.target.value as any)}
            value={activeTab}
            className="text-xs bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-300 focus:outline-none hover:border-neutral-600"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* Earnings Stats - Horizontal */}
        <div className="flex items-center justify-between py-2 border-t border-neutral-800">
          <div>
            <p className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">Earnings</p>
            <p className="text-2xl font-bold text-lime-400 mt-1">${(balance + profitBalance).toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">Change</p>
            <p className="text-lg font-bold text-lime-400 mt-1">+12.45%</p>
          </div>
        </div>

        {/* Chart */}
        <div className="pt-2" style={{ height: "180px" }}>
          <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d4ff00" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#d4ff00" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 200 Q 100 180, 200 150 T 400 120 Q 500 100, 600 80 T 800 50"
              fill="url(#chartGradient)"
              stroke="none"
            />
            <path
              d="M 0 200 Q 100 180, 200 150 T 400 120 Q 500 100, 600 80 T 800 50"
              fill="none"
              stroke="#d4ff00"
              strokeWidth="2"
            />
            <circle cx="400" cy="120" r="4" fill="#d4ff00" />
          </svg>
        </div>
      </div>

      {/* Recent Transactions - Real Data */}
      <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Transactions</h3>
          <button className="text-lime-400 text-xs hover:text-lime-300 font-semibold">View All</button>
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-neutral-500 text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const isPositive = tx.type === "deposit" || tx.type === "profit"
              const getIcon = () => {
                switch (tx.type) {
                  case "deposit":
                    return "↓"
                  case "withdraw":
                    return "↑"
                  case "profit":
                    return "📊"
                  default:
                    return "•"
                }
              }
              const getIconBg = () => {
                switch (tx.type) {
                  case "deposit":
                    return "bg-green-500/20"
                  case "withdraw":
                    return "bg-orange-500/20"
                  case "profit":
                    return "bg-purple-500/20"
                  default:
                    return "bg-neutral-800/20"
                }
              }
              const getIconColor = () => {
                switch (tx.type) {
                  case "deposit":
                    return "text-green-400"
                  case "withdraw":
                    return "text-orange-400"
                  case "profit":
                    return "text-purple-400"
                  default:
                    return "text-neutral-400"
                }
              }

              const date = new Date(tx.timestamp)
              const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              const formattedTime = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

              return (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 ${getIconBg()} rounded-lg flex items-center justify-center text-xs`}>
                      <span className={getIconColor()}>{getIcon()}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium capitalize">{tx.type}</p>
                      <p className="text-neutral-500 text-xs">{tx.description || `${tx.type} transaction`}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${isPositive ? "text-lime-400" : "text-red-400"}`}>
                      {isPositive ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-neutral-500 text-xs">{formattedDate} {formattedTime}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-5 gap-2">
        <button
          onClick={() => onNavigate("deposit")}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors"
        >
          <span className="text-2xl">💰</span>
          <p className="text-xs text-center text-neutral-400 font-medium">Fund Wallet</p>
        </button>
        <button
          onClick={() => onNavigate("withdraw")}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors"
        >
          <span className="text-2xl">📤</span>
          <p className="text-xs text-center text-neutral-400 font-medium">Withdraw</p>
        </button>
        <button className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors">
          <span className="text-2xl">↔</span>
          <p className="text-xs text-center text-neutral-400 font-medium">Transfer</p>
        </button>
        <button className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors">
          <span className="text-2xl">⏱</span>
          <p className="text-xs text-center text-neutral-400 font-medium">Transactions</p>
        </button>
        <button className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors">
          <span className="text-2xl">⊞</span>
          <p className="text-xs text-center text-neutral-400 font-medium">More</p>
        </button>
      </div>

      {/* Referral Earnings Card */}
      <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 overflow-hidden relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">Referral Earnings</p>
            <h3 className="text-2xl font-bold text-white mt-2">Invite & Earn</h3>
            <p className="text-neutral-400 text-sm mt-1">Get up to 10% commission on referrals</p>
            <button className="text-lime-400 text-xs font-semibold hover:text-lime-300 mt-3 uppercase tracking-wider">
              View Referrals →
            </button>
          </div>
          <div className="text-4xl opacity-20">🎁</div>
        </div>
      </div>


    </div>
  )
}
