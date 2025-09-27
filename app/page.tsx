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

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  if (!isAuthenticated) {
    return <LoginForm />
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />
      case "quadro":
        return <QuadroTab />
      case "capacitacao":
        return <CapacitacaoTab />
      case "treinados":
        return <TreinadosTab />
      case "desligamentos":
        return <DesligamentosTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </DashboardLayout>
  )
}
