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
import { Eye, EyeOff, UserX, TrendingDown, AlertTriangle, Building2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"

// Mock data para desligamentos
const desligamentosData = [
  {
    id: 1,
    nome: "Carlos Silva",
    carteira: "CAIXA",
    turno: "Manhã",
    data: "2024-01-15",
    motivo: "Pedido de Demissão",
    avisoPrevia: "Com",
    responsavel: "Maria Santos",
    veioAgencia: "Não",
    observacao: "Funcionário solicitou desligamento para nova oportunidade",
  },
  {
    id: 2,
    nome: "Ana Costa",
    carteira: "BTG",
    turno: "Tarde",
    data: "2024-01-12",
    motivo: "Justa Causa",
    avisoPrevia: "Sem",
    responsavel: "João Oliveira",
    veioAgencia: "Sim",
    observacao: "Descumprimento de normas internas",
  },
  {
    id: 3,
    nome: "Pedro Alves",
    carteira: "BMG",
    turno: "Integral",
    data: "2024-01-10",
    motivo: "Término de Contrato",
    avisoPrevia: "Com",
    responsavel: "Lucia Ferreira",
    veioAgencia: "Não",
    observacao: "Contrato temporário finalizado",
  },
  {
    id: 4,
    nome: "Fernanda Lima",
    carteira: "Carrefour",
    turno: "Manhã",
    data: "2024-01-08",
    motivo: "Pedido de Demissão",
    avisoPrevia: "Com",
    responsavel: "Roberto Silva",
    veioAgencia: "Sim",
    observacao: "Mudança de cidade",
  },
  {
    id: 5,
    nome: "Marcos Pereira",
    carteira: "WILLBANK",
    turno: "Tarde",
    data: "2024-01-05",
    motivo: "Demissão sem Justa Causa",
    avisoPrevia: "Com",
    responsavel: "Ana Santos",
    veioAgencia: "Não",
    observacao: "Reestruturação do setor",
  },
]

const motivosDesligamento = [
  "Pedido de Demissão",
  "Demissão sem Justa Causa",
  "Justa Causa",
  "Término de Contrato",
  "Aposentadoria",
  "Falecimento",
  "Abandono de Emprego",
]

export function DesligamentosTab() {
  const { user } = useAuth()
  const isAdmin = hasPermission(user, "edit")
  const [showCharts, setShowCharts] = useState(true)
  const [desligamentos, setDesligamentos] = useState(desligamentosData)
  const [motivos, setMotivos] = useState(motivosDesligamento)

  const [stats, setStats] = useState({
    totalDesligamentos: desligamentosData.length,
    comAvisoPrevia: desligamentosData.filter((d) => d.avisoPrevia === "Com").length,
    semAvisoPrevia: desligamentosData.filter((d) => d.avisoPrevia === "Sem").length,
    taxaRotatividade: 8.2,
    veioAgencia: desligamentosData.filter((d) => d.veioAgencia === "Sim").length,
  })

  // Form state para novo desligamento
  const [novoDesligamento, setNovoDesligamento] = useState({
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

  const updateStatistics = (newDesligamentos: any[]) => {
    const newStats = {
      totalDesligamentos: newDesligamentos.length,
      comAvisoPrevia: newDesligamentos.filter((d) => d.avisoPrevia === "Com").length,
      semAvisoPrevia: newDesligamentos.filter((d) => d.avisoPrevia === "Sem").length,
      taxaRotatividade: 8.2, // This would be calculated based on business logic
      veioAgencia: newDesligamentos.filter((d) => d.veioAgencia === "Sim").length,
    }
    setStats(newStats)
    console.log("[v0] Estatísticas de desligamentos atualizadas:", newStats)
  }

  const handleAddDesligamento = () => {
    if (novoDesligamento.nome && novoDesligamento.carteira && novoDesligamento.motivo) {
      const newDesligamento = {
        ...novoDesligamento,
        id: desligamentos.length + 1,
      }

      const updatedDesligamentos = [...desligamentos, newDesligamento]
      setDesligamentos(updatedDesligamentos)

      updateStatistics(updatedDesligamentos)

      console.log("[v0] Novo desligamento registrado:", newDesligamento)

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
    }
  }

  const pieDataAvisoPrevia = [
    { name: "Com Aviso Prévio", value: stats.comAvisoPrevia, color: "#22c55e" },
    { name: "Sem Aviso Prévio", value: stats.semAvisoPrevia, color: "#ef4444" },
  ]

  const pieDataMotivos = motivos
    .map((motivo, index) => ({
      name: motivo,
      value: desligamentos.filter((d) => d.motivo === motivo).length,
      color: `hsl(${(index * 360) / motivos.length}, 70%, 50%)`,
    }))
    .filter((item) => item.value > 0)

  const carteiraDesligamentos = ["CAIXA", "BTG", "BMG", "Carrefour", "WILLBANK"].map((carteira) => ({
    carteira,
    quantidade: desligamentos.filter((d) => d.carteira === carteira).length,
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
            <p className="text-xs text-muted-foreground">Este mês</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Taxa de Rotatividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.taxaRotatividade}%</div>
            <p className="text-xs text-muted-foreground">Mensal</p>
          </CardContent>
        </Card>
      </div>

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
                <BarChart data={carteiraDesligamentos}>
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

      {/* Adicionar Desligamento */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Novo Desligamento</CardTitle>
            <CardDescription>Adicione um novo registro de desligamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={novoDesligamento.nome}
                  onChange={(e) => setNovoDesligamento({ ...novoDesligamento, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="carteira">Carteira</Label>
                <Select
                  value={novoDesligamento.carteira}
                  onValueChange={(value) => setNovoDesligamento({ ...novoDesligamento, carteira: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar carteira" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAIXA">CAIXA</SelectItem>
                    <SelectItem value="BTG">BTG</SelectItem>
                    <SelectItem value="BMG">BMG</SelectItem>
                    <SelectItem value="Carrefour">Carrefour</SelectItem>
                    <SelectItem value="WILLBANK">WILLBANK</SelectItem>
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
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={novoDesligamento.data}
                  onChange={(e) => setNovoDesligamento({ ...novoDesligamento, data: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="motivo">Motivo</Label>
                <Select
                  value={novoDesligamento.motivo}
                  onValueChange={(value) => setNovoDesligamento({ ...novoDesligamento, motivo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {motivos.map((motivo) => (
                      <SelectItem key={motivo} value={motivo}>
                        {motivo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="aviso-previa">Aviso Prévio</Label>
                <Select
                  value={novoDesligamento.avisoPrevia}
                  onValueChange={(value) => setNovoDesligamento({ ...novoDesligamento, avisoPrevia: value })}
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
                  onValueChange={(value) => setNovoDesligamento({ ...novoDesligamento, veioAgencia: value })}
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
            <Button onClick={handleAddDesligamento} className="w-full">
              Registrar Desligamento
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Registros */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Desligamentos</CardTitle>
          <CardDescription>Histórico completo de desligamentos</CardDescription>
        </CardHeader>
        <CardContent>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
