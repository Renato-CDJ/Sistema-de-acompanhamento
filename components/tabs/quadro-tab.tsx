"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Eye, EyeOff, Calendar, BarChart3, Edit, Trash2, ChevronDown, Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"
import { useData } from "@/contexts/data-context"
import { useToast } from "@/hooks/use-toast"

interface QuadroTabProps {
  filters?: {
    dateRange?: { start: string; end: string }
    turno?: string
    carteira?: string
    secao?: string
  }
}

interface Quadro {
  id: number
  date: string
  total: number
  ativos: number
  ferias: number
  afastamento: number
  desaparecidos: number
  inss: number
  turno: string
  secao: string
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
    updateEstatisticasCarteira,
    deleteEstatisticasCarteira,
    carteiras,
    addCarteira,
    updateCarteira,
    deleteCarteira,
  } = useData()

  const [selectedOption, setSelectedOption] = useState("caixa")
  const [selectedTurno, setSelectedTurno] = useState("geral")
  const [showCharts, setShowCharts] = useState(true)
  const [showCarteiraDetails, setShowCarteiraDetails] = useState(false)

  const [isDadosDiariosDialogOpen, setIsDadosDiariosDialogOpen] = useState(false)
  const [isCarteiraStatsDialogOpen, setIsCarteiraStatsDialogOpen] = useState(false)

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
    secao: "",
  })

  const [editingDailyData, setEditingDailyData] = useState<number | null>(null)

  const [carteiraStatsData, setCarteiraStatsData] = useState({
    date: "",
    carteira: "",
    total: 0,
    presentes: 0,
    faltas: 0,
    turno: "geral",
  })

  const [editingCarteiraStats, setEditingCarteiraStats] = useState<number | null>(null)

  const [quadros, setQuadros] = useState<Quadro[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingQuadro, setEditingQuadro] = useState<Quadro | null>(null)
  const { toast } = useToast()

  const [deleteCarteiraId, setDeleteCarteiraId] = useState<string | null>(null)
  const [deleteStatsId, setDeleteStatsId] = useState<number | null>(null)
  const [deleteDadosId, setDeleteDadosId] = useState<number | null>(null)

  const filteredDadosDiarios = dadosDiarios.filter((dados) => {
    let matchesSecao = true
    const currentSecao = selectedOption === "caixa" ? "Caixa" : "Cobrança"
    if (filters?.secao && filters.secao !== "Todas as seções") {
      matchesSecao = dados.secao.toLowerCase() === filters.secao.toLowerCase()
    } else {
      matchesSecao = dados.secao === currentSecao
    }

    let matchesTurno = true
    if (filters?.turno && filters.turno !== "Todos os turnos") {
      matchesTurno = dados.turno.toLowerCase() === filters.turno.toLowerCase()
    }

    let matchesDataInicio = true
    if (filters?.dateRange?.start) {
      matchesDataInicio = dados.date >= filters.dateRange.start
    }

    let matchesDataFim = true
    if (filters?.dateRange?.end) {
      matchesDataFim = dados.date <= filters.dateRange.end
    }

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
      toast({
        title: "Erro",
        description: "Por favor, digite o nome da carteira",
        variant: "destructive",
      })
      return
    }

    addCarteira(newCarteira)
    setNewCarteira("")
    setIsCarteiraDialogOpen(false)
    toast({
      title: "Sucesso",
      description: "Carteira adicionada com sucesso!",
      variant: "success",
    })
  }

  const handleEditCarteira = (carteira) => {
    setEditingCarteira(carteira)
    setNewCarteira(carteira.name)
    setIsCarteiraDialogOpen(true)
  }

  const handleUpdateCarteira = () => {
    if (!newCarteira.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite o nome da carteira",
        variant: "destructive",
      })
      return
    }

    if (editingCarteira) {
      updateCarteira(editingCarteira.id, newCarteira)
    }

    setEditingCarteira(null)
    setNewCarteira("")
    setIsCarteiraDialogOpen(false)
    toast({
      title: "Sucesso",
      description: "Carteira atualizada com sucesso!",
      variant: "success",
    })
  }

  const handleDeleteCarteira = (carteiraId) => {
    setDeleteCarteiraId(carteiraId)
  }

  const confirmDeleteCarteira = () => {
    if (deleteCarteiraId) {
      deleteCarteira(deleteCarteiraId)
      toast({
        title: "Sucesso",
        description: "Carteira excluída com sucesso!",
        variant: "success",
      })
      setDeleteCarteiraId(null)
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

  const handleSaveCarteiraStats = () => {
    if (!carteiraStatsData.date) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma data",
        variant: "destructive",
      })
      return
    }

    if (!carteiraStatsData.carteira) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma carteira",
        variant: "destructive",
      })
      return
    }

    if (editingCarteiraStats !== null) {
      updateEstatisticasCarteira(editingCarteiraStats, {
        date: carteiraStatsData.date,
        carteira: carteiraStatsData.carteira,
        total: carteiraStatsData.total,
        presentes: carteiraStatsData.presentes,
        faltas: carteiraStatsData.faltas,
        turno: carteiraStatsData.turno,
      })
      toast({
        title: "Sucesso",
        description: "Estatísticas por carteira atualizadas com sucesso!",
        variant: "success",
      })
      setEditingCarteiraStats(null)
    } else {
      const newStat = {
        date: carteiraStatsData.date,
        carteira: carteiraStatsData.carteira,
        total: carteiraStatsData.total,
        presentes: carteiraStatsData.presentes,
        faltas: carteiraStatsData.faltas,
        turno: carteiraStatsData.turno,
      }

      addEstatisticasCarteira(newStat)
      toast({
        title: "Sucesso",
        description: "Estatísticas por carteira salvas com sucesso!",
        variant: "success",
      })
    }

    setCarteiraStatsData({
      date: "",
      carteira: "",
      total: 0,
      presentes: 0,
      faltas: 0,
      turno: "geral",
    })
    setIsCarteiraStatsDialogOpen(false)
  }

  const handleEditCarteiraStats = (stat: any) => {
    setEditingCarteiraStats(stat.id)
    setCarteiraStatsData({
      date: stat.date,
      carteira: stat.carteira,
      total: stat.total,
      presentes: stat.presentes,
      faltas: stat.faltas,
      turno: stat.turno,
    })
    setIsCarteiraStatsDialogOpen(true)
  }

  const handleDeleteCarteiraStats = (id: number) => {
    setDeleteStatsId(id)
  }

  const confirmDeleteStats = () => {
    if (deleteStatsId !== null) {
      deleteEstatisticasCarteira(deleteStatsId)
      toast({
        title: "Sucesso",
        description: "Estatística excluída com sucesso!",
        variant: "success",
      })
      setDeleteStatsId(null)
    }
  }

  const handleEditDadosDiarios = (record: any) => {
    console.log("[v0] Editing dados diarios:", record)
    setEditingDailyData(record.id)
    setDailyData({
      date: record.date,
      total: record.total,
      ativos: record.ativos,
      ferias: record.ferias,
      afastamento: record.afastamento,
      desaparecidos: record.desaparecidos,
      inss: record.inss,
      turno: record.turno,
      secao: record.secao,
    })
    setIsDadosDiariosDialogOpen(true)
  }

  const handleDeleteDadosDiarios = (id: number) => {
    setDeleteDadosId(id)
  }

  const confirmDeleteDados = () => {
    if (deleteDadosId !== null) {
      deleteDadosDiarios(deleteDadosId)
      toast({
        title: "Sucesso",
        description: "Registro excluído com sucesso!",
        variant: "success",
      })
      setDeleteDadosId(null)
    }
  }

  const handleSaveDailyData = () => {
    if (!dailyData.date) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma data",
        variant: "destructive",
      })
      return
    }

    const secao = editingDailyData !== null ? dailyData.secao : selectedOption === "caixa" ? "Caixa" : "Cobrança"

    if (editingDailyData !== null) {
      console.log("[v0] Updating dados diarios with secao:", secao)
      updateDadosDiarios(editingDailyData, { ...dailyData, secao })
      toast({
        title: "Sucesso",
        description: "Dados diários atualizados com sucesso!",
        variant: "success",
      })
      setEditingDailyData(null)
    } else {
      console.log("[v0] Adding new dados diarios with secao:", secao)
      addDadosDiarios({ ...dailyData, secao })
      toast({
        title: "Sucesso",
        description: "Dados diários salvos com sucesso!",
        variant: "success",
      })
    }

    setDailyData({
      date: "",
      total: 0,
      ativos: 0,
      ferias: 0,
      afastamento: 0,
      desaparecidos: 0,
      inss: 0,
      turno: "geral",
      secao: "",
    })
    setIsDadosDiariosDialogOpen(false)
  }

  const handleCancelEditCarteiraStats = () => {
    console.log("[v0] Canceling carteira stats edit")
    setEditingCarteiraStats(null)
    setCarteiraStatsData({
      date: "",
      carteira: "",
      total: 0,
      presentes: 0,
      faltas: 0,
      turno: "geral",
    })
    setIsCarteiraStatsDialogOpen(false)
  }

  const handleCancelEditDailyData = () => {
    console.log("[v0] Canceling daily data edit")
    setEditingDailyData(null)
    setDailyData({
      date: "",
      total: 0,
      ativos: 0,
      ferias: 0,
      afastamento: 0,
      desaparecidos: 0,
      inss: 0,
      turno: "geral",
      secao: "",
    })
    setIsDadosDiariosDialogOpen(false)
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

    let matchesTurno = true
    if (filters?.turno && filters.turno !== "Todos os turnos") {
      matchesTurno = stat.turno.toLowerCase() === filters.turno.toLowerCase()
    }

    return matchesDataInicio && matchesDataFim && matchesCarteira && matchesTurno
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingQuadro) {
        await updateDadosDiarios(editingQuadro.id, dailyData)
        toast({
          title: "Sucesso",
          description: "Quadro atualizado com sucesso!",
          variant: "success",
        })
      } else {
        await addDadosDiarios(dailyData)
        toast({
          title: "Sucesso",
          description: "Quadro criado com sucesso!",
          variant: "success",
        })
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar quadro:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar quadro. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este quadro?")) return

    try {
      await deleteDadosDiarios(id)
      toast({
        title: "Sucesso",
        description: "Quadro excluído com sucesso!",
        variant: "success",
      })
    } catch (error) {
      console.error("Erro ao excluir quadro:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir quadro. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="option-select" className="text-sm font-medium">
              Opção
            </Label>
            <Select value={selectedOption} onValueChange={setSelectedOption}>
              <SelectTrigger className="w-40" id="option-select">
                <SelectValue />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caixa">Caixa</SelectItem>
                <SelectItem value="cobranca">Cobrança</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="turno-select" className="text-sm font-medium">
              Turno
            </Label>
            <Select value={selectedTurno} onValueChange={setSelectedTurno}>
              <SelectTrigger className="w-32" id="turno-select">
                <SelectValue />
                <ChevronDown className="h-4 w-4 opacity-50" />
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCharts(!showCharts)} className="gap-2">
            {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
          </Button>
        </div>
      </div>

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
              {isAdmin && (
                <>
                  <Button onClick={() => setIsDadosDiariosDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Dados Diários
                  </Button>
                  <Button onClick={() => setIsCarteiraStatsDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Estatísticas por Carteira
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setShowCarteiraDetails(!showCarteiraDetails)}>
                {showCarteiraDetails ? "Ocultar Detalhes" : "Mostrar Detalhes"}
              </Button>
            </div>
          </div>

          {showCarteiraDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Detalhes das Carteiras</CardTitle>
                <CardDescription>
                  {filters?.dateRange?.start || filters?.dateRange?.end
                    ? `Estatísticas filtradas por período: ${filters.dateRange.start ? new Date(filters.dateRange.start).toLocaleDateString("pt-BR") : "início"} até ${filters.dateRange.end ? new Date(filters.dateRange.end).toLocaleDateString("pt-BR") : "fim"}`
                    : "Estatísticas gerais das carteiras"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredCarteiraStats.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma estatística de carteira encontrada.</p>
                    <p className="text-sm">
                      Use o formulário "Adicionar Estatísticas por Carteira" para adicionar dados.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Carteira</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Presentes</TableHead>
                        <TableHead>Faltas</TableHead>
                        <TableHead>ABS</TableHead>
                        <TableHead>Turno</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCarteiraStats.map((stat) => (
                        <TableRow key={stat.id}>
                          <TableCell className="font-medium">{stat.carteira}</TableCell>
                          <TableCell>{new Date(stat.date).toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell>{stat.total}</TableCell>
                          <TableCell className="text-green-600">{stat.presentes}</TableCell>
                          <TableCell className="text-red-600">{stat.faltas}</TableCell>
                          <TableCell>
                            {stat.total > 0 ? ((stat.faltas / stat.total) * 100).toFixed(1) + "%" : "0%"}
                          </TableCell>
                          <TableCell>{stat.turno}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

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

      {selectedOption === "caixa" && isAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => setIsDadosDiariosDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Dados Diários
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Dados - Dados Diários</CardTitle>
          <CardDescription>
            {filters?.secao && filters.secao !== "Todas as seções" && `Seção: ${filters.secao} `}
            {filters?.turno && filters.turno !== "Todos os turnos" && `- Turno: ${filters.turno} `}
            {filters?.dateRange?.start && `- De: ${new Date(filters.dateRange.start).toLocaleDateString("pt-BR")} `}
            {filters?.dateRange?.end && `até: ${new Date(filters.dateRange.end).toLocaleDateString("pt-BR")}`}
            {(!filters?.secao || filters.secao === "Todas as seções") &&
              (!filters?.turno || filters.turno === "Todos os turnos") &&
              !filters?.dateRange?.start &&
              !filters?.dateRange?.end &&
              `Registros de ${selectedOption === "caixa" ? "Caixa" : "Cobrança"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDadosDiarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum dado encontrado com os filtros aplicados.</p>
              <p className="text-sm">
                {dadosDiarios.length === 0
                  ? "Use o botão 'Adicionar Dados Diários' para adicionar dados."
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

      {selectedOption === "cobranca" && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Dados - Estatísticas por Carteira</CardTitle>
            <CardDescription>
              {filters?.carteira && filters.carteira !== "Todas as carteiras" && `Carteira: ${filters.carteira} `}
              {filters?.turno && filters.turno !== "Todos os turnos" && `- Turno: ${filters.turno} `}
              {filters?.dateRange?.start && `- De: ${new Date(filters.dateRange.start).toLocaleDateString("pt-BR")} `}
              {filters?.dateRange?.end && `até: ${new Date(filters.dateRange.end).toLocaleDateString("pt-BR")}`}
              {(!filters?.carteira || filters.carteira === "Todas as carteiras") &&
                (!filters?.turno || filters.turno === "Todos os turnos") &&
                !filters?.dateRange?.start &&
                !filters?.dateRange?.end &&
                "Todas as estatísticas de carteiras"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCarteiraStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma estatística de carteira encontrada.</p>
                <p className="text-sm">
                  {estatisticasCarteiras.length === 0
                    ? "Use o botão 'Adicionar Estatísticas por Carteira' para adicionar dados."
                    : "Tente ajustar os filtros ou adicionar novos dados."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Carteira</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Presentes</TableHead>
                    <TableHead>Faltas</TableHead>
                    <TableHead>ABS</TableHead>
                    <TableHead>Turno</TableHead>
                    {isAdmin && <TableHead>Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCarteiraStats.map((stat) => (
                    <TableRow key={stat.id}>
                      <TableCell>{new Date(stat.date).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="font-medium">{stat.carteira}</TableCell>
                      <TableCell>{stat.total}</TableCell>
                      <TableCell className="text-green-600">{stat.presentes}</TableCell>
                      <TableCell className="text-red-600">{stat.faltas}</TableCell>
                      <TableCell>
                        {stat.total > 0 ? ((stat.faltas / stat.total) * 100).toFixed(1) + "%" : "0%"}
                      </TableCell>
                      <TableCell>{stat.turno}</TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditCarteiraStats(stat)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteCarteiraStats(stat.id)}>
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

      <Dialog open={isDadosDiariosDialogOpen} onOpenChange={setIsDadosDiariosDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {editingDailyData !== null ? "Editar Dados Diários" : "Adicionar Dados Diários"}
            </DialogTitle>
            <DialogDescription>
              {editingDailyData !== null
                ? `Atualize os números diários para ${dailyData.secao || (selectedOption === "caixa" ? "Caixa" : "Cobrança")}`
                : `Registre os números diários para ${selectedOption === "caixa" ? "Caixa" : "Cobrança"}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-8 py-4">
            {editingDailyData !== null && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Editando registro da seção: <span className="font-bold">{dailyData.secao}</span>
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-3">
                <Label htmlFor="daily-date" className="text-base font-medium">
                  Data
                </Label>
                <Input
                  id="daily-date"
                  type="date"
                  className="h-11"
                  value={dailyData.date}
                  onChange={(e) => handleDailyDataChange("date", e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="daily-turno" className="text-base font-medium">
                  Turno
                </Label>
                <Select value={dailyData.turno} onValueChange={(value) => handleDailyDataChange("turno", value)}>
                  <SelectTrigger id="daily-turno" className="h-11">
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
              <div className="space-y-3">
                <Label htmlFor="daily-total" className="text-base font-medium">
                  Total
                </Label>
                <Input
                  id="daily-total"
                  type="number"
                  placeholder="0"
                  className="h-11 bg-muted"
                  value={dailyData.total}
                  readOnly
                />
                <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="daily-ativos" className="text-base font-medium">
                  Ativos
                </Label>
                <Input
                  id="daily-ativos"
                  type="number"
                  placeholder="0"
                  className="h-11"
                  value={dailyData.ativos}
                  onChange={(e) => handleDailyDataChange("ativos", Number(e.target.value))}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="daily-ferias" className="text-base font-medium">
                  Férias
                </Label>
                <Input
                  id="daily-ferias"
                  type="number"
                  placeholder="0"
                  className="h-11"
                  value={dailyData.ferias}
                  onChange={(e) => handleDailyDataChange("ferias", Number(e.target.value))}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="daily-afastamento" className="text-base font-medium">
                  Afastamento
                </Label>
                <Input
                  id="daily-afastamento"
                  type="number"
                  placeholder="0"
                  className="h-11"
                  value={dailyData.afastamento}
                  onChange={(e) => handleDailyDataChange("afastamento", Number(e.target.value))}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="daily-desaparecidos" className="text-base font-medium">
                  Desaparecidos
                </Label>
                <Input
                  id="daily-desaparecidos"
                  type="number"
                  placeholder="0"
                  className="h-11"
                  value={dailyData.desaparecidos}
                  onChange={(e) => handleDailyDataChange("desaparecidos", Number(e.target.value))}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="daily-inss" className="text-base font-medium">
                  INSS
                </Label>
                <Input
                  id="daily-inss"
                  type="number"
                  placeholder="0"
                  className="h-11"
                  value={dailyData.inss}
                  onChange={(e) => handleDailyDataChange("inss", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
              <Button variant="outline" className="w-full sm:w-auto bg-transparent" onClick={handleCancelEditDailyData}>
                Cancelar
              </Button>
              <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600" onClick={handleSaveDailyData}>
                {editingDailyData !== null ? "Atualizar" : "Adicionar Dados Diários"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCarteiraStatsDialogOpen} onOpenChange={setIsCarteiraStatsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {editingCarteiraStats !== null
                ? "Editar Estatísticas por Carteira"
                : "Adicionar Estatísticas por Carteira"}
            </DialogTitle>
            <DialogDescription>
              {editingCarteiraStats !== null
                ? "Atualize as estatísticas específicas de cada carteira"
                : "Registre as estatísticas específicas de cada carteira"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-3">
                <Label htmlFor="carteira-stats-date" className="text-base font-medium">
                  Data
                </Label>
                <Input
                  id="carteira-stats-date"
                  type="date"
                  className="h-11"
                  value={carteiraStatsData.date}
                  onChange={(e) => handleCarteiraStatsChange("date", e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="carteira-stats-carteira" className="text-base font-medium">
                  Carteira
                </Label>
                <Select
                  value={carteiraStatsData.carteira}
                  onValueChange={(value) => handleCarteiraStatsChange("carteira", value)}
                >
                  <SelectTrigger id="carteira-stats-carteira" className="h-11">
                    <SelectValue placeholder="Selecione a carteira" />
                  </SelectTrigger>
                  <SelectContent>
                    {carteiras.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Nenhuma carteira cadastrada. Acesse a aba "Capacitação" para adicionar.
                      </div>
                    ) : (
                      carteiras.map((carteira) => (
                        <SelectItem key={carteira.id} value={carteira.name}>
                          {carteira.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="carteira-stats-turno" className="text-base font-medium">
                  Turno
                </Label>
                <Select
                  value={carteiraStatsData.turno}
                  onValueChange={(value) => handleCarteiraStatsChange("turno", value)}
                >
                  <SelectTrigger id="carteira-stats-turno" className="h-11">
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
              <div className="space-y-3">
                <Label htmlFor="carteira-stats-total" className="text-base font-medium">
                  Total
                </Label>
                <Input
                  id="carteira-stats-total"
                  type="number"
                  placeholder="0"
                  className="h-11 bg-muted"
                  value={carteiraStatsData.total}
                  readOnly
                />
                <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="carteira-stats-presentes" className="text-base font-medium">
                  Presentes
                </Label>
                <Input
                  id="carteira-stats-presentes"
                  type="number"
                  placeholder="0"
                  className="h-11"
                  value={carteiraStatsData.presentes}
                  onChange={(e) => handleCarteiraStatsChange("presentes", Number(e.target.value))}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="carteira-stats-faltas" className="text-base font-medium">
                  Faltas
                </Label>
                <Input
                  id="carteira-stats-faltas"
                  type="number"
                  placeholder="0"
                  className="h-11"
                  value={carteiraStatsData.faltas}
                  onChange={(e) => handleCarteiraStatsChange("faltas", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-transparent"
                onClick={handleCancelEditCarteiraStats}
              >
                Cancelar
              </Button>
              <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600" onClick={handleSaveCarteiraStats}>
                {editingCarteiraStats !== null ? "Atualizar" : "Adicionar Estatísticas"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteCarteiraId !== null} onOpenChange={() => setDeleteCarteiraId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta carteira? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCarteira}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteStatsId !== null} onOpenChange={() => setDeleteStatsId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta estatística? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStats}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDadosId !== null} onOpenChange={() => setDeleteDadosId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDados}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
