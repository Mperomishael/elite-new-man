"use client"

import { useState, useEffect } from "react"
import { listenToUserTransactions } from "@/lib/auth-service"
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react"
import type { Transaction } from "@/lib/auth-service"
import type { Timestamp } from "firebase/firestore"

interface TransactionWithDate extends Transaction {
  timestamp: Date | Timestamp
}

interface TransactionHistoryProps {
  userId?: string
}

export function TransactionHistory({ userId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<TransactionWithDate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setError("User not authenticated")
      setLoading(false)
      return
    }

    setLoading(false)
    setError("")

    // Use real-time listener instead of one-time fetch
    const unsubscribe = listenToUserTransactions(userId, (data) => {
      // Convert Firestore timestamps to Date
      const parsedData = data.map((t) => ({
        ...t,
        timestamp: (t.timestamp as any)?.toDate?.() ?? new Date(t.timestamp as any),
      }))

      setTransactions(parsedData)
    })

    return () => unsubscribe()
  }, [userId])

  const filteredTransactions = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.currency.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transaction History</h2>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 hover:bg-slate-800 transition-colors">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <p className="text-slate-400">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "buy"
                        ? "bg-emerald-500/10"
                        : transaction.type === "sell"
                        ? "bg-red-500/10"
                        : transaction.type === "deposit"
                        ? "bg-blue-500/10"
                        : "bg-orange-500/10"
                    }`}
                  >
                    {transaction.type === "buy" && <TrendingUp className="w-5 h-5 text-emerald-400" />}
                    {transaction.type === "sell" && <TrendingDown className="w-5 h-5 text-red-400" />}
                    {transaction.type === "deposit" && <ArrowDownToLine className="w-5 h-5 text-blue-400" />}
                    {transaction.type === "withdraw" && <ArrowUpFromLine className="w-5 h-5 text-orange-400" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm capitalize">{transaction.type}</p>
                    <p className="text-xs text-slate-400">{transaction.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold text-sm ${
                      transaction.type === "buy" || transaction.type === "deposit" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {transaction.type === "buy" || transaction.type === "deposit" ? "+" : "-"}$
                    {transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">{transaction.currency}</p>
                </div>
              </div>

              {/* Receipt Image Display */}
              {transaction.receiptUrl && selectedReceipt === transaction.id && (
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <img
                    src={transaction.receiptUrl}
                    alt="Receipt"
                    className="max-h-64 rounded max-w-full mx-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%231e293b' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='16'%3EReceipt unavailable%3C/text%3E%3C/svg%3E"
                    }}
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">
                    {transaction.timestamp instanceof Date
                      ? transaction.timestamp.toLocaleString()
                      : (transaction.timestamp as any)?.toDate?.()?.toLocaleString() ?? new Date().toLocaleString()}
                  </span>
                  {transaction.receiptUrl && (
                    <button
                      onClick={() => setSelectedReceipt(selectedReceipt === transaction.id ? null : transaction.id)}
                      className="text-amber-500 hover:text-amber-400 font-medium"
                    >
                      {selectedReceipt === transaction.id ? "Hide" : "View"} Receipt
                    </button>
                  )}
                </div>
                <span
                  className={`capitalize px-2 py-1 rounded text-xs font-semibold ${
                    transaction.status === "completed"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : transaction.status === "rejected"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
