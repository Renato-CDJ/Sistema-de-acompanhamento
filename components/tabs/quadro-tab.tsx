"use client"

import { useState } from "react"
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
import { Plus, Eye, EyeOff, Calendar, BarChart3, Edit, Trash2, Filter } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"

export function QuadroTab() {
  const { user } = useAuth()
  const isAdmin = hasPermission(user, "edit")
  const [selectedOption, setSelectedOption] = useState("caixa")
  const [selectedTurno, setSelectedTurno] = useState("geral")
  const [showCharts, setShowCharts] = useState(true)
  const [showCarteiraDetails, setShowCarteiraDetails] = useState(false)

  const [caixaStats, setCaixaStats] = useState({ total: 245, ativos: 220, ferias: 15, afastamento: 10 })
  const [cobrancaStats, setCobrancaStats] = useState({ total: 180, ativos: 165, ferias: 10, afastamento: 5 })
  const [historicalData, setHistoricalData] = useState([
    { date: "2024-01-15", total: 245, ativos: 220, ferias: 15, afastamento: 10, turno: "Geral", tipo: "caixa" },
    { date: "2024-01-14", total: 243, ativos: 218, ferias: 15, afastamento: 10, turno: "Geral", tipo: "caixa" },
  ])

  const [carteiras, setCarteiras] = useState([
    { id: 1, name: "Banco Mercantil", total: 45, presentes: 42, faltas: 3, abs: "6.7%" },
    { id: 2, name: "BMG", total: 38, presentes: 36, faltas: 2, abs: "5.3%" },
    { id: 3, name: "BTG", total: 52, presentes: 48, faltas: 4, abs: "7.7%" },
    { id: 4, name: "Carrefour", total: 45, presentes: 39, faltas: 6, abs: "13.3%" },
  ])

  const [carteiraStats, setCarteiraStats] = useState([
    { id: 1, date: "2024-01-15", carteira: "Banco Mercantil", total: 45, presentes: 42, faltas: 3, turno: "Manhã" },
    { id: 2, date: "2024-01-15", carteira: "BMG", total: 38, presentes: 36, faltas: 2, turno: "Tarde" },
    { id: 3, date: "2024-01-14", carteira: "BTG", total: 52, presentes: 48, faltas: 4, turno: "Integral" },
  ])

  const [newCarteira, setNewCarteira] = useState("")
  const [editingCarteira, setEditingCarteira] = useState(null)
  const [isCarteiraDialogOpen, setIsCarteiraDialogOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState("")

  const [dailyData, setDailyData] = useState({
    date: "",
    total: 0,
    ativos: 0,
    ferias: 0,
    afastamento: 0,
    turno: "geral", // Added turno field
  })

  const [carteiraStatsData, setCarteiraStatsData] = useState({
    date: "",
    carteira: "",
    total: 0,
    presentes: 0,
    faltas: 0,
    turno: "geral", // Added turno field
  })

  const currentData = {
    stats: selectedOption === "caixa" ? caixaStats : cobrancaStats,
  }

  const pieData = [
    { name: "Ativos", value: currentData.stats.ativos, color: "#f97316" },
    { name: "Férias", value: currentData.stats.ferias, color: "#fb923c" },
    { name: "Afastamento", value: currentData.stats.afastamento, color: "#fdba74" },
  ]

  const handleAddCarteira = () => {
    if (!newCarteira.trim()) {
      alert("Por favor, digite o nome da carteira")
      return
    }

    const newId = Math.max(...carteiras.map((c) => c.id)) + 1
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
      // Also remove related stats
      setCarteiraStats(carteiraStats.filter((s) => s.carteira !== carteiras.find((c) => c.id === carteiraId)?.name))
      alert("Carteira excluída com sucesso!")
    }
  }

  const handleDailyDataChange = (field: string, value: string | number) => {
    const newData = { ...dailyData, [field]: value }

    // Auto-calculate total when ativos, ferias, or afastamento changes
    if (field === "ativos" || field === "ferias" || field === "afastamento") {
      const ativos = field === "ativos" ? Number(value) : newData.ativos
      const ferias = field === "ferias" ? Number(value) : newData.ferias
      const afastamento = field === "afastamento" ? Number(value) : newData.afastamento
      newData.total = ativos + ferias + afastamento
    }

    setDailyData(newData)
  }

  const handleCarteiraStatsChange = (field: string, value: string | number) => {
    const newData = { ...carteiraStatsData, [field]: value }

    // Auto-calculate total when presentes and faltas changes
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

    const newHistoricalRecord = {
      ...dailyData,
      tipo: selectedOption,
      id: Date.now(),
    }

    // Update historical data
    setHistoricalData([newHistoricalRecord, ...historicalData])

    // Update current statistics
    if (selectedOption === "caixa") {
      setCaixaStats({
        total: dailyData.total,
        ativos: dailyData.ativos,
        ferias: dailyData.ferias,
        afastamento: dailyData.afastamento,
      })
    } else {
      setCobrancaStats({
        total: dailyData.total,
        ativos: dailyData.ativos,
        ferias: dailyData.ferias,
        afastamento: dailyData.afastamento,
      })
    }

    console.log("[v0] Salvando dados diários:", dailyData)
    alert("Dados salvos com sucesso!")

    // Reset form
    setDailyData({
      date: "",
      total: 0,
      ativos: 0,
      ferias: 0,
      afastamento: 0,
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
      id: Date.now(),
      date: carteiraStatsData.date,
      carteira: selectedCarteiraName,
      total: carteiraStatsData.total,
      presentes: carteiraStatsData.presentes,
      faltas: carteiraStatsData.faltas,
      turno: carteiraStatsData.turno, // Include turno in saved data
    }

    setCarteiraStats([...carteiraStats, newStat])

    // Update carteira summary with latest data
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

    console.log("[v0] Salvando estatísticas por carteira:", newStat)
    alert("Estatísticas por carteira salvas com sucesso!")

    // Reset form
    setCarteiraStatsData({
      date: "",
      carteira: "",
      total: 0,
      presentes: 0,
      faltas: 0,
      turno: "geral",
    })
  }

  const filteredHistoricalData = historicalData.filter((record) => record.tipo === selectedOption)
  const filteredCarteiraStats = dateFilter ? carteiraStats.filter((stat) => stat.date === dateFilter) : carteiraStats

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="option">Opção</Label>
          <Select value={selectedOption} onValueChange={setSelectedOption}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="caixa">Caixa</SelectItem>
              <SelectItem value="cobranca">Cobrança</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="turno">Turno</Label>
          <Select value={selectedTurno} onValueChange={setSelectedTurno}>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentData.stats.ativos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Férias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{currentData.stats.ferias}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Afastamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{currentData.stats.afastamento}</div>
          </CardContent>
        </Card>
      </div>

      {/* Cobrança specific - Carteiras */}
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
                <CardTitle className="flex items-center justify-between">
                  Detalhes das Carteiras
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <Input
                      type="date"
                      placeholder="Filtrar por data"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-40"
                    />
                    {dateFilter && (
                      <Button variant="outline" size="sm" onClick={() => setDateFilter("")}>
                        Limpar
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Carteira</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Presentes</TableHead>
                      <TableHead>Faltas</TableHead>
                      <TableHead>ABS</TableHead>
                      <TableHead>Turno</TableHead>
                      {dateFilter && <TableHead>Data</TableHead>}
                      {isAdmin && <TableHead>Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dateFilter
                      ? // Show filtered stats by date
                        filteredCarteiraStats.map((stat) => (
                          <TableRow key={stat.id}>
                            <TableCell className="font-medium">{stat.carteira}</TableCell>
                            <TableCell>{stat.total}</TableCell>
                            <TableCell className="text-green-600">{stat.presentes}</TableCell>
                            <TableCell className="text-red-600">{stat.faltas}</TableCell>
                            <TableCell>
                              {stat.total > 0 ? ((stat.faltas / stat.total) * 100).toFixed(1) + "%" : "0%"}
                            </TableCell>
                            <TableCell>{stat.turno}</TableCell>
                            <TableCell>{new Date(stat.date).toLocaleDateString("pt-BR")}</TableCell>
                          </TableRow>
                        ))
                      : // Show current carteira summary
                        carteiras.map((carteira) => (
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
                                  <Button variant="outline" size="sm" onClick={() => handleDeleteCarteira(carteira.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
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

      {/* Charts Toggle */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setShowCharts(!showCharts)} className="gap-2">
          {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
        </Button>
      </div>

      {/* Charts */}
      {showCharts && (
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

      {/* Daily Data Entry */}
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

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

      {/* Historical Data */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Dados</CardTitle>
          <CardDescription>Últimos registros de {selectedOption === "caixa" ? "Caixa" : "Cobrança"}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Ativos</TableHead>
                <TableHead>Férias</TableHead>
                <TableHead>Afastamento</TableHead>
                <TableHead>Turno</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistoricalData.map((record, index) => (
                <TableRow key={record.id || index}>
                  <TableCell>{new Date(record.date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{record.total}</TableCell>
                  <TableCell className="text-green-600">{record.ativos}</TableCell>
                  <TableCell className="text-blue-600">{record.ferias}</TableCell>
                  <TableCell className="text-red-600">{record.afastamento}</TableCell>
                  <TableCell>{record.turno}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
