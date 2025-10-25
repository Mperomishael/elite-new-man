"use client"

import { FileCheck, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"

export function KycView() {
  const [kycStatus, setKycStatus] = useState<"pending" | "verified" | "rejected">("pending")

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <FileCheck className="w-8 h-8 text-lime-400" />
        <div>
          <h2 className="text-2xl font-bold">KYC Verification</h2>
          <p className="text-sm text-slate-400">Complete your identity verification</p>
        </div>
      </div>

      {/* Status Card */}
      <div
        className={`rounded-2xl p-6 ${
          kycStatus === "verified"
            ? "bg-gradient-to-br from-lime-400 to-green-500"
            : kycStatus === "rejected"
              ? "bg-gradient-to-br from-red-500 to-red-600"
              : "bg-gradient-to-br from-blue-600 to-purple-600"
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          {kycStatus === "verified" ? (
            <CheckCircle className="w-6 h-6 text-white" />
          ) : kycStatus === "rejected" ? (
            <AlertCircle className="w-6 h-6 text-white" />
          ) : (
            <FileCheck className="w-6 h-6 text-white" />
          )}
          <h3 className="text-xl font-bold text-white">
            {kycStatus === "verified"
              ? "Verified"
              : kycStatus === "rejected"
                ? "Verification Failed"
                : "Pending Verification"}
          </h3>
        </div>
        <p className="text-white/90 text-sm">
          {kycStatus === "verified"
            ? "Your account has been successfully verified"
            : kycStatus === "rejected"
              ? "Please resubmit your documents"
              : "Your documents are under review"}
        </p>
      </div>

      {/* Upload Documents */}
      <div className="bg-slate-700/50 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-lg">Required Documents</h3>

        <div className="space-y-3">
          <DocumentUpload title="Government ID" description="Passport, Driver's License, or National ID" />
          <DocumentUpload
            title="Proof of Address"
            description="Utility bill or bank statement (less than 3 months old)"
          />
          <DocumentUpload title="Selfie with ID" description="Clear photo of you holding your ID" />
        </div>

        <button className="w-full bg-lime-400 text-slate-900 font-bold py-4 rounded-xl active:scale-95 transition-transform">
          Submit Documents
        </button>
      </div>
    </div>
  )
}

function DocumentUpload({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
        <Upload className="w-5 h-5 text-lime-400" />
      </div>
      <button className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 rounded-lg transition-colors mt-2">
        Choose File
      </button>
    </div>
  )
}
