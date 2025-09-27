"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Plus, Eye, EyeOff, Calendar, BarChart3, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"
import { useData } from "@/contexts/data-context"

interface QuadroTabProps {
  filters?: {
    dateRange?: { start: string; end: string }
    turno?: string
    carteira?: string
    secao?: string
  }
}

export function QuadroTab({ filters }: QuadroTabProps) {
  const { user } = useAuth()
  const isAdmin = hasPermission(user, "edit")
  const {
    dadosDiarios,
    addDadosDiarios,
    updateDadosDiarios,
    deleteDadosDiarios,
    estatisticasCarteiras,
    addEstatisticasCarteira,
  } = useData()

  const [selectedOption, setSelectedOption] = useState("caixa")
  const [selectedTurno, setSelectedTurno] = useState("geral")
  const [showCharts, setShowCharts] = useState(true)
  const [showCarteiraDetails, setShowCarteiraDetails] = useState(false)

  const [carteiras, setCarteiras] = useState([])
  const [newCarteira, setNewCarteira] = useState("")
  const [editingCarteira, setEditingCarteira] = useState(null)
  const [isCarteiraDialogOpen, setIsCarteiraDialogOpen] = useState(false)

  const [dailyData, setDailyData] = useState({
    date: "",
    total: 0,
    ativos: 0,
    ferias: 0,
    afastamento: 0,
    desaparecidos: 0,
    inss: 0,
    turno: "geral",
  })

  const [carteiraStatsData, setCarteiraStatsData] = useState({
    date: "",
    carteira: "",
    total: 0,
    presentes: 0,
    faltas: 0,
    turno: "geral",
  })

  const filteredDadosDiarios = dadosDiarios.filter((dados) => {
    // Filtro por seção
    let matchesSecao = true
    if (filters?.secao && filters.secao !== "Todas as seções") {
      matchesSecao = dados.secao.toLowerCase() === filters.secao.toLowerCase()
    }

    // Filtro por turno
    let matchesTurno = true
    if (filters?.turno && filters.turno !== "Todos os turnos") {
      matchesTurno = dados.turno.toLowerCase() === filters.turno.toLowerCase()
    }

    // Filtro por data início
    let matchesDataInicio = true
    if (filters?.dateRange?.start) {
      matchesDataInicio = dados.date >= filters.dateRange.start
    }

    // Filtro por data fim
    let matchesDataFim = true
    if (filters?.dateRange?.end) {
      matchesDataFim = dados.date <= filters.dateRange.end
    }

    console.log("[v0] Filtrando dados:", {
      dados: dados,
      filters: filters,
      matchesSecao,
      matchesTurno,
      matchesDataInicio,
      matchesDataFim,
    })

    return matchesSecao && matchesTurno && matchesDataInicio && matchesDataFim
  })

  const currentStats =
    filteredDadosDiarios.length > 0
      ? filteredDadosDiarios.reduce(
          (acc, dados) => ({
            total: acc.total + dados.total,
            ativos: acc.ativos + dados.ativos,
            ferias: acc.ferias + dados.ferias,
            afastamento: acc.afastamento + dados.afastamento,
            desaparecidos: acc.desaparecidos + dados.desaparecidos,
            inss: acc.inss + dados.inss,
          }),
          { total: 0, ativos: 0, ferias: 0, afastamento: 0, desaparecidos: 0, inss: 0 },
        )
      : { total: 0, ativos: 0, ferias: 0, afastamento: 0, desaparecidos: 0, inss: 0 }

  const pieData = [
    { name: "Ativos", value: currentStats.ativos, color: "#22c55e" },
    { name: "Férias", value: currentStats.ferias, color: "#3b82f6" },
    { name: "Afastamento", value: currentStats.afastamento, color: "#ef4444" },
    { name: "Desaparecidos", value: currentStats.desaparecidos, color: "#f59e0b" },
    { name: "INSS", value: currentStats.inss, color: "#8b5cf6" },
  ].filter((item) => item.value > 0)

  const handleAddCarteira = () => {
    if (!newCarteira.trim()) {
      alert("Por favor, digite o nome da carteira")
      return
    }

    const newId = carteiras.length > 0 ? Math.max(...carteiras.map((c) => c.id)) + 1 : 1
    const newCarteiraObj = {
      id: newId,
      name: newCarteira,
      total: 0,
      presentes: 0,
      faltas: 0,
      abs: "0%",
    }

    setCarteiras([...carteiras, newCarteiraObj])
    setNewCarteira("")
    setIsCarteiraDialogOpen(false)
    alert("Carteira adicionada com sucesso!")
  }

  const handleEditCarteira = (carteira) => {
    setEditingCarteira(carteira)
    setNewCarteira(carteira.name)
    setIsCarteiraDialogOpen(true)
  }

  const handleUpdateCarteira = () => {
    if (!newCarteira.trim()) {
      alert("Por favor, digite o nome da carteira")
      return
    }

    setCarteiras(carteiras.map((c) => (c.id === editingCarteira.id ? { ...c, name: newCarteira } : c)))

    setEditingCarteira(null)
    setNewCarteira("")
    setIsCarteiraDialogOpen(false)
    alert("Carteira atualizada com sucesso!")
  }

  const handleDeleteCarteira = (carteiraId) => {
    if (confirm("Tem certeza que deseja excluir esta carteira?")) {
      setCarteiras(carteiras.filter((c) => c.id !== carteiraId))
      alert("Carteira excluída com sucesso!")
    }
  }

  const handleDailyDataChange = (field: string, value: string | number) => {
    const newData = { ...dailyData, [field]: value }

    if (["ativos", "ferias", "afastamento", "desaparecidos", "inss"].includes(field)) {
      const ativos = field === "ativos" ? Number(value) : newData.ativos
      const ferias = field === "ferias" ? Number(value) : newData.ferias
      const afastamento = field === "afastamento" ? Number(value) : newData.afastamento
      const desaparecidos = field === "desaparecidos" ? Number(value) : newData.desaparecidos
      const inss = field === "inss" ? Number(value) : newData.inss
      newData.total = ativos + ferias + afastamento + desaparecidos + inss
    }

    setDailyData(newData)
  }

  const handleCarteiraStatsChange = (field: string, value: string | number) => {
    const newData = { ...carteiraStatsData, [field]: value }

    if (field === "presentes" || field === "faltas") {
      const presentes = field === "presentes" ? Number(value) : newData.presentes
      const faltas = field === "faltas" ? Number(value) : newData.faltas
      newData.total = presentes + faltas
    }

    setCarteiraStatsData(newData)
  }

  const handleSaveDailyData = () => {
    if (!dailyData.date) {
      alert("Por favor, selecione uma data")
      return
    }

    const dadosParaSalvar = {
      ...dailyData,
      secao: selectedOption === "caixa" ? "Caixa" : "Cobrança",
    }

    console.log("[v0] Salvando dados diários:", dadosParaSalvar)
    addDadosDiarios(dadosParaSalvar)
    alert("Dados salvos com sucesso!")

    setDailyData({
      date: "",
      total: 0,
      ativos: 0,
      ferias: 0,
      afastamento: 0,
      desaparecidos: 0,
      inss: 0,
      turno: "geral",
    })
  }

  const handleSaveCarteiraStats = () => {
    if (!carteiraStatsData.date) {
      alert("Por favor, selecione uma data")
      return
    }

    if (!carteiraStatsData.carteira) {
      alert("Por favor, selecione uma carteira")
      return
    }

    const selectedCarteiraName = carteiras.find((c) => c.id === Number.parseInt(carteiraStatsData.carteira))?.name

    const newStat = {
      date: carteiraStatsData.date,
      carteira: selectedCarteiraName,
      total: carteiraStatsData.total,
      presentes: carteiraStatsData.presentes,
      faltas: carteiraStatsData.faltas,
      turno: carteiraStatsData.turno,
    }

    addEstatisticasCarteira(newStat)

    const abs =
      carteiraStatsData.total > 0 ? ((carteiraStatsData.faltas / carteiraStatsData.total) * 100).toFixed(1) + "%" : "0%"

    setCarteiras(
      carteiras.map((c) =>
        c.name === selectedCarteiraName
          ? {
              ...c,
              total: carteiraStatsData.total,
              presentes: carteiraStatsData.presentes,
              faltas: carteiraStatsData.faltas,
              abs: abs,
            }
          : c,
      ),
    )

    alert("Estatísticas por carteira salvas com sucesso!")

    setCarteiraStatsData({
      date: "",
      carteira: "",
      total: 0,
      presentes: 0,
      faltas: 0,
      turno: "geral",
    })
  }

  const filteredCarteiraStats = estatisticasCarteiras.filter((stat) => {
    let matchesDataInicio = true
    if (filters?.dateRange?.start) {
      matchesDataInicio = stat.date >= filters.dateRange.start
    }

    let matchesDataFim = true
    if (filters?.dateRange?.end) {
      matchesDataFim = stat.date <= filters.dateRange.end
    }

    let matchesCarteira = true
    if (filters?.carteira && filters.carteira !== "Todas as carteiras") {
      matchesCarteira = stat.carteira === filters.carteira
    }

    return matchesDataInicio && matchesDataFim && matchesCarteira
  })

  const handleEditDadosDiarios = (record: any) => {
    setDailyData({
      date: record.date,
      total: record.total,
      ativos: record.ativos,
      ferias: record.ferias,
      afastamento: record.afastamento,
      desaparecidos: record.desaparecidos,
      inss: record.inss,
      turno: record.turno,
    })
  }

  const handleDeleteDadosDiarios = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      deleteDadosDiarios(id)
      alert("Registro excluído com sucesso!")
    }
  }

  useEffect(() => {
    // Simulação de carregamento de carteiras
    setCarteiras([
      { id: 1, name: "Carteira 1", total: 0, presentes: 0, faltas: 0, abs: "0%" },
      { id: 2, name: "Carteira 2", total: 0, presentes: 0, faltas: 0, abs: "0%" },
    ])
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentStats.ativos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Férias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{currentStats.ferias}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Afastamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{currentStats.afastamento}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Desaparecidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{currentStats.desaparecidos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">INSS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{currentStats.inss}</div>
          </CardContent>
        </Card>
      </div>

      {selectedOption === "cobranca" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Estatísticas por Carteira</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCarteiraDetails(!showCarteiraDetails)}>
                {showCarteiraDetails ? "Ocultar Detalhes" : "Mostrar Detalhes"}
              </Button>
              {isAdmin && (
                <Dialog open={isCarteiraDialogOpen} onOpenChange={setIsCarteiraDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingCarteira(null)
                        setNewCarteira("")
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Carteira
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCarteira ? "Editar Carteira" : "Adicionar Nova Carteira"}</DialogTitle>
                      <DialogDescription>
                        {editingCarteira ? "Edite o nome da carteira" : "Adicione uma nova carteira ao sistema"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="carteira-name">Nome da Carteira</Label>
                        <Input
                          id="carteira-name"
                          placeholder="Nome da carteira"
                          value={newCarteira}
                          onChange={(e) => setNewCarteira(e.target.value)}
                        />
                      </div>
                      <Button className="w-full" onClick={editingCarteira ? handleUpdateCarteira : handleAddCarteira}>
                        {editingCarteira ? "Atualizar" : "Adicionar"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {showCarteiraDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Detalhes das Carteiras</CardTitle>
                <CardDescription>
                  {filters?.dateRange?.start || filters?.dateRange?.end
                    ? `Estatísticas filtradas por período: ${new Date(filters.dateRange.start).toLocaleDateString("pt-BR")} até ${new Date(filters.dateRange.end).toLocaleDateString("pt-BR")}`
                    : "Estatísticas gerais das carteiras"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {carteiras.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma carteira cadastrada ainda.</p>
                    <p className="text-sm">Adicione uma carteira para começar a registrar estatísticas.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Carteira</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Presentes</TableHead>
                        <TableHead>Faltas</TableHead>
                        <TableHead>ABS</TableHead>
                        <TableHead>Turno</TableHead>
                        {filters?.dateRange?.start || (filters?.dateRange?.end && <TableHead>Data</TableHead>)}
                        {isAdmin && <TableHead>Ações</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filters?.dateRange?.start || filters?.dateRange?.end
                        ? filteredCarteiraStats.map((stat) => (
                            <TableRow key={stat.id}>
                              <TableCell className="font-medium">{stat.carteira}</TableCell>
                              <TableCell>{stat.total}</TableCell>
                              <TableCell className="text-green-600">{stat.presentes}</TableCell>
                              <TableCell className="text-red-600">{stat.faltas}</TableCell>
                              <TableCell>
                                {stat.total > 0 ? ((stat.faltas / stat.total) * 100).toFixed(1) + "%" : "0%"}
                              </TableCell>
                              <TableCell>{stat.turno}</TableCell>
                              {filters?.dateRange?.start ||
                                (filters?.dateRange?.end && (
                                  <TableCell>{new Date(stat.date).toLocaleDateString("pt-BR")}</TableCell>
                                ))}
                              {isAdmin && (
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditCarteira(stat)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDeleteCarteira(stat.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        : carteiras.map((carteira) => (
                            <TableRow key={carteira.id}>
                              <TableCell className="font-medium">{carteira.name}</TableCell>
                              <TableCell>{carteira.total}</TableCell>
                              <TableCell className="text-green-600">{carteira.presentes}</TableCell>
                              <TableCell className="text-red-600">{carteira.faltas}</TableCell>
                              <TableCell>{carteira.abs}</TableCell>
                              <TableCell>-</TableCell>
                              {isAdmin && (
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditCarteira(carteira)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteCarteira(carteira.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Adicionar Estatísticas por Carteira
                </CardTitle>
                <CardDescription>Registre as estatísticas específicas de cada carteira</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label htmlFor="carteira-stats-date">Data</Label>
                      <Input
                        id="carteira-stats-date"
                        type="date"
                        value={carteiraStatsData.date}
                        onChange={(e) => handleCarteiraStatsChange("date", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="carteira-stats-carteira">Carteira</Label>
                      <Select
                        value={carteiraStatsData.carteira}
                        onValueChange={(value) => handleCarteiraStatsChange("carteira", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a carteira" />
                        </SelectTrigger>
                        <SelectContent>
                          {carteiras.map((carteira) => (
                            <SelectItem key={carteira.id} value={carteira.id.toString()}>
                              {carteira.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="carteira-stats-turno">Turno</Label>
                      <Select
                        value={carteiraStatsData.turno}
                        onValueChange={(value) => handleCarteiraStatsChange("turno", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="geral">Geral</SelectItem>
                          <SelectItem value="manha">Manhã</SelectItem>
                          <SelectItem value="tarde">Tarde</SelectItem>
                          <SelectItem value="integral">Integral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="carteira-stats-total">Total</Label>
                      <Input
                        id="carteira-stats-total"
                        type="number"
                        placeholder="0"
                        value={carteiraStatsData.total}
                        readOnly
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Calculado automaticamente</p>
                    </div>
                    <div>
                      <Label htmlFor="carteira-stats-presentes">Presentes</Label>
                      <Input
                        id="carteira-stats-presentes"
                        type="number"
                        placeholder="0"
                        value={carteiraStatsData.presentes}
                        onChange={(e) => handleCarteiraStatsChange("presentes", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="carteira-stats-faltas">Faltas</Label>
                      <Input
                        id="carteira-stats-faltas"
                        type="number"
                        placeholder="0"
                        value={carteiraStatsData.faltas}
                        onChange={(e) => handleCarteiraStatsChange("faltas", Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full" onClick={handleSaveCarteiraStats}>
                        Salvar Estatísticas
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setShowCharts(!showCharts)} className="gap-2">
          {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
        </Button>
      </div>

      {showCharts && pieData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição - {selectedOption === "caixa" ? "Caixa" : "Cobrança"}</CardTitle>
            <CardDescription>Status atual dos funcionários por turno: {selectedTurno}</CardDescription>
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

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Adicionar Dados Diários
            </CardTitle>
            <CardDescription>
              Registre os números diários para {selectedOption === "caixa" ? "Caixa" : "Cobrança"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="daily-date">Data</Label>
                  <Input
                    id="daily-date"
                    type="date"
                    value={dailyData.date}
                    onChange={(e) => handleDailyDataChange("date", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="daily-turno">Turno</Label>
                  <Select value={dailyData.turno} onValueChange={(value) => handleDailyDataChange("turno", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Geral</SelectItem>
                      <SelectItem value="manha">Manhã</SelectItem>
                      <SelectItem value="tarde">Tarde</SelectItem>
                      <SelectItem value="integral">Integral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                <div>
                  <Label htmlFor="daily-total">Total</Label>
                  <Input
                    id="daily-total"
                    type="number"
                    placeholder="0"
                    value={dailyData.total}
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Calculado automaticamente</p>
                </div>
                <div>
                  <Label htmlFor="daily-ativos">Ativos</Label>
                  <Input
                    id="daily-ativos"
                    type="number"
                    placeholder="0"
                    value={dailyData.ativos}
                    onChange={(e) => handleDailyDataChange("ativos", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="daily-ferias">Férias</Label>
                  <Input
                    id="daily-ferias"
                    type="number"
                    placeholder="0"
                    value={dailyData.ferias}
                    onChange={(e) => handleDailyDataChange("ferias", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="daily-afastamento">Afastamento</Label>
                  <Input
                    id="daily-afastamento"
                    type="number"
                    placeholder="0"
                    value={dailyData.afastamento}
                    onChange={(e) => handleDailyDataChange("afastamento", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="daily-desaparecidos">Desaparecidos</Label>
                  <Input
                    id="daily-desaparecidos"
                    type="number"
                    placeholder="0"
                    value={dailyData.desaparecidos}
                    onChange={(e) => handleDailyDataChange("desaparecidos", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="daily-inss">INSS</Label>
                  <Input
                    id="daily-inss"
                    type="number"
                    placeholder="0"
                    value={dailyData.inss}
                    onChange={(e) => handleDailyDataChange("inss", Number(e.target.value))}
                  />
                </div>
                <div className="flex items-end">
                  <Button className="w-full" onClick={handleSaveDailyData}>
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Dados</CardTitle>
          <CardDescription>
            {filters?.secao && filters.secao !== "Todas as seções" && `Seção: ${filters.secao} `}
            {filters?.turno && filters.turno !== "Todos os turnos" && `- Turno: ${filters.turno} `}
            {filters?.dateRange?.start && `- De: ${new Date(filters.dateRange.start).toLocaleDateString("pt-BR")} `}
            {filters?.dateRange?.end && `até: ${new Date(filters.dateRange.end).toLocaleDateString("pt-BR")}`}
            {(!filters?.secao || filters.secao === "Todas as seções") &&
              (!filters?.turno || filters.turno === "Todos os turnos") &&
              !filters?.dateRange?.start &&
              !filters?.dateRange?.end &&
              "Todos os registros"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDadosDiarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum dado encontrado com os filtros aplicados.</p>
              <p className="text-sm">
                {dadosDiarios.length === 0
                  ? "Use o formulário acima para adicionar dados diários."
                  : "Tente ajustar os filtros ou adicionar novos dados."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Ativos</TableHead>
                  <TableHead>Férias</TableHead>
                  <TableHead>Afastamento</TableHead>
                  <TableHead>Desaparecidos</TableHead>
                  <TableHead>INSS</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Seção</TableHead>
                  {isAdmin && <TableHead>Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDadosDiarios.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{record.total}</TableCell>
                    <TableCell className="text-green-600">{record.ativos}</TableCell>
                    <TableCell className="text-blue-600">{record.ferias}</TableCell>
                    <TableCell className="text-red-600">{record.afastamento}</TableCell>
                    <TableCell className="text-amber-600">{record.desaparecidos}</TableCell>
                    <TableCell className="text-purple-600">{record.inss}</TableCell>
                    <TableCell>{record.turno}</TableCell>
                    <TableCell>{record.secao}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditDadosDiarios(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteDadosDiarios(record.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
