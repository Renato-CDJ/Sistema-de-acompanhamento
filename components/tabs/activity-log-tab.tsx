"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Download,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Database,
  GraduationCap,
  UserX,
  MessageSquare,
  CalendarDays,
  Settings,
} from "lucide-react"
import { useActivityLog } from "@/contexts/activity-log-context"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const categoryIcons = {
  data: Database,
  training: GraduationCap,
  dismissal: UserX,
  user: User,
  document: FileText,
  chat: MessageSquare,
  agenda: CalendarDays,
  export: Download,
  system: Settings,
}

const categoryColors = {
  data: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  training: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  dismissal: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  user: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  document: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  chat: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  agenda: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  export: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  system: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
}

const categoryLabels = {
  data: "Dados",
  training: "Treinamento",
  dismissal: "Desligamento",
  user: "Usuário",
  document: "Documento",
  chat: "Chat",
  agenda: "Agenda",
  export: "Exportação",
  system: "Sistema",
}

export function ActivityLogTab() {
  const { activities, exportActivities, clearActivities } = useActivityLog()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  const filteredActivities = useMemo(() => {
    let filtered = [...activities]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (activity) =>
          activity.action.toLowerCase().includes(search) ||
          activity.details.toLowerCase().includes(search) ||
          activity.userName.toLowerCase().includes(search),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((activity) => activity.category === categoryFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      filtered = filtered.filter((activity) => {
        const activityDate = new Date(activity.timestamp)
        const activityDay = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate())

        switch (dateFilter) {
          case "today":
            return activityDay.getTime() === today.getTime()
          case "week": {
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return activityDate >= weekAgo
          }
          case "month": {
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return activityDate >= monthAgo
          }
          default:
            return true
        }
      })
    }

    return filtered
  }, [activities, searchTerm, categoryFilter, dateFilter])

  const stats = useMemo(() => {
    const categoryCounts = activities.reduce(
      (acc, activity) => {
        acc[activity.category] = (acc[activity.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total: activities.length,
      today: activities.filter((a) => {
        const today = new Date()
        const activityDate = new Date(a.timestamp)
        return (
          activityDate.getDate() === today.getDate() &&
          activityDate.getMonth() === today.getMonth() &&
          activityDate.getFullYear() === today.getFullYear()
        )
      }).length,
      categoryCounts,
    }
  }, [activities])

  const handleClearActivities = () => {
    if (confirm("Tem certeza que deseja limpar todo o histórico de atividades? Esta ação não pode ser desfeita.")) {
      clearActivities()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Histórico de Atividades</h2>
          <p className="text-muted-foreground">Acompanhe todas as ações realizadas no sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportActivities} className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button
            variant="outline"
            onClick={handleClearActivities}
            className="gap-2 text-red-600 hover:text-red-700 bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
            Limpar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categorias Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{Object.keys(stats.categoryCounts).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{filteredActivities.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>Filtre as atividades por categoria, data ou pesquisa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar atividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Período</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger id="date">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>
            {filteredActivities.length === 0
              ? "Nenhuma atividade encontrada"
              : `Mostrando ${filteredActivities.length} atividade${filteredActivities.length !== 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {filteredActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Nenhuma atividade encontrada</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {activities.length === 0
                    ? "As atividades aparecerão aqui conforme você usa o sistema"
                    : "Tente ajustar os filtros para ver mais resultados"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map((activity) => {
                  const Icon = categoryIcons[activity.category]
                  const colorClass = categoryColors[activity.category]

                  return (
                    <Card key={activity.id} className="border-l-4 border-l-primary/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${colorClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">{activity.action}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                              </div>
                              <Badge variant="outline" className={colorClass}>
                                {categoryLabels[activity.category]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{activity.userName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(new Date(activity.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
