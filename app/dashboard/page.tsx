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
import { CopyTradingView } from "@/components/copy-trading-view"
import { TermsView } from "@/components/terms-view"
import { ActivityPanel } from "@/components/activity-panel"
import { OnboardingModal } from "@/components/onboarding-modal"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { getUserProfile, signOutUser, logUserActivity, type UserProfile } from "@/lib/auth-service"

export default function TradingDashboard() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<
    | "dashboard"
    | "history"
    | "activity"
    | "deposit"
    | "withdraw"
    | "buy"
    | "sell"
    | "kyc"
    | "referrals"
    | "support"
    | "settings"
    | "copytrading"
    | "terms"
  >("dashboard")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userName, setUserName] = useState("")
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid)
        if (profile) {
          setUserProfile(profile)
          setUserName(`${profile.firstName} ${profile.lastName}`)
          setIsAuthenticated(true)

          // Check if onboarding is needed
          if (!profile.onboardingCompleted) {
            setShowOnboarding(true)
          }

          // Log login activity (once per session)
          if (!sessionStorage.getItem(`login-logged-${user.uid}`)) {
            try {
              await logUserActivity(user.uid, {
                type: "login",
                description: `${profile.displayName || profile.firstName + " " + profile.lastName} logged in`,
              })
              sessionStorage.setItem(`login-logged-${user.uid}`, "1")
            } catch (error) {
              console.error("[v0] Failed to log login activity:", error)
            }
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
    try {
      if (userProfile?.uid) {
        await logUserActivity(userProfile.uid, {
          type: "logout",
          description: `${userProfile.displayName || userName} logged out`,
        })
        sessionStorage.removeItem(`login-logged-${userProfile.uid}`)
      }
    } catch (error) {
      console.error("[v0] Failed to log logout activity:", error)
    }
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
      case "activity":
        return (
          <ActivityPanel
            userId={userProfile?.uid || ""}
            maxItems={100}
            onSignOut={handleLogout}
          />
        )
      case "deposit":
        return <DepositView userId={userProfile?.uid || ""} username={userProfile?.username || ""} />
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
        return <SupportView userId={userProfile?.uid || ""} username={userProfile?.username || ""} />
      case "settings":
        return <SettingsView userName={userName} userProfile={userProfile || undefined} />
      case "copytrading":
        return <CopyTradingView />
      case "terms":
        return <TermsView />
      default:
        return <DashboardView userName={userName} onNavigate={setActiveView} />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="bg-black min-h-screen font-sans text-white pb-20">
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
        onLogout={handleLogout}
      />
      <ActivityNotifications />
      <main className="px-4 pt-4">{renderView()}</main>
      <BottomNav activeView={activeView} onNavigate={setActiveView} />
      {userProfile && (
        <OnboardingModal
          userProfile={userProfile}
          isOpen={showOnboarding}
          onClose={(updated) => {
            setShowOnboarding(false)
            if (updated) {
              // Refresh user profile to get updated onboardingCompleted status
              getUserProfile(userProfile.uid).then((profile) => {
                if (profile) setUserProfile(profile)
              })
            }
          }}
        />
      )}
    </div>
  )
}
