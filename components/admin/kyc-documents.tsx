"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, onSnapshot, doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { FileText, Download, Eye } from "lucide-react"
import { logUserActivity } from "@/lib/auth-service"

interface KYCDocumentsProps {
  userId?: string
}

interface KYCDocument {
  id?: string
  userId: string
  username: string
  documentUrl: string
  uploadedAt: number
  status: "pending" | "approved" | "rejected"
}

export function KYCDocuments({ userId }: KYCDocumentsProps) {
  const [documents, setDocuments] = useState<KYCDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<KYCDocument | null>(null)

  useEffect(() => {
    // Use real-time listener so admin sees uploads and status changes live
    let unsubscribe: any = null
    try {
      let q
      if (userId) {
        q = query(collection(db, "kycDocuments"), where("userId", "==", userId))
      } else {
        q = query(collection(db, "kycDocuments"))
      }
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const docs: KYCDocument[] = []
        querySnapshot.forEach((d) => docs.push({ id: d.id, ...(d.data() as KYCDocument) }))
        setDocuments(docs)
        setLoading(false)
      })
    } catch (error) {
      console.error("[v0] Load KYC documents error:", error)
      setLoading(false)
    }

    return () => unsubscribe && unsubscribe()
  }, [userId])

  const loadDocuments = async () => {
    // kept for compatibility but no longer required
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (selectedDoc) {
    const handleReview = async (status: "approved" | "rejected") => {
      try {
        // update kycDocuments entry
        await setDoc(doc(db, "kycDocuments", selectedDoc.id), { status }, { merge: true })
        // update user's profile kycStatus
        await setDoc(doc(db, "users", selectedDoc.userId), { kycStatus: status }, { merge: true })
        // log activity
        await logUserActivity(selectedDoc.userId, {
          type: "kyc_approved",
          description: `KYC verification ${status === "approved" ? "approved" : "rejected"}`,
        })
        setSelectedDoc({ ...selectedDoc, status })
      } catch (error) {
        console.error("[v0] Review KYC doc error:", error)
      }
    }

    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedDoc(null)}
          className="text-amber-500 hover:text-amber-400 text-sm font-medium"
        >
          ← Back to Documents
        </button>

        <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
          <div className="mb-4">
            <p className="text-sm text-slate-400">User</p>
            <p className="text-lg font-semibold text-white">{selectedDoc.username}</p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-slate-400">Uploaded</p>
            <p className="text-white">{new Date(selectedDoc.uploadedAt).toLocaleString()}</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-slate-400 mb-3">Document Preview</p>
            {selectedDoc.documentUrl.startsWith("data:image") ? (
              <img
                src={selectedDoc.documentUrl || "/placeholder.svg"}
                alt="KYC Document"
                className="max-w-full h-auto rounded-lg border border-slate-700"
              />
            ) : (
              <div className="bg-slate-800 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400">PDF Document</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <a
              href={selectedDoc.documentUrl}
              download
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 rounded-lg"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            <button
              onClick={() => handleReview("approved")}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 rounded-lg"
            >
              Approve
            </button>
            <button
              onClick={() => handleReview("rejected")}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">KYC Documents</h2>
        <p className="text-slate-400">View and manage user KYC documents</p>
      </div>

      {documents.length === 0 ? (
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-8 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-400">No KYC documents found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="bg-slate-900 rounded-lg border border-slate-800 p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-white font-medium">{doc.username}</p>
                <p className="text-sm text-slate-400">{new Date(doc.uploadedAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doc.status === "approved"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : doc.status === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {doc.status}
                </span>
                <button onClick={() => setSelectedDoc(doc)} className="text-amber-500 hover:text-amber-400 p-2">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
