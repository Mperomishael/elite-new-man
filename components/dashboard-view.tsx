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
    <div className="max-w-2xl mx-auto space-y-5 pb-24 px-4">
      {/* Welcome Section - Compact */}
      <div className="pt-3">
        <p className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">Welcome back</p>
        <h1 className="text-3xl font-bold text-white mt-1">{userName}</h1>
      </div>

      {/* Portfolio Value Card - Premium */}
      <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-neutral-500 text-xs uppercase tracking-wider font-semibold mb-2">Portfolio Value</p>
            <h2 className="text-4xl font-bold text-white">${(balance + profitBalance).toFixed(2)}</h2>
            <div className="flex items-center gap-4 mt-3">
              <div>
                <p className="text-neutral-500 text-xs">≈ {((balance + profitBalance) / 40000).toFixed(6)} BTC</p>
              </div>
              <div className="flex items-center gap-1 bg-lime-400/10 px-2 py-1 rounded">
                <span className="text-lime-400 text-xs font-semibold">+12.45%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Cards Grid - 2 Column */}
      <div className="grid grid-cols-2 gap-3">
        {/* Available Balance */}
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <p className="text-neutral-500 text-xs uppercase tracking-wide font-semibold mb-3">Available</p>
          <h3 className="text-2xl font-bold text-white">${balance.toFixed(2)}</h3>
          <p className="text-neutral-500 text-xs mt-2">{(balance / 40000).toFixed(6)} BTC</p>
        </div>
        
        {/* Profit Balance */}
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <p className="text-neutral-500 text-xs uppercase tracking-wide font-semibold mb-3">Earnings</p>
          <h3 className="text-2xl font-bold text-lime-400">${profitBalance.toFixed(2)}</h3>
          <p className="text-neutral-500 text-xs mt-2">{(profitBalance / 40000).toFixed(6)} BTC</p>
        </div>
      </div>

      {/* Action Buttons - Compact */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate("deposit")}
          className="bg-lime-400 hover:bg-lime-500 text-black font-bold py-3 rounded-xl transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
        >
          <span>+</span> Deposit
        </button>
        <button
          onClick={() => onNavigate("withdraw")}
          className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 text-sm flex items-center justify-center gap-2 border border-neutral-700"
        >
          <span>↗</span> Withdraw
        </button>
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

      {/* Recent Transactions */}
      <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Transactions</h3>
          <button className="text-lime-400 text-xs hover:text-lime-300 font-semibold">View All</button>
        </div>
        
        <div className="space-y-3">
          {/* Deposit Transaction */}
          <div className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-lime-400/20 rounded-lg flex items-center justify-center text-xs">
                <span className="text-lime-400">↓</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Deposit</p>
                <p className="text-neutral-500 text-xs">Wallet Funding via USDT</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lime-400 text-sm font-semibold">+$2,500</p>
            </div>
          </div>

          {/* Withdrawal Transaction */}
          <div className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-500/20 rounded-lg flex items-center justify-center text-xs">
                <span className="text-red-400">↑</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Withdrawal</p>
                <p className="text-neutral-500 text-xs">USDT to 0x8d***9f83</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-red-400 text-sm font-semibold">-$1,200</p>
            </div>
          </div>

          {/* Profit Transaction */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-lime-400/20 rounded-lg flex items-center justify-center text-xs">
                <span className="text-lime-400">+</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Trading Profit</p>
                <p className="text-neutral-500 text-xs">Realized gain from trade</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lime-400 text-sm font-semibold">+$560</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-3 gap-3">
        <button className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors">
          <span className="text-xl">💰</span>
          <p className="text-xs text-center text-neutral-400 font-medium">Deposit</p>
        </button>
        <button className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors">
          <span className="text-xl">📤</span>
          <p className="text-xs text-center text-neutral-400 font-medium">Withdraw</p>
        </button>
        <button className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors">
          <span className="text-xl">↔</span>
          <p className="text-xs text-center text-neutral-400 font-medium">Transfer</p>
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
