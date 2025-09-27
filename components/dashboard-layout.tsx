"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Building2,
  BarChart3,
  Users,
  GraduationCap,
  UserCheck,
  UserX,
  LogOut,
  Menu,
  X,
  Filter,
  Check,
  FilterX,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useData } from "@/contexts/data-context"

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  filters?: {
    dateRange?: { start: string; end: string }
    turno?: string
    carteira?: string
    status?: string
    motivo?: string
    secao?: string
  }
  onFiltersChange?: (filters: any) => void
  onApplyFilters?: () => void
  onClearFilters?: () => void
}

const tabs = [
  { id: "overview", label: "Visão Geral", icon: BarChart3 },
  { id: "quadro", label: "Quadro", icon: Users },
  { id: "capacitacao", label: "Capacitação", icon: GraduationCap },
  { id: "treinados", label: "Treinados", icon: UserCheck },
  { id: "desligamentos", label: "Desligamentos", icon: UserX },
]

export function DashboardLayout({
  children,
  activeTab,
  onTabChange,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const { carteiras } = useData()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const isAdmin = hasPermission(user, "edit")

  const handleFilterChange = (key: string, value: string) => {
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        [key]: value,
      })
    }
  }

  const handleDateRangeChange = (type: "start" | "end", value: string) => {
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        dateRange: {
          ...filters?.dateRange,
          [type]: value,
        },
      })
    }
  }

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters()
    }
    setShowFilters(false)
  }

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters()
    }
    setShowFilters(false)
  }

  const renderFilters = () => {
    const commonFilters = (
      <>
        <div>
          <Label htmlFor="filter-date-start">Data Início</Label>
          <Input
            id="filter-date-start"
            type="date"
            value={filters?.dateRange?.start || ""}
            onChange={(e) => handleDateRangeChange("start", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="filter-date-end">Data Fim</Label>
          <Input
            id="filter-date-end"
            type="date"
            value={filters?.dateRange?.end || ""}
            onChange={(e) => handleDateRangeChange("end", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="filter-turno">Turno</Label>
          <Select
            value={filters?.turno || "Todos os turnos"}
            onValueChange={(value) => handleFilterChange("turno", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os turnos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos os turnos">Todos os turnos</SelectItem>
              <SelectItem value="Manhã">Manhã</SelectItem>
              <SelectItem value="Tarde">Tarde</SelectItem>
              <SelectItem value="Integral">Integral</SelectItem>
              <SelectItem value="Geral">Geral</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="filter-carteira">Carteira</Label>
          <Select
            value={filters?.carteira || "Todas as carteiras"}
            onValueChange={(value) => handleFilterChange("carteira", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as carteiras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas as carteiras">Todas as carteiras</SelectItem>
              {carteiras.map((carteira) => (
                <SelectItem key={carteira.name} value={carteira.name}>
                  {carteira.name}
                </SelectItem>
              ))}
              <SelectItem value="CAIXA">CAIXA</SelectItem>
              <SelectItem value="BTG">BTG</SelectItem>
              <SelectItem value="BMG">BMG</SelectItem>
              <SelectItem value="Carrefour">Carrefour</SelectItem>
              <SelectItem value="WILLBANK">WILLBANK</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </>
    )

    const specificFilters = () => {
      const secaoFilter = (
        <div>
          <Label htmlFor="filter-secao">Seção</Label>
          <Select
            value={filters?.secao || "Todas as seções"}
            onValueChange={(value) => handleFilterChange("secao", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as seções" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas as seções">Todas as seções</SelectItem>
              <SelectItem value="Caixa">Caixa</SelectItem>
              <SelectItem value="Cobrança">Cobrança</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )

      switch (activeTab) {
        case "capacitacao":
        case "treinados":
          return (
            <>
              <div>
                <Label htmlFor="filter-status">Status</Label>
                <Select
                  value={filters?.status || "Todos os status"}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos os status">Todos os status</SelectItem>
                    <SelectItem value="Aplicado">Aplicado</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {secaoFilter}
            </>
          )
        case "desligamentos":
          return (
            <>
              <div>
                <Label htmlFor="filter-motivo">Motivo</Label>
                <Select
                  value={filters?.motivo || "Todos os motivos"}
                  onValueChange={(value) => handleFilterChange("motivo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os motivos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos os motivos">Todos os motivos</SelectItem>
                    <SelectItem value="Pedido de Demissão">Pedido de Demissão</SelectItem>
                    <SelectItem value="Justa Causa">Justa Causa</SelectItem>
                    <SelectItem value="Término de Contrato">Término de Contrato</SelectItem>
                    <SelectItem value="Demissão sem Justa Causa">Demissão sem Justa Causa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {secaoFilter}
            </>
          )
        case "quadro":
        case "overview":
          return secaoFilter
        default:
          return secaoFilter
      }
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {commonFilters}
        {specificFilters()}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-balance">Sistema</h1>
                  <p className="text-xs text-muted-foreground">Acompanhamento</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      onTabChange(tab.id)
                      setSidebarOpen(false)
                    }}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">{user?.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{isAdmin ? "Administrador" : "Usuário"}</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-semibold">{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                <Filter className="h-4 w-4" />
                {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
              </Button>
              {isAdmin && (
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Modo Administrador</div>
                </div>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              {renderFilters()}
              <div className="flex gap-2 mt-4">
                <Button onClick={handleApplyFilters} size="sm" className="gap-2">
                  <Check className="h-4 w-4" />
                  Confirmar Filtro
                </Button>
                <Button onClick={handleClearFilters} variant="outline" size="sm" className="gap-2 bg-transparent">
                  <FilterX className="h-4 w-4" />
                  Remover Filtro
                </Button>
              </div>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
