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
import { PageLoader } from "@/components/page-loader"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { getUserProfile, signOutUser, logUserActivity, type UserProfile } from "@/lib/auth-service"
import type { AppView } from "@/lib/views"

export default function TradingDashboard() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<AppView>("dashboard")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [pageTransitioning, setPageTransitioning] = useState(false)
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

  const navigateTo = (view: AppView) => {
    setPageTransitioning(true)
    setTimeout(() => {
      setActiveView(view)
      setPageTransitioning(false)
    }, 520)
  }

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView userName={userName} onNavigate={navigateTo} />
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
        return <DashboardView userName={userName} onNavigate={navigateTo} />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-5">
          <div className="relative">
            <img
              src="https://i.ibb.co/DPWT64HW/file-00000000899871f49095bc51ed0ef7c0.png"
              alt="Loading"
              className="w-20 h-20 animate-logo-pulse"
            />
            <span className="absolute inset-0 rounded-full border-2 border-lime-400/60 animate-ripple" />
            <span className="absolute inset-0 rounded-full border-2 border-lime-400/30 animate-ripple [animation-delay:0.4s]" />
          </div>
          <div className="flex items-center gap-2">
            {[0,1,2,3,4].map((i) => (
              <span key={i} className="block rounded-full bg-lime-400 animate-dot-wave"
                style={{ width: i===2?10:6, height: i===2?10:6, animationDelay: `${i*0.12}s` }} />
            ))}
          </div>
          <p className="text-neutral-400 text-sm tracking-widest uppercase animate-pulse">Loading…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="bg-black min-h-screen font-sans text-white pb-20">
      <PageLoader isLoading={pageTransitioning} />
      <TopBar
        onMenuClick={() => setIsMenuOpen(true)}
        userName={userName}
        onNavigateToKyc={() => navigateTo("kyc")}
        onLogout={handleLogout}
      />
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        onNavigate={(view) => {
          setIsMenuOpen(false)
          navigateTo(view)
        }}
        onLogout={handleLogout}
      />
      <ActivityNotifications />
      <main className="px-4 pt-4">{renderView()}</main>
      <BottomNav activeView={activeView} onNavigate={navigateTo} />
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
