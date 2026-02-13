"use client"

import { useState, useEffect } from "react"
import { onSnapshot, collection, query, where, type Unsubscribe } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { approveDeposit, rejectDeposit, type DepositRequest } from "@/lib/admin-service"
import { Button } from "@/components/ui/button"
import { AlertCircle, Check, X } from "lucide-react"

interface DepositRequestsProps {
  adminId: string
}

export function DepositRequests({ adminId }: DepositRequestsProps) {
  const [requests, setRequests] = useState<DepositRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedProof, setSelectedProof] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null

    try {
      const q = query(collection(db, "depositRequests"), where("status", "==", "pending"))
      unsubscribe = onSnapshot(q, (snapshot) => {
        const requestsList: DepositRequest[] = []
        snapshot.forEach((doc) => {
          requestsList.push({ ...doc.data(), id: doc.id } as DepositRequest)
        })
        setRequests(requestsList)
        setLoading(false)
      })
    } catch (err) {
      console.error("[v0] Error setting up deposit listener:", err)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const handleApprove = async (request: DepositRequest) => {
    setProcessing(request.id)
    setError(null)

    const result = await approveDeposit(request.id, adminId)

    if (result.success) {
      console.log("[v0] Deposit approved successfully")
    } else {
      setError(result.error || "Failed to approve deposit")
    }

    setProcessing(null)
  }

  const handleReject = async (request: DepositRequest) => {
    if (!window.confirm(`Are you sure you want to reject this deposit request? The transaction will be cancelled.`)) {
      return
    }

    setProcessing(request.id)
    setError(null)

    const result = await rejectDeposit(request.id, adminId)

    if (result.success) {
      console.log("[v0] Deposit rejected successfully")
    } else {
      setError(result.error || "Failed to reject deposit")
    }

    setProcessing(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Deposit Requests</h2>
        <p className="text-slate-400">Review and approve pending deposit requests (Real-time updates enabled)</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-200 font-medium">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-slate-900 rounded-lg p-12 border border-slate-800 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-slate-400">No pending deposit requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-slate-900 rounded-lg p-6 border border-slate-800 overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{request.username}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">Request ID: {request.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{request.amount.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">{request.currency}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Deposit Type:</span>
                  <span className="text-white font-semibold">
                    {request.currency === "BANK" ? "Bank Transfer" : "Cryptocurrency"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Requested:</span>
                  <span className="text-white">
                    {request.requestedAt && typeof request.requestedAt === "object" && "toDate" in request.requestedAt
                      ? (request.requestedAt as any).toDate().toLocaleString()
                      : new Date(request.requestedAt as any).toLocaleString()}
                  </span>
                </div>
              </div>

              {request.proofScreenshot && (
                <div className="mb-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300 bg-blue-500/20 px-2 py-1 rounded">📋 Receipt</span>
                    <button
                      onClick={() => setSelectedProof(selectedProof === request.id ? null : request.id)}
                      className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      {selectedProof === request.id ? "Hide" : "View"} Proof
                    </button>
                  </div>
                  {selectedProof === request.id && (
                    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 overflow-x-auto">
                      <img
                        src={request.proofScreenshot}
                        alt="Deposit receipt"
                        className="max-h-96 rounded max-w-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%231e293b' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='16'%3EReceipt unavailable%3C/text%3E%3C/svg%3E"
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(request)}
                  disabled={processing === request.id}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2"
                >
                  {processing === request.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Approve Deposit
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleReject(request)}
                  disabled={processing === request.id}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 flex items-center justify-center gap-2"
                >
                  {processing === request.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Reject
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
