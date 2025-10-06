"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Notification } from "@/lib/types"

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  soundEnabled: boolean
  toggleSound: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("notifications")
    if (stored) {
      setNotifications(JSON.parse(stored))
    }
    const soundPref = localStorage.getItem("notificationSound")
    if (soundPref !== null) {
      setSoundEnabled(soundPref === "true")
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem("notificationSound", soundEnabled.toString())
  }, [soundEnabled])

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }, [soundEnabled])

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString() + Math.random(),
        timestamp: new Date().toISOString(),
        read: false,
      }

      setNotifications((prev) => [newNotification, ...prev])

      playNotificationSound()

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
        })
      }
    },
    [playNotificationSound],
  )

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        soundEnabled,
        toggleSound,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
