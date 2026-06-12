"use client"

import { useState, useEffect } from "react"
import { Upload, Check, Clock, AlertCircle, Lock, Unlock } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"
import type { UserProfile } from "@/lib/auth-service"
import { KYCUpload } from "./kyc-upload"

export function KycView() {
  const [user, setUser] = useState(auth.currentUser)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })

    return () => unsubAuth()
  }, [])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    // Real-time listener to track user profile changes (esp. kycStatus)
    const userRef = doc(db, "users", user.uid)
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const isVerified = userProfile?.kycStatus === "approved"
  const isPending = userProfile?.kycStatus === "pending"
  const isRejected = userProfile?.kycStatus === "rejected"
  const isNotStarted = userProfile?.kycStatus === "not-started"
  const balanceLimit = 1000000

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isVerified ? "bg-lime-400/20" : "bg-amber-500/20"}`}>
          {isVerified ? (
            <Unlock className="w-6 h-6 text-lime-400" />
          ) : (
            <Lock className="w-6 h-6 text-amber-400" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Account Upgrade</h2>
          <p className="text-sm text-neutral-400">Unlock higher balance limits by completing verification</p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
          <p className="text-xs text-neutral-400 mb-1">Current Balance</p>
          <p className="text-2xl font-bold text-lime-400">${(userProfile?.balance || 0).toLocaleString()}</p>
        </div>
        <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
          <p className="text-xs text-neutral-400 mb-1">Balance Limit</p>
          <p className={`text-2xl font-bold ${isVerified ? "text-lime-400" : "text-red-400"}`}>
            ${isVerified ? balanceLimit.toLocaleString() : "500,000"}
          </p>
        </div>
        <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
          <p className="text-xs text-neutral-400 mb-1">Status</p>
          <div className="flex items-center gap-2 mt-2">
            {isVerified ? (
              <>
                <Check className="w-5 h-5 text-lime-400" />
                <span className="text-lg font-bold text-lime-400">Approved</span>
              </>
            ) : isPending ? (
              <>
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-bold text-yellow-400">Pending</span>
              </>
            ) : isRejected ? (
              <>
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-lg font-bold text-red-400">Rejected</span>
              </>
            ) : isNotStarted ? (
              <>
                <Lock className="w-5 h-5 text-neutral-400" />
                <span className="text-lg font-bold text-neutral-400">Not Started</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-neutral-400" />
                <span className="text-lg font-bold text-neutral-400">Not Started</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Benefits Card */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Unlock className="w-5 h-5 text-amber-400" />
          Verify to Unlock
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">Increase Balance Limit</p>
              <p className="text-sm text-neutral-300">Up to $1,000,000 from current $500,000</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">Higher Trading Limits</p>
              <p className="text-sm text-neutral-300">Increase your daily transaction limits</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">Priority Support</p>
              <p className="text-sm text-neutral-300">Get faster responses to your inquiries</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Status Message */}
      {isVerified && (
        <div className="bg-lime-400/10 rounded-xl p-4 border border-lime-400/20">
          <div className="flex gap-3">
            <Check className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-1">Account Verified!</p>
              <p className="text-sm text-neutral-300">You can now access higher balance limits and premium features.</p>
            </div>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-1">Verification Rejected</p>
              <p className="text-sm text-neutral-300">Please review the requirements and resubmit your documents.</p>
            </div>
          </div>
        </div>
      )}

      {isPending && (
        <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
          <div className="flex gap-3">
            <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-1">Under Review</p>
              <p className="text-sm text-neutral-300">Your documents are being reviewed by our team. This typically takes 24-48 hours.</p>
            </div>
          </div>
        </div>
      )}

      {/* Requirements Section */}
      {!isVerified && (
        <div>
          <h3 className="font-semibold text-white mb-4">Required Documents</h3>
          <div className="space-y-3 mb-6">
            <DocumentRequirement
              title="Government ID"
              description="Passport, Driver's License, or National ID (PNG, JPG, or PDF)"
            />
            <DocumentRequirement
              title="Proof of Address"
              description="Utility bill or bank statement from the last 3 months (PNG, JPG, or PDF)"
            />
            <DocumentRequirement
              title="Selfie with ID"
              description="Clear photo of you holding your government ID (PNG or JPG)"
            />
          </div>
        </div>
      )}

      {/* Upload Section */}
      {!isVerified && (
        <div>
          {!showUpload ? (
            <button
              onClick={() => setShowUpload(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Documents Now
            </button>
          ) : (
            <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-white">Submit Your Documents</h3>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              {user && <KYCUpload userId={user.uid} onUploadSuccess={() => setShowUpload(false)} />}
            </div>
          )}
        </div>
      )}

      {/* Already Verified Info */}
      {isVerified && (
        <div className="bg-lime-400/5 rounded-xl p-6 border border-lime-400/20 text-center">
          <Unlock className="w-12 h-12 text-lime-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-2">Your account is fully upgraded</p>
          <p className="text-sm text-neutral-300">
            You now have access to all features and maximum balance limits. Enjoy trading with confidence!
          </p>
        </div>
      )}
    </div>
  )
}

function DocumentRequirement({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800">
      <p className="font-medium text-white mb-1">{title}</p>
      <p className="text-sm text-neutral-400">{description}</p>
    </div>
  )
}
