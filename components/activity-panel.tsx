"use client"

import { useState, useEffect } from "react"
import { LogIn, Check, AlertCircle, TrendingUp, TrendingDown, Clock } from "lucide-react"
import { listenToUserActivities } from "@/lib/auth-service"
import type { Activity } from "@/lib/auth-service"

interface ActivityPanelProps {
  userId?: string
  maxItems?: number
}

export function ActivityPanel({ userId, maxItems = 10 }: ActivityPanelProps) {
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

  const filteredActivities = filter === "all" ? activities : activities.filter((a) => a.type === filter)

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "login":
        return <LogIn className="w-4 h-4 text-blue-400" />
      case "deposit_approved":
        return <TrendingUp className="w-4 h-4 text-emerald-400" />
      case "withdrawal_approved":
        return <TrendingDown className="w-4 h-4 text-red-400" />
      case "kyc_approved":
        return <Check className="w-4 h-4 text-emerald-400" />
      case "balance_change":
        return <TrendingUp className="w-4 h-4 text-amber-400" />
      case "profile_update":
        return <AlertCircle className="w-4 h-4 text-slate-400" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getActivityBgColor = (type: Activity["type"]) => {
    switch (type) {
      case "login":
        return "bg-blue-500/10"
      case "deposit_approved":
      case "kyc_approved":
        return "bg-emerald-500/10"
      case "withdrawal_approved":
        return "bg-red-500/10"
      case "balance_change":
        return "bg-amber-500/10"
      case "profile_update":
        return "bg-slate-800/50"
      default:
        return "bg-slate-800/50"
    }
  }

  const getActivityBdColor = (type: Activity["type"]) => {
    switch (type) {
      case "login":
        return "border-blue-500/20"
      case "deposit_approved":
      case "kyc_approved":
        return "border-emerald-500/20"
      case "withdrawal_approved":
        return "border-red-500/20"
      case "balance_change":
        return "border-amber-500/20"
      case "profile_update":
        return "border-slate-700"
      default:
        return "border-slate-700"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Activity Panel</h2>
        <p className="text-sm text-slate-400 mt-1">Your account activity and important events</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
            filter === "all"
              ? "bg-amber-500 text-white"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("login")}
          className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
            filter === "login"
              ? "bg-blue-500 text-white"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          Logins
        </button>
        <button
          onClick={() => setFilter("deposit_approved")}
          className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
            filter === "deposit_approved"
              ? "bg-emerald-500 text-white"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          Deposits
        </button>
        <button
          onClick={() => setFilter("balance_change")}
          className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
            filter === "balance_change"
              ? "bg-amber-500 text-white"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          Balance
        </button>
      </div>

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-lg">No activities yet</p>
          <p className="text-slate-500 text-sm mt-1">Your account events will appear here</p>
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
                    <p className="text-sm font-semibold text-emerald-400 mt-1">
                      ${activity.amount.toFixed(2)}
                    </p>
                  )}

                  {activity.previousValue !== undefined && activity.newValue !== undefined && (
                    <div className="text-xs text-slate-400 mt-1 space-y-1">
                      <p>
                        Previous: <span className="text-slate-300 font-medium">{String(activity.previousValue)}</span>
                      </p>
                      <p>
                        Current:{" "}
                        <span className="text-emerald-400 font-medium">{String(activity.newValue)}</span>
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 mt-2">
                    {activity.timestamp?.toDate?.()?.toLocaleString?.() ?? new Date().toLocaleString()}
                  </p>
                </div>

                {/* Activity Type Badge */}
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-slate-800 text-slate-300">
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
          <p className="text-xs text-slate-400">
            Showing {filteredActivities.length} of {activities.length} activities
          </p>
        </div>
      )}
    </div>
  )
}
