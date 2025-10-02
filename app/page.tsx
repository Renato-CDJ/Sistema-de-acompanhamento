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
import { CarteirasTab } from "@/components/tabs/carteiras-tab"
import { OperadoresTab } from "@/components/tabs/operadores-tab"
import { RelatorioMonitoriasTab } from "@/components/tabs/relatorio-monitorias-tab"
import { ApuracaoTIATab } from "@/components/tabs/apuracao-tia-tab"

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
    setAppliedFilters({ ...filters })
  }

  const handleClearFilters = () => {
    setFilters({})
    setAppliedFilters({})
  }

  const handleFiltersChange = (newFilters: Filters) => {
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
      case "carteiras":
        return <CarteirasTab filters={appliedFilters} />
      case "operadores":
        return <OperadoresTab filters={appliedFilters} />
      case "relatorio-monitorias":
        return <RelatorioMonitoriasTab filters={appliedFilters} />
      case "apuracao-tia":
        return <ApuracaoTIATab filters={appliedFilters} />
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
