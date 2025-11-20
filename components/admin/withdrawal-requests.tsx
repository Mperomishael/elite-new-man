"use client"

import { useState, useEffect } from "react"
import { onSnapshot, collection, query, where, type Unsubscribe } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { approveWithdrawal, type WithdrawalRequest } from "@/lib/admin-service"
import { getUserProfile } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"

interface WithdrawalRequestsProps {
  adminId: string
}

export function WithdrawalRequests({ adminId }: WithdrawalRequestsProps) {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null

    try {
      const q = query(collection(db, "withdrawalRequests"), where("status", "==", "pending"))
      unsubscribe = onSnapshot(q, (snapshot) => {
        const requestsList: WithdrawalRequest[] = []
        snapshot.forEach((doc) => {
          requestsList.push(doc.data() as WithdrawalRequest)
        })
        setRequests(requestsList)
        setLoading(false)
      })
    } catch (error) {
      console.error("[v0] Error setting up withdrawal listener:", error)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const handleApprove = async (request: WithdrawalRequest) => {
    setProcessing(request.id)

    const userProfile = await getUserProfile(request.userId)
    if (!userProfile) {
      alert("User not found")
      setProcessing(null)
      return
    }

    // Note: Balance was already deducted when withdrawal request was created
    // Just approve the withdrawal here
    const result = await approveWithdrawal(request.id, adminId)

    if (result.success) {
      // Remove from list (real-time listener will handle this)
      console.log("[v0] Withdrawal approved successfully")
    } else {
      alert(`Error: ${result.error}`)
    }

    setProcessing(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Withdrawal Requests</h2>
        <p className="text-slate-400">Review and approve pending withdrawal requests (Real-time updates enabled)</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-slate-900 rounded-lg p-12 border border-slate-800 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-slate-400">No pending withdrawal requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{request.username}</h3>
                  <p className="text-sm text-slate-400">Request ID: {request.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">${request.amount.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">{request.crypto}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Withdrawal Type:</span>
                  <span className="text-white font-semibold">
                    {request.crypto === "BANK" ? "Bank Transfer" : "Cryptocurrency"}
                  </span>
                </div>
                {request.crypto === "BANK" ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Destination:</span>
                    <span className="text-white font-mono text-xs">Bank Account</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Wallet Address:</span>
                    <span className="text-white font-mono text-xs">{request.walletAddress.substring(0, 20)}...</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Requested:</span>
                  <span className="text-white">{new Date(request.requestedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Status:</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    {request.status}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleApprove(request)}
                disabled={processing === request.id}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {processing === request.id ? "Processing..." : "Approve Withdrawal"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
