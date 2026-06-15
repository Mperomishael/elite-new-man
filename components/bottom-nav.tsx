"use client"

import { PlusCircle, Bot, Home, FileCheck, Headphones } from "lucide-react"
import type { AppView } from "@/lib/views"

interface BottomNavProps {
  activeView: string
  onNavigate: (view: AppView) => void
}

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  const navItems: { id: AppView; label: string; icon: any; isCenter?: boolean }[] = [
    { id: "deposit", label: "Add Funds", icon: PlusCircle },
    { id: "buy", label: "Auto Trade", icon: Bot },
    { id: "dashboard", label: "Home", icon: Home, isCenter: true },
    { id: "kyc", label: "KYC", icon: FileCheck },
    { id: "support", label: "Support", icon: Headphones },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-neutral-800 z-40 safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-2xl mx-auto px-1 sm:px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center gap-0.5 py-2 px-2 sm:px-3 -mt-6 active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-lime-400 rounded-full flex items-center justify-center shadow-lg shadow-lime-400/50">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-white mt-1">{item.label}</span>
              </button>
            )
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 py-2.5 sm:py-3 px-2 sm:px-3 transition-all active:scale-95 ${
                isActive ? "text-lime-400" : "text-neutral-400"
              }`}
            >
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? "scale-110" : ""} transition-transform`} />
              <span className="text-[10px] sm:text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
