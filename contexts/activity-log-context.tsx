"use client"

import { createContext, useContext, useCallback, type ReactNode } from "react"
import useSWR from "swr"
import { useAuth } from "./auth-context"
import { createClient } from "@/lib/supabase/client"

export interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: string
  category: "data" | "training" | "dismissal" | "user" | "document" | "chat" | "agenda" | "export" | "system"
  details: string
  timestamp: Date
  metadata?: Record<string, any>
}

interface ActivityLogContextType {
  activities: ActivityLog[]
  addActivity: (
    action: string,
    category: ActivityLog["category"],
    details: string,
    metadata?: Record<string, any>,
  ) => Promise<void>
  getActivitiesByCategory: (category: ActivityLog["category"]) => ActivityLog[]
  getActivitiesByUser: (userId: string) => ActivityLog[]
  getActivitiesByDateRange: (startDate: Date, endDate: Date) => ActivityLog[]
  clearActivities: () => Promise<void>
  exportActivities: () => void
  isLoading: boolean
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined)

const fetcher = async (key: string) => {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error("Not authenticated")

  const { data, error } = await supabase.from("activity_logs").select("*").order("timestamp", { ascending: false })

  if (error) throw error

  return (data || []).map((item: any) => ({
    id: item.id,
    userId: item.entity_id || "",
    userName: item.user_name,
    action: item.action,
    category: item.entity as ActivityLog["category"],
    details: item.details,
    timestamp: new Date(item.timestamp),
    metadata: item.changes,
  }))
}

export function ActivityLogProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()

  const shouldFetch = user && !authLoading

  const {
    data: activities = [],
    mutate,
    isLoading,
  } = useSWR(shouldFetch ? "activity_logs" : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  })

  const addActivity = useCallback(
    async (action: string, category: ActivityLog["category"], details: string, metadata?: Record<string, any>) => {
      if (!user) return

      const supabase = createClient()

      const { error } = await supabase.from("activity_logs").insert({
        user_name: user.name,
        entity_id: user.id,
        action,
        entity: category,
        details,
        changes: metadata || null,
      })

      if (error) throw error

      await mutate()
    },
    [user, mutate],
  )

  const getActivitiesByCategory = useCallback(
    (category: ActivityLog["category"]) => {
      return activities.filter((activity) => activity.category === category)
    },
    [activities],
  )

  const getActivitiesByUser = useCallback(
    (userId: string) => {
      return activities.filter((activity) => activity.userId === userId)
    },
    [activities],
  )

  const getActivitiesByDateRange = useCallback(
    (startDate: Date, endDate: Date) => {
      return activities.filter((activity) => {
        const activityDate = new Date(activity.timestamp)
        return activityDate >= startDate && activityDate <= endDate
      })
    },
    [activities],
  )

  const clearActivities = useCallback(async () => {
    const supabase = createClient()

    const { error } = await supabase.from("activity_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    if (error) throw error

    await mutate()
  }, [mutate])

  const exportActivities = useCallback(() => {
    const dataStr = JSON.stringify(activities, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `activity-logs-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [activities])

  return (
    <ActivityLogContext.Provider
      value={{
        activities,
        addActivity,
        getActivitiesByCategory,
        getActivitiesByUser,
        getActivitiesByDateRange,
        clearActivities,
        exportActivities,
        isLoading,
      }}
    >
      {children}
    </ActivityLogContext.Provider>
  )
}

export function useActivityLog() {
  const context = useContext(ActivityLogContext)
  if (context === undefined) {
    throw new Error("useActivityLog must be used within an ActivityLogProvider")
  }
  return context
}
