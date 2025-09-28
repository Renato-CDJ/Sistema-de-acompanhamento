"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Eye, EyeOff, Users, BookOpen, Award, Filter } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { hasPermission } from "@/lib/auth"

interface TreinadosTabProps {
  filters?: {
    dateRange?: { start: string; end: string }
    turno?: string
    carteira?: string
    status?: string
  }
}

export function TreinadosTab({ filters }: TreinadosTabProps) {
  const { user } = useAuth()
  const isAdmin = hasPermission(user, "edit")
  const [showCharts, setShowCharts] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    data: "",
    turno: "Todos os turnos",
    carteira: "Todas as carteiras",
    nome: "",
    assunto: "",
  })

  const { carteiras, getTreinadosStats } = useData()
  const { totalTreinados, assuntosUnicos, operadoresTreinados } = getTreinadosStats()

  const [filtroAssunto, setFiltroAssunto] = useState("")
  const [filtroNome, setFiltroNome] = useState("")
  const [filtroData, setFiltroData] = useState("")
  const [filtroTurno, setFiltroTurno] = useState("Todos os turnos")
  const [filtroCarteira, setFiltroCarteira] = useState("Todas as carteiras")

  const assuntosStats = assuntosUnicos.map((assunto, index) => ({
    assunto,
    quantidade: operadoresTreinados.filter((o) => o.assunto === assunto).length,
    color: `hsl(${(index * 360) / assuntosUnicos.length}, 70%, 50%)`,
  }))

  const carteiraStats = carteiras.map((carteira, index) => ({
    carteira: carteira.name,
    quantidade: operadoresTreinados.filter((o) => o.carteira === carteira.name).length,
    color: `hsl(${(index * 360) / carteiras.length}, 70%, 50%)`,
  }))

  const treinadosFiltrados = operadoresTreinados.filter((treinado) => {
    // Filtros globais
    const matchDateRange =
      !filters?.dateRange?.start ||
      !filters?.dateRange?.end ||
      (treinado.dataConlusao >= filters.dateRange.start && treinado.dataConlusao <= filters.dateRange.end)

    const matchTurno =
      !filters?.turno ||
      filters.turno === "Todos os turnos" ||
      treinado.turno?.toLowerCase() === filters.turno.toLowerCase()

    const matchCarteira =
      !filters?.carteira || filters.carteira === "Todas as carteiras" || treinado.carteira === filters.carteira

    const matchStatus = !filters?.status || filters.status === "Todos os status"

    // Filtros locais (mantidos para compatibilidade)
    const matchAssunto =
      !filtrosAplicados.assunto || treinado.assunto.toLowerCase().includes(filtrosAplicados.assunto.toLowerCase())
    const matchNome =
      !filtrosAplicados.nome || treinado.nome.toLowerCase().includes(filtrosAplicados.nome.toLowerCase())
    const matchData = !filtrosAplicados.data || treinado.dataConlusao.includes(filtrosAplicados.data)
    const matchLocalCarteira =
      filtrosAplicados.carteira === "Todas as carteiras" || treinado.carteira === filtrosAplicados.carteira
    const matchLocalTurno = filtrosAplicados.turno === "Todos os turnos" || treinado.turno === filtrosAplicados.turno

    return (
      matchDateRange &&
      matchTurno &&
      matchCarteira &&
      matchStatus &&
      matchAssunto &&
      matchNome &&
      matchData &&
      matchLocalCarteira &&
      matchLocalTurno
    )
  })

  const handleConfirmarFiltro = () => {
    setFiltrosAplicados({
      data: filtroData,
      turno: filtroTurno,
      carteira: filtroCarteira,
      nome: filtroNome,
      assunto: filtroAssunto,
    })
    setShowFilters(false)
  }

  const handleRemoverFiltro = () => {
    setFiltroData("")
    setFiltroTurno("Todos os turnos")
    setFiltroCarteira("Todas as carteiras")
    setFiltroNome("")
    setFiltroAssunto("")
    setFiltrosAplicados({
      data: "",
      turno: "Todos os turnos",
      carteira: "Todas as carteiras",
      nome: "",
      assunto: "",
    })
    setShowFilters(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <Filter className="h-4 w-4" />
          {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
        </Button>

        {(filtrosAplicados.data ||
          filtrosAplicados.turno !== "Todos os turnos" ||
          filtrosAplicados.carteira !== "Todas as carteiras" ||
          filtrosAplicados.nome ||
          filtrosAplicados.assunto) && (
          <Badge variant="secondary" className="gap-2">
            Filtros aplicados
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoverFiltro}
              className="h-4 w-4 p-0 hover:bg-transparent"
            >
              ×
            </Button>
          </Badge>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="filtro-data">Data</Label>
                <Input
                  id="filtro-data"
                  type="date"
                  value={filtroData}
                  onChange={(e) => setFiltroData(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="filtro-turno">Turno</Label>
                <Select value={filtroTurno} onValueChange={setFiltroTurno}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os turnos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos os turnos">Todos os turnos</SelectItem>
                    <SelectItem value="Manhã">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Integral">Integral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filtro-carteira">Carteira</Label>
                <Select value={filtroCarteira} onValueChange={setFiltroCarteira}>
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
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filtro-nome">Nome</Label>
                <Input
                  id="filtro-nome"
                  placeholder="Digite o nome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="filtro-assunto">Assunto</Label>
                <Input
                  id="filtro-assunto"
                  placeholder="Digite o assunto..."
                  value={filtroAssunto}
                  onChange={(e) => setFiltroAssunto(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConfirmarFiltro} className="flex-1">
                Confirmar Filtro
              </Button>
              <Button variant="outline" onClick={handleRemoverFiltro} className="flex-1 bg-transparent">
                Remover Filtro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total de Operadores Treinados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalTreinados}</div>
            <p className="text-xs text-muted-foreground mt-1">Operadores com treinamento concluído</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Assuntos Diferentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{assuntosUnicos.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Tipos de treinamento aplicados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Média por Assunto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {assuntosUnicos.length > 0 ? Math.round(totalTreinados / assuntosUnicos.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Operadores por tipo de treinamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Assunto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Estatísticas por Assunto de Capacitação
          </CardTitle>
          <CardDescription>Quantidade de operadores treinados por assunto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assuntosStats.map((stat, index) => (
              <Card key={index} className="border-l-4" style={{ borderLeftColor: stat.color }}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-sm">{stat.assunto}</h4>
                      <p className="text-2xl font-bold mt-1">{stat.quantidade}</p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <span className="text-lg font-bold" style={{ color: stat.color }}>
                        {stat.quantidade}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Toggle */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setShowCharts(!showCharts)} className="gap-2">
          {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
        </Button>
      </div>

      {/* Charts */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Assunto</CardTitle>
              <CardDescription>Operadores treinados por assunto</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assuntosStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ assunto, percent }) => `${assunto.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantidade"
                  >
                    {assuntosStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Treinados por Carteira</CardTitle>
              <CardDescription>Distribuição por carteira</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={carteiraStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="carteira" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
