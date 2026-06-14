"use client"

import { useState, useEffect } from "react"
import { LogIn, LogOut, Check, AlertCircle, TrendingUp, TrendingDown, Clock, ArrowDownToLine, ArrowUpFromLine, FileCheck, Repeat } from "lucide-react"
import { listenToUserActivities } from "@/lib/auth-service"
import type { Activity } from "@/lib/auth-service"

interface ActivityPanelProps {
  userId?: string
  maxItems?: number
  onSignOut?: () => void
}

export function ActivityPanel({ userId, maxItems = 10, onSignOut }: ActivityPanelProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | Activity["type"]>("all")

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    // Real-time listener for activities
    const unsubscribe = listenToUserActivities(userId, (data) => {
      setActivities(data.slice(0, maxItems))
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId, maxItems])

  const filteredActivities =
    filter === "all"
      ? activities
      : filter === "deposit"
        ? activities.filter((a) => a.type === "deposit" || a.type === "deposit_approved")
        : filter === "withdraw"
          ? activities.filter((a) => a.type === "withdraw" || a.type === "withdrawal_approved")
          : activities.filter((a) => a.type === filter)

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "login":
        return <LogIn className="w-4 h-4 text-lime-400" />
      case "logout":
        return <LogOut className="w-4 h-4 text-neutral-400" />
      case "deposit":
      case "deposit_approved":
        return <ArrowDownToLine className="w-4 h-4 text-lime-400" />
      case "withdraw":
        return <ArrowUpFromLine className="w-4 h-4 text-orange-400" />
      case "withdrawal_approved":
        return <TrendingDown className="w-4 h-4 text-red-400" />
      case "trade":
        return <Repeat className="w-4 h-4 text-purple-400" />
      case "kyc_submission":
        return <FileCheck className="w-4 h-4 text-amber-400" />
      case "kyc_approved":
        return <Check className="w-4 h-4 text-lime-400" />
      case "balance_change":
        return <TrendingUp className="w-4 h-4 text-amber-400" />
      case "profile_update":
        return <AlertCircle className="w-4 h-4 text-neutral-400" />
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />
    }
  }

  const getActivityBgColor = (type: Activity["type"]) => {
    switch (type) {
      case "login":
      case "deposit":
      case "deposit_approved":
      case "kyc_approved":
        return "bg-lime-400/10"
      case "logout":
        return "bg-neutral-800/50"
      case "withdraw":
        return "bg-orange-500/10"
      case "withdrawal_approved":
        return "bg-red-500/10"
      case "trade":
        return "bg-purple-500/10"
      case "kyc_submission":
        return "bg-amber-500/10"
      case "balance_change":
        return "bg-amber-500/10"
      case "profile_update":
        return "bg-neutral-800/50"
      default:
        return "bg-neutral-800/50"
    }
  }

  const getActivityBdColor = (type: Activity["type"]) => {
    switch (type) {
      case "login":
      case "deposit":
      case "deposit_approved":
      case "kyc_approved":
        return "border-lime-400/20"
      case "logout":
        return "border-neutral-700"
      case "withdraw":
        return "border-orange-500/20"
      case "withdrawal_approved":
        return "border-red-500/20"
      case "trade":
        return "border-purple-500/20"
      case "kyc_submission":
        return "border-amber-500/20"
      case "balance_change":
        return "border-amber-500/20"
      case "profile_update":
        return "border-neutral-700"
      default:
        return "border-neutral-700"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-3 lime-400 border-t-transparent rounded-full animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Activity Panel</h2>
          <p className="text-sm text-neutral-400 mt-1">Your account activity and important events</p>
        </div>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
            filter === "all"
              ? "bg-amber-500 text-white"
              : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("login")}
          className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
            filter === "login"
              ? "bg-lime-400 text-white"
              : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
          }`}
        >
          Logins
        </button>
        <button
          onClick={() => setFilter("logout")}
          className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
            filter === "logout"
              ? "bg-neutral-400 text-black"
              : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
          }`}
        >
          Sign Outs
        </button>
        <button
          onClick={() => setFilter("deposit")}
          className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
            filter === "deposit"
              ? "bg-lime-400 text-white"
              : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
          }`}
        >
          Deposits
        </button>
        <button
          onClick={() => setFilter("withdraw")}
          className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
            filter === "withdraw"
              ? "bg-orange-500 text-white"
              : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
          }`}
        >
          Withdrawals
        </button>
        <button
          onClick={() => setFilter("trade")}
          className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
            filter === "trade"
              ? "bg-purple-500 text-white"
              : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
          }`}
        >
          Trading
        </button>
        <button
          onClick={() => setFilter("kyc_submission")}
          className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
            filter === "kyc_submission"
              ? "bg-amber-500 text-white"
              : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
          }`}
        >
          KYC
        </button>
        <button
          onClick={() => setFilter("balance_change")}
          className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
            filter === "balance_change"
              ? "bg-amber-500 text-white"
              : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
          }`}
        >
          Balance
        </button>
      </div>

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <Clock className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-400 text-lg">No activities yet</p>
          <p className="text-neutral-500 text-sm mt-1">Your account events will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity, idx) => (
            <div
              key={activity.id || idx}
              className={`${getActivityBgColor(activity.type)} border ${getActivityBdColor(
                activity.type
              )} rounded-lg p-4 transition-all hover:bg-opacity-20`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{activity.description}</p>

                  {/* Display value changes if applicable */}
                  {activity.amount && (
                    <p className="text-sm font-semibold text-lime-400 mt-1">
                      ${activity.amount.toFixed(2)}
                    </p>
                  )}

                  {activity.previousValue !== undefined && activity.newValue !== undefined && (
                    <div className="text-xs text-neutral-400 mt-1 space-y-1">
                      <p>
                        Previous: <span className="text-neutral-300 font-medium">{String(activity.previousValue)}</span>
                      </p>
                      <p>
                        Current:{" "}
                        <span className="text-lime-400 font-medium">{String(activity.newValue)}</span>
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-neutral-500 mt-2">
                    {activity.timestamp?.toDate?.()?.toLocaleString?.() ?? new Date().toLocaleString()}
                  </p>
                </div>

                {/* Activity Type Badge */}
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-neutral-800 text-neutral-300">
                    {activity.type.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show more indicator */}
      {activities.length > maxItems && (
        <div className="text-center pt-4">
          <p className="text-xs text-neutral-400">
            Showing {filteredActivities.length} of {activities.length} activities
          </p>
        </div>
      )}
    </div>
  )
}
