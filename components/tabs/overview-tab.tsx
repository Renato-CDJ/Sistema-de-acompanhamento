"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
import { TrendingUp, Users, GraduationCap, UserX, Eye, EyeOff, Settings } from "lucide-react"
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

export function OverviewTab({ filters }: OverviewTabProps) {
  const [showCharts, setShowCharts] = useState(true)
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

  const {
    getCapacitacaoStats,
    getDesligamentosStats,
    getTreinadosStats,
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
    if (!filters) return true

    const matchDateRange =
      !filters.dateRange?.start ||
      !filters.dateRange?.end ||
      (dados.date >= filters.dateRange.start && dados.date <= filters.dateRange.end)

    const matchTurno =
      !filters.turno || filters.turno === "Todos os turnos" || dados.turno.toLowerCase() === filters.turno.toLowerCase()

    const matchSecao =
      !filters.secao || filters.secao === "Todas as seções" || dados.secao.toLowerCase() === filters.secao.toLowerCase()

    console.log("[v0] Filtrando dados diários na overview:", {
      dados: dados,
      filters: filters,
      matchDateRange,
      matchTurno,
      matchSecao,
    })

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

  const filteredDesligamentos = desligamentos.filter((desligamento) => {
    if (!filters) return true

    const matchDateRange =
      !filters.dateRange?.start ||
      !filters.dateRange?.end ||
      (desligamento.data >= filters.dateRange.start && desligamento.data <= filters.dateRange.end)

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

  const totalFuncionarios = filteredDadosDiarios.reduce((sum, dados) => sum + dados.total, 0) || 0
  const totalAtivos = filteredDadosDiarios.reduce((sum, dados) => sum + dados.ativos, 0) || 0
  const totalFerias = filteredDadosDiarios.reduce((sum, dados) => sum + dados.ferias, 0) || 0
  const totalAfastamento = filteredDadosDiarios.reduce((sum, dados) => sum + dados.afastamento, 0) || 0
  const totalDesaparecidos = filteredDadosDiarios.reduce((sum, dados) => sum + dados.desaparecidos, 0) || 0
  const totalINSS = filteredDadosDiarios.reduce((sum, dados) => sum + dados.inss, 0) || 0

  const filteredCapacitacaoStats = {
    totalTreinamentos: filteredTreinamentos.reduce((sum, t) => sum + t.quantidade, 0),
    aplicados: filteredTreinamentos.filter((t) => t.status === "Aplicado").reduce((sum, t) => sum + t.quantidade, 0),
    pendentes: filteredTreinamentos.filter((t) => t.status === "Pendente").reduce((sum, t) => sum + t.quantidade, 0),
    taxaConclusao: 0,
  }
  filteredCapacitacaoStats.taxaConclusao =
    filteredCapacitacaoStats.totalTreinamentos > 0
      ? (filteredCapacitacaoStats.aplicados / filteredCapacitacaoStats.totalTreinamentos) * 100
      : 0

  const filteredDesligamentosStats = {
    totalDesligamentos: filteredDesligamentos.length,
    comAvisoPrevia: filteredDesligamentos.filter((d) => d.avisoPrevia === "Com").length,
    semAvisoPrevia: filteredDesligamentos.filter((d) => d.avisoPrevia === "Sem").length,
    veioAgencia: filteredDesligamentos.filter((d) => d.veioAgencia === "Sim").length,
  }

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
      value: filteredCapacitacaoStats.pendentes.toString(),
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
      value: `${filteredCapacitacaoStats.taxaConclusao.toFixed(1)}%`,
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

  const barData = filteredDadosDiarios.slice(-5).map((dados, index) => ({
    month: new Date(dados.date).toLocaleDateString("pt-BR", { month: "short" }),
    funcionarios: dados.total,
    treinamentos: filteredCapacitacaoStats.aplicados,
    desligamentos: filteredDesligamentosStats.totalDesligamentos,
  }))

  const handleStatsToggle = (key: string, value: boolean) => {
    setVisibleStats((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Visão Geral</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowStatsConfig(!showStatsConfig)} className="gap-2">
            <Settings className="h-4 w-4" />
            Configurar Estatísticas
          </Button>
          <Button variant="outline" onClick={() => setShowCharts(!showCharts)} className="gap-2">
            {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
          </Button>
        </div>
      </div>

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

      {/* Stats Cards */}
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
                  <span className={stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}>{stat.change}</span>{" "}
                  em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

      {/* Charts */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - só mostra se há dados */}
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

          {/* Bar Chart - só mostra se há dados */}
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

      {/* Additional Stats - só mostra se há dados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {carteiras.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Desempenho por Carteira</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {carteiras.map((carteira, index) => (
                  <div key={carteira.name} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{carteira.name}</span>
                    <span className="text-sm text-muted-foreground">{carteira.taxa.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredCapacitacaoStats.totalTreinamentos > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Treinamentos Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Aplicados</span>
                  <span className="text-2xl font-bold text-primary">{filteredCapacitacaoStats.aplicados}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-sm text-muted-foreground">{filteredCapacitacaoStats.totalTreinamentos}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${filteredCapacitacaoStats.taxaConclusao}%` }}
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
              {filteredCapacitacaoStats.pendentes > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {filteredCapacitacaoStats.pendentes} treinamentos pendentes
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
              {filteredCapacitacaoStats.totalTreinamentos === 0 &&
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
    </div>
  )
}
