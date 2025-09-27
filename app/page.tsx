"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/login-form"
import { DashboardLayout } from "@/components/dashboard-layout"
import { OverviewTab } from "@/components/tabs/overview-tab"
import { QuadroTab } from "@/components/tabs/quadro-tab"
import { CapacitacaoTab } from "@/components/tabs/capacitacao-tab"
import { TreinadosTab } from "@/components/tabs/treinados-tab"
import { DesligamentosTab } from "@/components/tabs/desligamentos-tab"

interface Filters {
  dateRange?: { start: string; end: string }
  turno?: string
  carteira?: string
  status?: string
  motivo?: string
  secao?: string
}

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [filters, setFilters] = useState<Filters>({})
  const [appliedFilters, setAppliedFilters] = useState<Filters>({})

  if (!isAuthenticated) {
    return <LoginForm />
  }

  const handleApplyFilters = () => {
    console.log("[v0] Aplicando filtros:", filters)
    setAppliedFilters({ ...filters })
  }

  const handleClearFilters = () => {
    console.log("[v0] Limpando filtros")
    setFilters({})
    setAppliedFilters({})
  }

  const handleFiltersChange = (newFilters: Filters) => {
    console.log("[v0] Alterando filtros:", newFilters)
    setFilters(newFilters)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab filters={appliedFilters} />
      case "quadro":
        return <QuadroTab filters={appliedFilters} />
      case "capacitacao":
        return <CapacitacaoTab filters={appliedFilters} />
      case "treinados":
        return <TreinadosTab filters={appliedFilters} />
      case "desligamentos":
        return <DesligamentosTab filters={appliedFilters} />
      default:
        return <OverviewTab filters={appliedFilters} />
    }
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onApplyFilters={handleApplyFilters}
      onClearFilters={handleClearFilters}
    >
      {renderTabContent()}
    </DashboardLayout>
  )
}
