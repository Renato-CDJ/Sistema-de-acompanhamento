"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Upload, Download, Eye, EyeOff, Users, BookOpen, Award, FileSpreadsheet } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"

// Mock data baseado nos treinamentos da aba de Capacitação
const operadoresTreinados = [
  { id: 1, nome: "João Silva", assunto: "Treinamento Inicial", dataConlusao: "2024-01-15", carteira: "CAIXA" },
  { id: 2, nome: "Maria Santos", assunto: "Calibragem", dataConlusao: "2024-01-14", carteira: "BTG" },
  { id: 3, nome: "Pedro Costa", assunto: "Feedback", dataConlusao: "2024-01-13", carteira: "WILLBANK" },
  { id: 4, nome: "Ana Oliveira", assunto: "SARB", dataConlusao: "2024-01-12", carteira: "PEFISA" },
  { id: 5, nome: "Carlos Lima", assunto: "Prevenção ao Assédio", dataConlusao: "2024-01-11", carteira: "BMG" },
  { id: 6, nome: "Lucia Ferreira", assunto: "Compliance", dataConlusao: "2024-01-10", carteira: "CAIXA" },
  { id: 7, nome: "Roberto Alves", assunto: "Atendimento ao Cliente", dataConlusao: "2024-01-09", carteira: "BTG" },
  { id: 8, nome: "Fernanda Rocha", assunto: "Treinamento Inicial", dataConlusao: "2024-01-08", carteira: "WILLBANK" },
  { id: 9, nome: "Marcos Pereira", assunto: "Calibragem", dataConlusao: "2024-01-07", carteira: "PEFISA" },
  { id: 10, nome: "Juliana Mendes", assunto: "Feedback", dataConlusao: "2024-01-06", carteira: "BMG" },
]

// Estatísticas baseadas nos dados
const assuntosStats = [
  { assunto: "Treinamento Inicial", quantidade: 2, color: "#f97316" },
  { assunto: "Calibragem", quantidade: 2, color: "#fb923c" },
  { assunto: "Feedback", quantidade: 2, color: "#fdba74" },
  { assunto: "SARB", quantidade: 1, color: "#fed7aa" },
  { assunto: "Prevenção ao Assédio", quantidade: 1, color: "#ffedd5" },
  { assunto: "Compliance", quantidade: 1, color: "#22c55e" },
  { assunto: "Atendimento ao Cliente", quantidade: 1, color: "#16a34a" },
]

const carteiraStats = [
  { carteira: "CAIXA", quantidade: 2, color: "#f97316" },
  { carteira: "BTG", quantidade: 2, color: "#fb923c" },
  { carteira: "WILLBANK", quantidade: 2, color: "#fdba74" },
  { carteira: "PEFISA", quantidade: 2, color: "#fed7aa" },
  { carteira: "BMG", quantidade: 2, color: "#ffedd5" },
]

export function TreinadosTab() {
  const { user } = useAuth()
  const isAdmin = hasPermission(user, "edit")
  const [showCharts, setShowCharts] = useState(true)
  const [treinados, setTreinados] = useState(operadoresTreinados)
  const [filtroAssunto, setFiltroAssunto] = useState("")
  const [filtroNome, setFiltroNome] = useState("")

  const totalTreinados = treinados.length
  const assuntosUnicos = [...new Set(treinados.map((t) => t.assunto))]

  // Filtrar dados
  const treinadosFiltrados = treinados.filter((treinado) => {
    const matchAssunto = !filtroAssunto || treinado.assunto.toLowerCase().includes(filtroAssunto.toLowerCase())
    const matchNome = !filtroNome || treinado.nome.toLowerCase().includes(filtroNome.toLowerCase())
    return matchAssunto && matchNome
  })

  // Simular importação de planilha
  const handleImportPlanilha = () => {
    // Em uma implementação real, isso abriria um file picker
    const novosTreinados = [
      {
        id: treinados.length + 1,
        nome: "Importado da Planilha",
        assunto: "Treinamento Inicial",
        dataConlusao: "2024-01-16",
        carteira: "CAIXA",
      },
    ]
    setTreinados([...treinados, ...novosTreinados])
    alert("Planilha importada com sucesso!")
  }

  // Simular download de planilha
  const handleDownloadPlanilha = () => {
    // Em uma implementação real, isso geraria e baixaria um arquivo Excel
    const csvContent =
      "Nome,Assunto,Data Conclusão,Carteira\n" +
      treinadosFiltrados.map((t) => `${t.nome},${t.assunto},${t.dataConlusao},${t.carteira}`).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "operadores-treinados.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total de Operadores Treinados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalTreinados}</div>
            <p className="text-xs text-muted-foreground mt-1">Operadores com treinamento concluído</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Assuntos Diferentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{assuntosUnicos.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Tipos de treinamento aplicados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Média por Assunto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{Math.round(totalTreinados / assuntosUnicos.length)}</div>
            <p className="text-xs text-muted-foreground mt-1">Operadores por tipo de treinamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Assunto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Estatísticas por Assunto de Capacitação
          </CardTitle>
          <CardDescription>Quantidade de operadores treinados por assunto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assuntosStats.map((stat, index) => (
              <Card key={index} className="border-l-4" style={{ borderLeftColor: stat.color }}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-sm">{stat.assunto}</h4>
                      <p className="text-2xl font-bold mt-1">{stat.quantidade}</p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <span className="text-lg font-bold" style={{ color: stat.color }}>
                        {stat.quantidade}
                      </span>
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
              <CardTitle>Distribuição por Assunto</CardTitle>
              <CardDescription>Operadores treinados por assunto</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assuntosStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ assunto, percent }) => `${assunto.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantidade"
                  >
                    {assuntosStats.map((entry, index) => (
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
              <CardTitle>Treinados por Carteira</CardTitle>
              <CardDescription>Distribuição por carteira</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={carteiraStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="carteira" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Operadores Treinados
          </CardTitle>
          <CardDescription>Lista completa de operadores com treinamento concluído</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="filtro-nome">Filtrar por Nome</Label>
              <Input
                id="filtro-nome"
                placeholder="Digite o nome do operador..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="filtro-assunto">Filtrar por Assunto</Label>
              <Input
                id="filtro-assunto"
                placeholder="Digite o assunto..."
                value={filtroAssunto}
                onChange={(e) => setFiltroAssunto(e.target.value)}
              />
            </div>
            <div className="flex flex-col justify-end gap-2">
              {isAdmin && (
                <Button onClick={handleImportPlanilha} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Importar Planilha
                </Button>
              )}
              <Button variant="outline" onClick={handleDownloadPlanilha} className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Baixar Planilha
              </Button>
            </div>
          </div>

          {/* Tabela de Operadores Treinados */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Data Conclusão</TableHead>
                  <TableHead>Carteira</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treinadosFiltrados.length > 0 ? (
                  treinadosFiltrados.map((treinado) => (
                    <TableRow key={treinado.id}>
                      <TableCell className="font-medium">{treinado.nome}</TableCell>
                      <TableCell>{treinado.assunto}</TableCell>
                      <TableCell>{new Date(treinado.dataConlusao).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{treinado.carteira}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        >
                          Concluído
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum operador encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {treinadosFiltrados.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {treinadosFiltrados.length} de {totalTreinados} operadores treinados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
