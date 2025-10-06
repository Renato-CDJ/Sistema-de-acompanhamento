"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useAuth } from "./auth-context"

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
  ) => void
  getActivitiesByCategory: (category: ActivityLog["category"]) => ActivityLog[]
  getActivitiesByUser: (userId: string) => ActivityLog[]
  getActivitiesByDateRange: (startDate: Date, endDate: Date) => ActivityLog[]
  clearActivities: () => void
  exportActivities: () => void
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined)

export function ActivityLogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityLog[]>([])

  // Load activities from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("activity-logs")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Convert timestamp strings back to Date objects
        const activitiesWithDates = parsed.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp),
        }))
        setActivities(activitiesWithDates)
      } catch (error) {
        console.error("Failed to parse activity logs:", error)
      }
    }
  }, [])

  // Save activities to localStorage whenever they change
  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem("activity-logs", JSON.stringify(activities))
    }
  }, [activities])

  const addActivity = useCallback(
    (action: string, category: ActivityLog["category"], details: string, metadata?: Record<string, any>) => {
      if (!user) return

      const newActivity: ActivityLog = {
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        userName: user.name,
        action,
        category,
        details,
        timestamp: new Date(),
        metadata,
      }

      setActivities((prev) => [newActivity, ...prev])
    },
    [user],
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

  const clearActivities = useCallback(() => {
    setActivities([])
    localStorage.removeItem("activity-logs")
  }, [])

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
