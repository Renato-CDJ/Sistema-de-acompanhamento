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
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Plus, Eye, EyeOff, Calendar, BookOpen, Users, CheckCircle, Clock, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { hasPermission } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import type { Treinamento } from "@/types"

interface CapacitacaoTabProps {
  filters?: {
    dateRange?: { start: string; end: string }
    turno?: string
    carteira?: string
    status?: string
  }
}

export function CapacitacaoTab({ filters }: CapacitacaoTabProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const isAdmin = hasPermission(user, "edit")
  const [showCharts, setShowCharts] = useState(true)
  const [editingCarteira, setEditingCarteira] = useState<any>(null)
  const [editingTreinamento, setEditingTreinamento] = useState<Treinamento | null>(null)

  const {
    carteiras,
    treinamentos,
    assuntos,
    addCarteira,
    updateCarteira,
    deleteCarteira,
    addTreinamento,
    updateTreinamento,
    addAssunto,
    updateAssunto,
    deleteAssunto,
    getCapacitacaoStats,
  } = useData()

  const capacitacaoStats = getCapacitacaoStats()

  // Form states
  const [novaCarteira, setNovaCarteira] = useState("")
  const [novoAssunto, setNovoAssunto] = useState("")
  const [novoTreinamento, setNovoTreinamento] = useState({
    quantidade: "",
    turno: "",
    carteira: "",
    data: "",
    responsavel: "",
    status: "Pendente" as "Aplicado" | "Pendente",
    assunto: "",
    cargaHoraria: "",
  })

  const pieDataStatus = [
    { name: "Aplicados", value: capacitacaoStats.aplicados, color: "#22c55e" },
    { name: "Pendentes", value: capacitacaoStats.pendentes, color: "#f59e0b" },
  ]

  const treinamentosFiltrados = treinamentos.filter((treinamento) => {
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

  const handleAddCarteira = () => {
    if (novaCarteira.trim()) {
      addCarteira(novaCarteira)
      setNovaCarteira("")
      toast({
        title: "Sucesso!",
        description: "Carteira adicionada com sucesso.",
        variant: "default",
      })
    }
  }

  const handleEditCarteira = (index: number) => {
    setEditingCarteira({ ...carteiras[index], index })
  }

  const handleUpdateCarteira = () => {
    if (editingCarteira && editingCarteira.name.trim()) {
      updateCarteira(editingCarteira.id, editingCarteira.name)
      setEditingCarteira(null)
      toast({
        title: "Sucesso!",
        description: "Carteira atualizada com sucesso.",
        variant: "default",
      })
    }
  }

  const handleDeleteCarteira = (id: string) => {
    deleteCarteira(id)
    toast({
      title: "Sucesso!",
      description: "Carteira removida com sucesso.",
      variant: "default",
    })
  }

  const handleAddTreinamento = () => {
    if (novoTreinamento.quantidade && novoTreinamento.carteira && novoTreinamento.assunto) {
      addTreinamento({
        ...novoTreinamento,
        quantidade: Number.parseInt(novoTreinamento.quantidade),
      })

      setNovoTreinamento({
        quantidade: "",
        turno: "",
        carteira: "",
        data: "",
        responsavel: "",
        status: "Pendente",
        assunto: "",
        cargaHoraria: "",
      })

      toast({
        title: "Sucesso!",
        description: "Treinamento adicionado com sucesso.",
        variant: "default",
      })
    }
  }

  const handleAddAssunto = () => {
    if (novoAssunto.trim()) {
      addAssunto(novoAssunto)
      setNovoAssunto("")
      toast({
        title: "Sucesso!",
        description: "Assunto adicionado com sucesso.",
        variant: "default",
      })
    }
  }

  const handleEditTreinamento = (treinamento: Treinamento) => {
    setEditingTreinamento(treinamento)
  }

  const handleUpdateTreinamento = () => {
    if (editingTreinamento) {
      updateTreinamento(editingTreinamento.id, {
        status: editingTreinamento.status,
      })
      setEditingTreinamento(null)
      toast({
        title: "Sucesso!",
        description: "Status do treinamento atualizado com sucesso.",
        variant: "default",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Total de Treinamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{capacitacaoStats.totalTreinamentos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Aplicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{capacitacaoStats.aplicados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{capacitacaoStats.pendentes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{capacitacaoStats.taxaConclusao.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Carteira */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estatísticas por Carteira
            </CardTitle>
            <CardDescription>Desempenho de treinamentos por carteira</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {carteiras.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma carteira cadastrada ainda.</p>
              {isAdmin && <p className="text-sm">Use o botão "Adicionar Carteira" na seção de gerenciamento.</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {carteiras.map((carteira, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{carteira.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={carteira.taxa >= 90 ? "default" : carteira.taxa >= 70 ? "secondary" : "destructive"}
                        >
                          {carteira.taxa.toFixed(1)}%
                        </Badge>
                        {isAdmin && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditCarteira(index)}>
                              Editar
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCarteira(carteira.id)}>
                              Excluir
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span>{carteira.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Aplicados:</span>
                        <span className="text-green-600">{carteira.aplicados}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pendentes:</span>
                        <span className="text-yellow-600">{carteira.pendentes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Toggle */}
      <div className="flex justify-end gap-2">
        {isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <BookOpen className="h-4 w-4" />
                Gerenciar Assunto Capacitação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Gerenciar Assuntos de Capacitação</DialogTitle>
                <DialogDescription>Gerencie os assuntos disponíveis para treinamentos de capacitação</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={novoAssunto}
                    onChange={(e) => setNovoAssunto(e.target.value)}
                    placeholder="Nome do novo assunto"
                    className="flex-1"
                  />
                  <Button onClick={handleAddAssunto}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assunto</TableHead>
                        <TableHead className="w-24">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assuntos.length > 0 ? (
                        assuntos.map((assunto, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{assunto}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const novoNome = prompt("Editar assunto:", assunto)
                                    if (novoNome && novoNome.trim() && novoNome !== assunto) {
                                      updateAssunto(index, novoNome.trim())
                                      toast({
                                        title: "Sucesso!",
                                        description: "Assunto atualizado com sucesso.",
                                        variant: "default",
                                      })
                                    }
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Tem certeza que deseja excluir o assunto "${assunto}"?`)) {
                                      deleteAssunto(index)
                                      toast({
                                        title: "Sucesso!",
                                        description: "Assunto removido com sucesso.",
                                        variant: "default",
                                      })
                                    }
                                  }}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                            Nenhum assunto cadastrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        <Button variant="outline" onClick={() => setShowCharts(!showCharts)} className="gap-2">
          {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
        </Button>
      </div>

      {/* Charts */}
      {showCharts && capacitacaoStats.totalTreinamentos > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Treinamentos</CardTitle>
              <CardDescription>Distribuição entre aplicados e pendentes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieDataStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieDataStatus.map((entry, index) => (
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
              <CardTitle>Treinamentos por Carteira</CardTitle>
              <CardDescription>Distribuição de treinamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={carteiras}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="aplicados" fill="#22c55e" name="Aplicados" />
                  <Bar dataKey="pendentes" fill="#f59e0b" name="Pendentes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Adicionar Treinamento */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Adicionar Treinamento
            </CardTitle>
            <CardDescription>Registre um novo treinamento no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  value={novoTreinamento.quantidade}
                  onChange={(e) => setNovoTreinamento({ ...novoTreinamento, quantidade: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="turno">Turno</Label>
                <Select
                  value={novoTreinamento.turno}
                  onValueChange={(value) => setNovoTreinamento({ ...novoTreinamento, turno: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manhã">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Integral">Integral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="carteira">Carteira</Label>
                <Select
                  value={novoTreinamento.carteira}
                  onValueChange={(value) => setNovoTreinamento({ ...novoTreinamento, carteira: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar carteira" />
                  </SelectTrigger>
                  <SelectContent>
                    {carteiras.map((carteira) => (
                      <SelectItem key={carteira.name} value={carteira.name}>
                        {carteira.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={novoTreinamento.data}
                  onChange={(e) => setNovoTreinamento({ ...novoTreinamento, data: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={novoTreinamento.responsavel}
                  onChange={(e) => setNovoTreinamento({ ...novoTreinamento, responsavel: e.target.value })}
                  placeholder="Nome do responsável"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={novoTreinamento.status}
                  onValueChange={(value) => setNovoTreinamento({ ...novoTreinamento, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aplicado">Aplicado</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assunto">Assunto Capacitação</Label>
                <Select
                  value={novoTreinamento.assunto}
                  onValueChange={(value) => setNovoTreinamento({ ...novoTreinamento, assunto: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar assunto" />
                  </SelectTrigger>
                  <SelectContent>
                    {assuntos.map((assunto) => (
                      <SelectItem key={assunto} value={assunto}>
                        {assunto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cargaHoraria">Carga Horária</Label>
                <Input
                  id="cargaHoraria"
                  type="time"
                  step="1"
                  value={novoTreinamento.cargaHoraria}
                  onChange={(e) => setNovoTreinamento({ ...novoTreinamento, cargaHoraria: e.target.value })}
                  placeholder="00:00:00"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddTreinamento} className="flex-1">
                Adicionar Treinamento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Treinamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Treinamentos</CardTitle>
          <CardDescription>Histórico de todos os treinamentos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {treinamentosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum treinamento encontrado.</p>
              {isAdmin && <p className="text-sm">Adicione treinamentos usando o formulário acima.</p>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Carteira</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Carga Horária</TableHead>
                  {isAdmin && <TableHead>Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {treinamentosFiltrados.map((treinamento) => (
                  <TableRow key={treinamento.id}>
                    <TableCell className="font-medium">{treinamento.quantidade}</TableCell>
                    <TableCell>{treinamento.turno}</TableCell>
                    <TableCell>{treinamento.carteira}</TableCell>
                    <TableCell>{new Date(treinamento.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{treinamento.responsavel}</TableCell>
                    <TableCell>
                      <Badge variant={treinamento.status === "Aplicado" ? "default" : "secondary"}>
                        {treinamento.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{treinamento.assunto}</TableCell>
                    <TableCell>{treinamento.cargaHoraria || "-"}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleEditTreinamento(treinamento)}>
                          Editar Status
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

      {/* Edit Carteira Dialog */}
      {editingCarteira && (
        <Dialog open={!!editingCarteira} onOpenChange={() => setEditingCarteira(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Carteira</DialogTitle>
              <DialogDescription>Edite as informações da carteira</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-carteira-name">Nome da Carteira</Label>
                <Input
                  id="edit-carteira-name"
                  value={editingCarteira.name}
                  onChange={(e) => setEditingCarteira({ ...editingCarteira, name: e.target.value })}
                  placeholder="Nome da carteira"
                />
              </div>
              <Button onClick={handleUpdateCarteira} className="w-full">
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {editingTreinamento && (
        <Dialog open={!!editingTreinamento} onOpenChange={() => setEditingTreinamento(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Status do Treinamento</DialogTitle>
              <DialogDescription>Altere o status do treinamento entre Pendente e Aplicado</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Treinamento: {editingTreinamento.assunto}</Label>
                <p className="text-sm text-muted-foreground">
                  Carteira: {editingTreinamento.carteira} | Quantidade: {editingTreinamento.quantidade}
                </p>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingTreinamento.status}
                  onValueChange={(value) =>
                    setEditingTreinamento({ ...editingTreinamento, status: value as "Aplicado" | "Pendente" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aplicado">Aplicado</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdateTreinamento} className="w-full">
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
