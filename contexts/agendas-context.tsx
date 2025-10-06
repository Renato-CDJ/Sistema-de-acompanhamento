"use client"

import { createContext, useContext, useEffect, type ReactNode, useCallback } from "react"
import useSWR from "swr"
import type { Agenda } from "@/lib/types"
import { useAuth } from "./auth-context"
import { useNotifications } from "@/contexts/notifications-context"
import { createClient } from "@/lib/supabase/client"

interface AgendasContextType {
  agendas: Agenda[]
  addAgenda: (agenda: Omit<Agenda, "id" | "createdAt" | "notified24h" | "notifiedHours">) => Promise<void>
  updateAgenda: (id: string, agenda: Partial<Agenda>) => Promise<void>
  deleteAgenda: (id: string) => Promise<void>
  getUpcomingAgendas: () => Agenda[]
  checkNotifications: () => void
  isLoading: boolean
}

const AgendasContext = createContext<AgendasContextType | undefined>(undefined)

const fetcher = async (key: string) => {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  const { data, error } = await supabase
    .from("agendas")
    .select("*")
    .order("date", { ascending: true })
    .order("time", { ascending: true })

  if (error) throw error

  return (data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    date: item.date,
    time: item.time,
    participants: item.participants || [],
    createdBy: item.created_by,
    createdAt: item.created_at,
    notified24h: item.notified_24h || false,
    notifiedHours: item.notified_hours || false,
  }))
}

export function AgendasProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const { addNotification } = useNotifications()

  const shouldFetch = user && !authLoading
  const {
    data: agendas = [],
    mutate,
    isLoading,
  } = useSWR(shouldFetch ? "agendas" : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  })

  const addAgenda = async (newAgenda: Omit<Agenda, "id" | "createdAt" | "notified24h" | "notifiedHours">) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("agendas")
      .insert({
        title: newAgenda.title,
        description: newAgenda.description,
        date: newAgenda.date,
        time: newAgenda.time,
        participants: newAgenda.participants,
        created_by: user?.email || "",
        notified_24h: false,
        notified_hours: false,
      })
      .select()
      .single()

    if (error) throw error

    await mutate()
  }

  const updateAgenda = async (id: string, updatedAgenda: Partial<Agenda>) => {
    const supabase = createClient()

    const updateData: any = {}
    if (updatedAgenda.title) updateData.title = updatedAgenda.title
    if (updatedAgenda.description) updateData.description = updatedAgenda.description
    if (updatedAgenda.date) updateData.date = updatedAgenda.date
    if (updatedAgenda.time) updateData.time = updatedAgenda.time
    if (updatedAgenda.participants) updateData.participants = updatedAgenda.participants
    if (updatedAgenda.notified24h !== undefined) updateData.notified_24h = updatedAgenda.notified24h
    if (updatedAgenda.notifiedHours !== undefined) updateData.notified_hours = updatedAgenda.notifiedHours

    const { error } = await supabase.from("agendas").update(updateData).eq("id", id)

    if (error) throw error

    await mutate()
  }

  const deleteAgenda = async (id: string) => {
    const supabase = createClient()

    const { error } = await supabase.from("agendas").delete().eq("id", id)

    if (error) throw error

    await mutate()
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
      if (!agenda.participants.includes(userId)) return

      const agendaDateTime = new Date(`${agenda.date}T${agenda.time}`)
      const timeDiff = agendaDateTime.getTime() - now.getTime()
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      if (!agenda.notified24h && hoursDiff <= 24 && hoursDiff > 23) {
        showNotification(agenda, "24 horas")
        updateAgenda(agenda.id, { notified24h: true })
      }

      if (!agenda.notifiedHours && hoursDiff <= 1 && hoursDiff > 0) {
        showNotification(agenda, "1 hora")
        updateAgenda(agenda.id, { notifiedHours: true })
      }
    })
  }, [agendas, user])

  const showNotification = (agenda: Agenda, timeframe: string) => {
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

    if (typeof window !== "undefined") {
      const event = new CustomEvent("agenda-notification", {
        detail: { agenda, timeframe },
      })
      window.dispatchEvent(event)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      checkNotifications()
    }, 60000)

    return () => clearInterval(interval)
  }, [checkNotifications])

  useEffect(() => {
    const checkAgendas = () => {
      const now = new Date()
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const in1Hour = new Date(now.getTime() + 60 * 60 * 1000)

      agendas.forEach((agenda) => {
        const agendaTime = new Date(`${agenda.date}T${agenda.time}`)

        if (agendaTime > now && agendaTime <= in24Hours && !agenda.notified24h) {
          addNotification({
            type: "info",
            title: "Reunião em 24 horas",
            message: `${agenda.title} está agendada para amanhã às ${agenda.time}`,
          })

          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("agenda-notification", {
                detail: { agenda, timeframe: "em 24 horas" },
              }),
            )
          }
        }

        if (agendaTime > now && agendaTime <= in1Hour && !agenda.notifiedHours) {
          addNotification({
            type: "warning",
            title: "Reunião em 1 hora",
            message: `${agenda.title} começa em 1 hora (${agenda.time})`,
          })

          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("agenda-notification", {
                detail: { agenda, timeframe: "em 1 hora" },
              }),
            )
          }
        }
      })
    }

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
        isLoading,
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
