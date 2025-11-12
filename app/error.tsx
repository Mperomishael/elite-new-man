"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Error boundary caught:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated error icon */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse opacity-20"></div>
            <div className="absolute inset-2 bg-slate-950 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-500 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Animated message */}
        <div className="space-y-4 animate-in fade-in duration-1000">
          <h1 className="text-2xl font-bold text-white">Oops! Something Went Wrong</h1>
          <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
            <p className="font-medium">
              <span className="inline-block animate-pulse">It is our fault,</span>
              <span className="inline-block ml-1 animate-pulse" style={{ animationDelay: "0.2s" }}>
                not yours.
              </span>
            </p>
            <p className="text-slate-400">We sincerely apologize for this unexpected issue.</p>
            <p className="text-emerald-400 font-semibold inline-block">We'll be back shortly.</p>
          </div>
        </div>

        {/* Animated status dots */}
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            onClick={() => reset()}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-300"
          >
            Home
          </button>
        </div>

        {/* Error details */}
        {error.message && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-xs text-slate-400 max-h-20 overflow-auto">
            <p className="text-red-400 font-mono break-words">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}
