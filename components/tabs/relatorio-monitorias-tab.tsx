"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { FileText, Trash2, EyeOff, Eye, Save, Edit2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"
import { useData } from "@/contexts/data-context"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WeekData {
  id: string
  conforme: number
  inconforme: number
}

interface MonthData {
  year: number
  month: number
  weeks: WeekData[]
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

const COLORS = {
  conforme: "#22c55e",
  inconforme: "#ef4444",
}

export function RelatorioMonitoriasTab() {
  const { user } = useAuth()
  const isAdmin = hasPermission(user, "edit")

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const [selectedYear, setSelectedYear] = useState(currentYear.toString())
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString())
  const [showInconformityAverage, setShowInconformityAverage] = useState(true)
  const [tableFilterMonth, setTableFilterMonth] = useState<string>("all")
  const [editDialog, setEditDialog] = useState<{
    year: number
    month: number
    weekId: string
    weekNumber: number
    conforme: number
    inconforme: number
  } | null>(null)
  const [deleteWeekDialog, setDeleteWeekDialog] = useState<{
    year: number
    month: number
    weekId: string
    weekNumber: number
  } | null>(null)

  const [weeklyInputs, setWeeklyInputs] = useState<{ conforme: string; inconforme: string }>({
    conforme: "",
    inconforme: "",
  })

  const { monitoringData, addOrUpdateMonitoringMonth, deleteMonitoringWeek, updateMonitoringWeek, getMonitoringStats } =
    useData()

  const currentMonthData = useMemo(() => {
    const existing = monitoringData.find(
      (m) => m.year === Number.parseInt(selectedYear) && m.month === Number.parseInt(selectedMonth),
    )
    if (existing) return existing

    return {
      year: Number.parseInt(selectedYear),
      month: Number.parseInt(selectedMonth),
      weeks: [],
    }
  }, [selectedYear, selectedMonth, monitoringData])

  const registerWeekData = () => {
    const conforme = Number.parseInt(weeklyInputs.conforme) || 0
    const inconforme = Number.parseInt(weeklyInputs.inconforme) || 0

    if (conforme === 0 && inconforme === 0) {
      return
    }

    const updatedMonth = { ...currentMonthData }
    const newWeek = {
      id: `week-${Date.now()}`,
      conforme,
      inconforme,
    }
    updatedMonth.weeks.push(newWeek)
    addOrUpdateMonitoringMonth(updatedMonth)

    setWeeklyInputs({ conforme: "", inconforme: "" })
  }

  const handleEditWeek = () => {
    if (!editDialog) return

    const updatedWeek = {
      id: editDialog.weekId,
      conforme: editDialog.conforme,
      inconforme: editDialog.inconforme,
    }

    updateMonitoringWeek(editDialog.year, editDialog.month, editDialog.weekId, updatedWeek)
    setEditDialog(null)
  }

  const handleDeleteWeek = (year: number, month: number, weekId: string) => {
    deleteMonitoringWeek(year, month, weekId)
    setDeleteWeekDialog(null)
  }

  const consolidatedTotals = useMemo(() => {
    return getMonitoringStats(Number.parseInt(selectedYear), Number.parseInt(selectedMonth))
  }, [selectedYear, selectedMonth, monitoringData, getMonitoringStats])

  const filteredTableData = useMemo(() => {
    if (tableFilterMonth === "all") {
      return monitoringData.flatMap((monthData) =>
        monthData.weeks.map((week, index) => ({
          ...week,
          weekNumber: index + 1,
          month: MONTHS[monthData.month],
          year: monthData.year,
          monthIndex: monthData.month,
        })),
      )
    } else {
      const monthData = monitoringData.find(
        (m) => m.year === Number.parseInt(selectedYear) && m.month === Number.parseInt(tableFilterMonth),
      )
      if (!monthData) return []
      return monthData.weeks.map((week, index) => ({
        ...week,
        weekNumber: index + 1,
        month: MONTHS[monthData.month],
        year: monthData.year,
        monthIndex: monthData.month,
      }))
    }
  }, [monitoringData, tableFilterMonth, selectedYear])

