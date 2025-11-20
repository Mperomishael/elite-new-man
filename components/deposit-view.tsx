"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Bitcoin, Copy, Check, Upload, AlertCircle } from "lucide-react"
import { getAdminWalletSettings, createDepositRequest, listenToBankDetails } from "@/lib/admin-service"
import type { AdminWalletSettings, BankDetails } from "@/lib/admin-service"

interface DepositViewProps {
  userId: string
  username: string
}

function TypingText({
  text,
  duration = 3000,
  className = "",
}: { text: string; duration?: number; className?: string }) {
  const [visible, setVisible] = useState("")
  const [cursorOn, setCursorOn] = useState(true)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    let mounted = true
    setVisible("")
    setCompleted(false)

    const total = Math.max(1, text.length)
    const interval = Math.max(10, Math.floor(duration / total))
    let i = 0
    const typer = setInterval(() => {
      if (!mounted) return
      i += 1
      setVisible(text.slice(0, i))
      if (i >= total) {
        clearInterval(typer)
        setCompleted(true)
      }
    }, interval)

    const cursorTimer = setInterval(() => {
      if (!mounted) return
      setCursorOn((v) => !v)
    }, 500)

    return () => {
      mounted = false
      clearInterval(typer)
      clearInterval(cursorTimer)
    }
  }, [text, duration])

  const transformStyle = completed
    ? {
        transform: "scale(1.04)",
        transition: "transform 220ms ease-out",
        textShadow: "0 6px 18px rgba(34,197,94,0.12)",
      }
    : {}

  return (
    <span className={className} style={{ display: "inline-block", ...transformStyle }}>
      <span style={{ fontWeight: 600, letterSpacing: 0.5, textTransform: "capitalize" }}>{visible}</span>
      <span style={{ display: "inline-block", width: 10, marginLeft: 6, opacity: cursorOn ? 1 : 0 }} aria-hidden>
        |
      </span>
    </span>
  )
}

