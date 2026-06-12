"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Transaction {
  id: string
  userId: string
  username: string
  type: string
  amount: number
  status: string
  timestamp: string
}

export function TransactionsManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "deposit" | "withdraw" | "buy" | "sell">("all")

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"))
      const allTransactions: Transaction[] = []

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data()
        const transactionsSnapshot = await getDocs(collection(db, "users", userDoc.id, "transactions"))

        transactionsSnapshot.forEach((transDoc) => {
          const transData = transDoc.data()
          allTransactions.push({
            ...transData,
            userId: userDoc.id,
            username: userData.username || "Unknown",
          } as Transaction)
        })
      }

      // Sort by timestamp descending
      allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setTransactions(allTransactions)
    } catch (error) {
      console.error("[v0] Load transactions error:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = filter === "all" ? transactions : transactions.filter((t) => t.type === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 lime-400 border-t-transparent rounded-full animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Transactions</h2>
        <p className="text-slate-400">View all user transactions</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "deposit", "withdraw", "buy", "sell"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === type ? "bg-amber-500 text-slate-900" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-4 text-white">@{transaction.username}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.type === "deposit"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : transaction.type === "withdraw"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-white font-semibold">${transaction.amount.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : transaction.status === "pending"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-400 text-sm">
                    {new Date(transaction.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-slate-400 text-sm">Showing {filteredTransactions.length} transactions</div>
    </div>
  )
}
