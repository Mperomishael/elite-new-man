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
import { AuthPage } from "@/components/auth-page"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getUserProfile, signOutUser, type UserProfile } from "@/lib/auth-service"

export default function TradingDashboard() {
  const [activeView, setActiveView] = useState<
    "dashboard" | "history" | "deposit" | "withdraw" | "buy" | "sell" | "kyc" | "referrals" | "support" | "settings"
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
        }
      } else {
        setIsAuthenticated(false)
        setUserProfile(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

 const handleLogin = async (profile: UserProfile) => {
  setUserProfile(profile)
  setUserName(`${profile.firstName} ${profile.lastName}`)
  setIsAuthenticated(true)

  // 📨 Send welcome email via Zoho API
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

  }

  const handleLogout = async () => {
    await signOutUser()
    setIsAuthenticated(false)
    setUserProfile(null)
  }

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView userName={userName} onNavigate={setActiveView} />
      case "history":
        return <TransactionHistory />
      case "deposit":
        return <DepositView />
      case "withdraw":
        return <WithdrawView />
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
        return <SettingsView userName={userName} />
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
    return <AuthPage onLogin={handleLogin} />
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
  
