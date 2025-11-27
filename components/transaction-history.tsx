"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Search, Filter, TrendingUp, TrendingDown, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"

interface Transaction {
  id: string
  type: "buy" | "sell" | "deposit" | "withdraw"
  amount: number
  currency: string
  description: string
  status: "pending" | "completed"
  timestamp: any // Firestore Timestamp or string
}

interface TransactionHistoryProps {
  userId?: string
}

export function TransactionHistory({ userId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!userId) {
      setError("User not authenticated")
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")

    const q = query(
      collection(db, "users", userId, "transactions"),
      orderBy("timestamp", "desc")
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Transaction[] = snapshot.docs.map((doc) => {
          const t = doc.data() as Transaction
          return {
            ...t,
            id: doc.id,
            timestamp: t.timestamp?.toDate ? t.timestamp.toDate() : new Date(t.timestamp),
          }
        })
        setTransactions(data)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching transactions:", err)
        setError("Failed to load transactions")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  const filteredTransactions = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.currency.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div key={transaction.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
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
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
                <span>{transaction.timestamp.toLocaleString()}</span>
                <span
                  className={`capitalize ${
                    transaction.status === "completed" ? "text-emerald-400" : "text-yellow-400"
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
