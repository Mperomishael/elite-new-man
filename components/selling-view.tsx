"use client"

import { useState, useEffect } from "react"
import { TrendingDown, Wallet } from "lucide-react"
import { auth, getUserProfile, getUserTransactions, updateUserBalance, addTransaction, logUserActivity } from "@/lib/auth-service"

export function SellingView() {
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
        const sellTransactions = userTransactions.filter((t) => t.type === "sell")
        setTransactions(sellTransactions)
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
            container_id: "tradingview_chart_sell",
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

      const widgetContainer = document.getElementById("tradingview-screener-sell")
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

  const cryptoHoldings = [
    {
      symbol: "BTCUSDT",
      name: "Bitcoin",
      quantity: 0.025,
      currentPrice: 50125.5,
      totalValue: 1253.14,
      profit: 125.5,
      profitPercent: 11.1,
    },
    {
      symbol: "ETHUSDT",
      name: "Ethereum",
      quantity: 1.5,
      currentPrice: 2300.75,
      totalValue: 3451.13,
      profit: 245.3,
      profitPercent: 7.6,
    },
  ]

  const forexHoldings = [
    {
      symbol: "EURUSD",
      name: "Euro / US Dollar",
      quantity: 10000,
      currentPrice: 1.0856,
      totalValue: 10856.0,
      profit: 156.0,
      profitPercent: 1.46,
    },
    {
      symbol: "GBPUSD",
      name: "British Pound / US Dollar",
      quantity: 5000,
      currentPrice: 1.2634,
      totalValue: 6317.0,
      profit: -83.0,
      profitPercent: -1.3,
    },
  ]

  const holdings = assetType === "crypto" ? cryptoHoldings : forexHoldings

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Sell Assets</h2>
        <p className="text-neutral-400 text-sm">Sell your holdings</p>
      </div>

      {/* Asset Type Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setAssetType("crypto")
            setSelectedAsset(null)
          }}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            assetType === "crypto" ? "bg-red-500 text-white" : "bg-neutral-800 text-neutral-400"
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
            assetType === "forex" ? "bg-red-500 text-white" : "bg-neutral-800 text-neutral-400"
          }`}
        >
          Forex
        </button>
      </div>

      {!selectedAsset && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Live {assetType === "crypto" ? "Crypto" : "Forex"} Markets Worldwide</h3>
          <div className="bg-neutral-900/50 rounded-2xl overflow-hidden border border-neutral-800">
            <div id="tradingview-screener-sell" className="tradingview-widget-container">
              <div className="tradingview-widget-container__widget"></div>
            </div>
          </div>
        </div>
      )}

      {/* Holdings List */}
      {!selectedAsset ? (
        <div className="space-y-2">
          {holdings.map((holding) => (
            <button
              key={holding.symbol}
              onClick={() => setSelectedAsset(holding.symbol)}
              className="w-full bg-neutral-900 border border-neutral-800 hover:border-red-500 rounded-xl p-4 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-semibold">{holding.symbol}</p>
                    <p className="text-xs text-neutral-400">{holding.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${holding.totalValue.toLocaleString()}</p>
                  <p className={`text-xs ${holding.profit >= 0 ? "text-lime-400" : "text-red-400"}`}>
                    {holding.profit >= 0 ? "+" : ""}${holding.profit.toFixed(2)} (
                    {holding.profitPercent >= 0 ? "+" : ""}
                    {holding.profitPercent}%)
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-800">
                <span>Quantity: {holding.quantity}</span>
                <span>Price: ${holding.currentPrice.toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Sell Form with TradingView Chart */
        <div className="space-y-4">
          <button onClick={() => setSelectedAsset(null)} className="text-sm text-red-400 hover:text-red-300">
            ← Back to holdings
          </button>

          {/* TradingView Chart */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div id="tradingview_chart_sell" style={{ height: "500px" }} />
          </div>

          {/* Selected Asset Info */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-lg">{selectedAsset}</p>
                <p className="text-sm text-neutral-400">{holdings.find((h) => h.symbol === selectedAsset)?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl">
                  ${holdings.find((h) => h.symbol === selectedAsset)?.currentPrice.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-400">Available:</span>
              <span className="font-semibold">
                {holdings.find((h) => h.symbol === selectedAsset)?.quantity} {selectedAsset?.split("/")[0]}
              </span>
            </div>
          </div>

          {/* Order Type */}
          <div className="flex gap-2">
            <button
              onClick={() => setOrderType("market")}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                orderType === "market" ? "bg-red-500 text-white" : "bg-neutral-800 text-neutral-400"
              }`}
            >
              Market Order
            </button>
            <button
              onClick={() => setOrderType("limit")}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                orderType === "limit" ? "bg-red-500 text-white" : "bg-neutral-800 text-neutral-400"
              }`}
            >
              Limit Order
            </button>
          </div>

          {/* Amount Input */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <label className="text-sm text-neutral-400 mb-2 block">Quantity to Sell</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              max={holdings.find((h) => h.symbol === selectedAsset)?.quantity}
              className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {amount && (
              <p className="text-xs text-neutral-400 mt-2">
                ≈ $
                {(
                  Number.parseFloat(amount) * (holdings.find((h) => h.symbol === selectedAsset)?.currentPrice || 0)
                ).toFixed(2)}{" "}
                USD
              </p>
            )}
          </div>

          {/* Quick Percentage Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percentage) => (
              <button
                key={percentage}
                onClick={() => {
                  const maxQuantity = holdings.find((h) => h.symbol === selectedAsset)?.quantity || 0
                  setAmount(((maxQuantity * percentage) / 100).toString())
                }}
                className="bg-neutral-800 hover:bg-neutral-700 rounded-lg py-2 text-sm font-medium transition-colors"
              >
                {percentage}%
              </button>
            ))}
          </div>

          <button
            disabled={!amount || Number.parseFloat(amount) <= 0}
            onClick={async () => {
              if (!selectedAsset || !amount || Number.parseFloat(amount) <= 0) return

              const user = auth.currentUser
              if (!user) return

              const holding = holdings.find((h) => h.symbol === selectedAsset)
              if (!holding || Number.parseFloat(amount) > holding.quantity) {
                alert("Insufficient holdings")
                return
              }

              const sellQuantity = Number.parseFloat(amount)
              const sellAmount = sellQuantity * (holding.currentPrice || 0)
              const newBalance = userBalance + sellAmount

              await updateUserBalance(user.uid, newBalance)

              await addTransaction(user.uid, {
                type: "sell",
                amount: sellAmount,
                currency: selectedAsset,
                status: "completed",
                timestamp: new Date().toISOString(),
                description: `Sold ${sellQuantity} ${selectedAsset} at $${holding.currentPrice}`,
              })

              try {
                await logUserActivity(user.uid, {
                  type: "trade",
                  description: `Sold ${sellQuantity} ${selectedAsset} at $${holding.currentPrice}`,
                  amount: sellAmount,
                })
              } catch (err) {
                console.error("[v0] Failed to log trade activity:", err)
              }

              setUserBalance(newBalance)
              setAmount("")
              setSelectedAsset(null)
              alert("Sale successful! Check transaction history for details.")
            }}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold py-4 rounded-xl transition-all duration-300 transform active:scale-95"
          >
            Sell {selectedAsset}
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
