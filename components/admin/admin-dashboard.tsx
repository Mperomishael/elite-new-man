"use client"

import { useState } from "react"
import { UsersManagement } from "./users-management"
import { WalletSettings } from "./wallet-settings"
import { WithdrawalRequests } from "./withdrawal-requests"
import { DepositRequests } from "./deposit-requests"
import { TransactionsManagement } from "./transactions-management"
import { AdminStats } from "./admin-stats"
import { signOutUser } from "@/lib/auth-service"
import { useRouter } from "next/navigation"

interface AdminDashboardProps {
  adminId: string
}

export function AdminDashboard({ adminId }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "wallets" | "deposits" | "withdrawals" | "transactions">(
    "overview",
  )
  const router = useRouter()

  const handleLogout = async () => {
    await signOutUser()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Admin Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/images/design-mode/Whats-App-Image-2025-10-10-at-8-45-37-AM-1-removebg-preview-1.png"
                alt="UltimateStckTrader Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-slate-400">UltimateStckTrader</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "users", label: "Users", icon: "👥" },
              { id: "wallets", label: "Wallet Settings", icon: "💳" },
              { id: "deposits", label: "Deposits", icon: "💰" },
              { id: "withdrawals", label: "Withdrawals", icon: "💸" },
              { id: "transactions", label: "Transactions", icon: "📝" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-amber-500 border-amber-500"
                    : "text-slate-400 border-transparent hover:text-white"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {activeTab === "overview" && <AdminStats />}
        {activeTab === "users" && <UsersManagement />}
        {activeTab === "wallets" && <WalletSettings adminId={adminId} />}
        {activeTab === "deposits" && <DepositRequests adminId={adminId} />}
        {activeTab === "withdrawals" && <WithdrawalRequests adminId={adminId} />}
        {activeTab === "transactions" && <TransactionsManagement />}
      </main>
    </div>
  )
}
