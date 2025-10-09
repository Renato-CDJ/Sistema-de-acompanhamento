"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Plus,
  Download,
  Upload,
  Lock,
  Unlock,
  Search,
  Maximize2,
  Minimize2,
  EyeOff,
  Eye,
  Edit2,
  Users,
  Trash2,
  BarChart3,
  TrendingUp,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"
import { useData } from "@/contexts/data-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface AbsEntry {
  id: number
  matricula: string
  operador: string
  login: string
  supervisao: string
  coordenador: string
  turno: string
  admissao: string
  tempoEmpresa: number
  terminoAvisoPrevio?: string
  absences: Record<string, string>
  domingo: string
  observacao: string
}

interface Supervisor {
  id: number
  nome: string
}

interface Coordenador {
  id: number
  nome: string
}

const statusOptions = [
  {
    value: "",
    label: "Presente",
    color: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600",
  },
  {
    value: "FÉRIAS",
    label: "Férias",
    color: "bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-white border border-blue-300 dark:border-blue-700",
  },
  {
    value: "FOLGA",
    label: "Folga",
    color: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600",
  },
  {
    value: "AFASTAMENTO",
    label: "Afastamento",
    color:
      "bg-yellow-100 dark:bg-yellow-900 text-gray-900 dark:text-white border border-yellow-300 dark:border-yellow-700",
  },
  {
    value: "COMUNICAÇÃO",
    label: "Comunicação",
    color:
      "bg-purple-100 dark:bg-purple-900 text-gray-900 dark:text-white border border-purple-300 dark:border-purple-700",
  },
  {
    value: "DESLIGAMENTO",
    label: "Desligamento",
    color: "bg-pink-100 dark:bg-pink-900 text-gray-900 dark:text-white border border-pink-300 dark:border-pink-700",
  },
  {
    value: "ATESTADO",
    label: "Atestado",
    color: "bg-green-100 dark:bg-green-900 text-gray-900 dark:text-white border border-green-300 dark:border-green-700",
  },
]