  const filteredTotals = useMemo(() => {
    const totalConforme = filteredTableData.reduce((sum, week) => sum + week.conforme, 0)
    const totalInconforme = filteredTableData.reduce((sum, week) => sum + week.inconforme, 0)
    const total = totalConforme + totalInconforme
    return {
      conforme: totalConforme,
      inconforme: totalInconforme,
      total,
      mediaConforme: total > 0 ? ((totalConforme / total) * 100).toFixed(1) : "0.0",
      mediaInconforme: total > 0 ? ((totalInconforme / total) * 100).toFixed(1) : "0.0",
    }
  }, [filteredTableData])

  const pieChartData = useMemo(() => {
    if (consolidatedTotals.total === 0) return []
    return [
      { name: "Conforme", value: consolidatedTotals.conforme, color: COLORS.conforme },
      { name: "Inconforme", value: consolidatedTotals.inconforme, color: COLORS.inconforme },
    ]
  }, [consolidatedTotals])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-bold">Relatório de Monitorias</h2>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Período</CardTitle>
          <CardDescription>Escolha o ano e mês para visualizar ou inserir dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Ano</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="month">Mês</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="month">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Dados Semanais</CardTitle>
            <CardDescription>Insira os dados de monitorias para cada semana (Segunda a Sábado)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold mb-3">Registrar Nova Semana</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="new-conforme" className="text-sm">
                    Conforme
                  </Label>
                  <Input
                    id="new-conforme"
                    type="number"
                    min="0"
                    value={weeklyInputs.conforme}
                    onChange={(e) => setWeeklyInputs((prev) => ({ ...prev, conforme: e.target.value }))}
                    placeholder="0"
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="new-inconforme" className="text-sm">
                    Inconforme
                  </Label>
                  <Input
                    id="new-inconforme"
                    type="number"
                    min="0"
                    value={weeklyInputs.inconforme}
                    onChange={(e) => setWeeklyInputs((prev) => ({ ...prev, inconforme: e.target.value }))}
                    placeholder="0"
                    className="h-9"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={registerWeekData} className="w-full h-9 gap-2">
                    <Save className="h-4 w-4" />
                    Registrar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Consolidado Mensal</CardTitle>
            <CardDescription className="text-base">
              Resumo de {MONTHS[Number.parseInt(selectedMonth)]} {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative overflow-hidden p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl border-2 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 dark:bg-green-800 rounded-full -mr-12 -mt-12 opacity-20" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                        Total Conforme
                      </p>
                    </div>
                    <p className="text-4xl font-bold text-green-700 dark:text-green-200 mb-1">
                      {consolidatedTotals.conforme}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">Monitorias Sem apontamentos</p>
                  </div>
                </div>

                <div className="relative overflow-hidden p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-xl border-2 border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-200 dark:bg-red-800 rounded-full -mr-12 -mt-12 opacity-20" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-red-500 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">
                        Total Inconforme
                      </p>
                    </div>
                    <p className="text-4xl font-bold text-red-700 dark:text-red-200 mb-1">
                      {consolidatedTotals.inconforme}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">Monitorias Com Apontamentos</p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden p-6 bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 rounded-xl border-2 border-primary/30 shadow-lg hover:shadow-xl transition-shadow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-primary rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-primary uppercase tracking-wide">Total Geral</p>
                  </div>
                  <p className="text-4xl font-bold text-primary mb-1">{consolidatedTotals.total}</p>
                  <p className="text-sm text-muted-foreground">Todas as monitorias realizadas</p>
                </div>
              </div>

              <div className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-shadow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full -mr-16 -mt-16" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                      Média de Conformidade
                    </p>
                  </div>
                  <p className="text-4xl font-bold text-blue-700 dark:text-blue-200 mb-1">
                    {consolidatedTotals.mediaConforme}%
                  </p>
                  <p className="text-sm text-muted-foreground">Taxa de conformes do período</p>
                </div>
              </div>

              {showInconformityAverage && (
                <div className="relative overflow-hidden p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-xl border-2 border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 dark:bg-orange-800 rounded-full -mr-16 -mt-16 opacity-20" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">
                        Média de Inconformidade
                      </p>
                    </div>
                    <p className="text-4xl font-bold text-orange-700 dark:text-orange-200 mb-1">
                      {consolidatedTotals.mediaInconforme}%
                    </p>
                    <p className="text-sm text-muted-foreground">Taxa de inconformes do período</p>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInconformityAverage(!showInconformityAverage)}
                className="w-full gap-2 h-10 font-medium hover:bg-muted transition-colors"
              >
                {showInconformityAverage ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Ocultar Média de Inconformidade
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Mostrar Média de Inconformidade
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Distribuição Percentual</CardTitle>
                <CardDescription>Proporção entre conformes e inconformes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="45%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value} monitorias`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>Adicione dados para visualizar o gráfico</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Tabela Detalhada</CardTitle>
              <CardDescription>Visão completa dos dados semanais</CardDescription>
            </div>
            <div className="w-full sm:w-48">
              <Select value={tableFilterMonth} onValueChange={setTableFilterMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por mês" />
                </SelectTrigger>
                <SelectContent>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Mês</th>
                  <th className="text-left p-3 font-semibold">Ano</th>
                  <th className="text-left p-3 font-semibold">Semana</th>
                  <th className="text-right p-3 font-semibold">Conforme</th>
                  <th className="text-right p-3 font-semibold">Inconforme</th>
                  <th className="text-right p-3 font-semibold">Total</th>
                  <th className="text-right p-3 font-semibold">% Conforme</th>
                  {isAdmin && <th className="text-center p-3 font-semibold">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {filteredTableData.length > 0 ? (
                  <>
                    {filteredTableData.map((week, index) => {
                      const total = week.conforme + week.inconforme
                      const percentage = total > 0 ? ((week.conforme / total) * 100).toFixed(1) : "0.0"
                      return (
                        <tr key={`${week.year}-${week.monthIndex}-${week.id}`} className="border-b hover:bg-muted/50">
                          <td className="p-3">{week.month}</td>
                          <td className="p-3">{week.year}</td>
                          <td className="p-3">Semana {week.weekNumber}</td>
                          <td className="text-right p-3 text-green-600 font-medium">{week.conforme}</td>
                          <td className="text-right p-3 text-red-600 font-medium">{week.inconforme}</td>
                          <td className="text-right p-3 font-semibold">{total}</td>
                          <td className="text-right p-3 text-blue-600 font-medium">{percentage}%</td>
                          {isAdmin && (
                            <td className="p-3">
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setEditDialog({
                                      year: week.year,
                                      month: week.monthIndex,
                                      weekId: week.id,
                                      weekNumber: week.weekNumber,
                                      conforme: week.conforme,
                                      inconforme: week.inconforme,
                                    })
                                  }
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setDeleteWeekDialog({
                                      year: week.year,
                                      month: week.monthIndex,
                                      weekId: week.id,
                                      weekNumber: week.weekNumber,
                                    })
                                  }
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                    <tr className="bg-muted/50 font-bold">
                      <td className="p-3" colSpan={3}>
                        Total {tableFilterMonth === "all" ? "Geral" : "do Mês"}
                      </td>
                      <td className="text-right p-3 text-green-600">{filteredTotals.conforme}</td>
                      <td className="text-right p-3 text-red-600">{filteredTotals.inconforme}</td>
                      <td className="text-right p-3">{filteredTotals.total}</td>
                      <td className="text-right p-3 text-blue-600">{filteredTotals.mediaConforme}%</td>
                      {isAdmin && <td className="p-3"></td>}
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="p-8 text-center text-muted-foreground">
                      Nenhum dado disponível para o período selecionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Semana {editDialog?.weekNumber}</DialogTitle>
            <DialogDescription>Ajuste os valores de conforme e inconforme para esta semana</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-conforme">Conforme</Label>
              <Input
                id="edit-conforme"
                type="number"
                min="0"
                value={editDialog?.conforme || 0}
                onChange={(e) =>
                  setEditDialog((prev) => (prev ? { ...prev, conforme: Number.parseInt(e.target.value) || 0 } : null))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-inconforme">Inconforme</Label>
              <Input
                id="edit-inconforme"
                type="number"
                min="0"
                value={editDialog?.inconforme || 0}
                onChange={(e) =>
                  setEditDialog((prev) => (prev ? { ...prev, inconforme: Number.parseInt(e.target.value) || 0 } : null))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEditWeek}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteWeekDialog} onOpenChange={() => setDeleteWeekDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a Semana {deleteWeekDialog?.weekNumber}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteWeekDialog &&
                handleDeleteWeek(deleteWeekDialog.year, deleteWeekDialog.month, deleteWeekDialog.weekId)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
