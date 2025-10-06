"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

interface DashboardPreferences {
  visibleWidgets: {
    funcionarios: boolean
    treinamento: boolean
    desligamentos: boolean
    taxaConclusao: boolean
    ativos: boolean
    ferias: boolean
    afastamento: boolean
    desaparecidos: boolean
    inss: boolean
    distribuicao: boolean
    evolucao: boolean
    desempenhoCarteira: boolean
    alertas: boolean
    monitorias: boolean
    tia: boolean
  }
  compactMode: boolean
}

interface DashboardPreferencesContextType {
  preferences: DashboardPreferences
  updatePreferences: (prefs: Partial<DashboardPreferences>) => void
  toggleWidget: (widget: keyof DashboardPreferences["visibleWidgets"]) => void
  toggleCompactMode: () => void
  resetToDefault: () => void
}

const defaultPreferences: DashboardPreferences = {
  visibleWidgets: {
    funcionarios: true,
    treinamento: true,
    desligamentos: true,
    taxaConclusao: true,
    ativos: true,
    ferias: true,
    afastamento: true,
    desaparecidos: true,
    inss: true,
    distribuicao: true,
    evolucao: true,
    desempenhoCarteira: true,
    alertas: true,
    monitorias: true,
    tia: true,
  },
  compactMode: false,
}

const DashboardPreferencesContext = createContext<DashboardPreferencesContextType | undefined>(undefined)

export function DashboardPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<DashboardPreferences>(defaultPreferences)

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("dashboardPreferences")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setPreferences({ ...defaultPreferences, ...parsed })
      } catch (e) {
        console.error("Failed to parse dashboard preferences:", e)
      }
    }
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("dashboardPreferences", JSON.stringify(preferences))
  }, [preferences])

  const updatePreferences = useCallback((prefs: Partial<DashboardPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...prefs }))
  }, [])

  const toggleWidget = useCallback((widget: keyof DashboardPreferences["visibleWidgets"]) => {
    setPreferences((prev) => ({
      ...prev,
      visibleWidgets: {
        ...prev.visibleWidgets,
        [widget]: !prev.visibleWidgets[widget],
      },
    }))
  }, [])

  const toggleCompactMode = useCallback(() => {
    setPreferences((prev) => ({ ...prev, compactMode: !prev.compactMode }))
  }, [])

  const resetToDefault = useCallback(() => {
    setPreferences(defaultPreferences)
  }, [])

  return (
    <DashboardPreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        toggleWidget,
        toggleCompactMode,
        resetToDefault,
      }}
    >
      {children}
    </DashboardPreferencesContext.Provider>
  )
}

export function useDashboardPreferences() {
  const context = useContext(DashboardPreferencesContext)
  if (context === undefined) {
    throw new Error("useDashboardPreferences must be used within a DashboardPreferencesProvider")
  }
  return context
}
