"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"

interface DashboardViewProps {
  userName: string
  onNavigate: (view: "deposit" | "withdraw") => void
}

export function DashboardView({ userName, onNavigate }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily")
  const [cryptoPrices, setCryptoPrices] = useState({
    bitcoin: { price: 0, change: 0 },
    ethereum: { price: 0, change: 0 },
    tether: { price: 0, change: 0 },
    binancecoin: { price: 0, change: 0 },
    ripple: { price: 0, change: 0 },
    cardano: { price: 0, change: 0 },
    solana: { price: 0, change: 0 },
    polkadot: { price: 0, change: 0 },
  })
  const [balance, setBalance] = useState(0)
  const [profitBalance, setProfitBalance] = useState(0)
  const [selectedCurrency, setSelectedCurrency] = useState("USD")

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
    script.async = true
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      dateRange: "12M",
      showChart: true,
      locale: "en",
      width: "100%",
      height: "400",
      largeChartUrl: "",
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      plotLineColorGrowing: "rgba(16, 185, 129, 1)",
      plotLineColorFalling: "rgba(239, 68, 68, 1)",
      gridLineColor: "rgba(42, 46, 57, 0)",
      scaleFontColor: "rgba(120, 123, 134, 1)",
      belowLineFillColorGrowing: "rgba(16, 185, 129, 0.12)",
      belowLineFillColorFalling: "rgba(239, 68, 68, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(16, 185, 129, 0)",
      belowLineFillColorFallingBottom: "rgba(239, 68, 68, 0)",
      symbolActiveColor: "rgba(16, 185, 129, 0.12)",
      tabs: [
        {
          title: "Crypto",
          symbols: [
            { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
            { s: "BINANCE:ETHUSDT", d: "Ethereum" },
            { s: "BINANCE:BNBUSDT", d: "BNB" },
            { s: "BINANCE:SOLUSDT", d: "Solana" },
            { s: "BINANCE:XRPUSDT", d: "Ripple" },
          ],
          originalTitle: "Crypto",
        },
        {
          title: "Forex",
          symbols: [
            { s: "FX:EURUSD", d: "EUR/USD" },
            { s: "FX:GBPUSD", d: "GBP/USD" },
            { s: "FX:USDJPY", d: "USD/JPY" },
            { s: "FX:USDCHF", d: "USD/CHF" },
            { s: "FX:AUDUSD", d: "AUD/USD" },
          ],
          originalTitle: "Forex",
        },
      ],
    })

    const widgetContainer = document.getElementById("tradingview-market-overview")
    if (widgetContainer) {
      widgetContainer.appendChild(script)
    }

    return () => {
      if (widgetContainer && widgetContainer.contains(script)) {
        widgetContainer.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,ripple,cardano,solana,polkadot&vs_currencies=usd&include_24hr_change=true",
        )
        const data = await response.json()
        setCryptoPrices({
          bitcoin: { price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change },
          ethereum: { price: data.ethereum.usd, change: data.ethereum.usd_24h_change },
          tether: { price: data.tether.usd, change: data.tether.usd_24h_change },
          binancecoin: { price: data.binancecoin.usd, change: data.binancecoin.usd_24h_change },
          ripple: { price: data.ripple.usd, change: data.ripple.usd_24h_change },
          cardano: { price: data.cardano.usd, change: data.cardano.usd_24h_change },
          solana: { price: data.solana.usd, change: data.solana.usd_24h_change },
          polkadot: { price: data.polkadot.usd, change: data.polkadot.usd_24h_change },
        })
      } catch (error) {
        console.log("[v0] Error fetching crypto prices:", error)
      }
    }

    fetchCryptoPrices()
    const interval = setInterval(fetchCryptoPrices, 30000)
    return () => clearInterval(interval)
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
      }
    })

    return () => unsubscribe()
  }, [])

  const cryptoData = [
    { id: "bitcoin", name: "Bitcoin", symbol: "BTC", icon: "₿", color: "orange" },
    { id: "ethereum", name: "Ethereum", symbol: "ETH", icon: "Ξ", color: "purple" },
    { id: "tether", name: "Tether", symbol: "USDT", icon: "₮", color: "emerald" },
    { id: "binancecoin", name: "BNB", symbol: "BNB", icon: "◆", color: "yellow" },
    { id: "ripple", name: "Ripple", symbol: "XRP", icon: "✕", color: "blue" },
    { id: "cardano", name: "Cardano", symbol: "ADA", icon: "₳", color: "cyan" },
    { id: "solana", name: "Solana", symbol: "SOL", icon: "◎", color: "violet" },
    { id: "polkadot", name: "Polkadot", symbol: "DOT", icon: "●", color: "pink" },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24 px-4">
      {/* Welcome Section */}
      <div className="pt-2">
        <p className="text-neutral-400 text-sm">Welcome back,</p>
        <div className="flex items-center gap-2 mt-1">
          <h1 className="text-2xl font-bold text-white">{userName}</h1>
          <span className="text-lg">✓</span>
        </div>
        <p className="text-neutral-400 text-sm mt-2">Here&apos;s what&apos;s happening with your account today.</p>
      </div>

      {/* Total Balance Card - Full Width */}
      <div className="bg-gradient-to-br from-lime-400/20 to-lime-400/5 rounded-3xl p-5 border border-lime-400/30">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral-400 text-sm mb-2">Total Balance</p>
            <h2 className="text-4xl font-bold text-white">${(balance + profitBalance).toFixed(2)}</h2>
            <p className="text-neutral-500 text-xs mt-2">≈ {((balance + profitBalance) / 40000).toFixed(6)} BTC</p>
          </div>
          <div className="text-5xl">💰</div>
        </div>
      </div>

      {/* Balance Cards Grid - 2 Column */}
      <div className="grid grid-cols-2 gap-3">
        {/* Main Balance */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl p-4 border border-purple-500/30">
          <p className="text-neutral-400 text-xs mb-2">Main Balance</p>
          <h3 className="text-2xl font-bold text-white">${balance.toFixed(2)}</h3>
          <p className="text-neutral-500 text-xs mt-2">≈ {(balance / 40000).toFixed(6)} BTC</p>
        </div>
        
        {/* Profit Balance */}
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-2xl p-4 border border-orange-500/30">
          <p className="text-neutral-400 text-xs mb-2">Profit Balance</p>
          <h3 className="text-2xl font-bold text-white">${profitBalance.toFixed(2)}</h3>
          <p className="text-neutral-500 text-xs mt-2">≈ {(profitBalance / 40000).toFixed(6)} BTC</p>
        </div>
      </div>

      {/* Action Buttons - Full Width Stacked */}
      <div className="space-y-2">
        <button
          onClick={() => onNavigate("deposit")}
          className="w-full bg-lime-400 hover:bg-lime-500 text-black font-bold py-4 rounded-2xl transition-all active:scale-95 text-base flex items-center justify-center gap-2"
        >
          <span>+</span> Fund Wallet
        </button>
        <button
          onClick={() => onNavigate("withdraw")}
          className="w-full border-2 border-lime-400 hover:bg-lime-400/10 text-lime-400 font-bold py-4 rounded-2xl transition-all active:scale-95 text-base flex items-center justify-center gap-2"
        >
          <span>↗</span> Withdraw Funds
        </button>
      </div>

      {/* Account Overview Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Account Overview</h3>
          <select
            onChange={(e) => setActiveTab(e.target.value as any)}
            value={activeTab}
            className="text-xs bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-neutral-400 focus:outline-none"
          >
            <option value="daily">This Month</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="yearly">This Year</option>
          </select>
        </div>

        {/* Earnings Stats */}
        <div className="space-y-2">
          <p className="text-neutral-400 text-sm">Total Earnings</p>
          <h3 className="text-3xl font-bold text-lime-400">${(balance + profitBalance).toFixed(2)}</h3>
          <p className="text-lime-400 text-sm font-semibold">▲ 12.45% vs last month</p>
        </div>

        {/* Chart */}
        <div className="bg-neutral-900/50 rounded-2xl p-4 relative border border-neutral-800" style={{ height: "200px" }}>
          {/* SVG Chart */}
          <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d4ff00" stopOpacity="0.3" />
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
            <circle cx="400" cy="120" r="5" fill="#d4ff00" />
          </svg>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Recent Transactions</h3>
          <button className="text-lime-400 text-sm hover:underline">View All</button>
        </div>
        
        <div className="space-y-2">
          {/* Transaction Items */}
          <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <span>↓</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Deposit</p>
                <p className="text-neutral-400 text-xs">Wallet Funding via USDT</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lime-400 text-sm font-semibold">+$2,500.00</p>
              <p className="text-neutral-400 text-xs">Completed</p>
            </div>
          </div>

          <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <span>↑</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Withdrawal</p>
                <p className="text-neutral-400 text-xs">USDT to 0x8d***9f83</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-red-400 text-sm font-semibold">-$1,200.00</p>
              <p className="text-neutral-400 text-xs">Completed</p>
            </div>
          </div>

          <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <span>📊</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Profit</p>
                <p className="text-neutral-400 text-xs">Trading Profit</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lime-400 text-sm font-semibold">+$560.00</p>
              <p className="text-neutral-400 text-xs">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-2">
          <button className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors">
            <span className="text-2xl">💰</span>
            <p className="text-xs text-center text-neutral-400">Fund Wallet</p>
          </button>
          <button className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors">
            <span className="text-2xl">↑</span>
            <p className="text-xs text-center text-neutral-400">Withdraw</p>
          </button>
          <button className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors">
            <span className="text-2xl">↔</span>
            <p className="text-xs text-center text-neutral-400">Transfer</p>
          </button>
        </div>
      </div>

      {/* Invite & Earn Card */}
      <div className="bg-gradient-to-br from-lime-400 via-lime-300 to-lime-200 rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-20 text-6xl">🎁</div>
        <h3 className="text-lg font-bold text-black relative z-10">Invite & Earn</h3>
        <p className="text-sm text-black/80 mt-2 relative z-10">Earn up to 10% commission</p>
        <button className="text-lime-600 text-sm font-semibold hover:underline mt-3 relative z-10">View Referrals →</button>
      </div>


    </div>
  )
}
