"use client"

import { useState, useEffect } from "react"
import { Users, Copy, Share2, Gift } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { auth } from "@/lib/firebase"

interface Referral {
  id: string
  referrerId: string
  referredUserId: string
  referredUsername: string
  referredEmail: string
  referralDate: string
  status: "active" | "inactive"
  earnings: number
}

export function ReferralsView() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [copied, setCopied] = useState(false)

  const referralCode = auth.currentUser?.uid?.substring(0, 8).toUpperCase() || "UST2025"
  const referralLink = `https://ultimatestcktrader.online/ref/${referralCode}`

  useEffect(() => {
    loadReferrals()
  }, [])

  const loadReferrals = async () => {
    try {
      if (!auth.currentUser) return

      const q = query(collection(db, "referrals"), where("referrerId", "==", auth.currentUser.uid))
      const querySnapshot = await getDocs(q)

      const referralsData: Referral[] = []
      let totalEarn = 0

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Referral
        referralsData.push(data)
        totalEarn += data.earnings || 0
      })

      setReferrals(referralsData)
      setTotalEarnings(totalEarn)
    } catch (error) {
      console.error("[v0] Load referrals error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join UltimateStckTrader",
        text: "Join me on UltimateStckTrader and start trading!",
        url: referralLink,
      })
    } else {
      handleCopyLink()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-lime-400" />
        <div>
          <h2 className="text-2xl font-bold">Referral Program</h2>
          <p className="text-sm text-neutral-400">Invite friends and earn rewards</p>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-6 h-6 text-white" />
          <h3 className="text-xl font-bold text-white">Your Earnings</h3>
        </div>
        <p className="text-4xl font-bold text-white mb-2">${totalEarnings.toLocaleString()}</p>
        <p className="text-blue-100 text-sm">From {referrals.length} successful referrals</p>
      </div>

      {/* Referral Code */}
      <div className="bg-neutral-700/50 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-lg">Your Referral Code</h3>
        <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-600">
          <p className="text-xs text-neutral-400 mb-2">Referral Code</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-lime-400">{referralCode}</p>
            <button
              onClick={handleCopyCode}
              className="bg-lime-400 text-neutral-900 p-3 rounded-lg active:scale-95 transition-transform hover:bg-lime-300"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-600">
          <p className="text-xs text-neutral-400 mb-2">Referral Link</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-white flex-1 truncate">{referralLink}</p>
            <button
              onClick={handleCopyLink}
              className="bg-neutral-700 hover:bg-neutral-600 text-white p-2 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={handleShareLink}
          className="w-full bg-lime-400 text-neutral-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-lime-300"
        >
          <Share2 className="w-5 h-5" />
          Share Referral Link
        </button>

        {copied && <p className="text-center text-lime-400 text-sm">Copied to clipboard!</p>}
      </div>

      {/* Referral List */}
      <div className="bg-neutral-700/50 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-lg">Your Referrals</h3>
        {referrals.length > 0 ? (
          <div className="space-y-3">
            {referrals.map((referral) => (
              <ReferralItem
                key={referral.id}
                name={referral.referredUsername}
                date={new Date(referral.referralDate).toLocaleDateString()}
                earnings={`$${referral.earnings.toLocaleString()}`}
                status={referral.status}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-400">
            <p>No referrals yet. Share your referral link to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ReferralItem({
  name,
  date,
  earnings,
  status,
}: {
  name: string
  date: string
  earnings: string
  status: string
}) {
  return (
    <div className="bg-neutral-800/50 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)}
          </span>
        </div>
        <div>
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-neutral-400">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-lime-400">{earnings}</p>
        <p className="text-xs text-neutral-400 capitalize">{status}</p>
      </div>
    </div>
  )
}
