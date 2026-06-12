"use client"

import { useEffect, useState } from "react"
import { X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WelcomeModalProps {
  userName: string
  onClose: () => void
}

export function WelcomeModal({ userName, onClose }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? "bg-black/60 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-gradient-to-br from-neutral-900 to-black border-2 border-lime-400/50 rounded-2xl p-8 max-w-md w-full shadow-2xl transition-all duration-500 ${
          isVisible ? "scale-100 opacity-100 tranneutral-y-0" : "scale-90 opacity-0 tranneutral-y-8"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-lime-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg shadow-lime-400/50">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-lime-400 to-lime-400 bg-clip-text text-transparent">
            Welcome to Elite Block Market!
          </h2>

          <p className="text-xl text-white font-semibold mb-6">Hello, {userName}!</p>

          <div className="bg-neutral-800/50 border border-lime-400/30 rounded-lg p-4 mb-6">
            <p className="text-neutral-300 text-sm leading-relaxed">
              Your account has been successfully verified. You're now ready to start trading and managing your
              investments with Elite Block Market.
            </p>
          </div>

          <div className="space-y-2 text-left mb-6">
            <div className="flex items-center gap-3 text-neutral-300 text-sm">
              <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
              <span>Access real-time market data</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-300 text-sm">
              <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
              <span>Trade crypto and forex markets</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-300 text-sm">
              <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
              <span>Manage your portfolio efficiently</span>
            </div>
          </div>

          <Button
            onClick={handleClose}
            className="w-full h-12 bg-gradient-to-r from-lime-400 to-lime-400 hover:from-lime-500 hover:to-lime-500 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  )
}
