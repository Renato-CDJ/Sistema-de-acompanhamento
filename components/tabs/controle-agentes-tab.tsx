"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import { Upload, Download, Plus, Edit, Trash2, Users, Filter } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { hasPermission } from "@/lib/auth"
import * as XLSX from "xlsx"
import { useToast } from "@/hooks/use-toast"

export function ControleAgentesTab() {
  const { user } = useAuth()
  const isAdmin = hasPermission(user, "edit")
  const [showFilters, setShowFilters] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAgente, setEditingAgente] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const { agentes, addAgente, updateAgente, deleteAgente, importAgentes, carteiras } = useData()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("")

  const [filtrosAplicados, setFiltrosAplicados] = useState({
    carteira: "",
    operador: "",
    gestor: "",
    turno: "",
  })

  const [filtroCarteira, setFiltroCarteira] = useState("")
  const [filtroOperador, setFiltroOperador] = useState("")
  const [filtroGestor, setFiltroGestor] = useState("")
  const [filtroTurno, setFiltroTurno] = useState("")

  const [formData, setFormData] = useState({
    operador: "",
    carteira: "",
    gestor: "",
    turno: "INTEGRAL" as "INTEGRAL" | "TARDE" | "MANHÃ",
    status: "Ativo" as "Ativo" | "Desligado" | "Férias",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteAgenteId, setDeleteAgenteId] = useState<number | null>(null)

  const agentesFiltrados = agentes.filter((agente) => {
    const matchCarteira =
      !filtrosAplicados.carteira || agente.carteira.toLowerCase().includes(filtrosAplicados.carteira.toLowerCase())
    const matchOperador =
      !filtrosAplicados.operador || agente.operador.toLowerCase().includes(filtrosAplicados.operador.toLowerCase())
    const matchGestor =
      !filtrosAplicados.gestor || agente.gestor.toLowerCase().includes(filtrosAplicados.gestor.toLowerCase())
    const matchTurno = !filtrosAplicados.turno || agente.turno === filtrosAplicados.turno
    const matchSearch = !searchTerm || agente.operador.toLowerCase().includes(searchTerm.toLowerCase())

    return matchCarteira && matchOperador && matchGestor && matchTurno && matchSearch
  })

  const handleImportPlanilha = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos CSV (.csv)",
        variant: "destructive",
      })
      event.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const agentesImportados: Omit<any, "id">[] = []

        const lines = text.split("\n").filter((line) => line.trim())

        const startIndex =
          lines[0] && (lines[0].toLowerCase().includes("operador") || lines[0].toLowerCase().includes("carteira"))
            ? 1
            : 0

        for (let i = startIndex; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
          if (values.length >= 3 && values[0] && values[0].length > 1) {
            agentesImportados.push({
              operador: values[0],
              carteira: values[1] || "",
              gestor: values[2] || "",
              turno: (values[3] as "INTEGRAL" | "TARDE" | "MANHÃ") || "INTEGRAL",
              status: values[4] || "Ativo",
            })
          }
        }

        if (agentesImportados.length > 0) {
          importAgentes(agentesImportados)
          toast({
            title: "Sucesso",
            description: `${agentesImportados.length} agentes importados com sucesso!`,
            variant: "success",
          })
        } else {
          toast({
            title: "Erro",
            description: "Nenhum agente válido encontrado no arquivo CSV.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erro ao importar arquivo:", error)
        toast({
          title: "Erro",
          description: "Erro ao processar o arquivo CSV. Verifique o formato e tente novamente.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)

    event.target.value = ""
  }

  const handleConfirmarFiltro = () => {
    setFiltrosAplicados({
      carteira: filtroCarteira,
      operador: filtroOperador,
      gestor: filtroGestor,
      turno: filtroTurno,
    })
    setShowFilters(false)
  }

  const handleRemoverFiltro = () => {
    setFiltroCarteira("")
    setFiltroOperador("")
    setFiltroGestor("")
    setFiltroTurno("")
    setFiltrosAplicados({
      carteira: "",
      operador: "",
      gestor: "",
      turno: "",
    })
    setShowFilters(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.operador || !formData.carteira || !formData.gestor || !formData.status) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      if (editingAgente) {
        await updateAgente(editingAgente.id, formData)
        toast({
          title: "Sucesso",
          description: "Agente atualizado com sucesso!",
          variant: "success",
        })
      } else {
        // Handle multiple operators (one per line)
        const operadores = formData.operador.split("\n").filter((nome) => nome.trim())

        if (operadores.length > 1) {
          // Bulk add
          const agentesParaAdicionar = operadores.map((operador) => ({
            operador: operador.trim(),
            carteira: formData.carteira,
            gestor: formData.gestor,
            turno: formData.turno,
            status: formData.status,
          }))
          importAgentes(agentesParaAdicionar)
          toast({
            title: "Sucesso",
            description: `${operadores.length} agentes adicionados com sucesso!`,
            variant: "success",
          })
        } else {
          // Single add
          await addAgente({
            ...formData,
            operador: operadores[0].trim(),
          })
          toast({
            title: "Sucesso",
            description: "Agente adicionado com sucesso!",
            variant: "success",
          })
        }
      }

      setIsDialogOpen(false)
      setEditingAgente(null)
      setFormData({
        operador: "",
        carteira: "",
        gestor: "",
        turno: "INTEGRAL",
        status: "Ativo",
      })
    } catch (error) {
      console.error("Erro ao salvar agente:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar agente. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAgente = async (agenteId: number) => {
    setDeleteAgenteId(agenteId)
  }

  const confirmDeleteAgente = async () => {
    if (deleteAgenteId === null) return

    try {
      await deleteAgente(deleteAgenteId)
      toast({
        title: "Sucesso",
        description: "Agente excluído com sucesso!",
        variant: "success",
      })
      setDeleteAgenteId(null)
    } catch (error) {
      console.error("Erro ao excluir agente:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir agente. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPlanilha = () => {
    try {
      const worksheetData = [
        ["CARTEIRA", "NOME", "GESTOR", "TURNO", "STATUS"],
        ...agentes.map((agente) => [agente.carteira, agente.operador, agente.gestor, agente.turno, agente.status]),
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Controle de Agentes")

      XLSX.writeFile(workbook, `controle_agentes_${new Date().toISOString().split("T")[0]}.xlsx`)
    } catch (error) {
      console.error("Erro ao exportar planilha:", error)
      toast({
        title: "Erro",
        description: "Erro ao exportar planilha. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleEditAgente = (agente: any) => {
    setEditingAgente(agente)
    setFormData({
      operador: agente.operador,
      carteira: agente.carteira,
      gestor: agente.gestor,
      turno: agente.turno,
      status: agente.status,
    })
    setIsDialogOpen(true)
  }

  const statusCounts = {
    total: agentes.length,
    ativos: agentes.filter((a) => a.status === "Ativo").length,
    desligados: agentes.filter((a) => a.status === "Desligado").length,
    ferias: agentes.filter((a) => a.status === "Férias").length,
  }

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status)
    setStatusDialogOpen(true)
  }

  const agentesByStatus = selectedStatus === "Total" ? agentes : agentes.filter((a) => a.status === selectedStatus)

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".csv" style={{ display: "none" }} />

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <Filter className="h-4 w-4" />
          {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
        </Button>

        {(filtrosAplicados.carteira ||
          filtrosAplicados.operador ||
          filtrosAplicados.gestor ||
          filtrosAplicados.turno) && (
          <Badge variant="secondary" className="gap-2">
            Filtros aplicados
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoverFiltro}
              className="h-4 w-4 p-0 hover:bg-transparent"
            >
              ×
            </Button>
          </Badge>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="filtro-carteira">Carteira</Label>
                <Input
                  id="filtro-carteira"
                  placeholder="Digite a carteira..."
                  value={filtroCarteira}
                  onChange={(e) => setFiltroCarteira(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="filtro-operador">Nome</Label>
                <Input
                  id="filtro-operador"
                  placeholder="Digite o nome..."
                  value={filtroOperador}
                  onChange={(e) => setFiltroOperador(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="filtro-gestor">Gestor</Label>
                <Input
                  id="filtro-gestor"
                  placeholder="Digite o gestor..."
                  value={filtroGestor}
                  onChange={(e) => setFiltroGestor(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="filtro-turno">Turno</Label>
                <Select value={filtroTurno} onValueChange={setFiltroTurno}>
                  <SelectTrigger id="filtro-turno">
                    <SelectValue placeholder="Todos os turnos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os turnos</SelectItem>
                    <SelectItem value="INTEGRAL">INTEGRAL</SelectItem>
                    <SelectItem value="TARDE">TARDE</SelectItem>
                    <SelectItem value="MANHÃ">MANHÃ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConfirmarFiltro} className="flex-1">
                Confirmar Filtro
              </Button>
              <Button variant="outline" onClick={handleRemoverFiltro} className="flex-1 bg-transparent">
                Remover Filtro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleStatusClick("Total")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Agentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{statusCounts.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Clique para ver detalhes</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleStatusClick("Ativo")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{statusCounts.ativos}</div>
            <p className="text-xs text-muted-foreground mt-1">Clique para ver detalhes</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleStatusClick("Desligado")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Desligados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{statusCounts.desligados}</div>
            <p className="text-xs text-muted-foreground mt-1">Clique para ver detalhes</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleStatusClick("Férias")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Férias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{statusCounts.ferias}</div>
            <p className="text-xs text-muted-foreground mt-1">Clique para ver detalhes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Controle de Agentes
          </CardTitle>
          <CardDescription>Controle de operadores para monitoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="search">Pesquisar Operador</Label>
            <Input
              id="search"
              placeholder="Digite o nome do operador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <>
                  <Dialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open)
                      if (!open) {
                        setEditingAgente(null)
                        setFormData({
                          operador: "",
                          carteira: "",
                          gestor: "",
                          turno: "INTEGRAL",
                          status: "Ativo",
                        })
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Adicionar Agente
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingAgente ? "Editar Agente" : "Adicionar Novo Agente"}</DialogTitle>
                        <DialogDescription>
                          {editingAgente
                            ? "Edite as informações do agente."
                            : "Adicione um ou mais agentes ao sistema. Para adicionar múltiplos agentes, digite um nome por linha."}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                          <div>
                            <Label htmlFor="operador">
                              {editingAgente ? "Nome do Operador" : "Nome(s) do(s) Operador(es)"}
                            </Label>
                            {editingAgente ? (
                              <Input
                                id="operador"
                                value={formData.operador}
                                onChange={(e) => setFormData({ ...formData, operador: e.target.value })}
                                placeholder="Digite o nome completo"
                                required
                              />
                            ) : (
                              <Textarea
                                id="operador"
                                value={formData.operador}
                                onChange={(e) => setFormData({ ...formData, operador: e.target.value })}
                                placeholder="Digite um nome por linha para adicionar múltiplos agentes de uma vez"
                                rows={4}
                                className="resize-none"
                                required
                              />
                            )}
                            {!editingAgente && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Digite um nome por linha para adicionar múltiplos agentes de uma vez
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="carteira">Carteira *</Label>
                            <Select
                              value={formData.carteira}
                              onValueChange={(value) => setFormData({ ...formData, carteira: value })}
                              required
                            >
                              <SelectTrigger id="carteira">
                                <SelectValue placeholder="Selecione uma carteira" />
                              </SelectTrigger>
                              <SelectContent>
                                {carteiras.length === 0 ? (
                                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    Nenhuma carteira cadastrada. Acesse a aba "Carteiras" para adicionar.
                                  </div>
                                ) : (
                                  carteiras.map((carteira) => (
                                    <SelectItem key={carteira.id} value={carteira.name}>
                                      {carteira.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="gestor">Gestor *</Label>
                            <Input
                              id="gestor"
                              value={formData.gestor}
                              onChange={(e) => setFormData({ ...formData, gestor: e.target.value })}
                              placeholder="Digite o nome do gestor"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="turno">Turno *</Label>
                            <Select
                              value={formData.turno}
                              onValueChange={(value: "INTEGRAL" | "TARDE" | "MANHÃ") =>
                                setFormData({ ...formData, turno: value })
                              }
                              required
                            >
                              <SelectTrigger id="turno">
                                <SelectValue placeholder="Selecione um turno" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="INTEGRAL">INTEGRAL</SelectItem>
                                <SelectItem value="TARDE">TARDE</SelectItem>
                                <SelectItem value="MANHÃ">MANHÃ</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="status">Status *</Label>
                            <Select
                              value={formData.status}
                              onValueChange={(value: "Ativo" | "Desligado" | "Férias") =>
                                setFormData({ ...formData, status: value })
                              }
                              required
                            >
                              <SelectTrigger id="status">
                                <SelectValue placeholder="Selecione um status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Ativo">Ativo</SelectItem>
                                <SelectItem value="Desligado">Desligado</SelectItem>
                                <SelectItem value="Férias">Férias</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsDialogOpen(false)
                              setEditingAgente(null)
                              setFormData({
                                operador: "",
                                carteira: "",
                                gestor: "",
                                turno: "INTEGRAL",
                                status: "Ativo",
                              })
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={isSubmitting}>
                            {editingAgente ? "Salvar Alterações" : "Adicionar Agente"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={handleImportPlanilha} variant="outline" className="gap-2 bg-transparent">
                    <Upload className="h-4 w-4" />
                    Importar Planilha
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={handleDownloadPlanilha} className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Exportar Planilha
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CARTEIRA</TableHead>
                  <TableHead>NOME</TableHead>
                  <TableHead>GESTOR</TableHead>
                  <TableHead>TURNO</TableHead>
                  <TableHead>STATUS</TableHead>
                  {isAdmin && <TableHead>Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentesFiltrados.length > 0 ? (
                  agentesFiltrados.map((agente) => (
                    <TableRow key={agente.id}>
                      <TableCell>{agente.carteira}</TableCell>
                      <TableCell className="font-medium">{agente.operador}</TableCell>
                      <TableCell>{agente.gestor}</TableCell>
                      <TableCell>{agente.turno}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            agente.status === "Ativo"
                              ? "default"
                              : agente.status === "Desligado"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {agente.status}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAgente(agente)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAgente(agente.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted-foreground">
                      Nenhum agente encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {agentesFiltrados.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {agentesFiltrados.length} de {agentes.length} agentes
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedStatus === "Total" ? "Todos os Agentes" : `Agentes - ${selectedStatus}`}</DialogTitle>
            <DialogDescription>
              Lista de operadores {selectedStatus === "Total" ? "" : `com status: ${selectedStatus}`}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">CARTEIRA</TableHead>
                  <TableHead className="w-[280px]">NOME</TableHead>
                  <TableHead className="w-[180px]">GESTOR</TableHead>
                  <TableHead className="w-[120px]">TURNO</TableHead>
                  <TableHead className="w-[120px]">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentesByStatus.length > 0 ? (
                  agentesByStatus.map((agente) => (
                    <TableRow key={agente.id}>
                      <TableCell className="w-[180px]">{agente.carteira}</TableCell>
                      <TableCell className="font-medium w-[280px]">{agente.operador}</TableCell>
                      <TableCell className="w-[180px]">{agente.gestor}</TableCell>
                      <TableCell className="w-[120px]">{agente.turno}</TableCell>
                      <TableCell className="w-[120px]">
                        <Badge
                          variant={
                            agente.status === "Ativo"
                              ? "default"
                              : agente.status === "Desligado"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {agente.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum agente encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">Total: {agentesByStatus.length} agentes</div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAgenteId !== null} onOpenChange={() => setDeleteAgenteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAgente}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
