"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { OverviewTab } from "@/components/tabs/overview-tab"
import { QuadroTab } from "@/components/tabs/quadro-tab"
import { CapacitacaoTab } from "@/components/tabs/capacitacao-tab"
import { TreinadosTab } from "@/components/tabs/treinados-tab"
import { DesligamentosTab } from "@/components/tabs/desligamentos-tab"
import { Toaster } from "@/components/ui/toaster"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [filters, setFilters] = useState({
    dateRange: { start: "", end: "" },
    turno: "",
    carteira: "",
    status: "",
    motivo: "",
    secao: "",
  })
  const [appliedFilters, setAppliedFilters] = useState({})

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    setAppliedFilters(filters)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      dateRange: { start: "", end: "" },
      turno: "",
      carteira: "",
      status: "",
      motivo: "",
      secao: "",
    }
    setFilters(clearedFilters)
    setAppliedFilters(clearedFilters)
  }

  const renderActiveTab = () => {
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
    <>
      <DashboardLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      >
        {renderActiveTab()}
      </DashboardLayout>
      <Toaster />
    </>
  )
}
