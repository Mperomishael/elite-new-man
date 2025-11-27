"use client"

import { useState } from "react"
import { AlertCircle, Shield } from "lucide-react"

export function LicenseView() {
  const [isLoading, setIsLoading] = useState(true)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    return false
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault()
    return false
  }

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault()
    return false
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-400" />
          <h1 className="text-3xl font-bold">Company License</h1>
        </div>
        <p className="text-slate-400">View our official company license. This document is for viewing only.</p>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-300 mb-1">Protected Document</p>
          <p className="text-xs text-blue-200">
            This license is protected and cannot be downloaded, screenshotted, or copied. It is for viewing purposes only.
          </p>
        </div>
      </div>

      {/* License Image Container */}
      <div className="relative group">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900 rounded-2xl flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm">Loading license...</p>
            </div>
          </div>
        )}

        {/* Protected Image Container */}
        <div
          className="bg-slate-900 rounded-2xl p-4 md:p-6 border border-slate-800 overflow-hidden relative"
          onContextMenu={handleContextMenu}
          onCopy={handleCopy}
          style={{
            WebkitUserSelect: "none",
            userSelect: "none",
            WebkitTouchCallout: "none",
          } as React.CSSProperties}
        >
          {/* Anti-screenshot overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
            }}
          />

          {/* License Image */}
          <img
            src="https://i.ibb.co/spqVXGpT/Whats-App-Image-2025-11-15-at-9-11-47-PM.jpg"
            alt="Company License"
            draggable={false}
            onContextMenu={handleContextMenu}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            className="w-full h-auto rounded-lg relative z-10"
            style={{
              WebkitUserSelect: "none",
              userSelect: "none",
              pointerEvents: "none",
              WebkitTouchCallout: "none",
              filter: "brightness(1) contrast(1.05)",
            } as React.CSSProperties}
          />

          {/* Watermark overlay - subtle pattern */}
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 opacity-5"
            style={{
              fontSize: "4rem",
              fontWeight: "bold",
              color: "rgba(255,255,255,0.3)",
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            <div style={{ transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>CONFIDENTIAL</div>
          </div>

          {/* Click prevention overlay */}
          <div
            className="absolute inset-0 cursor-not-allowed"
            onContextMenu={handleContextMenu}
            onDragStart={handleDragStart}
            onCopy={handleCopy}
          />
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-sm">License Document Information</h3>
        <div className="space-y-2 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>License Type:</span>
            <span className="text-white font-medium">Business Operating License</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="text-emerald-400 font-medium">Active</span>
          </div>
          <div className="flex justify-between">
            <span>Protection:</span>
            <span className="text-blue-400 font-medium">View Only - Secured</span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-xs text-slate-500 bg-slate-900/30 rounded-lg p-3">
        <p>
          This license document is confidential and proprietary. Unauthorized reproduction or distribution is
          prohibited.
        </p>
      </div>
    </div>
  )
}
