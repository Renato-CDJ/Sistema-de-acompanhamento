"use client"

import { useState } from "react"
import { useData } from "@/contexts/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, FileText, Clock, Filter } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function AuditoriaPage() {
  const { getActivityLogs } = useData()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedUser, setSelectedUser] = useState("Todos os usuários")
  const [selectedAction, setSelectedAction] = useState("Todas as ações")
  const [selectedEntity, setSelectedEntity] = useState("Todas as entidades")

  const logs = getActivityLogs({
    dateRange: startDate && endDate ? { start: startDate, end: endDate } : undefined,
    user: selectedUser,
    action: selectedAction,
    entity: selectedEntity,
  })

  // Get unique values for filters
  const allLogs = getActivityLogs()
  const uniqueUsers = ["Todos os usuários", ...new Set(allLogs.map((log) => log.user))]
  const uniqueActions = ["Todas as ações", ...new Set(allLogs.map((log) => log.action))]
  const uniqueEntities = ["Todas as entidades", ...new Set(allLogs.map((log) => log.entity))]

  const getActionColor = (action: string) => {
    switch (action) {
      case "Criar":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "Editar":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "Excluir":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      case "Importar":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return timestamp
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Auditoria</h1>
        <p className="text-muted-foreground">Histórico completo de todas as ações realizadas no sistema</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>Filtre o histórico de auditoria por data, usuário, ação ou entidade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="start-date">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-filter">Usuário</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger id="user-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="action-filter">Ação</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger id="action-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="entity-filter">Entidade</Label>
              <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                <SelectTrigger id="entity-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {uniqueEntities.map((entity) => (
                    <SelectItem key={entity} value={entity}>
                      {entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">Ações registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Criações</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.filter((log) => log.action === "Criar").length}</div>
            <p className="text-xs text-muted-foreground">Novos registros</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edições</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.filter((log) => log.action === "Editar").length}</div>
            <p className="text-xs text-muted-foreground">Registros alterados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exclusões</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.filter((log) => log.action === "Excluir").length}</div>
            <p className="text-xs text-muted-foreground">Registros removidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atividades</CardTitle>
          <CardDescription>
            {logs.length === 0
              ? "Nenhuma atividade encontrada com os filtros selecionados"
              : `Mostrando ${logs.length} ${logs.length === 1 ? "registro" : "registros"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Data/Hora
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Usuário
                    </div>
                  </TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Alterações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhuma atividade registrada
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{formatTimestamp(log.timestamp)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {log.user}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.entity}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate text-sm">{log.details}</p>
                      </TableCell>
                      <TableCell>
                        {log.changes && log.changes.length > 0 ? (
                          <div className="space-y-1">
                            {log.changes.map((change, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="font-medium">{change.field}:</span>{" "}
                                <span className="text-muted-foreground line-through">{change.oldValue}</span>
                                {" → "}
                                <span className="text-green-600 dark:text-green-400">{change.newValue}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
