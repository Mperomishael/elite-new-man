"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, X, Check, Clock, AlertCircle } from "lucide-react"
import { addKYCDocument, logUserActivity } from "@/lib/auth-service"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot } from "firebase/firestore"

interface KYCUploadProps {
  userId: string
  onUploadSuccess?: () => void
}

interface KYCDocument {
  id?: string
  userId: string
  documentUrl: string
  uploadedAt: number
  status: "pending" | "approved" | "rejected"
}

export function KYCUpload({ userId, onUploadSuccess }: KYCUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadCount, setUploadCount] = useState(0)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info")
  const [submittedDocs, setSubmittedDocs] = useState<KYCDocument[]>([])

  // Real-time listener for submitted documents
  useEffect(() => {
    let unsubscribe: any = null
    try {
      const q = query(collection(db, "kycDocuments"), where("userId", "==", userId))
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const docs: KYCDocument[] = []
        querySnapshot.forEach((d) => docs.push({ id: d.id, ...(d.data() as KYCDocument) }))
        setSubmittedDocs(docs)
      })
    } catch (error) {
      console.error("[v0] Load submitted documents error:", error)
    }

    return () => unsubscribe && unsubscribe()
  }, [userId])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      // filter allowed types and enforce max 5MB per file
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"]
      const maxBytes = 5 * 1024 * 1024
      const filtered = newFiles.filter((f) => {
        if (!allowedTypes.includes(f.type)) return false
        if (f.size > maxBytes) return false
        return true
      })
      const rejected = newFiles.filter((f) => !filtered.includes(f))
      if (rejected.length > 0) {
        setMessage("Some files rejected. Only PNG/JPG/PDF files under 5MB allowed.")
        setMessageType("error")
        setTimeout(() => setMessage(""), 5000)
      }
      setFiles([...files, ...filtered])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        resolve(dataUrl)
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage("Please select at least one file")
      setMessageType("error")
      return
    }

    setUploading(true)
    setMessage("")
    setMessageType("info")

    try {
      await Promise.all(
        files.map(async (file) => {
          const dataUrl = await fileToDataUrl(file)
          const result = await addKYCDocument(userId, dataUrl)
          if (!result.success) {
            throw new Error(result.error || "Failed to upload document")
          }
        })
      )

      setUploadCount((prev) => prev + files.length)
      setMessage(`Successfully submitted ${files.length} document${files.length > 1 ? "s" : ""}! Awaiting admin review.`)
      setMessageType("success")
      setFiles([])

      try {
        await logUserActivity(userId, {
          type: "kyc_submission",
          description: `Submitted ${files.length} KYC document${files.length > 1 ? "s" : ""} for verification`,
        })
      } catch (err) {
        console.error("[v0] Failed to log KYC submission activity:", err)
      }

      setTimeout(() => onUploadSuccess?.(), 2000)
    } catch (error: any) {
      console.error("[v0] Upload error:", error)
      setMessage(error?.message || "Error uploading documents")
      setMessageType("error")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div>
        <label className="block">
          <div className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center hover:border-amber-500 transition-colors cursor-pointer bg-neutral-800/50">
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-neutral-400" />
              <div>
                <p className="text-white font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-neutral-400 mt-1">PNG, JPG, PDF up to 5MB per file</p>
              </div>
            </div>
            <input type="file" multiple accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileSelect} className="hidden" />
          </div>
        </label>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-neutral-400 font-medium">Selected files ({files.length})</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-neutral-800 p-3 rounded-lg border border-neutral-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate font-medium">{file.name}</p>
                  <p className="text-xs text-neutral-400">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-neutral-400 hover:text-red-400 transition-colors ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Submit {files.length} Document{files.length > 1 ? "s" : ""}
            </>
          )}
        </button>
      )}

      {/* Messages */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
            messageType === "success"
              ? "bg-lime-400/10 text-lime-400 border border-lime-400/20"
              : messageType === "error"
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-lime-400/10 text-lime-400 border border-lime-400/20"
          }`}
        >
          {messageType === "success" && <Check className="w-4 h-4 flex-shrink-0" />}
          {messageType === "error" && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {messageType === "info" && <Clock className="w-4 h-4 flex-shrink-0" />}
          {message}
        </div>
      )}

      {/* Submitted Documents Status */}
      {submittedDocs.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-neutral-800">
          <h4 className="text-sm font-medium text-neutral-400">Submission History</h4>
          {submittedDocs.map((doc, index) => (
            <div key={doc.id || index} className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {doc.status === "approved" && (
                    <>
                      <Check className="w-4 h-4 text-lime-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-neutral-400">Submitted {new Date(doc.uploadedAt).toLocaleString()}</p>
                      </div>
                    </>
                  )}
                  {doc.status === "pending" && (
                    <>
                      <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0 animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-neutral-400">Under review since {new Date(doc.uploadedAt).toLocaleString()}</p>
                      </div>
                    </>
                  )}
                  {doc.status === "rejected" && (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-neutral-400">Rejected on {new Date(doc.uploadedAt).toLocaleString()}</p>
                      </div>
                    </>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${
                    doc.status === "approved"
                      ? "bg-lime-400/20 text-lime-400"
                      : doc.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {doc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700 space-y-2">
        <p className="text-xs font-medium text-neutral-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Important Information
        </p>
        <ul className="text-xs text-neutral-400 space-y-1">
          <li>• All documents must be clear and readable</li>
          <li>• Files must be PNG, JPG, or PDF format</li>
          <li>• Maximum file size: 5MB per document</li>
          <li>• Processing time: 24-48 hours</li>
          <li>• You'll receive an email notification when reviewed</li>
        </ul>
      </div>
    </div>
  )
}

export const KycView = KYCUpload

