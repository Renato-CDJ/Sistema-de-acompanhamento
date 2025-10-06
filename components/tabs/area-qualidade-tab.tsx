"use client"
import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import {
  Plus,
  Edit,
  Trash2,
  Users,
  BarChart3,
  List,
  Calendar,
  BookOpen,
  TrendingUp,
  ClipboardCheck,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"
import { useData } from "@/contexts/data-context"
import { useUsers } from "@/contexts/users-context"
import { useAgendas } from "@/contexts/agendas-context"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TeamMember {
  id: number
  userId: string
  nome: string
  cargo: string
  carteiras: string[]
  dataAdmissao: string // Changed from tempoEmpresa to dataAdmissao
  turno: string
  status: "Férias" | "Ativo" | "Desligado" | "Promovido" | "Afastado"
}

interface MonitoringRecord {
  id: number
  memberId: number
  memberName: string
  quantidade: number
  data: string
  dataFim?: string // Optional end date for date ranges
  observacao?: string
}

function calculateTempoEmpresa(dataAdmissao: string): string {
  const admissao = new Date(dataAdmissao)
  const hoje = new Date()

  let anos = hoje.getFullYear() - admissao.getFullYear()
  let meses = hoje.getMonth() - admissao.getMonth()

  if (meses < 0) {
    anos--
    meses += 12
  }

  if (anos === 0 && meses === 0) {
    return "Menos de 1 mês"
  } else if (anos === 0) {
    return `${meses} ${meses === 1 ? "mês" : "meses"}`
  } else if (meses === 0) {
    return `${anos} ${anos === 1 ? "ano" : "anos"}`
  } else {
    return `${anos} ${anos === 1 ? "ano" : "anos"} e ${meses} ${meses === 1 ? "mês" : "meses"}`
  }
}

export function AreaQualidadeTab() {
  const { user } = useAuth()
  const isAdmin = hasPermission(user, "edit")
  const { carteiras, treinamentos, operadores } = useData()
  const { agendas } = useAgendas()
  const { users } = useUsers()
  const { toast } = useToast()

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("areaQualidadeTeam")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [monitoringRecords, setMonitoringRecords] = useState<MonitoringRecord[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("monitoringRecords")
      // </CHANGE> Fixed typo from JSON.JSON.parse to JSON.parse
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const [isMonitoringDialogOpen, setIsMonitoringDialogOpen] = useState(false)
  const [monitoringFormData, setMonitoringFormData] = useState({
    memberId: "",
    quantidade: "",
    data: "",
    dataFim: "",
    observacao: "",
  })

  const [filters, setFilters] = useState({
    memberName: "",
    startDate: "",
    endDate: "",
    carteira: "",
    status: "",
  })

  const [monitoringFilters, setMonitoringFilters] = useState({
    memberName: "",
    startDate: "",
    endDate: "",
  })

  const [formData, setFormData] = useState({
    userId: "",
    nome: "",
    cargo: "",
    carteiras: [] as string[],
    dataAdmissao: "", // Changed from tempoEmpresa to dataAdmissao
    turno: "",
    status: "Ativo" as TeamMember["status"],
  })

  const [activeView, setActiveView] = useState<"list" | "analytics" | "monitoring-report">("list")

  const [showFilters, setShowFilters] = useState(false)
  const [showMonitoringFilters, setShowMonitoringFilters] = useState(false)
  const [deleteMonitoringId, setDeleteMonitoringId] = useState<number | null>(null)

  const saveToLocalStorage = (data: TeamMember[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("areaQualidadeTeam", JSON.stringify(data))
    }
  }

  const saveMonitoringToLocalStorage = (data: MonitoringRecord[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("monitoringRecords", JSON.stringify(data))
    }
  }

  const handleMonitoringSave = () => {
    if (!monitoringFormData.memberId || !monitoringFormData.quantidade || !monitoringFormData.data) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    const member = teamMembers.find((m) => m.id === Number(monitoringFormData.memberId))
    if (!member) return

    const newRecord: MonitoringRecord = {
      id: Date.now(),
      memberId: member.id,
      memberName: member.nome,
      quantidade: Number(monitoringFormData.quantidade),
      data: monitoringFormData.data,
      dataFim: monitoringFormData.dataFim || undefined,
      observacao: monitoringFormData.observacao || undefined,
    }

    const updated = [...monitoringRecords, newRecord]
    setMonitoringRecords(updated)
    saveMonitoringToLocalStorage(updated)

    toast({
      title: "Sucesso",
      description: "Monitorias registradas com sucesso!",
    })

    setIsMonitoringDialogOpen(false)
    setMonitoringFormData({
      memberId: "",
      quantidade: "",
      data: "",
      dataFim: "",
      observacao: "",
    })
  }

  const handleUserSelect = (userId: string) => {
    const selectedUser = users.find((u) => u.id === userId)
    if (selectedUser) {
      setFormData({
        ...formData,
        userId,
        nome: selectedUser.name,
        cargo: selectedUser.cargo || "",
      })
    }
  }

  const handleCarteirasChange = (value: string) => {
    if (value === "Geral") {
      setFormData({ ...formData, carteiras: ["Geral"] })
    } else {
      const current = formData.carteiras.filter((c) => c !== "Geral")
      if (current.includes(value)) {
        setFormData({ ...formData, carteiras: current.filter((c) => c !== value) })
      } else {
        setFormData({ ...formData, carteiras: [...current, value] })
      }
    }
  }

  const handleSave = () => {
    if (
      !formData.nome ||
      !formData.cargo ||
      formData.carteiras.length === 0 ||
      !formData.dataAdmissao || // Changed validation field
      !formData.turno
    ) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    if (editingMember) {
      const updated = teamMembers.map((m) => (m.id === editingMember.id ? { ...formData, id: editingMember.id } : m))
      setTeamMembers(updated)
      saveToLocalStorage(updated)
      toast({
        title: "Sucesso",
        description: "Membro da equipe atualizado com sucesso!",
      })
    } else {
      const newMember = {
        ...formData,
        id: Date.now(),
      }
      const updated = [...teamMembers, newMember]
      setTeamMembers(updated)
      saveToLocalStorage(updated)
      toast({
        title: "Sucesso",
        description: "Membro da equipe adicionado com sucesso!",
      })
    }

    handleCloseDialog()
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      userId: member.userId,
      nome: member.nome,
      cargo: member.cargo,
      carteiras: member.carteiras,
      dataAdmissao: member.dataAdmissao, // Changed field
      turno: member.turno,
      status: member.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId !== null) {
      const updated = teamMembers.filter((m) => m.id !== deleteId)
      setTeamMembers(updated)
      saveToLocalStorage(updated)
      toast({
        title: "Sucesso",
        description: "Membro da equipe removido com sucesso!",
      })
      setDeleteId(null)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingMember(null)
    setFormData({
      userId: "",
      nome: "",
      cargo: "",
      carteiras: [],
      dataAdmissao: "", // Changed field
      turno: "",
      status: "Ativo",
    })
  }

  const getStatusColor = (status: TeamMember["status"]) => {
    switch (status) {
      case "Ativo":
        return "bg-green-500"
      case "Férias":
        return "bg-blue-500"
      case "Desligado":
        return "bg-red-500"
      case "Promovido":
        return "bg-purple-500"
      case "Afastado":
        return "bg-amber-500"
      default:
        return "bg-gray-500"
    }
  }

  const memberAnalytics = useMemo(() => {
    return teamMembers.map((member) => {
      const memberTreinamentos = treinamentos.filter((t) => t.responsavel === member.nome)
      const treinamentosAplicados = memberTreinamentos.filter((t) => t.status === "Aplicado").length
      const treinamentosPendentes = memberTreinamentos.filter((t) => t.status === "Pendente").length

      const operadoresTreinados = memberTreinamentos
        .filter((t) => t.status === "Aplicado")
        .reduce((sum, t) => sum + t.quantidade, 0)

      const memberAgendas = agendas.filter((a) => a.participants.includes(member.userId))
      const totalReunioes = memberAgendas.length

      const memberMonitorings = monitoringRecords.filter((m) => m.memberId === member.id)
      const totalMonitorias = memberMonitorings.reduce((sum, m) => sum + m.quantidade, 0)

      return {
        ...member,
        treinamentosAplicados,
        treinamentosPendentes,
        operadoresTreinados,
        totalReunioes,
        totalMonitorias,
      }
    })
  }, [teamMembers, treinamentos, agendas, monitoringRecords])

  const filteredAnalytics = useMemo(() => {
    return memberAnalytics.filter((member) => {
      if (filters.memberName && !member.nome.toLowerCase().includes(filters.memberName.toLowerCase())) {
        return false
      }
      if (filters.carteira && !member.carteiras.includes(filters.carteira)) {
        return false
      }
      if (filters.status && member.status !== filters.status) {
        return false
      }
      if (filters.startDate) {
        const memberDate = new Date(member.dataAdmissao)
        const filterDate = new Date(filters.startDate)
        if (memberDate < filterDate) return false
      }
      if (filters.endDate) {
        const memberDate = new Date(member.dataAdmissao)
        const filterDate = new Date(filters.endDate)
        if (memberDate > filterDate) return false
      }
      return true
    })
  }, [memberAnalytics, filters])

  const summaryStats = useMemo(() => {
    const totalTreinamentosAplicados = filteredAnalytics.reduce((sum, m) => sum + m.treinamentosAplicados, 0)
    const totalTreinamentosPendentes = filteredAnalytics.reduce((sum, m) => sum + m.treinamentosPendentes, 0)
    const totalReunioes = filteredAnalytics.reduce((sum, m) => sum + m.totalReunioes, 0)
    const totalMonitorias = filteredAnalytics.reduce((sum, m) => sum + m.totalMonitorias, 0)

    return {
      totalTreinamentosAplicados,
      totalTreinamentosPendentes,
      totalReunioes,
      totalMembros: teamMembers.length,
      totalMonitorias,
    }
  }, [filteredAnalytics, teamMembers])

  const trainingSubjectStats = useMemo(() => {
    const subjectMap = new Map<string, { assunto: string; members: Map<string, number> }>()

    treinamentos.forEach((treinamento) => {
      if (treinamento.status === "Aplicado" && treinamento.responsavel) {
        if (!subjectMap.has(treinamento.assunto)) {
          subjectMap.set(treinamento.assunto, {
            assunto: treinamento.assunto,
            members: new Map(),
          })
        }

        const subjectData = subjectMap.get(treinamento.assunto)!
        const currentCount = subjectData.members.get(treinamento.responsavel) || 0
        subjectData.members.set(treinamento.responsavel, currentCount + treinamento.quantidade)
      }
    })

    return Array.from(subjectMap.values()).map((subject) => ({
      assunto: subject.assunto,
      members: Array.from(subject.members.entries()).map(([name, count]) => ({
        name,
        count,
      })),
      total: Array.from(subject.members.values()).reduce((sum, count) => sum + count, 0),
    }))
  }, [treinamentos])

  const COLORS = [
    "#10b981", // green
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange
    "#06b6d4", // cyan
    "#84cc16", // lime
  ]

  const getUserColor = (userName: string) => {
    let hash = 0
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash)
    }
    return COLORS[Math.abs(hash) % COLORS.length]
  }
  // </CHANGE>

  const chartData = useMemo(() => {
    const userActivityData = filteredAnalytics.map((m) => ({
      name: m.nome,
      value: m.treinamentosAplicados,
      treinamentos: m.treinamentosAplicados,
      color: getUserColor(m.nome),
    }))

    const userMonitoringData = filteredAnalytics
      .filter((m) => m.totalMonitorias > 0)
      .map((m) => ({
        name: m.nome,
        value: m.totalMonitorias,
        color: getUserColor(m.nome),
      }))

    return { userActivityData, userMonitoringData }
  }, [filteredAnalytics])

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${value} (${(percent * 100).toFixed(1)}%)`}
      </text>
    )
  }

  const filteredMonitoringRecords = useMemo(() => {
    return monitoringRecords.filter((record) => {
      if (
        monitoringFilters.memberName &&
        !record.memberName.toLowerCase().includes(monitoringFilters.memberName.toLowerCase())
      ) {
        return false
      }
      if (monitoringFilters.startDate) {
        const recordDate = new Date(record.data)
        const filterDate = new Date(monitoringFilters.startDate)
        if (recordDate < filterDate) return false
      }
      if (monitoringFilters.endDate) {
        const recordDate = record.dataFim ? new Date(record.dataFim) : new Date(record.data)
        const filterDate = new Date(monitoringFilters.endDate)
        if (recordDate > filterDate) return false
      }
      return true
    })
  }, [monitoringRecords, monitoringFilters])

  const handleDeleteMonitoring = (id: number) => {
    setDeleteMonitoringId(id)
  }

  const confirmDeleteMonitoring = () => {
    if (deleteMonitoringId !== null) {
      const updated = monitoringRecords.filter((m) => m.id !== deleteMonitoringId)
      setMonitoringRecords(updated)
      saveMonitoringToLocalStorage(updated)
      toast({
        title: "Sucesso",
        description: "Registro de monitoria removido com sucesso!",
      })
      setDeleteMonitoringId(null)
    }
  }

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate).toLocaleDateString("pt-BR")
    if (endDate) {
      const end = new Date(endDate).toLocaleDateString("pt-BR")
      return `${start} - ${end}`
    }
    return start
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "list" | "analytics" | "monitoring-report")}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analítico
            </TabsTrigger>
            <TabsTrigger value="monitoring-report" className="gap-2">
              <FileText className="h-4 w-4" />
              Relatório de Monitoria
            </TabsTrigger>
          </TabsList>
          {isAdmin && activeView === "list" && (
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Membro
            </Button>
          )}
          {isAdmin && (activeView === "analytics" || activeView === "monitoring-report") && (
            <Button onClick={() => setIsMonitoringDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Monitorias
            </Button>
          )}
        </div>

        <TabsContent value="list" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Área Qualidade - Quadro da Equipe
                  </CardTitle>
                  <CardDescription>
                    Gerencie os membros da equipe de qualidade com suas carteiras e status
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum membro cadastrado</p>
                  <p className="text-sm">Use o botão "Adicionar Membro" para começar</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Carteiras</TableHead>
                      <TableHead>Tempo de Empresa</TableHead>
                      <TableHead>Turno</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead>Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.nome}</TableCell>
                        <TableCell>{member.cargo}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {member.carteiras.map((carteira, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {carteira}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{calculateTempoEmpresa(member.dataAdmissao)}</TableCell>
                        <TableCell>{member.turno}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(member.status)}>{member.status}</Badge>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(member)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(member.id)}>
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
        </TabsContent>

        <TabsContent value="analytics" className="mt-0 space-y-6">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showFilters ? "Ocultar Filtros" : "Exibir Filtros"}
            </Button>
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-2">
                    <Label htmlFor="filter-name">Nome</Label>
                    <Input
                      id="filter-name"
                      placeholder="Buscar por nome"
                      value={filters.memberName}
                      onChange={(e) => setFilters({ ...filters, memberName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-carteira">Carteira</Label>
                    <Select
                      value={filters.carteira}
                      onValueChange={(value) => setFilters({ ...filters, carteira: value === "Todas" ? "" : value })}
                    >
                      <SelectTrigger id="filter-carteira">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todas">Todas</SelectItem>
                        <SelectItem value="Geral">Geral</SelectItem>
                        {carteiras.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-status">Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => setFilters({ ...filters, status: value === "Todos" ? "" : value })}
                    >
                      <SelectTrigger id="filter-status">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos">Todos</SelectItem>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Férias">Férias</SelectItem>
                        <SelectItem value="Afastado">Afastado</SelectItem>
                        <SelectItem value="Desligado">Desligado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-start">Data Início</Label>
                    <Input
                      id="filter-start"
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-end">Data Fim</Label>
                    <Input
                      id="filter-end"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ memberName: "", startDate: "", endDate: "", carteira: "", status: "" })}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Treinamentos Aplicados</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.totalTreinamentosAplicados}</div>
                <p className="text-xs text-muted-foreground">Total pela equipe</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Treinamentos Pendentes</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.totalTreinamentosPendentes}</div>
                <p className="text-xs text-muted-foreground">Aguardando aplicação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monitorias Realizadas</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.totalMonitorias}</div>
                <p className="text-xs text-muted-foreground">Total registrado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Reuniões</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.totalReunioes}</div>
                <p className="text-xs text-muted-foreground">Agendadas pela equipe</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Estatísticas por Assunto de Capacitação
              </CardTitle>
              <CardDescription>Desempenho por assunto de treinamento e responsável</CardDescription>
            </CardHeader>
            <CardContent>
              {trainingSubjectStats.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum treinamento aplicado</p>
                  <p className="text-sm">Os dados aparecerão quando houver treinamentos concluídos</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trainingSubjectStats.map((subject, idx) => {
                    const performanceColor =
                      subject.total >= 50
                        ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                        : subject.total >= 30
                          ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                          : subject.total >= 15
                            ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20"
                            : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"

                    return (
                      <Card key={idx} className={`border-2 ${performanceColor}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              <CardTitle className="text-base">{subject.assunto}</CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Total Treinados</span>
                            <span className="text-3xl font-bold text-primary">{subject.total}</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                subject.total >= 50
                                  ? "bg-green-600"
                                  : subject.total >= 30
                                    ? "bg-blue-600"
                                    : subject.total >= 15
                                      ? "bg-amber-600"
                                      : "bg-red-600"
                              }`}
                              style={{ width: `${Math.min((subject.total / 100) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="space-y-2 pt-2">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Responsáveis:</p>
                            {subject.members.map((member, memberIdx) => (
                              <div
                                key={memberIdx}
                                className="flex items-center justify-between p-2 rounded-lg bg-background/50 border"
                              >
                                <div className="flex items-center gap-2">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm font-medium">{member.name}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {member.count}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Distribuição de Atividades por Usuário</CardTitle>
                <CardDescription className="text-base">
                  Percentual de treinamentos aplicados por membro da equipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.userActivityData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum dado disponível</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={chartData.userActivityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {chartData.userActivityData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            const total = chartData.userActivityData.reduce((sum, item) => sum + item.value, 0)
                            const percentage = ((data.value / total) * 100).toFixed(1)
                            return (
                              <div className="bg-background/95 backdrop-blur-sm border-2 rounded-lg p-4 shadow-xl">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                                  <p className="font-bold text-base">{data.name}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">
                                    Treinamentos: <span className="text-primary font-bold">{data.treinamentos}</span>
                                  </p>
                                  <p className="text-sm font-medium">
                                    Percentual: <span className="text-primary font-bold">{percentage}%</span>
                                  </p>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ paddingTop: "20px" }}
                        formatter={(value, entry: any) => {
                          const total = chartData.userActivityData.reduce((sum, item) => sum + item.value, 0)
                          const percentage = ((entry.payload.value / total) * 100).toFixed(1)
                          return (
                            <span className="text-sm font-medium">
                              {entry.payload.name}: <span className="font-bold">{entry.payload.value}</span> (
                              {percentage}%)
                            </span>
                          )
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Monitorias Realizadas por Usuário</CardTitle>
                <CardDescription className="text-base">
                  Quantidade e percentual de monitorias por membro da equipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.userMonitoringData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma monitoria registrada</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={chartData.userMonitoringData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {chartData.userMonitoringData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            const total = chartData.userMonitoringData.reduce((sum, item) => sum + item.value, 0)
                            const percentage = ((data.value / total) * 100).toFixed(1)
                            return (
                              <div className="bg-background/95 backdrop-blur-sm border-2 rounded-lg p-4 shadow-xl">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                                  <p className="font-bold text-base">{data.name}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">
                                    Monitorias: <span className="text-primary font-bold">{data.value}</span>
                                  </p>
                                  <p className="text-sm font-medium">
                                    Percentual: <span className="text-primary font-bold">{percentage}%</span>
                                  </p>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ paddingTop: "20px" }}
                        formatter={(value, entry: any) => {
                          const total = chartData.userMonitoringData.reduce((sum, item) => sum + item.value, 0)
                          const percentage = ((entry.payload.value / total) * 100).toFixed(1)
                          return (
                            <span className="text-sm font-medium">
                              {entry.payload.name}: <span className="font-bold">{entry.payload.value}</span> (
                              {percentage}%)
                            </span>
                          )
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            {/* </CHANGE> */}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analítico por Membro
              </CardTitle>
              <CardDescription>Desempenho detalhado de cada membro da equipe de qualidade</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAnalytics.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum dado disponível</p>
                  <p className="text-sm">Adicione membros à equipe ou ajuste os filtros</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead className="text-center">Treinamentos Aplicados</TableHead>
                      <TableHead className="text-center">Treinamentos Pendentes</TableHead>
                      <TableHead className="text-center">Monitorias</TableHead>
                      <TableHead className="text-center">Operadores Treinados</TableHead>
                      <TableHead className="text-center">Reuniões</TableHead>
                      <TableHead>Carteiras</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnalytics.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.nome}</TableCell>
                        <TableCell>{member.cargo}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default" className="bg-green-600">
                            {member.treinamentosAplicados}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default" className="bg-amber-600">
                            {member.treinamentosPendentes}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default" className="bg-blue-600">
                            {member.totalMonitorias}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{member.operadoresTreinados}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{member.totalReunioes}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {member.carteiras.map((carteira, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {carteira}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(member.status)}>{member.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring-report" className="mt-0 space-y-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setShowMonitoringFilters(!showMonitoringFilters)}
              className="gap-2"
            >
              {showMonitoringFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showMonitoringFilters ? "Ocultar Filtros" : "Exibir Filtros"}
            </Button>
          </div>

          {showMonitoringFilters && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="monitoring-filter-name">Nome do Membro</Label>
                    <Input
                      id="monitoring-filter-name"
                      placeholder="Buscar por nome"
                      value={monitoringFilters.memberName}
                      onChange={(e) => setMonitoringFilters({ ...monitoringFilters, memberName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monitoring-filter-start">Data Início</Label>
                    <Input
                      id="monitoring-filter-start"
                      type="date"
                      value={monitoringFilters.startDate}
                      onChange={(e) => setMonitoringFilters({ ...monitoringFilters, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monitoring-filter-end">Data Fim</Label>
                    <Input
                      id="monitoring-filter-end"
                      type="date"
                      value={monitoringFilters.endDate}
                      onChange={(e) => setMonitoringFilters({ ...monitoringFilters, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setMonitoringFilters({ memberName: "", startDate: "", endDate: "" })}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Relatório de Monitoria
              </CardTitle>
              <CardDescription>Visualize todos os registros de monitorias realizadas pela equipe</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredMonitoringRecords.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhuma monitoria registrada</p>
                  <p className="text-sm">Use o botão "Adicionar Monitorias" para começar</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membro</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Observação</TableHead>
                      {isAdmin && <TableHead className="text-center">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMonitoringRecords
                      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                      .map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.memberName}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default" className="bg-blue-600">
                              {record.quantidade}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDateRange(record.data, record.dataFim)}</TableCell>
                          <TableCell className="max-w-md">
                            {record.observacao ? (
                              <span className="text-sm">{record.observacao}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground italic">Sem observação</span>
                            )}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteMonitoring(record.id)}
                                className="gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resumo por Membro
              </CardTitle>
              <CardDescription>Total de monitorias realizadas por cada membro da equipe</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredMonitoringRecords.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum dado disponível</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membro</TableHead>
                      <TableHead className="text-center">Total de Monitorias</TableHead>
                      <TableHead className="text-center">Registros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(
                      filteredMonitoringRecords.reduce(
                        (acc, record) => {
                          if (!acc[record.memberName]) {
                            acc[record.memberName] = { total: 0, count: 0 }
                          }
                          acc[record.memberName].total += record.quantidade
                          acc[record.memberName].count += 1
                          return acc
                        },
                        {} as Record<string, { total: number; count: number }>,
                      ),
                    )
                      .sort(([, a], [, b]) => b.total - a.total)
                      .map(([memberName, data]) => (
                        <TableRow key={memberName}>
                          <TableCell className="font-medium">{memberName}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default" className="bg-green-600 text-lg px-4 py-1">
                              {data.total}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{data.count}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Editar Membro" : "Adicionar Membro"}</DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Atualize as informações do membro da equipe"
                : "Adicione um novo membro à equipe de qualidade"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="user-select">Usuário</Label>
              <Select value={formData.userId} onValueChange={handleUserSelect}>
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} - {u.cargo || "Sem cargo"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ex: Analista de Qualidade"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Carteiras</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={formData.carteiras.includes("Geral") ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCarteirasChange("Geral")}
                >
                  Geral
                </Button>
                {carteiras.map((carteira) => (
                  <Button
                    key={carteira.id}
                    type="button"
                    variant={formData.carteiras.includes(carteira.name) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCarteirasChange(carteira.name)}
                    disabled={formData.carteiras.includes("Geral")}
                  >
                    {carteira.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="data-admissao">Data de Admissão</Label>
                <Input
                  id="data-admissao"
                  type="date"
                  value={formData.dataAdmissao}
                  onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="turno">Turno</Label>
                <Select value={formData.turno} onValueChange={(value) => setFormData({ ...formData, turno: value })}>
                  <SelectTrigger id="turno">
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manhã">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Integral">Integral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TeamMember["status"]) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Férias">Férias</SelectItem>
                  <SelectItem value="Desligado">Desligado</SelectItem>
                  <SelectItem value="Promovido">Promovido</SelectItem>
                  <SelectItem value="Afastado">Afastado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>{editingMember ? "Atualizar" : "Adicionar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMonitoringDialogOpen} onOpenChange={setIsMonitoringDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Monitorias</DialogTitle>
            <DialogDescription>Registre a quantidade de monitorias realizadas por um membro</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="monitoring-member">Membro</Label>
              <Select
                value={monitoringFormData.memberId}
                onValueChange={(value) => setMonitoringFormData({ ...monitoringFormData, memberId: value })}
              >
                <SelectTrigger id="monitoring-member">
                  <SelectValue placeholder="Selecione um membro" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers
                    .filter((m) => m.status === "Ativo")
                    .map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monitoring-quantidade">Quantidade de Monitorias</Label>
              <Input
                id="monitoring-quantidade"
                type="number"
                min="1"
                value={monitoringFormData.quantidade}
                onChange={(e) => setMonitoringFormData({ ...monitoringFormData, quantidade: e.target.value })}
                placeholder="Ex: 5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monitoring-data">Data (ou Data Início)</Label>
                <Input
                  id="monitoring-data"
                  type="date"
                  value={monitoringFormData.data}
                  onChange={(e) => setMonitoringFormData({ ...monitoringFormData, data: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monitoring-data-fim">Data Fim (opcional)</Label>
                <Input
                  id="monitoring-data-fim"
                  type="date"
                  value={monitoringFormData.dataFim}
                  onChange={(e) => setMonitoringFormData({ ...monitoringFormData, dataFim: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monitoring-observacao">Observação (opcional)</Label>
              <Input
                id="monitoring-observacao"
                value={monitoringFormData.observacao}
                onChange={(e) => setMonitoringFormData({ ...monitoringFormData, observacao: e.target.value })}
                placeholder="Detalhes adicionais"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsMonitoringDialogOpen(false)
                  setMonitoringFormData({ memberId: "", quantidade: "", data: "", dataFim: "", observacao: "" })
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleMonitoringSave}>Adicionar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este membro da equipe? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteMonitoringId !== null} onOpenChange={() => setDeleteMonitoringId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este registro de monitoria? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMonitoring}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
