"use client"
import { useState, useMemo, useEffect } from "react"
import { Wallet, Check } from "lucide-react"
import { createWithdrawalRequest } from "@/lib/admin-service"
import { auth } from "@/lib/firebase"

interface WithdrawViewProps {
  userId?: string
  username?: string
  availableBalance?: number
}

export function WithdrawView({ userId = "", username = "", availableBalance = 0 }: WithdrawViewProps) {
  const [amount, setAmount] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState<string>("BTC")
  const [walletAddress, setWalletAddress] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState<"crypto" | "bank">("crypto")

  const [bankCountry, setBankCountry] = useState<string>("United States")
  const [bankName, setBankName] = useState<string>("")
  const [accountNumber, setAccountNumber] = useState<string>("")
  const [accountHolderName, setAccountHolderName] = useState<string>("")

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [updatedBalance, setUpdatedBalance] = useState<number | null>(null)

  const MIN_WITHDRAWAL = 100

  const BANK_OPTIONS: Record<string, string[]> = useMemo(
    () => ({
      "United States": ["Bank of America", "Chase", "Wells Fargo", "CitiBank", "US Bank", "PNC Bank"],
      Canada: ["RBC", "TD Canada Trust", "Scotiabank", "BMO", "CIBC"],
      "United Kingdom": ["HSBC", "Barclays", "Lloyds", "NatWest", "Santander"],
      Nigeria: ["Zenith Bank", "GTBank", "UBA", "Access Bank", "First Bank"],
      Ghana: ["Ecobank", "GCB Bank", "Fidelity Bank Ghana", "Stanbic Ghana"],
      Kenya: ["Equity Bank", "KCB", "Co-operative Bank", "Stanbic Bank Kenya"],
      "South Africa": ["Standard Bank", "FNB", "Nedbank", "Absa", "Capitec"],
      Liberia: ["LBDI", "Ecobank Liberia", "UBA Liberia", "Global Bank Liberia"],
      "United Arab Emirates": ["Emirates NBD", "Abu Dhabi Commercial Bank", "Mashreq Bank"],
      India: ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank"],
      China: ["ICBC", "China Construction Bank", "Agricultural Bank of China", "Bank of China"],
      Brazil: ["Itaú", "Bradesco", "Banco do Brasil", "Santander Brasil"],
    }),
    [],
  )

  useEffect(() => {
    if (BANK_OPTIONS[bankCountry] && !bankName) {
      setBankName(BANK_OPTIONS[bankCountry][0])
    }
  }, [bankCountry, bankName, BANK_OPTIONS])

  useEffect(() => {
    if (!userId) {
      const currentUser = auth.currentUser
      if (currentUser) {
        console.log("[v0] Using current user ID:", currentUser.uid)
      }
    }
  }, [userId])

  const handleWithdraw = async () => {
    const parsedAmount = Number(amount || "0")

    if (isNaN(parsedAmount) || parsedAmount < MIN_WITHDRAWAL || parsedAmount > availableBalance) {
      setErrorMessage(
        parsedAmount < MIN_WITHDRAWAL
          ? `Minimum withdrawal is $${MIN_WITHDRAWAL}.`
          : parsedAmount > availableBalance
            ? "Withdrawal amount exceeds available balance."
            : "Please enter a valid amount.",
      )
      return
    }

    if (withdrawMethod === "crypto" && !walletAddress) {
      setErrorMessage("Please enter your crypto wallet address.")
      return
    }

    if (withdrawMethod === "bank") {
      if (!bankCountry || !bankName || !accountNumber || !accountHolderName) {
        setErrorMessage("Please fill in all bank details.")
        return
      }
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      const destination =
        withdrawMethod === "crypto"
          ? walletAddress
          : `BANK|${bankCountry}|${bankName}|${accountHolderName}|${accountNumber}`

      const currency = withdrawMethod === "crypto" ? selectedCrypto : "BANK"

      const currentUser = auth.currentUser
      if (!currentUser) {
        setErrorMessage("User not authenticated")
        setIsLoading(false)
        return
      }

      console.log("Submitting withdrawal:", {
        userId: currentUser.uid,
        username,
        parsedAmount,
        currency,
        destination,
      })

      const result = await createWithdrawalRequest(currentUser.uid, username, parsedAmount, currency, destination)

      console.log("Withdrawal result:", result)

      if (result?.success) {
        setUpdatedBalance(result.newBalance || 0)
        setIsSubmitted(true)
      } else {
        setErrorMessage(result?.error || "Failed to process request.")
      }
    } catch (err) {
      console.error("Withdraw error:", err)
      setErrorMessage("Network or server error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    const finalBalance = updatedBalance !== null ? updatedBalance : availableBalance - Number(amount || 0)
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Check className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-emerald-400">Withdrawal Successful!</h3>
          <p className="text-slate-300 text-sm">Your withdrawal has been processed.</p>
        </div>

        <div className="bg-slate-900/40 border border-emerald-500/20 rounded-xl p-4 space-y-3 text-left">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Withdrawal Amount:</span>
            <span className="font-bold text-emerald-400">${Number(amount || 0).toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-700/50 pt-3 flex justify-between items-center">
            <span className="text-slate-400">New Balance:</span>
            <span className="font-bold text-lg text-blue-400">${finalBalance.toFixed(2)}</span>
          </div>
          <div className="text-xs text-slate-400 pt-2">
            {withdrawMethod === "crypto"
              ? `Sent to: ${walletAddress.substring(0, 10)}...${walletAddress.substring(walletAddress.length - 8)}`
              : `Bank: ${bankName} (${bankCountry})`}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <p className="text-blue-300 text-xs">
            Your withdrawal is now pending approval. You'll receive an update shortly.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full text-emerald-400 hover:text-emerald-300 text-sm font-medium bg-emerald-500/10 hover:bg-emerald-500/20 py-2 rounded-xl transition"
        >
          Make Another Withdrawal
        </button>
      </div>
    )
  }

  const parsedAmount = Number(amount || "0")
  const formDisabled = isLoading || availableBalance < MIN_WITHDRAWAL
  const isSubmitDisabled =
    isLoading ||
    availableBalance < MIN_WITHDRAWAL ||
    parsedAmount < MIN_WITHDRAWAL ||
    parsedAmount > availableBalance ||
    (withdrawMethod === "crypto" && !walletAddress)

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <h2 className="text-2xl font-bold mb-1">Withdraw Funds</h2>
      <p className="text-slate-400 text-sm">Transfer funds from your balance</p>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 flex justify-between">
        <div>
          <p className="text-slate-400 text-sm">Available Balance</p>
          <p className="text-3xl font-bold">${Number(availableBalance || 0).toFixed(2)}</p>
        </div>
        <Wallet className="w-8 h-8 text-slate-600" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setWithdrawMethod("crypto")}
          className={`p-4 rounded-xl border-2 transition ${
            withdrawMethod === "crypto"
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-slate-800 hover:border-slate-700"
          }`}
        >
          Crypto
        </button>
        <button
          onClick={() => setWithdrawMethod("bank")}
          className={`p-4 rounded-xl border-2 transition ${
            withdrawMethod === "bank"
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-slate-800 hover:border-slate-700"
          }`}
        >
          Bank
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <label className="text-slate-400 text-sm block mb-2">Withdrawal Amount</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Enter amount"
        />
      </div>

      {withdrawMethod === "crypto" ? (
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm"
          placeholder={`${selectedCrypto} wallet address`}
        />
      ) : (
        <div className="space-y-3 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <select
            value={bankCountry}
            onChange={(e) => {
              const c = e.target.value
              setBankCountry(c)
              setBankName(BANK_OPTIONS[c]?.[0] || "")
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
          >
            {Object.keys(BANK_OPTIONS).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
          >
            {(BANK_OPTIONS[bankCountry] || []).map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>

          <input
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
            placeholder="Account Holder Name"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
          />

          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Account Number / IBAN"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
          />
        </div>
      )}

      {errorMessage && (
        <p className="text-sm text-red-400 bg-red-600/10 border border-red-600/20 rounded-xl p-3">{errorMessage}</p>
      )}

      <button
        onClick={handleWithdraw}
        disabled={isSubmitDisabled}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl disabled:opacity-60 transition"
      >
        {isLoading ? "Processing..." : `Withdraw $${amount || "0.00"}`}
      </button>
    </div>
  )
}
