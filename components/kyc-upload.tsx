"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, Check } from "lucide-react"
import { addKYCDocument } from "@/lib/auth-service"

interface KYCUploadProps {
  userId: string
  onUploadSuccess?: () => void
}

export function KYCUpload({ userId, onUploadSuccess }: KYCUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([])
  const [message, setMessage] = useState("")

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
        setMessage("Some files were rejected. Only PNG/JPG/PDF files under 5MB are allowed.")
      }
      setFiles([...files, ...filtered])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setMessage("")

    try {
      for (const file of files) {
        // Create a data URL for the file (in production, you'd upload to cloud storage)
        const reader = new FileReader()
        reader.onload = async (e) => {
          const dataUrl = e.target?.result as string
          const result = await addKYCDocument(userId, dataUrl)

          if (result.success) {
            setUploadedDocs([...uploadedDocs, dataUrl])
            setMessage("Document uploaded successfully!")
            onUploadSuccess?.()
          } else {
            setMessage("Failed to upload document")
          }
        }
        reader.readAsDataURL(file)
      }

      setFiles([])
    } catch (error) {
      setMessage("Error uploading documents")
      console.error("[v0] Upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">KYC Documents</h3>
        <p className="text-sm text-slate-400">Upload identity documents for verification</p>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-amber-500 transition-colors cursor-pointer">
        <label className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-slate-400" />
            <div>
              <p className="text-white font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-400">PNG, JPG, PDF up to 5MB</p>
            </div>
          </div>
          <input type="file" multiple accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileSelect} className="hidden" />
        </label>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Selected files ({files.length})</p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800"
            >
              <span className="text-sm text-white truncate">{file.name}</span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="text-slate-400 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {uploading ? "Uploading..." : `Upload ${files.length} Document${files.length > 1 ? "s" : ""}`}
        </button>
      )}

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.includes("success")
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message}
        </div>
      )}

      {/* Uploaded Documents */}
      {uploadedDocs.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Uploaded documents ({uploadedDocs.length})</p>
          {uploadedDocs.map((doc, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">Document {index + 1} uploaded</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
