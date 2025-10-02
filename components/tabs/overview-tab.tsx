"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import {
  TrendingUp,
  Users,
  GraduationCap,
  UserX,
  Eye,
  EyeOff,
  Settings,
  ChevronDown,
  Briefcase,
  ZoomIn,
} from "lucide-react"
import { useData } from "@/contexts/data-context"

interface OverviewTabProps {
  filters?: {
    dateRange?: { start: string; end: string }
    turno?: string
    carteira?: string
    status?: string
    motivo?: string
    secao?: string
  }
}

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

export function OverviewTab({ filters }: OverviewTabProps) {
  const [selectedSection, setSelectedSection] = useState<"caixa" | "cob">("caixa")
  const [showCharts, setShowCharts] = useState(true)
  const [carteiraFilter, setCarteiraFilter] = useState<string>("geral")
  const [showDesempenhoCarteira, setShowDesempenhoCarteira] = useState(true)
  const [zoomedCarteira, setZoomedCarteira] = useState<any>(null)
  const [visibleStats, setVisibleStats] = useState({
    funcionarios: true,
    treinamento: true,
    desligamentos: true,
    taxaConclusao: true,
    ativos: true,
    ferias: true,
    afastamento: true,
    desaparecidos: true,
    inss: true,
  })
  const [showStatsConfig, setShowStatsConfig] = useState(false)
  const [monitoringFilterMonth, setMonitoringFilterMonth] = useState<string>("current")
  const [tiaFilterMonth, setTiaFilterMonth] = useState<string>("current")

  const {
    getCapacitacaoStats,
    getDesligamentosStats,
    getTreinadosStats,
    getMonitoringStats,
    getTIAStats,
    dadosDiarios,
    estatisticasCarteiras,
    carteiras,
    treinamentos,
    desligamentos,
  } = useData()

  const capacitacaoStats = getCapacitacaoStats()
  const desligamentosStats = getDesligamentosStats()
  const treinadosStats = getTreinadosStats()

  const filteredDadosDiarios = dadosDiarios.filter((dados) => {
    if (selectedSection === "caixa" && dados.secao !== "Caixa") {
      return false
    }

    // For COB section, only show Cobrança data
    if (selectedSection === "cob" && dados.secao !== "Cobrança") {
      return false
    }

    if (!filters) return true

    const matchDateRange =
      !filters.dateRange?.start ||
      !filters.dateRange?.end ||
      (dados.date >= filters.dateRange.start && dados.date <= filters.dateRange.end)

    const matchTurno =
      !filters.turno || filters.turno === "Todos os turnos" || dados.turno.toLowerCase() === filters.turno.toLowerCase()

    const matchSecao =
      !filters.secao || filters.secao === "Todas as seções" || dados.secao.toLowerCase() === filters.secao.toLowerCase()

    return matchDateRange && matchTurno && matchSecao
  })

  const filteredTreinamentos = treinamentos.filter((treinamento) => {
    if (!filters) return true

    const matchDateRange =
      !filters.dateRange?.start ||
      !filters.dateRange?.end ||
      (treinamento.data >= filters.dateRange.start && treinamento.data <= filters.dateRange.end)

    const matchTurno =
      !filters.turno ||
      filters.turno === "Todos os turnos" ||
      treinamento.turno.toLowerCase() === filters.turno.toLowerCase()

    const matchCarteira =
      !filters.carteira || filters.carteira === "Todas as carteiras" || treinamento.carteira === filters.carteira

    const matchStatus = !filters.status || filters.status === "Todos os status" || treinamento.status === filters.status

    return matchDateRange && matchTurno && matchCarteira && matchStatus
  })

  const caixaTreinamentos = filteredTreinamentos.filter((treinamento) => treinamento.carteira === "Caixa")

  const cobTreinamentos = filteredTreinamentos.filter((treinamento) => treinamento.carteira !== "Caixa")

  const filteredDesligamentos = desligamentos.filter((desligamento) => {
    if (!filters) return true

    const matchDateRange =
      !filters.dateRange?.start ||
      !filters.dateRange?.end ||
      (desligamento.data >= filters.dateRange.start && desligamento.data <= filters.dateRange?.end)

    const matchTurno =
      !filters.turno ||
      filters.turno === "Todos os turnos" ||
      desligamento.turno.toLowerCase() === filters.turno.toLowerCase()

    const matchCarteira =
      !filters.carteira || filters.carteira === "Todas as carteiras" || desligamento.carteira === filters.carteira

    const matchMotivo =
      !filters.motivo || filters.motivo === "Todos os motivos" || desligamento.motivo === filters.motivo

    return matchDateRange && matchTurno && matchCarteira && matchMotivo
  })

  const filteredCarteiraStats = estatisticasCarteiras.filter((stat) => {
    if (!filters) return true

    const matchDateRange =
      !filters.dateRange?.start ||
      !filters.dateRange?.end ||
      (stat.date >= filters.dateRange.start && stat.date <= filters.dateRange.end)

    const matchTurno =
      !filters.turno || filters.turno === "Todos os turnos" || stat.turno.toLowerCase() === filters.turno.toLowerCase()

    const matchCarteira =
      !filters.carteira || filters.carteira === "Todas as carteiras" || stat.carteira === filters.carteira

    return matchDateRange && matchTurno && matchCarteira
  })

  const totalFuncionarios = filteredDadosDiarios.reduce((sum, dados) => sum + dados.total, 0) || 0
  const totalAtivos = filteredDadosDiarios.reduce((sum, dados) => sum + dados.ativos, 0) || 0
  const totalFerias = filteredDadosDiarios.reduce((sum, dados) => sum + dados.ferias, 0) || 0
  const totalAfastamento = filteredDadosDiarios.reduce((sum, dados) => sum + dados.afastamento, 0) || 0
  const totalDesaparecidos = filteredDadosDiarios.reduce((sum, dados) => sum + dados.desaparecidos, 0) || 0
  const totalINSS = filteredDadosDiarios.reduce((sum, dados) => sum + dados.inss, 0) || 0

  const caixaCapacitacaoStats = {
    totalTreinamentos: caixaTreinamentos.reduce((sum, t) => sum + t.quantidade, 0),
    aplicados: caixaTreinamentos.filter((t) => t.status === "Aplicado").reduce((sum, t) => sum + t.quantidade, 0),
    pendentes: caixaTreinamentos.filter((t) => t.status === "Pendente").reduce((sum, t) => sum + t.quantidade, 0),
    taxaConclusao: 0,
  }
  caixaCapacitacaoStats.taxaConclusao =
    caixaCapacitacaoStats.totalTreinamentos > 0
      ? (caixaCapacitacaoStats.aplicados / caixaCapacitacaoStats.totalTreinamentos) * 100
      : 0

  const cobCapacitacaoStats = {
    totalTreinamentos: cobTreinamentos.reduce((sum, t) => sum + t.quantidade, 0),
    aplicados: cobTreinamentos.filter((t) => t.status === "Aplicado").reduce((sum, t) => sum + t.quantidade, 0),
    pendentes: cobTreinamentos.filter((t) => t.status === "Pendente").reduce((sum, t) => sum + t.quantidade, 0),
    taxaConclusao: 0,
  }
  cobCapacitacaoStats.taxaConclusao =
    cobCapacitacaoStats.totalTreinamentos > 0
      ? (cobCapacitacaoStats.aplicados / cobCapacitacaoStats.totalTreinamentos) * 100
      : 0

  const filteredDesligamentosStats = {
    totalDesligamentos: filteredDesligamentos.length,
    comAvisoPrevia: filteredDesligamentos.filter((d) => d.avisoPrevia === "Com").length,
    semAvisoPrevia: filteredDesligamentos.filter((d) => d.avisoPrevia === "Sem").length,
    veioAgencia: filteredDesligamentos.filter((d) => d.veioAgencia === "Sim").length,
  }

  const carteiraStatsAggregated = filteredCarteiraStats.reduce(
    (acc, stat) => {
      if (!acc[stat.carteira]) {
        acc[stat.carteira] = { total: 0, presentes: 0, faltas: 0 }
      }
      acc[stat.carteira].total += stat.total
      acc[stat.carteira].presentes += stat.presentes
      acc[stat.carteira].faltas += stat.faltas
      return acc
    },
    {} as Record<string, { total: number; presentes: number; faltas: number }>,
  )

  const statsData = [
    {
      title: "Total de Funcionários",
      value: totalFuncionarios > 0 ? totalFuncionarios.toString() : "0",
      change: "+0%",
      icon: Users,
      color: "text-blue-600",
      visible: visibleStats.funcionarios,
      key: "funcionarios",
    },
    {
      title: "Em Treinamento",
      value: caixaCapacitacaoStats.pendentes.toString(),
      change: "+0%",
      icon: GraduationCap,
      color: "text-green-600",
      visible: visibleStats.treinamento,
      key: "treinamento",
    },
    {
      title: "Desligamentos",
      value: filteredDesligamentosStats.totalDesligamentos.toString(),
      change: "+0%",
      icon: UserX,
      color: "text-red-600",
      visible: visibleStats.desligamentos,
      key: "desligamentos",
    },
    {
      title: "Taxa de Conclusão",
      value: `${caixaCapacitacaoStats.taxaConclusao.toFixed(1)}%`,
      change: "+0%",
      icon: TrendingUp,
      color: "text-primary",
      visible: visibleStats.taxaConclusao,
      key: "taxaConclusao",
    },
  ].filter((stat) => stat.visible)

  const pieData = [
    { name: "Ativos", value: totalAtivos, color: "#22c55e", visible: visibleStats.ativos },
    { name: "Férias", value: totalFerias, color: "#3b82f6", visible: visibleStats.ferias },
    { name: "Afastamento", value: totalAfastamento, color: "#ef4444", visible: visibleStats.afastamento },
    { name: "Desaparecidos", value: totalDesaparecidos, color: "#f59e0b", visible: visibleStats.desaparecidos },
    { name: "INSS", value: totalINSS, color: "#8b5cf6", visible: visibleStats.inss },
  ].filter((item) => item.value > 0 && item.visible)

  const barData = filteredDadosDiarios.slice(-7).map((dados) => {
    const date = new Date(dados.date)
    return {
      month: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      funcionarios: dados.total,
      treinamentos: caixaCapacitacaoStats.aplicados, // Replaced filteredCapacitacaoStats with caixaCapacitacaoStats
      desligamentos: filteredDesligamentosStats.totalDesligamentos,
    }
  })

  const handleStatsToggle = (key: string, value: boolean) => {
    setVisibleStats((prev) => ({ ...prev, [key]: value }))
  }

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monitoringStats =
    monitoringFilterMonth === "all"
      ? getMonitoringStats()
      : monitoringFilterMonth === "current"
        ? getMonitoringStats(currentYear, currentMonth)
        : getMonitoringStats(currentYear, Number.parseInt(monitoringFilterMonth))

  const tiaStats =
    tiaFilterMonth === "all"
      ? getTIAStats()
      : tiaFilterMonth === "current"
        ? getTIAStats(currentYear, currentMonth)
        : getTIAStats(currentYear, Number.parseInt(tiaFilterMonth))

  const totalCarteiraStats = Object.values(carteiraStatsAggregated).reduce(
    (acc, stats) => ({
      total: acc.total + stats.total,
      presentes: acc.presentes + stats.presentes,
      faltas: acc.faltas + stats.faltas,
    }),
    { total: 0, presentes: 0, faltas: 0 },
  )

  const filteredCarteiraStatsDisplay =
    carteiraFilter === "geral"
      ? null
      : Object.entries(carteiraStatsAggregated).filter(([carteira]) => carteira === carteiraFilter)

  const uniqueCarteiras = Array.from(new Set(filteredCarteiraStats.map((stat) => stat.carteira)))

  const caixaCarteiras = carteiras.filter((carteira) => carteira.name === "Caixa")
  const cobCarteiras = carteiras.filter((carteira) => carteira.name !== "Caixa")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select value={selectedSection} onValueChange={(value: "caixa" | "cob") => setSelectedSection(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
              <ChevronDown className="h-4 w-4 opacity-50" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="caixa">CAIXA</SelectItem>
              <SelectItem value="cob">COB</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {selectedSection === "caixa" && (
            <Button variant="outline" onClick={() => setShowStatsConfig(!showStatsConfig)} className="gap-2">
              <Settings className="h-4 w-4" />
              Configurar Estatísticas
            </Button>
          )}
          {selectedSection === "cob" && (
            <Button
              variant="outline"
              onClick={() => setShowDesempenhoCarteira(!showDesempenhoCarteira)}
              className="gap-2"
            >
              {showDesempenhoCarteira ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showDesempenhoCarteira ? "Ocultar Desempenho" : "Mostrar Desempenho"}
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowCharts(!showCharts)} className="gap-2">
            {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
          </Button>
        </div>
      </div>

      {selectedSection === "caixa" ? (
        // CAIXA Section - Original overview content
        <>
          {showStatsConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Configurar Visibilidade das Estatísticas</CardTitle>
                <CardDescription>Escolha quais estatísticas deseja exibir na visão geral</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="funcionarios"
                      checked={visibleStats.funcionarios}
                      onCheckedChange={(value) => handleStatsToggle("funcionarios", value)}
                    />
                    <Label htmlFor="funcionarios">Total de Funcionários</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="treinamento"
                      checked={visibleStats.treinamento}
                      onCheckedChange={(value) => handleStatsToggle("treinamento", value)}
                    />
                    <Label htmlFor="treinamento">Em Treinamento</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="desligamentos"
                      checked={visibleStats.desligamentos}
                      onCheckedChange={(value) => handleStatsToggle("desligamentos", value)}
                    />
                    <Label htmlFor="desligamentos">Desligamentos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="taxaConclusao"
                      checked={visibleStats.taxaConclusao}
                      onCheckedChange={(value) => handleStatsToggle("taxaConclusao", value)}
                    />
                    <Label htmlFor="taxaConclusao">Taxa de Conclusão</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ativos"
                      checked={visibleStats.ativos}
                      onCheckedChange={(value) => handleStatsToggle("ativos", value)}
                    />
                    <Label htmlFor="ativos">Ativos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ferias"
                      checked={visibleStats.ferias}
                      onCheckedChange={(value) => handleStatsToggle("ferias", value)}
                    />
                    <Label htmlFor="ferias">Férias</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="afastamento"
                      checked={visibleStats.afastamento}
                      onCheckedChange={(value) => handleStatsToggle("afastamento", value)}
                    />
                    <Label htmlFor="afastamento">Afastamento</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="desaparecidos"
                      checked={visibleStats.desaparecidos}
                      onCheckedChange={(value) => handleStatsToggle("desaparecidos", value)}
                    />
                    <Label htmlFor="desaparecidos">Desaparecidos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="inss"
                      checked={visibleStats.inss}
                      onCheckedChange={(value) => handleStatsToggle("inss", value)}
                    />
                    <Label htmlFor="inss">INSS</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className={stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}>
                        {stat.change}
                      </span>{" "}
                      em relação ao mês anterior
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {monitoringStats.total > 0 && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Consolidado Mensal - Monitorias</CardTitle>
                    <CardDescription>
                      {monitoringFilterMonth === "all"
                        ? "Resumo de todas as monitorias"
                        : monitoringFilterMonth === "current"
                          ? `Resumo de ${MONTHS[currentMonth]} ${currentYear}`
                          : `Resumo de ${MONTHS[Number.parseInt(monitoringFilterMonth)]} ${currentYear}`}
                    </CardDescription>
                  </div>
                  <div className="w-full sm:w-48">
                    <Select value={monitoringFilterMonth} onValueChange={setMonitoringFilterMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Mês Atual</SelectItem>
                        <SelectItem value="all">Todos os Meses</SelectItem>
                        {MONTHS.map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-muted-foreground mb-1">Total Conforme</p>
                    <p className="text-2xl font-bold text-green-600">{monitoringStats.conforme}</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-muted-foreground mb-1">Total Inconforme</p>
                    <p className="text-2xl font-bold text-red-600">{monitoringStats.inconforme}</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Total Geral</p>
                    <p className="text-2xl font-bold text-primary">{monitoringStats.total}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-muted-foreground mb-1">Média de Conformidade</p>
                    <p className="text-2xl font-bold text-blue-600">{monitoringStats.mediaConforme}%</p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-sm text-muted-foreground mb-1">Média de Inconformidade</p>
                    <p className="text-2xl font-bold text-orange-600">{monitoringStats.mediaInconforme}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {tiaStats.totalEntries > 0 && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Consolidado - Apuração TIA</CardTitle>
                    <CardDescription>
                      {tiaFilterMonth === "all"
                        ? "Resumo de todas as apurações TIA"
                        : tiaFilterMonth === "current"
                          ? `Resumo de ${MONTHS[currentMonth]} ${currentYear}`
                          : `Resumo de ${MONTHS[Number.parseInt(tiaFilterMonth)]} ${currentYear}`}
                    </CardDescription>
                  </div>
                  <div className="w-full sm:w-48">
                    <Select value={tiaFilterMonth} onValueChange={setTiaFilterMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Mês Atual</SelectItem>
                        <SelectItem value="all">Todos os Meses</SelectItem>
                        {MONTHS.map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-muted-foreground mb-1">Total de Registros</p>
                    <p className="text-2xl font-bold text-purple-600">{tiaStats.totalEntries}</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-muted-foreground mb-1">Total Analisados (Inconformes)</p>
                    <p className="text-2xl font-bold text-red-600">{tiaStats.totalAnalisados}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-muted-foreground mb-1">Total Quantidade</p>
                    <p className="text-2xl font-bold text-blue-600">{tiaStats.totalQuantidade}</p>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-muted-foreground mb-1">Média Percentual</p>
                    <p className="text-2xl font-bold text-amber-600">{tiaStats.mediaPercent}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleStats.ativos && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{totalAtivos}</div>
                </CardContent>
              </Card>
            )}
            {visibleStats.ferias && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Férias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{totalFerias}</div>
                </CardContent>
              </Card>
            )}
            {visibleStats.afastamento && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Afastamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{totalAfastamento}</div>
                </CardContent>
              </Card>
            )}
            {visibleStats.desaparecidos && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Desaparecidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{totalDesaparecidos}</div>
                </CardContent>
              </Card>
            )}
            {visibleStats.inss && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">INSS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{totalINSS}</div>
                </CardContent>
              </Card>
            )}
          </div>

          {showCharts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pieData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Funcionários</CardTitle>
                    <CardDescription>Status atual dos funcionários</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {barData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução Mensal</CardTitle>
                    <CardDescription>Funcionários, treinamentos e desligamentos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="funcionarios" fill="#f97316" name="Funcionários" />
                        <Bar dataKey="treinamentos" fill="#22c55e" name="Treinamentos" />
                        <Bar dataKey="desligamentos" fill="#ef4444" name="Desligamentos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {caixaCapacitacaoStats.totalTreinamentos > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Treinamentos Concluídos</CardTitle>
                  <CardDescription>Carteira Caixa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Aplicados</span>
                      <span className="text-2xl font-bold text-primary">{caixaCapacitacaoStats.aplicados}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total</span>
                      <span className="text-sm text-muted-foreground">{caixaCapacitacaoStats.totalTreinamentos}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${caixaCapacitacaoStats.taxaConclusao}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {caixaCapacitacaoStats.pendentes > 0 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {caixaCapacitacaoStats.pendentes} treinamentos pendentes
                      </p>
                    </div>
                  )}
                  {filteredDesligamentosStats.totalDesligamentos > 5 && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-800 dark:text-red-200">Alto número de desligamentos este mês</p>
                    </div>
                  )}
                  {totalDesaparecidos > 0 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        {totalDesaparecidos} funcionários desaparecidos
                      </p>
                    </div>
                  )}
                  {caixaCapacitacaoStats.totalTreinamentos === 0 &&
                    filteredDesligamentosStats.totalDesligamentos === 0 &&
                    filteredDadosDiarios.length === 0 && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Nenhum dado foi adicionado ainda. Comece adicionando dados nas outras abas.
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalFuncionarios}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalAtivos}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Férias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalFerias}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Afastamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{totalAfastamento}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Desaparecidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{totalDesaparecidos}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">INSS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{totalINSS}</div>
              </CardContent>
            </Card>
          </div>

          {showCharts && pieData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Distribuição - Cobrança</CardTitle>
                <CardDescription>Status atual dos funcionários da Cobrança</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {Object.keys(carteiraStatsAggregated).length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Estatísticas por Carteira</CardTitle>
                    <CardDescription>Resumo do desempenho de cada carteira na Cobrança</CardDescription>
                  </div>
                  <div className="w-full sm:w-48">
                    <Select value={carteiraFilter} onValueChange={setCarteiraFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar carteira" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geral">Geral (Totais)</SelectItem>
                        {uniqueCarteiras.map((carteira) => (
                          <SelectItem key={carteira} value={carteira}>
                            {carteira}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {carteiraFilter === "geral" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-2 border-primary/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Geral</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{totalCarteiraStats.total}</div>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-green-200 dark:border-green-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Presentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">{totalCarteiraStats.presentes}</div>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-red-200 dark:border-red-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Faltas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-red-600">{totalCarteiraStats.faltas}</div>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-blue-200 dark:border-blue-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">ABS Geral (%)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                          {totalCarteiraStats.total > 0
                            ? ((totalCarteiraStats.faltas / totalCarteiraStats.total) * 100).toFixed(1)
                            : "0"}
                          %
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCarteiraStatsDisplay?.map(([carteira, stats]) => {
                      const absPercentage = stats.total > 0 ? ((stats.faltas / stats.total) * 100).toFixed(1) : "0"
                      return (
                        <Card key={carteira} className="border-2">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-5 w-5 text-primary" />
                              <CardTitle className="text-lg">{carteira}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
                              <span className="text-sm font-medium text-muted-foreground">Total</span>
                              <span className="text-xl font-bold">{stats.total}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                              <span className="text-sm font-medium text-green-700 dark:text-green-300">Presentes</span>
                              <span className="text-xl font-bold text-green-600">{stats.presentes}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                              <span className="text-sm font-medium text-red-700 dark:text-red-300">Faltas</span>
                              <span className="text-xl font-bold text-red-600">{stats.faltas}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-primary/10 rounded-lg border border-primary/20">
                              <span className="text-sm font-medium text-primary">ABS (%)</span>
                              <span className="text-xl font-bold text-primary">{absPercentage}%</span>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {showDesempenhoCarteira && cobCarteiras.length > 0 && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>Desempenho por Carteira</CardTitle>
                </div>
                <CardDescription>Taxa de desempenho das carteiras de Cobrança</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {cobCarteiras.map((carteira) => {
                    const performanceColor =
                      carteira.taxa >= 80
                        ? "text-green-600 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                        : carteira.taxa >= 60
                          ? "text-blue-600 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                          : carteira.taxa >= 40
                            ? "text-amber-600 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20"
                            : "text-red-600 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"

                    return (
                      <Card key={carteira.name} className={`border-2 ${performanceColor} relative`}>
                        <CardHeader className="pb-2 px-3 pt-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              <CardTitle className="text-xs truncate">{carteira.name}</CardTitle>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setZoomedCarteira(carteira)}
                            >
                              <ZoomIn className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium">Taxa</span>
                              <span className="text-xl font-bold">{carteira.taxa.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  carteira.taxa >= 80
                                    ? "bg-green-600"
                                    : carteira.taxa >= 60
                                      ? "bg-blue-600"
                                      : carteira.taxa >= 40
                                        ? "bg-amber-600"
                                        : "bg-red-600"
                                }`}
                                style={{ width: `${carteira.taxa}%` }}
                              ></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {filteredDadosDiarios.length === 0 && Object.keys(carteiraStatsAggregated).length === 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <p>Nenhum dado de Cobrança encontrado.</p>
                  <p className="text-sm mt-2">
                    Adicione dados na aba "Quadro" selecionando a opção "Cobrança" para visualizar as estatísticas aqui.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cobCapacitacaoStats.totalTreinamentos > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Treinamentos Concluídos</CardTitle>
                  <CardDescription>Carteiras de Cobrança</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Aplicados</span>
                      <span className="text-2xl font-bold text-primary">{cobCapacitacaoStats.aplicados}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Pendentes</span>
                      <span className="text-sm text-muted-foreground">{cobCapacitacaoStats.pendentes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total</span>
                      <span className="text-sm text-muted-foreground">{cobCapacitacaoStats.totalTreinamentos}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${cobCapacitacaoStats.taxaConclusao}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alertas - Cobrança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cobCapacitacaoStats.pendentes > 0 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {cobCapacitacaoStats.pendentes} treinamentos pendentes
                      </p>
                    </div>
                  )}
                  {totalDesaparecidos > 0 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        {totalDesaparecidos} funcionários desaparecidos
                      </p>
                    </div>
                  )}
                  {cobCapacitacaoStats.totalTreinamentos === 0 && filteredDadosDiarios.length === 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Nenhum dado de treinamento encontrado para as carteiras de Cobrança.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {zoomedCarteira && (
        <Dialog open={!!zoomedCarteira} onOpenChange={() => setZoomedCarteira(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                {zoomedCarteira.name}
              </DialogTitle>
              <DialogDescription>Detalhes do desempenho da carteira</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-6 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Taxa de Capacitação</p>
                <p className="text-5xl font-bold text-primary">{zoomedCarteira.taxa.toFixed(1)}%</p>
              </div>
              <div className="w-full bg-secondary rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    zoomedCarteira.taxa >= 80
                      ? "bg-green-600"
                      : zoomedCarteira.taxa >= 60
                        ? "bg-blue-600"
                        : zoomedCarteira.taxa >= 40
                          ? "bg-amber-600"
                          : "bg-red-600"
                  }`}
                  style={{ width: `${zoomedCarteira.taxa}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="text-xl font-bold">{zoomedCarteira.total}</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center border border-green-200 dark:border-green-800">
                  <p className="text-xs text-muted-foreground mb-1">Aplicados</p>
                  <p className="text-xl font-bold text-green-600">{zoomedCarteira.aplicados}</p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-muted-foreground mb-1">Pendentes</p>
                  <p className="text-xl font-bold text-amber-600">{zoomedCarteira.pendentes}</p>
                </div>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
                <p className="text-sm font-medium">
                  {zoomedCarteira.taxa >= 80
                    ? "🎉 Excelente desempenho!"
                    : zoomedCarteira.taxa >= 60
                      ? "👍 Bom desempenho"
                      : zoomedCarteira.taxa >= 40
                        ? "⚠️ Desempenho regular"
                        : "⚠️ Necessita atenção"}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
