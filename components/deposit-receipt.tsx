"use client"

import { Download, Check } from "lucide-react"

interface DepositReceiptProps {
  depositId: string
  username: string
  amount: number
  crypto: "BTC" | "USDT"
  approvedAt: string
  transactionHash?: string
}

export function DepositReceipt({
  depositId,
  username,
  amount,
  crypto,
  approvedAt,
  transactionHash,
}: DepositReceiptProps) {
  const handleDownload = () => {
    const receiptContent = `
Elite Block Market - DEPOSIT RECEIPT
=====================================

Receipt ID: ${depositId}
Date: ${new Date(approvedAt).toLocaleString()}

User: ${username}
Deposit Amount: $${amount.toLocaleString()}
Cryptocurrency: ${crypto}

Status: APPROVED ✓

Transaction Hash: ${transactionHash || "N/A"}

This receipt confirms that your deposit has been successfully processed
and credited to your trading account.

=====================================
Elite Block Market Trading Platform
www.Elite Block Market.online
    `.trim()

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(receiptContent))
    element.setAttribute("download", `receipt-${depositId}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="bg-gradient-to-br from-lime-400/10 to-blue-500/10 border border-lime-400/20 rounded-2xl p-8 space-y-6">
      <div className="flex items-center justify-center">
        <div className="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-lime-400">Deposit Approved!</h3>
        <p className="text-neutral-400">Your funds have been credited to your account</p>
      </div>

      <div className="bg-neutral-900/50 rounded-lg p-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-400">Receipt ID:</span>
          <span className="text-white font-mono">{depositId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Amount:</span>
          <span className="text-lime-400 font-semibold">${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Cryptocurrency:</span>
          <span className="text-white font-semibold">{crypto}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Approved At:</span>
          <span className="text-white">{new Date(approvedAt).toLocaleString()}</span>
        </div>
        {transactionHash && (
          <div className="flex justify-between">
            <span className="text-neutral-400">Transaction:</span>
            <span className="text-white font-mono text-xs truncate">{transactionHash}</span>
          </div>
        )}
      </div>

      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-lg transition-colors"
      >
        <Download className="w-5 h-5" />
        Download Receipt
      </button>
    </div>
  )
}
