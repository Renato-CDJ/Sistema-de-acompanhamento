"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { Agenda } from "@/lib/types"
import { useAuth } from "./auth-context"
import { useNotifications } from "@/contexts/notifications-context"

interface AgendasContextType {
  agendas: Agenda[]
  addAgenda: (agenda: Omit<Agenda, "id" | "createdAt" | "notified24h" | "notifiedHours">) => void
  updateAgenda: (id: string, agenda: Partial<Agenda>) => void
  deleteAgenda: (id: string) => void
  getUpcomingAgendas: () => Agenda[]
  checkNotifications: () => void
}

const AgendasContext = createContext<AgendasContextType | undefined>(undefined)

export function AgendasProvider({ children }: { children: ReactNode }) {
  const [agendas, setAgendas] = useState<Agenda[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("agendas")
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error("Error loading agendas from localStorage:", error)
        return []
      }
    }
    return []
  })

  const { user } = useAuth()
  const { addNotification } = useNotifications()

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("agendas", JSON.stringify(agendas))
      } catch (error) {
        console.error("Error saving agendas to localStorage:", error)
      }
    }
  }, [agendas])

  // Check for notifications every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkNotifications()
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [agendas, user])

  const addAgenda = (newAgenda: Omit<Agenda, "id" | "createdAt" | "notified24h" | "notifiedHours">) => {
    const agenda: Agenda = {
      ...newAgenda,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      notified24h: false,
      notifiedHours: false,
    }
    setAgendas((prev) => [...prev, agenda])
  }

  const updateAgenda = (id: string, updatedAgenda: Partial<Agenda>) => {
    setAgendas((prev) => prev.map((agenda) => (agenda.id === id ? { ...agenda, ...updatedAgenda } : agenda)))
  }

  const deleteAgenda = (id: string) => {
    setAgendas((prev) => prev.filter((agenda) => agenda.id !== id))
  }

  const getUpcomingAgendas = () => {
    const now = new Date()
    return agendas
      .filter((agenda) => {
        const agendaDate = new Date(`${agenda.date}T${agenda.time}`)
        return agendaDate > now
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateA.getTime() - dateB.getTime()
      })
  }

  const checkNotifications = useCallback(() => {
    if (!user) return

    const now = new Date()
    const userId = user.id

    agendas.forEach((agenda) => {
      // Check if user is a participant
      if (!agenda.participants.includes(userId)) return

      const agendaDateTime = new Date(`${agenda.date}T${agenda.time}`)
      const timeDiff = agendaDateTime.getTime() - now.getTime()
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      // Notify 24 hours before
      if (!agenda.notified24h && hoursDiff <= 24 && hoursDiff > 23) {
        showNotification(agenda, "24 horas")
        setAgendas((prev) => prev.map((a) => (a.id === agenda.id ? { ...a, notified24h: true } : a)))
      }

      // Notify 1 hour before
      if (!agenda.notifiedHours && hoursDiff <= 1 && hoursDiff > 0) {
        showNotification(agenda, "1 hora")
        setAgendas((prev) => prev.map((a) => (a.id === agenda.id ? { ...a, notifiedHours: true } : a)))
      }
    })
  }, [agendas, user])

  const showNotification = (agenda: Agenda, timeframe: string) => {
    // Request notification permission if not granted
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(`Lembrete de Reunião - ${timeframe}`, {
          body: `${agenda.title} às ${agenda.time}`,
          icon: "/favicon.ico",
        })
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(`Lembrete de Reunião - ${timeframe}`, {
              body: `${agenda.title} às ${agenda.time}`,
              icon: "/favicon.ico",
            })
          }
        })
      }
    }

    // Also show in-app notification
    if (typeof window !== "undefined") {
      const event = new CustomEvent("agenda-notification", {
        detail: { agenda, timeframe },
      })
      window.dispatchEvent(event)
    }
  }

  // Check for upcoming agendas and send notifications
  useEffect(() => {
    const checkAgendas = () => {
      const now = new Date()
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const in1Hour = new Date(now.getTime() + 60 * 60 * 1000)

      agendas.forEach((agenda) => {
        const agendaTime = new Date(`${agenda.date}T${agenda.time}`)

        // Check if agenda is in 24 hours
        if (agendaTime > now && agendaTime <= in24Hours) {
          const key = `notified-24h-${agenda.id}`
          if (!localStorage.getItem(key)) {
            addNotification({
              type: "info",
              title: "Reunião em 24 horas",
              message: `${agenda.title} está agendada para amanhã às ${agenda.time}`,
            })
            localStorage.setItem(key, "true")

            // Dispatch custom event for in-app notification
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("agenda-notification", {
                  detail: { agenda, timeframe: "em 24 horas" },
                }),
              )
            }
          }
        }

        // Check if agenda is in 1 hour
        if (agendaTime > now && agendaTime <= in1Hour) {
          const key = `notified-1h-${agenda.id}`
          if (!localStorage.getItem(key)) {
            addNotification({
              type: "warning",
              title: "Reunião em 1 hora",
              message: `${agenda.title} começa em 1 hora (${agenda.time})`,
            })
            localStorage.setItem(key, "true")

            // Dispatch custom event for in-app notification
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("agenda-notification", {
                  detail: { agenda, timeframe: "em 1 hora" },
                }),
              )
            }
          }
        }
      })
    }

    // Check immediately and then every minute
    checkAgendas()
    const interval = setInterval(checkAgendas, 60000)

    return () => clearInterval(interval)
  }, [agendas, addNotification])

  return (
    <AgendasContext.Provider
      value={{
        agendas,
        addAgenda,
        updateAgenda,
        deleteAgenda,
        getUpcomingAgendas,
        checkNotifications,
      }}
    >
      {children}
    </AgendasContext.Provider>
  )
}

export function useAgendas() {
  const context = useContext(AgendasContext)
  if (context === undefined) {
    throw new Error("useAgendas must be used within an AgendasProvider")
  }
  return context
}
