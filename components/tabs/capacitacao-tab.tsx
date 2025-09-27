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
import { Plus, Eye, EyeOff, Calendar, BookOpen, Users, CheckCircle, Clock } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"

const capacitacaoStats = {
  totalTreinamentos: 156,
  aplicados: 134,
  pendentes: 22,
  taxaConclusao: 85.9,
}

const carteirasCapacitacao = [
  { name: "CAIXA", total: 45, aplicados: 42, pendentes: 3, taxa: 93.3 },
  { name: "BTG", total: 38, aplicados: 35, pendentes: 3, taxa: 92.1 },
  { name: "WILLBANK", total: 32, aplicados: 28, pendentes: 4, taxa: 87.5 },
  { name: "PEFISA", total: 25, aplicados: 20, pendentes: 5, taxa: 80.0 },
  { name: "BMG", total: 16, aplicados: 9, pendentes: 7, taxa: 56.3 },
]

const assuntosCapacitacao = [
  "Treinamento Inicial",
  "Calibragem",
  "Feedback",
  "SARB",
  "Prevenção ao Assédio",
  "Compliance",
  "Atendimento ao Cliente",
]

const treinamentosData = [
  {
    id: 1,
    quantidade: 15,
    turno: "Manhã",
    carteira: "CAIXA",
    data: "2024-01-15",
    responsavel: "Maria Silva",
    status: "Aplicado",
    assunto: "Treinamento Inicial",
  },
  {
    id: 2,
    quantidade: 12,
    turno: "Tarde",
    carteira: "BTG",
    data: "2024-01-14",
    responsavel: "João Santos",
    status: "Pendente",
    assunto: "Calibragem",
  },
  {
    id: 3,
    quantidade: 8,
    turno: "Integral",
    carteira: "WILLBANK",
    data: "2024-01-13",
    responsavel: "Ana Costa",
    status: "Aplicado",
    assunto: "Feedback",
  },
]

export function CapacitacaoTab() {
  const { user } = useAuth()
  const isAdmin = hasPermission(user, "edit")
  const [showCharts, setShowCharts] = useState(true)
  const [carteiras, setCarteiras] = useState(carteirasCapacitacao)
  const [assuntos, setAssuntos] = useState(assuntosCapacitacao)
  const [treinamentos, setTreinamentos] = useState(treinamentosData)

  // Form states
  const [novaCarteira, setNovaCarteira] = useState("")
  const [novoAssunto, setNovoAssunto] = useState("")
  const [novoTreinamento, setNovoTreinamento] = useState({
    quantidade: "",
    turno: "",
    carteira: "",
    data: "",
    responsavel: "",
    status: "Pendente",
    assunto: "",
  })

  const pieDataStatus = [
    { name: "Aplicados", value: capacitacaoStats.aplicados, color: "#22c55e" },
    { name: "Pendentes", value: capacitacaoStats.pendentes, color: "#f59e0b" },
  ]

  const pieDataCarteiras = carteiras.map((carteira, index) => ({
    name: carteira.name,
    value: carteira.total,
    color: `hsl(${(index * 360) / carteiras.length}, 70%, 50%)`,
  }))

  const handleAddCarteira = () => {
    if (novaCarteira.trim()) {
      setCarteiras([...carteiras, { name: novaCarteira, total: 0, aplicados: 0, pendentes: 0, taxa: 0 }])
      setNovaCarteira("")
    }
  }

  const handleAddAssunto = () => {
    if (novoAssunto.trim()) {
      setAssuntos([...assuntos, novoAssunto])
      setNovoAssunto("")
    }
  }

  const handleAddTreinamento = () => {
    if (novoTreinamento.quantidade && novoTreinamento.carteira && novoTreinamento.assunto) {
      setTreinamentos([
        ...treinamentos,
        {
          ...novoTreinamento,
          id: treinamentos.length + 1,
          quantidade: Number.parseInt(novoTreinamento.quantidade),
        },
      ])
      setNovoTreinamento({
        quantidade: "",
        turno: "",
        carteira: "",
        data: "",
        responsavel: "",
        status: "Pendente",
        assunto: "",
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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{capacitacaoStats.taxaConclusao}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Carteira */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estatísticas por Carteira
              </CardTitle>
              <CardDescription>Desempenho de treinamentos por carteira</CardDescription>
            </div>
            {isAdmin && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Carteira
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Carteira</DialogTitle>
                    <DialogDescription>Adicione uma nova carteira para capacitação</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nova-carteira">Nome da Carteira</Label>
                      <Input
                        id="nova-carteira"
                        value={novaCarteira}
                        onChange={(e) => setNovaCarteira(e.target.value)}
                        placeholder="Nome da carteira"
                      />
                    </div>
                    <Button onClick={handleAddCarteira} className="w-full">
                      Adicionar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {carteiras.map((carteira, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{carteira.name}</h4>
                    <Badge
                      variant={carteira.taxa >= 90 ? "default" : carteira.taxa >= 70 ? "secondary" : "destructive"}
                    >
                      {carteira.taxa.toFixed(1)}%
                    </Badge>
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
        </CardContent>
      </Card>

      {/* Charts Toggle */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setShowCharts(!showCharts)} className="gap-2">
          {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
        </Button>
      </div>

      {/* Charts */}
      {showCharts && (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddTreinamento} className="flex-1">
                Adicionar Treinamento
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Assunto
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Assunto</DialogTitle>
                    <DialogDescription>Adicione um novo assunto de capacitação</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="novo-assunto">Nome do Assunto</Label>
                      <Input
                        id="novo-assunto"
                        value={novoAssunto}
                        onChange={(e) => setNovoAssunto(e.target.value)}
                        placeholder="Nome do assunto"
                      />
                    </div>
                    <Button onClick={handleAddAssunto} className="w-full">
                      Adicionar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
                {isAdmin && <TableHead>Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {treinamentos.map((treinamento) => (
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
                  {isAdmin && (
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
