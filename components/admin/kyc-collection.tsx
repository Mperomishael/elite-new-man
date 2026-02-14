"use client"

import { useState, useEffect } from "react"
import { collection, query, onSnapshot, doc, updateDoc, type Unsubscribe } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Eye, Check, X, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KYCDocument {
  id: string
  userId: string
  username: string
  documentUrl: string
  uploadedAt: number
  status: "pending" | "approved" | "rejected"
  documentType?: string
  approvedBy?: string
  approvedAt?: number
  rejectionReason?: string
}

interface KYCCollectionProps {
  adminId: string
}

export function KYCCollection({ adminId }: KYCCollectionProps) {
  const [documents, setDocuments] = useState<KYCDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<KYCDocument | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending")

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null

    try {
      const q = query(collection(db, "kycDocuments"))
      unsubscribe = onSnapshot(q, async (snapshot) => {
        const docs: KYCDocument[] = []
        for (const docSnap of snapshot.docs) {
          const docData = docSnap.data() as any
          
          try {
            // Get user profile to get username
            const userRef = doc(db, "users", docData.userId)
            const userSnap = await (await import("firebase/firestore")).getDoc(userRef)
            const username = userSnap.exists() ? (userSnap.data() as any).username || "Unknown" : "Unknown"

            docs.push({
              id: docSnap.id,
              username,
              ...docData,
              uploadedAt: docData.uploadedAt?.toMillis?.() || docData.uploadedAt || Date.now(),
            } as KYCDocument)
          } catch (err) {
            console.error("[v0] Error fetching username:", err)
            docs.push({
              id: docSnap.id,
              username: "Unknown",
              ...docData,
              uploadedAt: docData.uploadedAt?.toMillis?.() || docData.uploadedAt || Date.now(),
            } as KYCDocument)
          }
        }

        // Sort by most recent first
        docs.sort((a, b) => b.uploadedAt - a.uploadedAt)
        setDocuments(docs)
        setLoading(false)
      })
    } catch (err) {
      console.error("[v0] Error setting up KYC listener:", err)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const handleApprove = async (doc: KYCDocument) => {
    setProcessing(doc.id)
    setError(null)

    try {
      const docRef = doc(db, "kycDocuments", doc.id)
      await updateDoc(docRef, {
        status: "approved",
        approvedBy: adminId,
        approvedAt: Date.now(),
      })

      // Update user KYC status if all documents are approved
      const userRef = doc(db, "users", doc.userId)
      await updateDoc(userRef, {
        kycStatus: "approved",
      })

      console.log("[v0] KYC document approved")
    } catch (err: any) {
      console.error("[v0] Error approving document:", err)
      setError(err.message || "Failed to approve document")
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (doc: KYCDocument, reason: string) => {
    setProcessing(doc.id)
    setError(null)

    try {
      const docRef = doc(db, "kycDocuments", doc.id)
      await updateDoc(docRef, {
        status: "rejected",
        approvedBy: adminId,
        approvedAt: Date.now(),
        rejectionReason: reason,
      })

      // Update user KYC status to rejected
      const userRef = doc(db, "users", doc.userId)
      await updateDoc(userRef, {
        kycStatus: "rejected",
      })

      console.log("[v0] KYC document rejected")
      setSelectedDoc(null)
    } catch (err: any) {
      console.error("[v0] Error rejecting document:", err)
      setError(err.message || "Failed to reject document")
    } finally {
      setProcessing(null)
    }
  }

  const filteredDocs = filterStatus === "all" ? documents : documents.filter((d) => d.status === filterStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">KYC Collection</h2>
          <p className="text-sm text-slate-400">Review and approve customer KYC documents</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{documents.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{documents.filter((d) => d.status === "pending").length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-1">Approved</p>
          <p className="text-2xl font-bold text-emerald-400">{documents.filter((d) => d.status === "approved").length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-400">{documents.filter((d) => d.status === "rejected").length}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === status
                ? "bg-emerald-500 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-800">
            <p className="text-slate-400">No {filterStatus === "all" ? "documents" : `${filterStatus} documents`} found</p>
          </div>
        ) : (
          filteredDocs.map((kyc) => (
            <div key={kyc.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white font-semibold">{kyc.username}</p>
                  <p className="text-xs text-slate-500 mt-1">ID: {kyc.userId.slice(0, 20)}...</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Uploaded: {new Date(kyc.uploadedAt).toLocaleString()}
                  </p>
                  {kyc.documentType && (
                    <p className="text-xs text-slate-400">
                      Type: <span className="text-slate-300">{kyc.documentType}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      kyc.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : kyc.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {kyc.status === "pending" && <Clock className="w-3 h-3" />}
                    {kyc.status === "approved" && <Check className="w-3 h-3" />}
                    {kyc.status === "rejected" && <X className="w-3 h-3" />}
                    {kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1)}
                  </span>
                </div>
              </div>

              {kyc.rejectionReason && (
                <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
                  <p className="text-xs text-red-400">
                    <span className="font-semibold">Rejection Reason:</span> {kyc.rejectionReason}
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedDoc(kyc)}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                Review Document
              </button>
            </div>
          ))
        )}
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
              <h3 className="text-lg font-bold text-white">{selectedDoc.username}'s KYC Document</h3>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Document Info */}
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-slate-400">User ID:</span> <span className="text-white">{selectedDoc.userId}</span>
                </p>
                <p>
                  <span className="text-slate-400">Uploaded:</span>{" "}
                  <span className="text-white">{new Date(selectedDoc.uploadedAt).toLocaleString()}</span>
                </p>
                <p>
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                      selectedDoc.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : selectedDoc.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {selectedDoc.status.toUpperCase()}
                  </span>
                </p>
              </div>

              {/* Document Preview */}
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                {selectedDoc.documentUrl?.endsWith(".pdf") ? (
                  <div className="aspect-video bg-slate-900 rounded flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-slate-400 mb-2">PDF Document</p>
                      <a
                        href={selectedDoc.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 text-sm underline"
                      >
                        Open in new tab
                      </a>
                    </div>
                  </div>
                ) : (
                  <img
                    src={selectedDoc.documentUrl}
                    alt="KYC Document"
                    className="w-full rounded max-h-96 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%231e293b' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='16'%3EDocument unavailable%3C/text%3E%3C/svg%3E"
                    }}
                  />
                )}
              </div>

              {/* Action Buttons */}
              {selectedDoc.status === "pending" && (
                <div className="space-y-3">
                  <Button
                    onClick={() => handleApprove(selectedDoc)}
                    disabled={processing === selectedDoc.id}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {processing === selectedDoc.id ? "Processing..." : "Approve Document"}
                  </Button>

                  <div className="space-y-2">
                    <input
                      type="text"
                      id="rejection-reason"
                      placeholder="Enter rejection reason (optional)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <Button
                      onClick={() => {
                        const reason = (document.getElementById("rejection-reason") as HTMLInputElement)?.value || ""
                        handleReject(selectedDoc, reason)
                      }}
                      disabled={processing === selectedDoc.id}
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                    >
                      {processing === selectedDoc.id ? "Processing..." : "Reject Document"}
                    </Button>
                  </div>
                </div>
              )}

              {selectedDoc.status === "approved" && (
                <div className="bg-emerald-500/20 border border-emerald-500 rounded-lg p-4">
                  <p className="text-emerald-400 text-sm">
                    ✓ Document approved by {selectedDoc.approvedBy || "admin"} on{" "}
                    {selectedDoc.approvedAt ? new Date(selectedDoc.approvedAt).toLocaleString() : "N/A"}
                  </p>
                </div>
              )}

              {selectedDoc.status === "rejected" && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 space-y-2">
                  <p className="text-red-400 text-sm">
                    ✕ Document rejected by {selectedDoc.approvedBy || "admin"} on{" "}
                    {selectedDoc.approvedAt ? new Date(selectedDoc.approvedAt).toLocaleString() : "N/A"}
                  </p>
                  {selectedDoc.rejectionReason && (
                    <p className="text-red-300 text-sm">
                      <span className="font-semibold">Reason:</span> {selectedDoc.rejectionReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
