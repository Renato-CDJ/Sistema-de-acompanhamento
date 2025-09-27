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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Plus, Eye, EyeOff, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"

const caixaData = {
  stats: { total: 245, ativos: 220, ferias: 15, afastamento: 10 },
  daily: [
    { date: "2024-01-15", total: 245, ativos: 220, ferias: 15, afastamento: 10, turno: "Geral" },
    { date: "2024-01-14", total: 243, ativos: 218, ferias: 15, afastamento: 10, turno: "Geral" },
  ],
}

const cobrancaData = {
  stats: { total: 180, ativos: 165, ferias: 10, afastamento: 5 },
  carteiras: [
    { name: "Banco Mercantil", total: 45, presentes: 42, faltas: 3, abs: "6.7%" },
    { name: "BMG", total: 38, presentes: 36, faltas: 2, abs: "5.3%" },
    { name: "BTG", total: 52, presentes: 48, faltas: 4, abs: "7.7%" },
    { name: "Carrefour", total: 45, presentes: 39, faltas: 6, abs: "13.3%" },
  ],
}

export function QuadroTab() {
  const { user } = useAuth()
  const isAdmin = hasPermission(user, "edit")
  const [selectedOption, setSelectedOption] = useState("caixa")
  const [selectedTurno, setSelectedTurno] = useState("geral")
  const [showCharts, setShowCharts] = useState(true)
  const [showCarteiraDetails, setShowCarteiraDetails] = useState(false)

  const currentData = selectedOption === "caixa" ? caixaData : cobrancaData

  const pieData = [
    { name: "Ativos", value: currentData.stats.ativos, color: "#f97316" },
    { name: "Férias", value: currentData.stats.ferias, color: "#fb923c" },
    { name: "Afastamento", value: currentData.stats.afastamento, color: "#fdba74" },
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="option">Opção</Label>
          <Select value={selectedOption} onValueChange={setSelectedOption}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="caixa">Caixa</SelectItem>
              <SelectItem value="cobranca">Cobrança</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="turno">Turno</Label>
          <Select value={selectedTurno} onValueChange={setSelectedTurno}>
            <SelectTrigger>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentData.stats.ativos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Férias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{currentData.stats.ferias}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Afastamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{currentData.stats.afastamento}</div>
          </CardContent>
        </Card>
      </div>

      {/* Cobrança specific - Carteiras */}
      {selectedOption === "cobranca" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Estatísticas por Carteira</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCarteiraDetails(!showCarteiraDetails)}>
                {showCarteiraDetails ? "Ocultar Detalhes" : "Mostrar Detalhes"}
              </Button>
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
                      <DialogDescription>Adicione uma nova carteira ao sistema</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="carteira-name">Nome da Carteira</Label>
                        <Input id="carteira-name" placeholder="Nome da carteira" />
                      </div>
                      <Button className="w-full">Adicionar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {showCarteiraDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Detalhes das Carteiras</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Carteira</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Presentes</TableHead>
                      <TableHead>Faltas</TableHead>
                      <TableHead>ABS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cobrancaData.carteiras.map((carteira, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{carteira.name}</TableCell>
                        <TableCell>{carteira.total}</TableCell>
                        <TableCell className="text-green-600">{carteira.presentes}</TableCell>
                        <TableCell className="text-red-600">{carteira.faltas}</TableCell>
                        <TableCell>{carteira.abs}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Charts Toggle */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setShowCharts(!showCharts)} className="gap-2">
          {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
        </Button>
      </div>

      {/* Charts */}
      {showCharts && (
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

      {/* Daily Data Entry */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Adicionar Dados Diários
            </CardTitle>
            <CardDescription>
              Registre os números diários para {selectedOption === "caixa" ? "Caixa" : "Cobrança"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="daily-total">Total</Label>
                <Input id="daily-total" type="number" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="daily-ativos">Ativos</Label>
                <Input id="daily-ativos" type="number" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="daily-ferias">Férias</Label>
                <Input id="daily-ferias" type="number" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="daily-afastamento">Afastamento</Label>
                <Input id="daily-afastamento" type="number" placeholder="0" />
              </div>
              <div className="flex items-end">
                <Button className="w-full">Salvar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Data */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Dados</CardTitle>
          <CardDescription>Últimos registros de {selectedOption === "caixa" ? "Caixa" : "Cobrança"}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Ativos</TableHead>
                <TableHead>Férias</TableHead>
                <TableHead>Afastamento</TableHead>
                <TableHead>Turno</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caixaData.daily.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(record.date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{record.total}</TableCell>
                  <TableCell className="text-green-600">{record.ativos}</TableCell>
                  <TableCell className="text-blue-600">{record.ferias}</TableCell>
                  <TableCell className="text-red-600">{record.afastamento}</TableCell>
                  <TableCell>{record.turno}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
