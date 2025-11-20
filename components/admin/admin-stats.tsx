"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, type Unsubscribe } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    pendingWithdrawals: 0,
    pendingDeposits: 0,
    totalTransactions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribers: Unsubscribe[] = []

    try {
      const withdrawalsQuery = query(collection(db, "withdrawalRequests"), where("status", "==", "pending"))
      const unsubWithdrawals = onSnapshot(withdrawalsQuery, (snapshot) => {
        setStats((prev) => ({
          ...prev,
          pendingWithdrawals: snapshot.size,
        }))
        setLoading(false)
      })
      unsubscribers.push(unsubWithdrawals)

      const depositsQuery = query(collection(db, "depositRequests"), where("status", "==", "pending"))
      const unsubDeposits = onSnapshot(depositsQuery, (snapshot) => {
        setStats((prev) => ({
          ...prev,
          pendingDeposits: snapshot.size,
        }))
        setLoading(false)
      })
      unsubscribers.push(unsubDeposits)

      // Note: For totalUsers and totalBalance, these are less frequently updated
      // Consider adding a real-time listener here as well if needed
    } catch (error) {
      console.error("[v0] Setup listeners error:", error)
      setLoading(false)
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "from-blue-500 to-cyan-500" },
    {
      label: "Total Balance",
      value: `$${stats.totalBalance.toLocaleString()}`,
      icon: "💰",
      color: "from-emerald-500 to-green-500",
    },
    {
      label: "Pending Withdrawals",
      value: stats.pendingWithdrawals,
      icon: "💸",
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Pending Deposits",
      value: stats.pendingDeposits,
      icon: "📥",
      color: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