export function DepositView({ userId, username }: DepositViewProps) {
  const [step, setStep] = useState<"amount" | "payment">("amount")
  const [amount, setAmount] = useState("")
  const [depositMethod, setDepositMethod] = useState<"crypto" | "bank">("crypto")
  const [selectedCrypto, setSelectedCrypto] = useState<"BTC" | "USDT">("BTC")
  const [walletSettings, setWalletSettings] = useState<AdminWalletSettings | null>(null)
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [copiedTag, setCopiedTag] = useState(false)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [isLoadingWallet, setIsLoadingWallet] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWalletSettings = async () => {
      setIsLoadingWallet(true)
      setWalletError(null)
      try {
        const settings = await getAdminWalletSettings()
        if (settings) {
          const normalized: Partial<AdminWalletSettings> = {
            btcAddress:
              (settings as any).btcAddress ||
              (settings as any).btc_address ||
              (settings as any).btc?.address ||
              (settings as any).btc ||
              null,
            btcTag:
              (settings as any).btcTag ||
              (settings as any).btc_tag ||
              (settings as any).btc?.tag ||
              (settings as any).btcMemo ||
              (settings as any).btc_memo ||
              null,
            usdtAddress:
              (settings as any).usdtAddress ||
              (settings as any).usdt_address ||
              (settings as any).usdt?.address ||
              (settings as any).usdt ||
              null,
            usdtTag:
              (settings as any).usdtTag ||
              (settings as any).usdt_tag ||
              (settings as any).usdt?.tag ||
              (settings as any).usdtMemo ||
              (settings as any).usdt_memo ||
              null,
          }
          setWalletSettings(normalized as AdminWalletSettings)
        } else {
          setWalletSettings(null)
          setWalletError("No wallet settings returned from server.")
        }
      } catch (err) {
        console.error("Failed to fetch admin wallet settings:", err)
        setWalletSettings(null)
        setWalletError("Failed to load wallet settings. Try again.")
      } finally {
        setIsLoadingWallet(false)
      }
    }

    const unsubscribe = listenToBankDetails((details) => {
      setBankDetails(details)
    })

    fetchWalletSettings()
    return () => unsubscribe()
  }, [])

  const handleCryptoChange = (crypto: "BTC" | "USDT") => {
    setSelectedCrypto(crypto)
    setCopiedAddress(false)
    setCopiedTag(false)
  }

  const handleProceedToPayment = () => {
    const parsed = Number.parseFloat(amount || "0")

    if (depositMethod === "crypto") {
      const walletAddress = selectedCrypto === "BTC" ? walletSettings?.btcAddress : walletSettings?.usdtAddress
      if (parsed >= 50 && walletAddress) {
        setStep("payment")
      } else {
        if (parsed < 50) console.warn("Deposit amount below minimum:", parsed)
        if (!walletAddress) setWalletError("Deposit wallet address not configured by admin.")
      }
    } else {
      if (parsed >= 50 && bankDetails) {
        setStep("payment")
      } else {
        if (parsed < 50) console.warn("Deposit amount below minimum:", parsed)
        if (!bankDetails) setWalletError("Bank details not configured by admin.")
      }
    }
  }

  const copyToClipboard = async (text: string, type: "address" | "tag") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "address") {
        setCopiedAddress(true)
        setTimeout(() => setCopiedAddress(false), 2000)
      } else {
        setCopiedTag(true)
        setTimeout(() => setCopiedTag(false), 2000)
      }
    } catch (err) {
      console.log("[v0] Failed to copy:", err)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (screenshot) {
      setIsLoading(true)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Screenshot = reader.result as string
        const result = await createDepositRequest(
          userId,
          username,
          Number.parseFloat(amount),
          depositMethod === "crypto" ? selectedCrypto : "BANK",
          base64Screenshot,
        )

        if (result.success) {
          setIsSubmitted(true)
        } else {
          alert("Failed to submit deposit request. Please try again.")
        }
        setIsLoading(false)
      }
      reader.readAsDataURL(screenshot)
    }
  }

  const walletAddress = selectedCrypto === "BTC" ? walletSettings?.btcAddress : walletSettings?.usdtAddress
  const tag = selectedCrypto === "BTC" ? walletSettings?.btcTag : walletSettings?.usdtTag

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Deposit Funds</h2>
        <p className="text-slate-400 text-sm">Add money to your trading account via cryptocurrency or bank transfer</p>
      </div>

      {!isSubmitted ? (
        <>
          {step === "amount" ? (
            <>
              <div className="space-y-3">
                <label className="text-sm font-medium">Deposit Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDepositMethod("crypto")}
                    className={`p-4 rounded-xl border-2 transition ${
                      depositMethod === "crypto"
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    Crypto
                  </button>
                  <button
                    onClick={() => setDepositMethod("bank")}
                    className={`p-4 rounded-xl border-2 transition ${
                      depositMethod === "bank"
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    Bank Transfer
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <label className="text-sm font-medium">Deposit Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="50"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-xs text-slate-400">Minimum deposit: $50.00</p>
              </div>

              {depositMethod === "crypto" && (
                <>
                  {/* Crypto Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Select Cryptocurrency</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleCryptoChange("BTC")}
                        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          selectedCrypto === "BTC"
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-slate-800 bg-slate-900 hover:border-slate-700"
                        }`}
                      >
                        <Bitcoin className="w-6 h-6 text-orange-400" />
                        <div className="text-left">
                          <p className="font-bold">Bitcoin</p>
                          <p className="text-xs text-slate-400">BTC</p>
                        </div>
                        {selectedCrypto === "BTC" && <Check className="w-5 h-5 text-emerald-400 ml-auto" />}
                      </button>

                      <button
                        onClick={() => handleCryptoChange("USDT")}
                        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          selectedCrypto === "USDT"
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-slate-800 bg-slate-900 hover:border-slate-700"
                        }`}
                      >
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          ₮
                        </div>
                        <div className="text-left">
                          <p className="font-bold">Tether</p>
                          <p className="text-xs text-slate-400">USDT</p>
                        </div>
                        {selectedCrypto === "USDT" && <Check className="w-5 h-5 text-emerald-400 ml-auto" />}
                      </button>
                    </div>
                  </div>

                  {/* Wallet status */}
                  <div className="space-y-2">
                    {isLoadingWallet ? (
                      <div className="flex items-center gap-3">
                        <TypingText
                          text="generating your wallet address"
                          duration={3000}
                          className="text-sm text-emerald-400"
                        />
                      </div>
                    ) : walletError ? (
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-red-300">{walletError}</p>
                      </div>
                    ) : !walletSettings ? (
                      <p className="text-xs text-red-300">No wallet settings available.</p>
                    ) : (
                      <p className="text-xs text-slate-400">Deposit address loaded</p>
                    )}
                  </div>
                </>
              )}

              {depositMethod === "bank" && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-xs text-blue-300">
                    {bankDetails
                      ? "Bank details are available for deposit"
                      : "Bank deposit is being configured by admin"}
                  </p>
                </div>
              )}

              {/* Proceed Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={
                  !amount ||
                  Number.parseFloat(amount || "0") < 50 ||
                  isLoadingWallet ||
                  (depositMethod === "crypto" &&
                    (!walletSettings ||
                      !(selectedCrypto === "BTC" ? walletSettings?.btcAddress : walletSettings?.usdtAddress))) ||
                  (depositMethod === "bank" && !bankDetails)
                }
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all duration-300 transform active:scale-95"
              >
                {depositMethod === "crypto" && !walletSettings ? "Loading wallet..." : "Proceed to Payment"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep("amount")} className="text-sm text-emerald-400 hover:text-emerald-300">
                ← Change amount
              </button>

              {/* Amount Summary */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-sm text-slate-400 mb-1">Deposit Amount</p>
                <p className="text-3xl font-bold text-emerald-400">${amount}</p>
                <p className="text-xs text-slate-400 mt-1">
                  via {depositMethod === "crypto" ? selectedCrypto : "Bank Transfer"}
                </p>
              </div>

              {depositMethod === "crypto" && walletAddress ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Wallet Address</label>
                    <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-mono break-all">{walletAddress}</p>
                      <button
                        onClick={() => copyToClipboard(walletAddress, "address")}
                        className="flex-shrink-0 p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                      >
                        {copiedAddress ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Tag/Memo</label>
                    <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-mono">{tag ?? "-"}</p>
                      <button
                        onClick={() => tag && copyToClipboard(tag, "tag")}
                        disabled={!tag}
                        className="flex-shrink-0 p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-60"
                      >
                        {copiedTag ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : depositMethod === "bank" && bankDetails ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-300">Bank Details for Deposit</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400">Bank Name</p>
                      <p className="text-sm font-semibold text-white">{bankDetails.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Account Holder</p>
                      <p className="text-sm font-semibold text-white">{bankDetails.accountHolderName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Account Number / IBAN</p>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-sm font-mono text-white break-all">{bankDetails.accountNumber}</p>
                        <button
                          onClick={() => copyToClipboard(bankDetails.accountNumber, "address")}
                          className="flex-shrink-0 p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                        >
                          {copiedAddress ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {bankDetails.routingNumber && (
                      <div>
                        <p className="text-xs text-slate-400">Routing Number</p>
                        <p className="text-sm font-mono text-white">{bankDetails.routingNumber}</p>
                      </div>
                    )}
                    {bankDetails.swiftCode && (
                      <div>
                        <p className="text-xs text-slate-400">SWIFT Code</p>
                        <p className="text-sm font-mono text-white">{bankDetails.swiftCode}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-400">Country</p>
                      <p className="text-sm font-semibold text-white">{bankDetails.country}</p>
                    </div>
                  </div>
                </div>
              ) : depositMethod === "bank" ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">Bank details not configured. Please contact support.</p>
                </div>
              ) : null}

              {/* Upload Screenshot */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <label className="text-sm font-medium mb-3 block">Upload Payment Proof / Screenshot</label>
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label htmlFor="screenshot-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                    {screenshot ? (
                      <p className="text-sm text-emerald-400 font-medium">{screenshot.name}</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium mb-1">Click to upload screenshot</p>
                        <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!screenshot || isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all duration-300 transform active:scale-95"
              >
                {isLoading ? "Submitting..." : "Submit Deposit"}
              </button>

              {/* Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="font-semibold mb-1">Important:</p>
                  <ul className="space-y-1 text-xs">
                    {depositMethod === "crypto" ? (
                      <>
                        <li>• Send only {selectedCrypto} to this address</li>
                        <li>• Include the memo/tag if provided</li>
                      </>
                    ) : (
                      <>
                        <li>• Transfer funds to the bank account shown above</li>
                        <li>• Use your username as transfer reference</li>
                      </>
                    )}
                    <li>• Upload a clear screenshot of your payment</li>
                    <li>• Your account will be credited after approval</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Deposit Submitted!</h3>
            <p className="text-slate-300 text-sm">
              Your deposit request has been received and is pending approval. You will be notified once your account is
              credited.
            </p>
          </div>
          <button
            onClick={() => {
              setIsSubmitted(false)
              setScreenshot(null)
              setStep("amount")
              setAmount("")
            }}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
          >
            Make Another Deposit
          </button>
        </div>
      )}
    </div>
  )
}
