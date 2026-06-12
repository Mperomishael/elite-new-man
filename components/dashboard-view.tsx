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
    <div className="max-w-2xl mx-auto space-y-4 pb-6">
      {/* Balance Section */}
      <div className="space-y-2">
        <p className="text-neutral-400 text-sm">Your total balance</p>
        <div className="flex items-end gap-2">
          <h1 className="text-4xl md:text-5xl font-bold">${(balance + profitBalance).toFixed(2)}</h1>
          {balance + profitBalance > 0 && (
            <span className="text-lime-400 text-base md:text-lg font-semibold mb-1">+0.00%</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
          <div className="text-neutral-400">
            Main Balance: <span className="text-lime-400 font-semibold">${balance.toFixed(2)}</span>
          </div>
          <div className="text-neutral-400">
            Profit Balance: <span className="text-purple-400 font-semibold">${profitBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Time Period Tabs */}
      <div className="flex gap-2 border-b border-neutral-800">
        {(["daily", "weekly", "monthly", "yearly"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium capitalize transition-colors relative ${
              activeTab === tab ? "text-lime-400" : "text-neutral-400 hover:text-neutral-300"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-neutral-900/50 rounded-2xl p-4 md:p-6 relative border border-neutral-800" style={{ height: "250px" }}>
        <div className="absolute top-4 left-4 text-xs text-neutral-400">$10k</div>
        <div className="absolute bottom-20 left-4 text-xs text-neutral-400">$8k</div>
        <div className="absolute bottom-4 left-4 text-xs text-neutral-400">$2k</div>

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
          {/* Tooltip indicator */}
          <circle cx="400" cy="120" r="6" fill="#d4ff00" />
          <circle cx="400" cy="120" r="3" fill="black" />
        </svg>

        {/* Tooltip */}
        <div className="absolute top-1/3 left-1/2 -tranneutral-x-1/2 bg-lime-400 text-black px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-bold">
          ▲ 23%
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-neutral-900/50 rounded-2xl p-4 md:p-5 border border-neutral-800">
          <p className="text-neutral-400 text-xs md:text-sm mb-1 md:mb-2">Wallet</p>
          <p className="text-xl md:text-2xl font-bold text-lime-400">+ 73.5 %</p>
        </div>
        <div className="bg-neutral-900/50 rounded-2xl p-4 md:p-5 border border-neutral-800">
          <p className="text-neutral-400 text-xs md:text-sm mb-1 md:mb-2">Market</p>
          <p className="text-xl md:text-2xl font-bold text-red-400">- 12.0 %</p>
        </div>
        <div className="bg-neutral-900/50 rounded-2xl p-4 md:p-5 border border-neutral-800">
          <p className="text-neutral-400 text-xs md:text-sm mb-1 md:mb-2">Equity Values</p>
          <p className="text-xl md:text-2xl font-bold">2,71.50</p>
        </div>
        <div className="bg-neutral-900/50 rounded-2xl p-4 md:p-5 border border-neutral-800">
          <p className="text-neutral-400 text-xs md:text-sm mb-1 md:mb-2">AVG Costs</p>
          <p className="text-xl md:text-2xl font-bold">89.10</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-base md:text-lg font-bold">Market Overview</h3>
        <div className="bg-neutral-900/50 rounded-2xl overflow-hidden border border-neutral-800">
          <div id="tradingview-market-overview" className="tradingview-widget-container">
            <div className="tradingview-widget-container__widget"></div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-base md:text-lg font-bold">Live Crypto Prices</h3>
        <div className="grid grid-cols-1 gap-2">
          {cryptoData.map((crypto) => {
            const priceData = cryptoPrices[crypto.id as keyof typeof cryptoPrices]
            return (
              <div key={crypto.id} className="bg-neutral-900/50 rounded-xl p-3 md:p-4 flex items-center justify-between border border-neutral-800">
                <div className="flex items-center gap-2 md:gap-3">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 bg-${crypto.color}-500/20 rounded-full flex items-center justify-center`}
                  >
                    <span className="text-lg md:text-xl">{crypto.icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm md:text-base">{crypto.name}</p>
                    <p className="text-xs text-neutral-400">{crypto.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm md:text-base">
                    ${priceData.price < 1 ? priceData.price.toFixed(4) : priceData.price.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    {priceData.change >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-lime-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    )}
                    <p className={`text-xs ${priceData.change >= 0 ? "text-lime-400" : "text-red-400"}`}>
                      {priceData.change >= 0 ? "+" : ""}
                      {priceData.change.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <button
          onClick={() => onNavigate("deposit")}
          className="bg-lime-400 hover:bg-lime-500 text-black font-bold py-3 md:py-4 rounded-xl transition-all active:scale-95 text-sm md:text-base"
        >
          + Fund Wallet
        </button>
        <button
          onClick={() => onNavigate("withdraw")}
          className="border border-lime-400 hover:bg-lime-400/10 text-lime-400 font-bold py-3 md:py-4 rounded-xl transition-all active:scale-95 text-sm md:text-base"
        >
          ↗ Withdraw
        </button>
      </div>

      <div className="bg-neutral-900/50 rounded-2xl p-4 md:p-5 border border-neutral-800">
        <label className="text-xs md:text-sm text-neutral-400 mb-2 block">Display Currency</label>
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
        >
          <option value="USD">US Dollar (USD)</option>
          <option value="EUR">Euro (EUR)</option>
          <option value="GBP">British Pound (GBP)</option>
          <option value="JPY">Japanese Yen (JPY)</option>
          <option value="AUD">Australian Dollar (AUD)</option>
          <option value="CAD">Canadian Dollar (CAD)</option>
          <option value="CHF">Swiss Franc (CHF)</option>
          <option value="CNY">Chinese Yuan (CNY)</option>
          <option value="INR">Indian Rupee (INR)</option>
          <option value="ZAR">South African Rand (ZAR)</option>
        </select>
      </div>
    </div>
  )
}
