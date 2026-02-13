"use client"

import { useState, useEffect } from "react"
import { DashboardView } from "@/components/dashboard-view"
import { TransactionHistory } from "@/components/transaction-history"
import { DepositView } from "@/components/deposit-view"
import { WithdrawView } from "@/components/withdraw-view"
import { BuyingView } from "@/components/buying-view"
import { SellingView } from "@/components/selling-view"
import { BottomNav } from "@/components/bottom-nav"
import { TopBar } from "@/components/top-bar"
import { SideMenu } from "@/components/side-menu"
import { KycView } from "@/components/kyc-view"
import { ReferralsView } from "@/components/referrals-view"
import { SupportView } from "@/components/support-view"
import { ActivityNotifications } from "@/components/activity-notifications"
import { SettingsView } from "@/components/settings-view"
import { LicenseView } from "@/components/license-view"
import { TermsView } from "@/components/terms-view"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { getUserProfile, signOutUser, addTransaction, type UserProfile } from "@/lib/auth-service"
import { Timestamp } from "firebase/firestore"

export default function TradingDashboard() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<
    | "dashboard"
    | "history"
    | "deposit"
    | "withdraw"
    | "buy"
    | "sell"
    | "kyc"
    | "referrals"
    | "support"
    | "settings"
    | "license"
    | "terms"
  >("dashboard")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid)
        if (profile) {
          setUserProfile(profile)
          setUserName(`${profile.firstName} ${profile.lastName}`)
          setIsAuthenticated(true)

          // Generate sample transactions if user has none
          try {
            // Check if user has transactions
            const txnModule = await import("@/lib/auth-service")
            const txns = await txnModule.getUserTransactions(user.uid)
            
            if (txns.length === 0) {
              // Generate 3 sample transactions
              const now = Timestamp.now()
              const sampleTransactions = [
                {
                  type: "buy" as const,
                  amount: 250,
                  currency: "USDT",
                  status: "completed" as const,
                  timestamp: new Timestamp(now.seconds - 86400, now.nanoseconds), // 1 day ago
                  description: "Bitcoin purchase",
                },
                {
                  type: "sell" as const,
                  amount: 125,
                  currency: "BTC",
                  status: "completed" as const,
                  timestamp: new Timestamp(now.seconds - 172800, now.nanoseconds), // 2 days ago
                  description: "Ethereum sell",
                },
                {
                  type: "deposit" as const,
                  amount: 500,
                  currency: "USD",
                  status: "completed" as const,
                  timestamp: new Timestamp(now.seconds - 259200, now.nanoseconds), // 3 days ago
                  description: "Bank transfer deposit",
                },
              ]

              for (const txn of sampleTransactions) {
                await addTransaction(user.uid, txn)
              }
            }
          } catch (err) {
            console.log("[v0] Sample transaction generation skipped:", err)
          }
        }
      } else {
        router.push("/auth/login")
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleLogin = async (profile: UserProfile) => {
    setUserProfile(profile)
    setUserName(`${profile.firstName} ${profile.lastName}`)
    setIsAuthenticated(true)

    try {
      const res = await fetch("/api/sendWelcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${profile.firstName} ${profile.lastName}`,
          email: profile.email,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error("Zoho send error:", data)
      } else {
        console.log("✅ Welcome email sent:", data.message)
      }
    } catch (error) {
      console.error("❌ Failed to send welcome email:", error)
    }
  }

  const handleLogout = async () => {
    await signOutUser()
    setIsAuthenticated(false)
    setUserProfile(null)
    router.push("/auth/login")
  }

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView userName={userName} onNavigate={setActiveView} />
      case "history":
        return <TransactionHistory userId={userProfile?.uid || ""} />
      case "deposit":
        return <DepositView />
      case "withdraw":
        return (
          <WithdrawView userId={userProfile?.uid} username={userName} availableBalance={userProfile?.balance || 0} />
        )
      case "buy":
        return <BuyingView />
      case "sell":
        return <SellingView />
      case "kyc":
        return <KycView />
      case "referrals":
        return <ReferralsView />
      case "support":
        return <SupportView />
      case "settings":
        return <SettingsView userName={userName} userProfile={userProfile || undefined} />
      case "license":
        return <LicenseView />
      case "terms":
        return <TermsView />
      default:
        return <DashboardView userName={userName} onNavigate={setActiveView} />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="bg-slate-950 min-h-screen font-sans text-white pb-20">
      <TopBar
        onMenuClick={() => setIsMenuOpen(true)}
        userName={userName}
        onNavigateToKyc={() => setActiveView("kyc")}
        onLogout={handleLogout}
      />
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view)
          setIsMenuOpen(false)
        }}
      />
      <ActivityNotifications />
      <main className="px-4 pt-4">{renderView()}</main>
      <BottomNav activeView={activeView} onNavigate={setActiveView} />
    </div>
  )
}