export function AbsTab() {
  const { user } = useAuth()
  const isAdmin = hasPermission(user, "edit")
  const { carteiras } = useData()
  const { toast } = useToast()

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  const [freezeUntilColumn, setFreezeUntilColumn] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLegendVisible, setIsLegendVisible] = useState(true)

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<AbsEntry | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<AbsEntry>>({})

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingEntry, setDeletingEntry] = useState<AbsEntry | null>(null)

  const [supervisores, setSupervisores] = useState<Supervisor[]>([
    { id: 1, nome: "THAIS SILVA" },
    { id: 2, nome: "TATIANA" },
    { id: 3, nome: "RAFAELA" },
    { id: 4, nome: "ISABELA RIBEIRO" },
    { id: 5, nome: "DRIANA APARECIDA" },
    { id: 6, nome: "GABRIELA" },
  ])

  const [coordenadores, setCoordenadores] = useState<Coordenador[]>([
    { id: 1, nome: "DENISE MORAES" },
    { id: 2, nome: "CEZAR AUGUSTO" },
    { id: 3, nome: "LARISSA BORGES" },
  ])

  const [isSupervisorDialogOpen, setIsSupervisorDialogOpen] = useState(false)
  const [isCoordenadorDialogOpen, setIsCoordenadorDialogOpen] = useState(false)
  const [newSupervisorName, setNewSupervisorName] = useState("")
  const [newCoordenadorName, setNewCoordenadorName] = useState("")
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null)
  const [editingCoordenador, setEditingCoordenador] = useState<Coordenador | null>(null)

  const [absData, setAbsData] = useState<AbsEntry[]>([
    {
      id: 1,
      matricula: "301434",
      operador: "SABRINA NUNES DOS GUERREIROS",
      login: "SABMADEIROS",
      supervisao: "THAIS SILVA",
      coordenador: "DENISE MORAES",
      turno: "MANHÃ",
      admissao: "24/1/2020",
      tempoEmpresa: 1796,
      absences: {},
      domingo: "DOMINGO",
      observacao: "P",
    },
    {
      id: 2,
      matricula: "301435",
      operador: "FABIOLLA BUGADA",
      login: "FBUGADA",
      supervisao: "TATIANA",
      coordenador: "DENISE MORAES",
      turno: "MANHÃ",
      admissao: "9/11/2020",
      tempoEmpresa: 1796,
      absences: {
        "2025-01-01": "FÉRIAS",
        "2025-01-02": "FÉRIAS",
        "2025-01-03": "FÉRIAS",
      },
      domingo: "DOMINGO",
      observacao: "P",
    },
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newEntryData, setNewEntryData] = useState<Partial<AbsEntry>>({
    turno: "MANHÃ",
    domingo: "DOMINGO",
    observacao: "P",
  })

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null)

  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false)

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)

  const handleAddSupervisor = () => {
    if (!newSupervisorName.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome do supervisor.",
        variant: "destructive",
      })
      return
    }

    const newId = Math.max(...supervisores.map((s) => s.id), 0) + 1
    setSupervisores([...supervisores, { id: newId, nome: newSupervisorName.trim().toUpperCase() }])
    setNewSupervisorName("")
    toast({
      title: "Supervisor adicionado",
      description: "O supervisor foi adicionado com sucesso.",
    })
  }

  const handleEditSupervisor = (supervisor: Supervisor) => {
    setEditingSupervisor(supervisor)
    setNewSupervisorName(supervisor.nome)
  }

  const handleSaveSupervisor = () => {
    if (!editingSupervisor || !newSupervisorName.trim()) return

    setSupervisores(
      supervisores.map((s) =>
        s.id === editingSupervisor.id ? { ...s, nome: newSupervisorName.trim().toUpperCase() } : s,
      ),
    )
    setEditingSupervisor(null)
    setNewSupervisorName("")
    toast({
      title: "Supervisor atualizado",
      description: "O supervisor foi atualizado com sucesso.",
    })
  }

  const handleDeleteSupervisor = (id: number) => {
    setSupervisores(supervisores.filter((s) => s.id !== id))
    toast({
      title: "Supervisor removido",
      description: "O supervisor foi removido com sucesso.",
    })
  }

  const handleAddCoordenador = () => {
    if (!newCoordenadorName.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome do coordenador.",
        variant: "destructive",
      })
      return
    }

    const newId = Math.max(...coordenadores.map((c) => c.id), 0) + 1
    setCoordenadores([...coordenadores, { id: newId, nome: newCoordenadorName.trim().toUpperCase() }])
    setNewCoordenadorName("")
    toast({
      title: "Coordenador adicionado",
      description: "O coordenador foi adicionado com sucesso.",
    })
  }

  const handleEditCoordenador = (coordenador: Coordenador) => {
    setEditingCoordenador(coordenador)
    setNewCoordenadorName(coordenador.nome)
  }

  const handleSaveCoordenador = () => {
    if (!editingCoordenador || !newCoordenadorName.trim()) return

    setCoordenadores(
      coordenadores.map((c) =>
        c.id === editingCoordenador.id ? { ...c, nome: newCoordenadorName.trim().toUpperCase() } : c,
      ),
    )
    setEditingCoordenador(null)
    setNewCoordenadorName("")
    toast({
      title: "Coordenador atualizado",
      description: "O coordenador foi atualizado com sucesso.",
    })
  }

  const handleDeleteCoordenador = (id: number) => {
    setCoordenadores(coordenadores.filter((c) => c.id !== id))
    toast({
      title: "Coordenador removido",
      description: "O coordenador foi removido com sucesso.",
    })
  }

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return absData

    const query = searchQuery.toLowerCase()
    return absData.filter(
      (entry) =>
        entry.matricula.toLowerCase().includes(query) ||
        entry.operador.toLowerCase().includes(query) ||
        entry.login.toLowerCase().includes(query) ||
        entry.supervisao.toLowerCase().includes(query) ||
        entry.coordenador.toLowerCase().includes(query) ||
        entry.turno.toLowerCase().includes(query),
    )
  }, [absData, searchQuery])

  const daysInMonth = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number)
    const date = new Date(year, month - 1, 1)
    const days: { date: string; day: number; weekday: string; isSunday: boolean }[] = []

    while (date.getMonth() === month - 1) {
      const dateStr = date.toISOString().split("T")[0]
      const weekdays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]
      const dayOfWeek = date.getDay()
      days.push({
        date: dateStr,
        day: date.getDate(),
        weekday: weekdays[dayOfWeek],
        isSunday: dayOfWeek === 0,
      })
      date.setDate(date.getDate() + 1)
    }

    return days
  }, [selectedMonth])

  const handleCellClick = (entryId: number, date: string, isSunday: boolean) => {
    if (!isAdmin) return
    if (isSunday) return
    setSelectedEntryId(entryId)
    setSelectedDate(date)
    setIsStatusDialogOpen(true)
  }

  const handleStatusChange = (status: string) => {
    if (selectedEntryId === null || selectedDate === null) return

    setAbsData((prev) =>
      prev.map((entry) => {
        if (entry.id === selectedEntryId) {
          const newAbsences = { ...entry.absences }
          if (status === "") {
            delete newAbsences[selectedDate]
          } else {
            newAbsences[selectedDate] = status
          }
          return { ...entry, absences: newAbsences }
        }
        return entry
      }),
    )

    setIsStatusDialogOpen(false)
    setSelectedEntryId(null)
    setSelectedDate(null)

    toast({
      title: "Status atualizado",
      description: "O status de ausência foi atualizado com sucesso.",
    })
  }

  const handleEditEntry = (entry: AbsEntry) => {
    setEditingEntry(entry)
    setEditFormData({
      matricula: entry.matricula,
      operador: entry.operador,
      login: entry.login,
      supervisao: entry.supervisao,
      coordenador: entry.coordenador,
      turno: entry.turno,
      admissao: entry.admissao,
      tempoEmpresa: entry.tempoEmpresa,
      terminoAvisoPrevio: entry.terminoAvisoPrevio,
      domingo: entry.domingo,
      observacao: entry.observacao,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingEntry) return

    setAbsData((prev) =>
      prev.map((entry) => {
        if (entry.id === editingEntry.id) {
          return { ...entry, ...editFormData }
        }
        return entry
      }),
    )

    setIsEditDialogOpen(false)
    setEditingEntry(null)
    setEditFormData({})

    toast({
      title: "Informações atualizadas",
      description: "Os dados do operador foram atualizados com sucesso.",
    })
  }

  const handleDeleteEntry = (entry: AbsEntry) => {
    setDeletingEntry(entry)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteEntry = () => {
    if (!deletingEntry) return

    setAbsData((prev) => prev.filter((entry) => entry.id !== deletingEntry.id))
    setIsDeleteDialogOpen(false)
    setDeletingEntry(null)

    toast({
      title: "Operador excluído",
      description: "O operador foi removido do controle de ausências.",
    })
  }

  const handleAddEntry = () => {
    if (!newEntryData.operador || !newEntryData.matricula) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos o nome do operador e matrícula.",
        variant: "destructive",
      })
      return
    }

    const newId = Math.max(...absData.map((e) => e.id), 0) + 1
    const newEntry: AbsEntry = {
      id: newId,
      matricula: newEntryData.matricula || "",
      operador: newEntryData.operador || "",
      login: newEntryData.login || "",
      supervisao: newEntryData.supervisao || "",
      coordenador: newEntryData.coordenador || "",
      turno: newEntryData.turno || "MANHÃ",
      admissao: newEntryData.admissao || "",
      tempoEmpresa: newEntryData.tempoEmpresa || 0,
      terminoAvisoPrevio: newEntryData.terminoAvisoPrevio,
      absences: {},
      domingo: newEntryData.domingo || "DOMINGO",
      observacao: newEntryData.observacao || "P",
    }

    setAbsData((prev) => [...prev, newEntry])
    setIsAddDialogOpen(false)
    setNewEntryData({
      turno: "MANHÃ",
      domingo: "DOMINGO",
      observacao: "P",
    })

    toast({
      title: "Operador adicionado",
      description: "O operador foi adicionado com sucesso ao controle de ausências.",
    })
  }

  const handleExport = () => {
    const csvContent = [
      [
        "Matrícula",
        "Operador",
        "Login",
        "Supervisão",
        "Coordenador",
        "Turno",
        "Admissão",
        "Tempo Empresa",
        "Término Aviso",
        ...daysInMonth.map((d) => `${d.day}/${selectedMonth.split("-")[1]}`),
        "Domingo",
        "Obs",
      ].join(","),
      ...absData.map((entry) =>
        [
          entry.matricula,
          entry.operador,
          entry.login,
          entry.supervisao,
          entry.coordenador,
          entry.turno,
          entry.admissao,
          entry.tempoEmpresa,
          entry.terminoAvisoPrevio || "",
          ...daysInMonth.map((d) => (d.isSunday ? "DOMINGO" : entry.absences[d.date] || "P")),
          entry.domingo,
          entry.observacao,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `abs_${selectedMonth}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Exportado com sucesso",
      description: "O arquivo CSV foi baixado.",
    })
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n")
        const headers = lines[0].split(",")

        const importedData: AbsEntry[] = []
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue

          const values = lines[i].split(",")
          const absences: Record<string, string> = {}

          daysInMonth.forEach((day, idx) => {
            const statusValue = values[9 + idx]?.trim()
            if (statusValue && statusValue !== "P" && statusValue !== "DOMINGO") {
              absences[day.date] = statusValue
            }
          })

          const newEntry: AbsEntry = {
            id: importedData.length + 1,
            matricula: values[0]?.trim() || "",
            operador: values[1]?.trim() || "",
            login: values[2]?.trim() || "",
            supervisao: values[3]?.trim() || "",
            coordenador: values[4]?.trim() || "",
            turno: values[5]?.trim() || "MANHÃ",
            admissao: values[6]?.trim() || "",
            tempoEmpresa: Number(values[7]) || 0,
            terminoAvisoPrevio: values[8]?.trim() || undefined,
            absences,
            domingo: values[9 + daysInMonth.length]?.trim() || "DOMINGO",
            observacao: values[9 + daysInMonth.length + 1]?.trim() || "P",
          }

          importedData.push(newEntry)
        }

        setAbsData(importedData)
        toast({
          title: "Importado com sucesso",
          description: `${importedData.length} operadores foram importados.`,
        })
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "Não foi possível importar o arquivo. Verifique o formato.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
    event.target.value = ""
  }

  const getCellColor = (status?: string) => {
    const option = statusOptions.find((opt) => opt.value === status)
    return option?.color || "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600"
  }

  const statistics = useMemo(() => {
    const totalOperators = absData.length
    const totalDays = daysInMonth.filter((d) => !d.isSunday).length
    const totalPossibleDays = totalOperators * totalDays

    const statusCounts: Record<string, number> = {
      FÉRIAS: 0,
      FOLGA: 0,
      AFASTAMENTO: 0,
      COMUNICAÇÃO: 0,
      DESLIGAMENTO: 0,
      ATESTADO: 0,
      PRESENTE: 0,
    }

    absData.forEach((entry) => {
      daysInMonth.forEach((day) => {
        if (day.isSunday) return
        const status = entry.absences[day.date]
        if (status) {
          statusCounts[status] = (statusCounts[status] || 0) + 1
        } else {
          statusCounts["PRESENTE"]++
        }
      })
    })

    const totalAbsences = Object.entries(statusCounts)
      .filter(([key]) => key !== "PRESENTE")
      .reduce((sum, [, count]) => sum + count, 0)

    return {
      totalOperators,
      totalDays,
      totalPossibleDays,
      totalAbsences,
      statusCounts,
      percentages: Object.entries(statusCounts).reduce(
        (acc, [key, count]) => {
          acc[key] = totalPossibleDays > 0 ? (count / totalPossibleDays) * 100 : 0
          return acc
        },
        {} as Record<string, number>,
      ),
    }
  }, [absData, daysInMonth])

  const columns = [
    { id: "matricula", label: "Matrícula", width: 100 },
    { id: "operador", label: "Operador", width: 200 },
    { id: "login", label: "Login", width: 120 },
    { id: "supervisao", label: "Supervisão", width: 120 },
    { id: "coordenador", label: "Coordenador", width: 120 },
    { id: "turno", label: "Turno", width: 80 },
    { id: "admissao", label: "Admissão", width: 100 },
    { id: "tempoEmpresa", label: "Tempo Empresa", width: 100 },
    { id: "terminoAvisoPrevio", label: "Término Aviso", width: 120 },
  ]

  const getColumnLeftPosition = (index: number) => {
    return columns.slice(0, index).reduce((sum, col) => sum + col.width, 0)
  }

  return (
    <div className={cn("space-y-6", isFullscreen && "fixed inset-0 z-50 bg-background p-6 overflow-auto")}>
      {!isFullscreen && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="month-select" className="text-sm font-medium">
                  Mês de Referência
                </Label>
                <Input
                  id="month-select"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-48"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="freeze-select" className="text-sm font-medium">
                  Congelar Colunas
                </Label>
                <Select value={freezeUntilColumn.toString()} onValueChange={(val) => setFreezeUntilColumn(Number(val))}>
                  <SelectTrigger id="freeze-select" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">
                      <div className="flex items-center gap-2">
                        <Unlock className="h-4 w-4" />
                        Nenhuma coluna
                      </div>
                    </SelectItem>
                    {columns.map((col, index) => (
                      <SelectItem key={col.id} value={(index + 1).toString()}>
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Até {col.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isAdmin && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Gerenciar</Label>
                  <Dialog open={isSupervisorDialogOpen} onOpenChange={setIsSupervisorDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Users className="h-4 w-4" />
                        Supervisores
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Gerenciar Supervisores</DialogTitle>
                        <DialogDescription>Adicione, edite ou remova supervisores do sistema</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nome do supervisor"
                            value={newSupervisorName}
                            onChange={(e) => setNewSupervisorName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                if (editingSupervisor) {
                                  handleSaveSupervisor()
                                } else {
                                  handleAddSupervisor()
                                }
                              }
                            }}
                          />
                          {editingSupervisor ? (
                            <>
                              <Button onClick={handleSaveSupervisor} size="sm">
                                Salvar
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingSupervisor(null)
                                  setNewSupervisorName("")
                                }}
                                size="sm"
                              >
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <Button onClick={handleAddSupervisor} size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {supervisores.map((supervisor) => (
                            <div
                              key={supervisor.id}
                              className="flex items-center justify-between p-2 rounded-md border bg-muted/30"
                            >
                              <span className="font-medium">{supervisor.nome}</span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditSupervisor(supervisor)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => handleDeleteSupervisor(supervisor.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {isAdmin && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium invisible">Gerenciar</Label>
                  <Dialog open={isCoordenadorDialogOpen} onOpenChange={setIsCoordenadorDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Users className="h-4 w-4" />
                        Coordenadores
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Gerenciar Coordenadores</DialogTitle>
                        <DialogDescription>Adicione, edite ou remova coordenadores do sistema</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nome do coordenador"
                            value={newCoordenadorName}
                            onChange={(e) => setNewCoordenadorName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                if (editingCoordenador) {
                                  handleSaveCoordenador()
                                } else {
                                  handleAddCoordenador()
                                }
                              }
                            }}
                          />
                          {editingCoordenador ? (
                            <>
                              <Button onClick={handleSaveCoordenador} size="sm">
                                Salvar
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingCoordenador(null)
                                  setNewCoordenadorName("")
                                }}
                                size="sm"
                              >
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <Button onClick={handleAddCoordenador} size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {coordenadores.map((coordenador) => (
                            <div
                              key={coordenador.id}
                              className="flex items-center justify-between p-2 rounded-md border bg-muted/30"
                            >
                              <span className="font-medium">{coordenador.nome}</span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditCoordenador(coordenador)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => handleDeleteCoordenador(coordenador.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <label htmlFor="import-file">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                        Importar
                      </span>
                    </Button>
                  </label>
                  <input id="import-file" type="file" accept=".csv" className="hidden" onChange={handleImport} />
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Adicionar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Adicionar Operador ao ABS</DialogTitle>
                        <DialogDescription>Preencha os dados do operador para controle de ausências</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-matricula">Matrícula *</Label>
                          <Input
                            id="new-matricula"
                            value={newEntryData.matricula || ""}
                            onChange={(e) => setNewEntryData({ ...newEntryData, matricula: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-login">Login</Label>
                          <Input
                            id="new-login"
                            value={newEntryData.login || ""}
                            onChange={(e) => setNewEntryData({ ...newEntryData, login: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="new-operador">Operador *</Label>
                          <Input
                            id="new-operador"
                            value={newEntryData.operador || ""}
                            onChange={(e) => setNewEntryData({ ...newEntryData, operador: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-supervisao">Supervisão</Label>
                          <Select
                            value={newEntryData.supervisao}
                            onValueChange={(val) => setNewEntryData({ ...newEntryData, supervisao: val })}
                          >
                            <SelectTrigger id="new-supervisao">
                              <SelectValue placeholder="Selecione um supervisor" />
                            </SelectTrigger>
                            <SelectContent>
                              {supervisores.map((supervisor) => (
                                <SelectItem key={supervisor.id} value={supervisor.nome}>
                                  {supervisor.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-coordenador">Coordenador</Label>
                          <Select
                            value={newEntryData.coordenador}
                            onValueChange={(val) => setNewEntryData({ ...newEntryData, coordenador: val })}
                          >
                            <SelectTrigger id="new-coordenador">
                              <SelectValue placeholder="Selecione um coordenador" />
                            </SelectTrigger>
                            <SelectContent>
                              {coordenadores.map((coordenador) => (
                                <SelectItem key={coordenador.id} value={coordenador.nome}>
                                  {coordenador.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-turno">Turno</Label>
                          <Select
                            value={newEntryData.turno}
                            onValueChange={(val) => setNewEntryData({ ...newEntryData, turno: val })}
                          >
                            <SelectTrigger id="new-turno">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MANHÃ">MANHÃ</SelectItem>
                              <SelectItem value="TARDE">TARDE</SelectItem>
                              <SelectItem value="INTEGRAL">INTEGRAL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-admissao">Admissão</Label>
                          <Input
                            id="new-admissao"
                            type="date"
                            value={newEntryData.admissao || ""}
                            onChange={(e) => setNewEntryData({ ...newEntryData, admissao: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-tempo">Tempo Empresa (dias)</Label>
                          <Input
                            id="new-tempo"
                            type="number"
                            value={newEntryData.tempoEmpresa || ""}
                            onChange={(e) => setNewEntryData({ ...newEntryData, tempoEmpresa: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-termino">Término Aviso Prévio</Label>
                          <Input
                            id="new-termino"
                            type="date"
                            value={newEntryData.terminoAvisoPrevio || ""}
                            onChange={(e) => setNewEntryData({ ...newEntryData, terminoAvisoPrevio: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-observacao">Observação</Label>
                          <Input
                            id="new-observacao"
                            value={newEntryData.observacao || ""}
                            onChange={(e) => setNewEntryData({ ...newEntryData, observacao: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddEntry}>Adicionar Operador</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>

          {isLegendVisible && (
            <Card className="border-l-4 border-l-primary shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Legenda de Status</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsLegendVisible(false)} className="gap-2">
                    <EyeOff className="h-4 w-4" />
                    Ocultar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg border-2 shadow-sm flex items-center justify-center font-bold text-xs",
                          option.color,
                        )}
                      >
                        {option.value ? option.value.substring(0, 1) : "P"}
                      </div>
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!isLegendVisible && (
            <Button variant="outline" size="sm" onClick={() => setIsLegendVisible(true)} className="gap-2">
              <Eye className="h-4 w-4" />
              Mostrar Legenda
            </Button>
          )}
        </>
      )}

      <Card className="shadow-lg border-2">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Controle de Ausências -{" "}
                {new Date(selectedMonth + "-01")
                  .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
                  .toUpperCase()}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {isAdmin
                  ? "Clique em uma célula para alterar o status de ausência do operador"
                  : "Visualização do controle de ausências mensal"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 bg-transparent"
                    title="Estatísticas e Percentuais"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      Estatísticas e Análise de Ausências
                    </DialogTitle>
                    <DialogDescription>
                      Análise detalhada do controle de ausências para{" "}
                      {new Date(selectedMonth + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Card className="border-2">
                        <CardHeader className="pb-2 px-3 pt-3">
                          <CardDescription className="text-xs">Total Operadores</CardDescription>
                          <CardTitle className="text-2xl font-bold">{statistics.totalOperators}</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="border-2">
                        <CardHeader className="pb-2 px-3 pt-3">
                          <CardDescription className="text-xs">Dias Úteis</CardDescription>
                          <CardTitle className="text-2xl font-bold">{statistics.totalDays}</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="border-2">
                        <CardHeader className="pb-2 px-3 pt-3">
                          <CardDescription className="text-xs">Total Ausências</CardDescription>
                          <CardTitle className="text-2xl font-bold text-orange-600">
                            {statistics.totalAbsences}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="border-2">
                        <CardHeader className="pb-2 px-3 pt-3">
                          <CardDescription className="text-xs">Taxa Presença</CardDescription>
                          <CardTitle className="text-2xl font-bold text-green-600">
                            {statistics.percentages["PRESENTE"]?.toFixed(1)}%
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </div>

                    {/* Detailed Status Breakdown */}
                    <Card className="border-2">
                      <CardHeader className="px-4 py-3">
                        <CardTitle className="text-base">Detalhamento por Status</CardTitle>
                        <CardDescription className="text-sm">
                          Quantidade e percentual de cada tipo de ausência
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 px-4 pb-4">
                        {statusOptions
                          .filter((opt) => opt.value !== "")
                          .map((option) => {
                            const count = statistics.statusCounts[option.value] || 0
                            const percentage = statistics.percentages[option.value] || 0

                            return (
                              <div key={option.value} className="space-y-2 p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={cn(
                                        "w-10 h-10 rounded-lg border-2 shadow-sm flex items-center justify-center font-bold text-sm",
                                        option.color,
                                      )}
                                    >
                                      {option.value.substring(0, 1)}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm">{option.label}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {count} ocorrência{count !== 1 ? "s" : ""}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xl font-bold">{percentage.toFixed(2)}%</p>
                                  </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all duration-500",
                                      option.value === "FÉRIAS" && "bg-blue-500",
                                      option.value === "FOLGA" && "bg-gray-500",
                                      option.value === "AFASTAMENTO" && "bg-yellow-500",
                                      option.value === "COMUNICAÇÃO" && "bg-purple-500",
                                      option.value === "DESLIGAMENTO" && "bg-pink-500",
                                      option.value === "ATESTADO" && "bg-green-500",
                                    )}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar operador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full sm:w-64"
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} className="shrink-0">
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  {columns.map((col, index) => (
                    <TableHead
                      key={col.id}
                      className={cn(
                        "font-semibold text-xs uppercase tracking-wide border-r",
                        index < freezeUntilColumn && "sticky z-20 bg-muted/50",
                      )}
                      style={
                        index < freezeUntilColumn
                          ? { left: `${getColumnLeftPosition(index)}px`, minWidth: `${col.width}px` }
                          : { minWidth: `${col.width}px` }
                      }
                    >
                      {col.label}
                    </TableHead>
                  ))}
                  {daysInMonth.map((day) => (
                    <TableHead key={day.date} className="min-w-[70px] text-center border-r">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-bold">{day.day}</span>
                        <span className={cn("text-xs font-medium", day.isSunday && "text-primary")}>{day.weekday}</span>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="min-w-[90px] text-center font-semibold border-l-2">Domingo</TableHead>
                  <TableHead className="min-w-[80px] text-center font-semibold">Obs</TableHead>
                  {isAdmin && <TableHead className="min-w-[80px] text-center font-semibold">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9 + daysInMonth.length + 2 + (isAdmin ? 1 : 0)}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="h-12 w-12 text-muted-foreground/50" />
                        <p className="font-medium">
                          {searchQuery ? "Nenhum operador encontrado" : "Nenhum operador cadastrado para este mês"}
                        </p>
                        <p className="text-sm">
                          {searchQuery
                            ? "Tente ajustar sua pesquisa"
                            : "Adicione operadores para começar o controle de ausências"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((entry, rowIndex) => (
                    <TableRow key={entry.id} className={cn(rowIndex % 2 === 0 && "bg-muted/20")}>
                      <TableCell
                        className={cn(
                          "font-mono text-sm border-r",
                          0 < freezeUntilColumn && "sticky z-10 bg-background",
                          rowIndex % 2 === 0 && 0 < freezeUntilColumn && "bg-muted/20",
                        )}
                        style={0 < freezeUntilColumn ? { left: `${getColumnLeftPosition(0)}px` } : undefined}
                      >
                        {entry.matricula}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "font-semibold border-r",
                          1 < freezeUntilColumn && "sticky z-10 bg-background",
                          rowIndex % 2 === 0 && 1 < freezeUntilColumn && "bg-muted/20",
                        )}
                        style={1 < freezeUntilColumn ? { left: `${getColumnLeftPosition(1)}px` } : undefined}
                      >
                        {entry.operador}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "border-r",
                          2 < freezeUntilColumn && "sticky z-10 bg-background",
                          rowIndex % 2 === 0 && 2 < freezeUntilColumn && "bg-muted/20",
                        )}
                        style={2 < freezeUntilColumn ? { left: `${getColumnLeftPosition(2)}px` } : undefined}
                      >
                        {entry.login}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "border-r",
                          3 < freezeUntilColumn && "sticky z-10 bg-background",
                          rowIndex % 2 === 0 && 3 < freezeUntilColumn && "bg-muted/20",
                        )}
                        style={3 < freezeUntilColumn ? { left: `${getColumnLeftPosition(3)}px` } : undefined}
                      >
                        {entry.supervisao}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "border-r",
                          4 < freezeUntilColumn && "sticky z-10 bg-background",
                          rowIndex % 2 === 0 && 4 < freezeUntilColumn && "bg-muted/20",
                        )}
                        style={4 < freezeUntilColumn ? { left: `${getColumnLeftPosition(4)}px` } : undefined}
                      >
                        {entry.coordenador}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "border-r",
                          5 < freezeUntilColumn && "sticky z-10 bg-background",
                          rowIndex % 2 === 0 && 5 < freezeUntilColumn && "bg-muted/20",
                        )}
                        style={5 < freezeUntilColumn ? { left: `${getColumnLeftPosition(5)}px` } : undefined}
                      >
                        <Badge variant="outline" className="text-xs font-semibold">
                          {entry.turno}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-sm border-r",
                          6 < freezeUntilColumn && "sticky z-10 bg-background",
                          rowIndex % 2 === 0 && 6 < freezeUntilColumn && "bg-muted/20",
                        )}
                        style={6 < freezeUntilColumn ? { left: `${getColumnLeftPosition(6)}px` } : undefined}
                      >
                        {entry.admissao}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-sm border-r",
                          7 < freezeUntilColumn && "sticky z-10 bg-background",
                          rowIndex % 2 === 0 && 7 < freezeUntilColumn && "bg-muted/20",
                        )}
                        style={7 < freezeUntilColumn ? { left: `${getColumnLeftPosition(7)}px` } : undefined}
                      >
                        {entry.tempoEmpresa} dias
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-sm border-r",
                          8 < freezeUntilColumn && "sticky z-10 bg-background",
                          rowIndex % 2 === 0 && 8 < freezeUntilColumn && "bg-muted/20",
                        )}
                        style={8 < freezeUntilColumn ? { left: `${getColumnLeftPosition(8)}px` } : undefined}
                      >
                        {entry.terminoAvisoPrevio || "-"}
                      </TableCell>
                      {daysInMonth.map((day) => {
                        const status = entry.absences[day.date]
                        const displayStatus = day.isSunday && !status ? "DOMINGO" : status
                        return (
                          <TableCell
                            key={day.date}
                            className={cn(
                              "text-center p-2 border-r",
                              getCellColor(displayStatus),
                              day.isSunday &&
                                !status &&
                                "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-400 dark:border-gray-600",
                              isAdmin &&
                                !day.isSunday &&
                                "cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all hover:scale-105",
                            )}
                            onClick={() => handleCellClick(entry.id, day.date, day.isSunday)}
                          >
                            <span className="text-xs font-bold">{displayStatus || "P"}</span>
                          </TableCell>
                        )
                      })}
                      <TableCell className="text-center border-l-2">
                        <Badge variant="secondary" className="text-xs font-semibold">
                          {entry.domingo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">{entry.observacao}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditEntry(entry)}
                              title="Editar operador"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteEntry(entry)}
                              title="Excluir operador"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Informações do Operador</DialogTitle>
            <DialogDescription>Atualize os dados do operador no controle de ausências</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-matricula">Matrícula</Label>
              <Input
                id="edit-matricula"
                value={editFormData.matricula || ""}
                onChange={(e) => setEditFormData({ ...editFormData, matricula: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-login">Login</Label>
              <Input
                id="edit-login"
                value={editFormData.login || ""}
                onChange={(e) => setEditFormData({ ...editFormData, login: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-operador">Operador</Label>
              <Input
                id="edit-operador"
                value={editFormData.operador || ""}
                onChange={(e) => setEditFormData({ ...editFormData, operador: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-supervisao">Supervisão</Label>
              <Select
                value={editFormData.supervisao}
                onValueChange={(val) => setEditFormData({ ...editFormData, supervisao: val })}
              >
                <SelectTrigger id="edit-supervisao">
                  <SelectValue placeholder="Selecione um supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisores.map((supervisor) => (
                    <SelectItem key={supervisor.id} value={supervisor.nome}>
                      {supervisor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-coordenador">Coordenador</Label>
              <Select
                value={editFormData.coordenador}
                onValueChange={(val) => setEditFormData({ ...editFormData, coordenador: val })}
              >
                <SelectTrigger id="edit-coordenador">
                  <SelectValue placeholder="Selecione um coordenador" />
                </SelectTrigger>
                <SelectContent>
                  {coordenadores.map((coordenador) => (
                    <SelectItem key={coordenador.id} value={coordenador.nome}>
                      {coordenador.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-turno">Turno</Label>
              <Select
                value={editFormData.turno}
                onValueChange={(val) => setEditFormData({ ...editFormData, turno: val })}
              >
                <SelectTrigger id="edit-turno">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANHÃ">MANHÃ</SelectItem>
                  <SelectItem value="TARDE">TARDE</SelectItem>
                  <SelectItem value="INTEGRAL">INTEGRAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-admissao">Admissão</Label>
              <Input
                id="edit-admissao"
                type="date"
                value={editFormData.admissao || ""}
                onChange={(e) => setEditFormData({ ...editFormData, admissao: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tempo">Tempo Empresa (dias)</Label>
              <Input
                id="edit-tempo"
                type="number"
                value={editFormData.tempoEmpresa || ""}
                onChange={(e) => setEditFormData({ ...editFormData, tempoEmpresa: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-termino">Término Aviso Prévio</Label>
              <Input
                id="edit-termino"
                type="date"
                value={editFormData.terminoAvisoPrevio || ""}
                onChange={(e) => setEditFormData({ ...editFormData, terminoAvisoPrevio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-observacao">Observação</Label>
              <Input
                id="edit-observacao"
                value={editFormData.observacao || ""}
                onChange={(e) => setEditFormData({ ...editFormData, observacao: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o operador <strong>{deletingEntry?.operador}</strong> (Matrícula:{" "}
              {deletingEntry?.matricula}) do controle de ausências?
              <br />
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEntry} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Status de Ausência</DialogTitle>
            <DialogDescription>
              Escolha o status para o dia {selectedDate ? new Date(selectedDate).toLocaleDateString("pt-BR") : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                className={cn(
                  "h-20 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform",
                  option.color,
                )}
                onClick={() => handleStatusChange(option.value)}
              >
                <span className="text-2xl font-bold">{option.value ? option.value.substring(0, 1) : "P"}</span>
                <span className="text-xs font-medium">{option.label}</span>
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
