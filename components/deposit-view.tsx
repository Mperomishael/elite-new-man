"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Bitcoin, Copy, Check, AlertCircle, Upload, X, Download } from "lucide-react"
import { getAdminWalletSettings, createDepositRequest, listenToBankDetails } from "@/lib/admin-service"
import type { AdminWalletSettings, BankDetails } from "@/lib/admin-service"
import QRCode from "qrcode"

interface DepositViewProps {
  userId: string
  username: string
}

export function DepositView({ userId, username }: DepositViewProps) {
  const [step, setStep] = useState<"amount" | "payment">("amount")
  const [amount, setAmount] = useState("")
  const [depositMethod, setDepositMethod] = useState<"crypto" | "bank">("crypto")
  const [selectedCrypto, setSelectedCrypto] = useState<"BTC" | "USDT" | "XRP" | "ETH">("BTC")
  const [walletSettings, setWalletSettings] = useState<AdminWalletSettings | null>(null)
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [copiedTag, setCopiedTag] = useState(false)
  const [copiedAccountNumber, setCopiedAccountNumber] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Proof upload and QR states
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)

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
            btcAddress: (settings as any).btcAddress || (settings as any).btc_address || null,
            btcTag: (settings as any).btcTag || (settings as any).btc_tag || null,
            usdtAddress: (settings as any).usdtAddress || (settings as any).usdt_address || null,
            usdtTag: (settings as any).usdtTag || (settings as any).usdt_tag || null,
            xrpAddress: (settings as any).xrpAddress || (settings as any).xrp_address || null,
            xrpTag: (settings as any).xrpTag || (settings as any).xrp_tag || null,
            ethAddress: (settings as any).ethAddress || (settings as any).eth_address || null,
            ethTag: (settings as any).ethTag || (settings as any).eth_tag || null,
          }
          setWalletSettings(normalized as AdminWalletSettings)
        }
      } catch (err) {
        console.error("Failed to fetch wallet settings:", err)
        setWalletError("Failed to load wallet settings")
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

  const handleCryptoChange = (crypto: "BTC" | "USDT" | "XRP" | "ETH") => {
    setSelectedCrypto(crypto)
  }

  const handleProceedToPayment = () => {
    const parsed = Number.parseFloat(amount || "0")

    if (depositMethod === "crypto") {
      const walletAddress = selectedCrypto === "BTC" ? walletSettings?.btcAddress : selectedCrypto === "USDT" ? walletSettings?.usdtAddress : selectedCrypto === "XRP" ? walletSettings?.xrpAddress : walletSettings?.ethAddress
      if (parsed >= 50 && walletAddress) {
        setStep("payment")
      } else {
        if (parsed < 50) setWalletError("Minimum deposit is $50")
        if (!walletAddress) setWalletError("Wallet address not configured")
      }
    } else {
      if (parsed >= 50 && bankDetails) {
        setStep("payment")
      } else {
        if (parsed < 50) setWalletError("Minimum deposit is $50")
        if (!bankDetails) setWalletError("Bank details not configured")
      }
    }
  }

  const copyToClipboard = async (text: string, type: "address" | "tag" | "accountNumber" = "address") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "address") {
        setCopiedAddress(true)
        setTimeout(() => setCopiedAddress(false), 2000)
      } else if (type === "tag") {
        setCopiedTag(true)
        setTimeout(() => setCopiedTag(false), 2000)
      } else if (type === "accountNumber") {
        setCopiedAccountNumber(true)
        setTimeout(() => setCopiedAccountNumber(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setProofPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateQRCode = async (txnId: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(txnId, {
        errorCorrectionLevel: "H",
        type: "image/png",
        width: 250,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      })
      setQrCode(qrDataUrl)
    } catch (err) {
      console.error("QR generation error:", err)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const parsedAmount = Number.parseFloat(amount)

      if (!userId || !username || !amount || isNaN(parsedAmount)) {
        throw new Error("Missing userId, username, or amount")
      }

      let proofBase64 = ""
      if (proofFile) {
        proofBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(proofFile)
        })
      }

      const result = await createDepositRequest(
        userId,
        username,
        parsedAmount,
        depositMethod === "crypto" ? (selectedCrypto as "BTC" | "USDT" | "XRP" | "ETH") : "BANK",
        proofBase64,
      )

      if (result.success) {
        setTransactionId(result.transactionId || "")
        if (result.transactionId) {
          await generateQRCode(result.transactionId)
        }
        setIsSubmitted(true)
      } else {
        alert(`Failed: ${result.error}`)
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const walletAddress = selectedCrypto === "BTC" ? walletSettings?.btcAddress : selectedCrypto === "USDT" ? walletSettings?.usdtAddress : selectedCrypto === "XRP" ? walletSettings?.xrpAddress : walletSettings?.ethAddress
  const tag = selectedCrypto === "BTC" ? walletSettings?.btcTag : selectedCrypto === "USDT" ? walletSettings?.usdtTag : selectedCrypto === "XRP" ? walletSettings?.xrpTag : walletSettings?.ethTag

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Deposit Funds</h2>
        <p className="text-slate-400 text-sm">Add money to your trading account</p>
        <div className="mt-3 p-3 bg-slate-900 rounded-lg text-xs text-slate-400">
          <p>User ID: <span className="text-white font-mono">{userId}</span></p>
          <p>Username: <span className="text-white font-mono">{username}</span></p>
        </div>
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
                    className={`p-4 rounded-xl border-2 transition ${depositMethod === "crypto" ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800"}`}
                  >
                    Crypto
                  </button>
                  <button
                    onClick={() => setDepositMethod("bank")}
                    className={`p-4 rounded-xl border-2 transition ${depositMethod === "bank" ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800"}`}
                  >
                    Bank
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <label className="text-sm font-medium">Amount (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="50"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-slate-400">Minimum: $50</p>
              </div>

              {depositMethod === "crypto" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Cryptocurrency</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["BTC", "USDT", "XRP", "ETH"].map((crypto) => (
                      <button
                        key={crypto}
                        onClick={() => handleCryptoChange(crypto as any)}
                        className={`p-3 rounded-xl border-2 text-sm ${selectedCrypto === crypto ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800"}`}
                      >
                        {crypto}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleProceedToPayment}
                disabled={!amount || Number.parseFloat(amount || "0") < 50 || isLoadingWallet}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl"
              >
                Proceed to Payment
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep("amount")} className="text-sm text-emerald-400">
                ← Change amount
              </button>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-sm text-slate-400">Amount</p>
                <p className="text-3xl font-bold text-emerald-400">${amount}</p>
              </div>

              {depositMethod === "crypto" && walletAddress && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Wallet Address</label>
                    <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-2">
                      <p className="text-xs font-mono break-all flex-1">{walletAddress}</p>
                      <button
                        onClick={() => copyToClipboard(walletAddress, "address")}
                        className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded"
                      >
                        {copiedAddress ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {tag && (
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">{selectedCrypto === "XRP" ? "Destination Tag" : "Tag/Memo"}</label>
                      <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
                        <p className="text-sm font-mono">{tag}</p>
                        <button onClick={() => copyToClipboard(tag, "tag")} className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded">
                          {copiedTag ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {depositMethod === "bank" && bankDetails && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-2">
                    <p className="text-xs text-blue-300">Bank Transfer Details</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Bank Name</label>
                    <div className="bg-slate-950 border border-slate-700 rounded-xl p-3">
                      <p className="text-sm text-white">{bankDetails.bankName}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Account Holder Name</label>
                    <div className="bg-slate-950 border border-slate-700 rounded-xl p-3">
                      <p className="text-sm text-white">{bankDetails.accountHolderName}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Account Number</label>
                    <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-2">
                      <p className="text-sm font-mono text-white break-all flex-1">{bankDetails.accountNumber}</p>
                      <button
                        onClick={() => copyToClipboard(bankDetails.accountNumber, "accountNumber")}
                        className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded flex-shrink-0"
                      >
                        {copiedAccountNumber ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {bankDetails.routingNumber && (
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Routing Number</label>
                      <div className="bg-slate-950 border border-slate-700 rounded-xl p-3">
                        <p className="text-sm font-mono text-white">{bankDetails.routingNumber}</p>
                      </div>
                    </div>
                  )}

                  {bankDetails.swiftCode && (
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">SWIFT/BIC Code</label>
                      <div className="bg-slate-950 border border-slate-700 rounded-xl p-3">
                        <p className="text-sm font-mono text-white">{bankDetails.swiftCode}</p>
                      </div>
                    </div>
                  )}

                  {bankDetails.iban && (
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">IBAN</label>
                      <div className="bg-slate-950 border border-slate-700 rounded-xl p-3">
                        <p className="text-sm font-mono text-white">{bankDetails.iban}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Country</label>
                    <div className="bg-slate-950 border border-slate-700 rounded-xl p-3">
                      <p className="text-sm text-white">{bankDetails.country}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <label className="text-sm font-medium">Upload Payment Proof</label>
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-emerald-500 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleProofFileChange}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label htmlFor="proof-upload" className="cursor-pointer">
                    {proofFile ? (
                      <>
                        <Check className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                        <p className="text-sm text-emerald-400">{proofFile.name}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm font-medium">Click to upload proof</p>
                        <p className="text-xs text-slate-400">PNG, JPG, PDF</p>
                      </>
                    )}
                  </label>
                </div>

                {proofPreview && (
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Preview</label>
                    {proofFile?.type.startsWith("image/") ? (
                      <img src={proofPreview} alt="Proof preview" className="max-h-48 rounded-lg mx-auto" />
                    ) : (
                      <div className="bg-slate-950 p-4 rounded-lg text-center text-slate-400 text-sm">
                        PDF File Selected
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setProofFile(null)
                        setProofPreview(null)
                      }}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white font-bold py-4 rounded-xl"
              >
                {isLoading ? "Submitting..." : "Submit Deposit Request"}
              </button>
            </>
          )}
        </>
      ) : (
        <div className="space-y-6 text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 space-y-4">
            <Check className="w-16 h-16 mx-auto text-emerald-400" />
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Deposit Submitted</h3>
              <p className="text-slate-400">Your deposit request has been submitted for approval</p>
            </div>

            {transactionId && (
              <div className="space-y-3">
                <div className="bg-slate-900 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Transaction ID</p>
                  <p className="text-sm font-mono text-white break-all">{transactionId}</p>
                </div>

                {qrCode && (
                  <div className="bg-slate-900 rounded-xl p-4 space-y-3">
                    <p className="text-xs text-slate-400">Scan to Track</p>
                    <img src={qrCode} alt="QR Code" className="w-48 h-48 mx-auto bg-white p-2 rounded" />
                    <button
                      onClick={() => {
                        const link = document.createElement("a")
                        link.href = qrCode
                        link.download = `deposit-qr-${transactionId}.png`
                        link.click()
                      }}
                      className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 justify-center mx-auto"
                    >
                      <Download className="w-3 h-3" /> Download QR
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setStep("amount")
              setAmount("")
              setProofFile(null)
              setProofPreview(null)
              setQrCode(null)
              setTransactionId(null)
              setIsSubmitted(false)
            }}
            className="text-emerald-400 hover:text-emerald-300"
          >
            Make Another Deposit
          </button>
        </div>
      )}
    </div>
  )
}
