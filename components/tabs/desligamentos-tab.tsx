"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Eye, EyeOff, UserX, AlertTriangle, Building2, Edit, Trash2, Filter } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"
import { useData } from "@/contexts/data-context"

const motivosDesligamento = [
  "Pedido de Demissão",
  "Demissão sem Justa Causa",
  "Justa Causa",
  "Término de Contrato",
  "Aposentadoria",
  "Falecimento",
  "Abandono de Emprego",
]

interface DesligamentosTabProps {
  filters?: {
    dateRange?: { start: string; end: string }
    turno?: string
    carteira?: string
    motivo?: string
  }
}

export function DesligamentosTab({ filters }: DesligamentosTabProps) {
  const { user } = useAuth()
  const isAdmin = hasPermission(user, "edit")
  const { desligamentos, addDesligamento, updateDesligamento, deleteDesligamento, getDesligamentosStats, carteiras } =
    useData()

  const [showCharts, setShowCharts] = useState(true)
  const [dateFilter, setDateFilter] = useState("")
  const [carteiraFilter, setCarteiraFilter] = useState("todas")

  const stats = getDesligamentosStats()

  // Form state para novo desligamento
  const [novoDesligamento, setNovoDesligamento] = useState({
    nome: "",
    carteira: "",
    turno: "",
    data: "",
    motivo: "",
    avisoPrevia: "Com" as "Com" | "Sem",
    responsavel: "",
    veioAgencia: "Não" as "Sim" | "Não",
    observacao: "",
  })

  // Estado para edição de desligamentos
  const [editingDesligamento, setEditingDesligamento] = useState<any>(null)

  const handleEditDesligamento = (desligamento: any) => {
    setEditingDesligamento(desligamento)
    setNovoDesligamento({
      nome: desligamento.nome,
      carteira: desligamento.carteira,
      turno: desligamento.turno,
      data: desligamento.data,
      motivo: desligamento.motivo,
      avisoPrevia: desligamento.avisoPrevia,
      responsavel: desligamento.responsavel,
      veioAgencia: desligamento.veioAgencia,
      observacao: desligamento.observacao,
    })
  }

  const handleDeleteDesligamento = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este registro de desligamento?")) {
      deleteDesligamento(id)
      alert("Desligamento excluído com sucesso!")
    }
  }

  const handleAddDesligamento = () => {
    if (novoDesligamento.nome && novoDesligamento.carteira && novoDesligamento.motivo && novoDesligamento.data) {
      if (editingDesligamento) {
        // Editando desligamento existente
        updateDesligamento(editingDesligamento.id, novoDesligamento)
        alert("Desligamento atualizado com sucesso!")
      } else {
        // Adicionando novo desligamento
        addDesligamento(novoDesligamento)
        alert("Desligamento registrado com sucesso!")
      }

      console.log("[v0] Desligamento processado:", novoDesligamento)

      // Reset form
      setNovoDesligamento({
        nome: "",
        carteira: "",
        turno: "",
        data: "",
        motivo: "",
        avisoPrevia: "Com",
        responsavel: "",
        veioAgencia: "Não",
        observacao: "",
      })
      setEditingDesligamento(null)
    } else {
      alert("Por favor, preencha todos os campos obrigatórios (Nome, Carteira, Motivo e Data)")
    }
  }

  const pieDataAvisoPrevia = [
    { name: "Com Aviso Prévio", value: stats.comAvisoPrevia, color: "#22c55e" },
    { name: "Sem Aviso Prévio", value: stats.semAvisoPrevia, color: "#ef4444" },
  ].filter((item) => item.value > 0)

  const pieDataMotivos = motivosDesligamento
    .map((motivo, index) => ({
      name: motivo,
      value: desligamentos.filter((d) => d.motivo === motivo).length,
      color: `hsl(${(index * 360) / motivosDesligamento.length}, 70%, 50%)`,
    }))
    .filter((item) => item.value > 0)

  const carteiraDesligamentos = carteiras.map((carteira) => ({
    carteira: carteira.name,
    quantidade: desligamentos.filter((d) => d.carteira === carteira.name).length,
  }))

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserX className="h-4 w-4" />
              Total Desligamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalDesligamentos}</div>
            <p className="text-xs text-muted-foreground">Registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Com Aviso Prévio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.comAvisoPrevia}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDesligamentos > 0 ? ((stats.comAvisoPrevia / stats.totalDesligamentos) * 100).toFixed(1) : 0}%
              do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sem Aviso Prévio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.semAvisoPrevia}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDesligamentos > 0 ? ((stats.semAvisoPrevia / stats.totalDesligamentos) * 100).toFixed(1) : 0}%
              do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Veio de Agência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.veioAgencia}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDesligamentos > 0 ? ((stats.veioAgencia / stats.totalDesligamentos) * 100).toFixed(1) : 0}% do
              total
            </p>
          </CardContent>
        </Card>
      </div>

      {desligamentos.length > 0 && (
        <>
          {/* Análise de Motivos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Análise de Motivos
              </CardTitle>
              <CardDescription>Principais motivos de desligamento para análise</CardDescription>
            </CardHeader>
            <CardContent>
              {pieDataMotivos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pieDataMotivos.map((motivo, index) => (
                    <Card key={index} className="border-l-4" style={{ borderLeftColor: motivo.color }}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-sm">{motivo.name}</h4>
                            <p className="text-2xl font-bold mt-1">{motivo.value}</p>
                          </div>
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${motivo.color}20` }}
                          >
                            <span className="text-lg font-bold" style={{ color: motivo.color }}>
                              {motivo.value}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum motivo de desligamento registrado ainda.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Desligamentos por Carteira */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Desligamentos por Carteira
              </CardTitle>
              <CardDescription>Distribuição de desligamentos por carteira</CardDescription>
            </CardHeader>
            <CardContent>
              {carteiraDesligamentos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {carteiraDesligamentos.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 text-center">
                        <h4 className="font-semibold text-sm mb-2">{item.carteira}</h4>
                        <div className="text-2xl font-bold text-red-600">{item.quantidade}</div>
                        <p className="text-xs text-muted-foreground">desligamentos</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma carteira cadastrada ainda.</p>
                  <p className="text-sm">Acesse a aba "Carteiras" para gerenciar as carteiras.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Charts Toggle */}
      {desligamentos.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setShowCharts(!showCharts)} className="gap-2">
            {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
          </Button>
        </div>
      )}

      {/* Charts */}
      {showCharts && desligamentos.length > 0 && pieDataAvisoPrevia.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Aviso Prévio</CardTitle>
              <CardDescription>Distribuição por aviso prévio</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieDataAvisoPrevia}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieDataAvisoPrevia.map((entry, index) => (
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
              <CardTitle>Desligamentos por Carteira</CardTitle>
              <CardDescription>Quantidade por carteira</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={carteiraDesligamentos.filter((c) => c.quantidade > 0)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="carteira" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Adicionar/Editar Desligamento */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>{editingDesligamento ? "Editar Desligamento" : "Registrar Novo Desligamento"}</CardTitle>
            <CardDescription>
              {editingDesligamento ? "Edite os dados do desligamento" : "Adicione um novo registro de desligamento"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={novoDesligamento.nome}
                  onChange={(e) => setNovoDesligamento({ ...novoDesligamento, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="carteira">Carteira *</Label>
                <Select
                  value={novoDesligamento.carteira}
                  onValueChange={(value) => setNovoDesligamento({ ...novoDesligamento, carteira: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar carteira" />
                  </SelectTrigger>
                  <SelectContent>
                    {carteiras.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Nenhuma carteira cadastrada. Acesse a aba "Carteiras" para adicionar.
                      </div>
                    ) : (
                      carteiras.map((carteira) => (
                        <SelectItem key={carteira.name} value={carteira.name}>
                          {carteira.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="turno">Turno</Label>
                <Select
                  value={novoDesligamento.turno}
                  onValueChange={(value) => setNovoDesligamento({ ...novoDesligamento, turno: value })}
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
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={novoDesligamento.data}
                  onChange={(e) => setNovoDesligamento({ ...novoDesligamento, data: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="motivo">Motivo *</Label>
                <Input
                  id="motivo"
                  value={novoDesligamento.motivo}
                  onChange={(e) => setNovoDesligamento({ ...novoDesligamento, motivo: e.target.value })}
                  placeholder="Digite o motivo do desligamento"
                />
              </div>
              <div>
                <Label htmlFor="aviso-previa">Aviso Prévio</Label>
                <Select
                  value={novoDesligamento.avisoPrevia}
                  onValueChange={(value: "Com" | "Sem") =>
                    setNovoDesligamento({ ...novoDesligamento, avisoPrevia: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Com">Com</SelectItem>
                    <SelectItem value="Sem">Sem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={novoDesligamento.responsavel}
                  onChange={(e) => setNovoDesligamento({ ...novoDesligamento, responsavel: e.target.value })}
                  placeholder="Nome do responsável"
                />
              </div>
              <div>
                <Label htmlFor="veio-agencia">Veio de Agência</Label>
                <Select
                  value={novoDesligamento.veioAgencia}
                  onValueChange={(value: "Sim" | "Não") =>
                    setNovoDesligamento({ ...novoDesligamento, veioAgencia: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mb-4">
              <Label htmlFor="observacao">Observação</Label>
              <Textarea
                id="observacao"
                value={novoDesligamento.observacao}
                onChange={(e) => setNovoDesligamento({ ...novoDesligamento, observacao: e.target.value })}
                placeholder="Observações sobre o desligamento..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddDesligamento} className="flex-1">
                {editingDesligamento ? "Atualizar Desligamento" : "Registrar Desligamento"}
              </Button>
              {editingDesligamento && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingDesligamento(null)
                    setNovoDesligamento({
                      nome: "",
                      carteira: "",
                      turno: "",
                      data: "",
                      motivo: "",
                      avisoPrevia: "Com",
                      responsavel: "",
                      veioAgencia: "Não",
                      observacao: "",
                    })
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Registros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Registros de Desligamentos
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Input
                type="date"
                placeholder="Filtrar por data"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-40"
              />
              <Select value={carteiraFilter} onValueChange={setCarteiraFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar carteira" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {carteiras.map((carteira) => (
                    <SelectItem key={carteira.name} value={carteira.name}>
                      {carteira.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(dateFilter || carteiraFilter !== "todas") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateFilter("")
                    setCarteiraFilter("todas")
                  }}
                >
                  Limpar
                </Button>
              )}
            </div>
          </CardTitle>
          <CardDescription>Histórico completo de desligamentos</CardDescription>
        </CardHeader>
        <CardContent>
          {desligamentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum desligamento registrado ainda.</p>
              <p className="text-sm">Use o formulário acima para registrar desligamentos.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Carteira</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Aviso Prévio</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Agência</TableHead>
                    <TableHead>Observação</TableHead>
                    {isAdmin && <TableHead>Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {desligamentos.map((desligamento) => (
                    <TableRow key={desligamento.id}>
                      <TableCell className="font-medium">{desligamento.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{desligamento.carteira}</Badge>
                      </TableCell>
                      <TableCell>{desligamento.turno}</TableCell>
                      <TableCell>{new Date(desligamento.data).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{desligamento.motivo}</TableCell>
                      <TableCell>
                        <Badge variant={desligamento.avisoPrevia === "Com" ? "default" : "destructive"}>
                          {desligamento.avisoPrevia}
                        </Badge>
                      </TableCell>
                      <TableCell>{desligamento.responsavel}</TableCell>
                      <TableCell>
                        <Badge variant={desligamento.veioAgencia === "Sim" ? "secondary" : "outline"}>
                          {desligamento.veioAgencia}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={desligamento.observacao}>
                        {desligamento.observacao}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditDesligamento(desligamento)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDesligamento(desligamento.id)}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
