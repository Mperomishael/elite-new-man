// ...existing code...
"use client"

import React, { useState } from "react"
import { Bitcoin, Wallet, AlertCircle, Check } from "lucide-react"
import { createWithdrawalRequest } from "@/lib/admin-service"

interface WithdrawViewProps {
  userId: string
  username: string
  availableBalance: number
}

export function WithdrawView({ userId, username, availableBalance }: WithdrawViewProps) {
  const [amount, setAmount] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState<"BTC" | "USDT">("BTC")
  const [walletAddress, setWalletAddress] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const MIN_WITHDRAWAL = 100
  const quickPercentages = [25, 50, 75, 100]

  const handlePercentage = (percentage: number) => {
    const withdrawAmount = ((availableBalance * percentage) / 100).toFixed(2)
    setAmount(withdrawAmount)
  }

  const handleWithdraw = async () => {
    const parsedAmount = Number.parseFloat(amount || "0")

    // basic validation
    if (!amount || !walletAddress || parsedAmount <= 0 || parsedAmount > availableBalance || parsedAmount < MIN_WITHDRAWAL) {
      setErrorMessage(
        !walletAddress
          ? "Please add a wallet address."
          : parsedAmount < MIN_WITHDRAWAL
          ? `Minimum withdrawal is $${MIN_WITHDRAWAL}.`
          : parsedAmount > availableBalance
          ? "Withdrawal amount exceeds available balance."
          : "Please enter a valid amount."
      )
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      const result = await createWithdrawalRequest(
        userId,
        username,
        parsedAmount,
        selectedCrypto,
        walletAddress,
      )

      if (result && result.success) {
        setIsSubmitted(true)
      } else {
        setErrorMessage(result?.message || "Processed sucessfully.")
      }
    } catch (err) {
      setErrorMessage("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Withdrawal Request Submitted!</h3>
            <p className="text-slate-300 text-sm">
              Your withdrawal request for ${amount} has been submitted. You will be
              notified once it's processed.
            </p>
          </div>
          <button
            onClick={() => {
              setIsSubmitted(false)
              setAmount("")
              setWalletAddress("")
              setErrorMessage("")
            }}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
          >
            Make Another Withdrawal
          </button>
        </div>
      </div>
    )
  }

  const parsedAmountForWarning = Number.parseFloat(amount || "0")
  const formDisabled = isLoading || availableBalance < MIN_WITHDRAWAL

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 pb-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-1">Withdraw Funds</h2>
        <p className="text-slate-400 text-xs md:text-sm">Transfer money from your account</p>
      </div>

      {/* Available Balance */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 md:p-5 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs md:text-sm mb-1">Available Balance</p>
            <p className="text-2xl md:text-3xl font-bold">${availableBalance?.toFixed(2)}</p>
          </div>
          <Wallet className="w-8 h-8 md:w-10 md:h-10 text-slate-600" />
        </div>
      </div>

      {/* Balance too low notice */}
      {availableBalance < MIN_WITHDRAWAL && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 md:p-4 flex items-start gap-2 md:gap-3">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-yellow-300">
            Your available balance is below the minimum withdrawal amount of ${MIN_WITHDRAWAL}. Add funds to withdraw.
          </p>
        </div>
      )}

      {/* Crypto Selection */}
      <div className="space-y-2">
        <label className="text-xs md:text-sm font-medium">Select Cryptocurrency</label>
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <button
            onClick={() => setSelectedCrypto("BTC")}
            disabled={formDisabled}
            className={`p-3 md:p-4 rounded-xl border-2 transition-all ${selectedCrypto === "BTC"
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-slate-800 bg-slate-900 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <Bitcoin className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
              <div className="text-left">
                <p className="font-bold text-sm md:text-base">Bitcoin</p>
                <p className="text-xs text-slate-400">BTC</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setSelectedCrypto("USDT")}
            disabled={formDisabled}
            className={`p-3 md:p-4 rounded-xl border-2 transition-all ${selectedCrypto === "USDT"
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-slate-800 bg-slate-900 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-xs md:text-sm font-bold">₮</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-sm md:text-base">Tether</p>
                <p className="text-xs text-slate-400">USDT</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
        <label className="text-xs md:text-sm text-slate-400 mb-2 block">Withdrawal Amount (USD)</label>
        <p className="text-xs text-amber-400 mb-3">Minimum withdrawal: ${MIN_WITHDRAWAL}</p>
        <div className="relative mb-3 md:mb-4">
          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-xl md:text-2xl font-bold text-slate-400">
            $
          </span>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min={MIN_WITHDRAWAL}
            max={availableBalance}
            disabled={formDisabled}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 md:pl-10 pr-4 py-3 md:py-4 text-2xl md:text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
          />
        </div>

        {/* Quick Percentage Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {quickPercentages.map((percentage) => (
            <button
              key={percentage}
              onClick={() => handlePercentage(percentage)}
              disabled={formDisabled}
              className="bg-slate-800 hover:bg-slate-700 rounded-lg py-2 text-xs md:text-sm font-medium transition-colors active:scale-95 disabled:opacity-60"
            >
              {percentage}%
            </button>
          ))}
        </div>
      </div>

      {/* Wallet Address Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
        <label className="text-xs md:text-sm text-slate-400 mb-2 block">{selectedCrypto} Wallet Address</label>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder={`Enter your ${selectedCrypto} wallet address`}
          disabled={formDisabled}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
        />
      </div>

      {/* Warning */}
      {amount && (parsedAmountForWarning > availableBalance || parsedAmountForWarning < MIN_WITHDRAWAL) && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 md:p-4 flex items-start gap-2 md:gap-3">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-red-300">
            {parsedAmountForWarning > availableBalance
              ? "Withdrawal amount exceeds available balance"
              : `Minimum withdrawal amount is $${MIN_WITHDRAWAL}`}
          </p>
        </div>
      )}

      {/* Inline error message */}
      {errorMessage && (
        <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-3 md:p-4 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {/* Withdraw Button */}
      <button
        onClick={handleWithdraw}
        disabled={
          !amount ||
          !walletAddress ||
          Number.parseFloat(amount || "0") <= 0 ||
          Number.parseFloat(amount || "0") > availableBalance ||
          Number.parseFloat(amount || "0") < MIN_WITHDRAWAL ||
          isLoading ||
          availableBalance < MIN_WITHDRAWAL
        }
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 md:py-4 rounded-xl transition-all duration-300 transform active:scale-95 text-sm md:text-base disabled:opacity-60"
      >
        {isLoading ? "Submitting..." : `Request Withdrawal $${amount || "0.00"}`}
      </button>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 md:p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <p className="font-semibold mb-1">Important:</p>
          <ul className="space-y-1 text-xs">
    
            <li>• Processing typically takes 15-60 minutes</li>
            <li>• Ensure your wallet address is correct</li>
            <li>• You will be notified once processed</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
// ...existing code...
