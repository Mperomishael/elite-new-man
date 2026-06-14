"use client"

import { useState, useEffect } from "react"
import { Search, TrendingUp, Star } from "lucide-react"
import { auth } from "@/lib/firebase"
import { getUserProfile, getUserTransactions, updateUserBalance, addTransaction, logUserActivity } from "@/lib/auth-service"

export function BuyingView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [orderType, setOrderType] = useState<"market" | "limit">("market")
  const [assetType, setAssetType] = useState<"crypto" | "forex">("crypto")
  const [userBalance, setUserBalance] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser
      if (user) {
        const profile = await getUserProfile(user.uid)
        if (profile) {
          setUserBalance(profile.balance)
        }
        const userTransactions = await getUserTransactions(user.uid)
        const buyTransactions = userTransactions.filter((t) => t.type === "buy")
        setTransactions(buyTransactions)
      }
    }
    fetchUserData()
  }, [])

  useEffect(() => {
    if (selectedAsset) {
      const script = document.createElement("script")
      script.src = "https://s3.tradingview.com/tv.js"
      script.async = true
      script.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            container_id: "tradingview_chart",
            autosize: true,
            symbol: assetType === "crypto" ? `BINANCE:${selectedAsset.replace("/", "")}` : `FX:${selectedAsset}`,
            interval: "D",
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            toolbar_bg: "#0f172a",
            enable_publishing: false,
            hide_side_toolbar: false,
            allow_symbol_change: true,
            studies: ["STD;SMA", "STD;RSI"],
            height: 500,
            width: "100%",
          })
        }
      }
      document.body.appendChild(script)

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script)
        }
      }
    }
  }, [selectedAsset, assetType])

  useEffect(() => {
    if (!selectedAsset) {
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.async = true
      script.textContent = JSON.stringify({
        width: "100%",
        height: 490,
        defaultColumn: "overview",
        screener_type: assetType === "crypto" ? "crypto_mkt" : "forex_mkt",
        displayCurrency: "USD",
        colorTheme: "dark",
        locale: "en",
      })

      const widgetContainer = document.getElementById("tradingview-screener")
      if (widgetContainer) {
        widgetContainer.innerHTML = ""
        widgetContainer.appendChild(script)
      }

      const scriptLoader = document.createElement("script")
      scriptLoader.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js"
      scriptLoader.async = true
      widgetContainer?.appendChild(scriptLoader)

      return () => {
        if (widgetContainer && widgetContainer.contains(script)) {
          widgetContainer.removeChild(script)
        }
        if (widgetContainer && widgetContainer.contains(scriptLoader)) {
          widgetContainer.removeChild(scriptLoader)
        }
      }
    }
  }, [assetType, selectedAsset])

  const cryptoAssets = [
    { symbol: "BTCUSDT", name: "Bitcoin", price: 50125.5, change: 2.5, favorite: true },
    { symbol: "ETHUSDT", name: "Ethereum", price: 2300.75, change: 1.8, favorite: true },
    { symbol: "USDTUSDT", name: "Tether", price: 1.0, change: 0.01, favorite: false },
    { symbol: "BNBUSDT", name: "BNB", price: 315.25, change: 3.2, favorite: false },
    { symbol: "SOLUSDT", name: "Solana", price: 98.45, change: 5.1, favorite: true },
  ]

  const forexAssets = [
    { symbol: "EURUSD", name: "Euro / US Dollar", price: 1.0856, change: 0.15, favorite: true },
    { symbol: "GBPUSD", name: "British Pound / US Dollar", price: 1.2634, change: -0.23, favorite: false },
    { symbol: "USDJPY", name: "US Dollar / Japanese Yen", price: 149.85, change: 0.45, favorite: false },
    { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", price: 0.6523, change: 0.32, favorite: false },
    { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", price: 1.3542, change: -0.18, favorite: false },
  ]

  const assets = assetType === "crypto" ? cryptoAssets : forexAssets

  const filteredAssets = assets.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Buy Assets</h2>
        <p className="text-neutral-400 text-sm">Purchase cryptocurrencies and forex</p>
      </div>

      {/* Asset Type Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setAssetType("crypto")
            setSelectedAsset(null)
          }}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            assetType === "crypto" ? "bg-lime-400 text-white" : "bg-neutral-800 text-neutral-400"
          }`}
        >
          Crypto
        </button>
        <button
          onClick={() => {
            setAssetType("forex")
            setSelectedAsset(null)
          }}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            assetType === "forex" ? "bg-lime-400 text-white" : "bg-neutral-800 text-neutral-400"
          }`}
        >
          Forex
        </button>
      </div>

      {!selectedAsset && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Live {assetType === "crypto" ? "Crypto" : "Forex"} Markets Worldwide</h3>
          <div className="bg-neutral-900/50 rounded-2xl overflow-hidden border border-neutral-800">
            <div id="tradingview-screener" className="tradingview-widget-container">
              <div className="tradingview-widget-container__widget"></div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -tranneutral-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search assets..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
        />
      </div>

      {/* Asset List */}
      {!selectedAsset ? (
        <div className="space-y-2">
          {filteredAssets.map((asset) => (
            <button
              key={asset.symbol}
              onClick={() => setSelectedAsset(asset.symbol)}
              className="w-full bg-neutral-900 border border-neutral-800 hover:border-lime-400 rounded-xl p-4 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-lime-400/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-lime-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{asset.symbol}</p>
                      {asset.favorite && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                    </div>
                    <p className="text-xs text-neutral-400">{asset.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${asset.price.toLocaleString()}</p>
                  <p className={`text-xs ${asset.change >= 0 ? "text-lime-400" : "text-red-400"}`}>
                    {asset.change >= 0 ? "+" : ""}
                    {asset.change}%
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Buy Form with TradingView Chart */
        <div className="space-y-4">
          <button onClick={() => setSelectedAsset(null)} className="text-sm text-lime-400 hover:text-lime-300">
            ← Back to assets
          </button>

          {/* TradingView Chart */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div id="tradingview_chart" style={{ height: "500px" }} />
          </div>

          {/* Selected Asset Info */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">{selectedAsset}</p>
                <p className="text-sm text-neutral-400">{assets.find((a) => a.symbol === selectedAsset)?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl">
                  ${assets.find((a) => a.symbol === selectedAsset)?.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Order Type */}
          <div className="flex gap-2">
            <button
              onClick={() => setOrderType("market")}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                orderType === "market" ? "bg-lime-400 text-white" : "bg-neutral-800 text-neutral-400"
              }`}
            >
              Market Order
            </button>
            <button
              onClick={() => setOrderType("limit")}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                orderType === "limit" ? "bg-lime-400 text-white" : "bg-neutral-800 text-neutral-400"
              }`}
            >
              Limit Order
            </button>
          </div>

          {/* Amount Input */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <label className="text-sm text-neutral-400 mb-2 block">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -tranneutral-y-1/2 text-xl font-bold text-neutral-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black border border-neutral-700 rounded-lg pl-9 pr-4 py-3 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>
            {amount && (
              <p className="text-xs text-neutral-400 mt-2">
                ≈{" "}
                {(Number.parseFloat(amount) / (assets.find((a) => a.symbol === selectedAsset)?.price || 1)).toFixed(6)}{" "}
                {selectedAsset?.split("/")[0]}
              </p>
            )}
          </div>

          {/* Buy Button */}
          <button
            disabled={!amount || Number.parseFloat(amount) <= 0}
            className="w-full bg-lime-400 hover:bg-lime-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold py-4 rounded-xl transition-all duration-300 transform active:scale-95"
            onClick={async () => {
              if (!selectedAsset || !amount || Number.parseFloat(amount) <= 0) return

              const user = auth.currentUser
              if (!user) return

              const buyAmount = Number.parseFloat(amount)
              if (buyAmount > userBalance) {
                alert("Insufficient balance")
                return
              }

              const newBalance = userBalance - buyAmount
              await updateUserBalance(user.uid, newBalance)

              const assetPrice = assets.find((a) => a.symbol === selectedAsset)?.price || 0
              const quantity = buyAmount / assetPrice

              // Enhanced buy button with real-time transaction sync
              await addTransaction(user.uid, {
                type: "buy",
                amount: buyAmount,
                currency: selectedAsset,
                status: "completed",
                timestamp: new Date().toISOString(),
                description: `Bought ${quantity.toFixed(6)} ${selectedAsset} at $${assetPrice}`,
              })

              try {
                await logUserActivity(user.uid, {
                  type: "trade",
                  description: `Bought ${quantity.toFixed(6)} ${selectedAsset} at $${assetPrice}`,
                  amount: buyAmount,
                })
              } catch (err) {
                console.error("[v0] Failed to log trade activity:", err)
              }

              setUserBalance(newBalance)
              setAmount("")
              setSelectedAsset(null)
              alert("Purchase successful! Check transaction history for details.")
            }}
          >
            Buy {selectedAsset}
          </button>
        </div>
      )}
    </div>
  )
}

// Declare TradingView on window object
declare global {
  interface Window {
    TradingView: any
  }
}
