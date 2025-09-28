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
import { Upload, Download, Plus, Edit, Trash2, FileSpreadsheet, Filter, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { hasPermission } from "@/lib/auth"

export function OperadoresTab() {
  const { user } = useAuth()
  const isAdmin = hasPermission(user, "edit")
  const [showFilters, setShowFilters] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingOperador, setEditingOperador] = useState<any>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { operadores, addOperador, updateOperador, deleteOperador, importOperadores, assuntos } = useData()
  const totalTreinados = operadores.length

  const [filtrosAplicados, setFiltrosAplicados] = useState({
    data: "",
    nome: "",
    assunto: "",
  })

  const [filtroAssunto, setFiltroAssunto] = useState("")
  const [filtroNome, setFiltroNome] = useState("")
  const [filtroData, setFiltroData] = useState("")

  const [formData, setFormData] = useState({
    nome: "",
    assunto: "",
    dataConlusao: "",
  })

  const treinadosFiltrados = operadores.filter((treinado) => {
    const matchAssunto =
      !filtrosAplicados.assunto || treinado.assunto.toLowerCase().includes(filtrosAplicados.assunto.toLowerCase())
    const matchNome =
      !filtrosAplicados.nome || treinado.nome.toLowerCase().includes(filtrosAplicados.nome.toLowerCase())
    const matchData = !filtrosAplicados.data || treinado.dataConlusao.includes(filtrosAplicados.data)

    return matchAssunto && matchNome && matchData
  })

  const handleImportPlanilha = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Only accept CSV files
    if (!file.name.endsWith(".csv")) {
      alert("Por favor, selecione apenas arquivos CSV (.csv)")
      event.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const operadoresImportados: Omit<any, "id">[] = []

        const lines = text.split("\n").filter((line) => line.trim())

        // Skip header if it exists
        const startIndex =
          lines[0] && (lines[0].toLowerCase().includes("nome") || lines[0].toLowerCase().includes("name")) ? 1 : 0

        for (let i = startIndex; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
          if (values.length >= 3 && values[0] && values[0].length > 1) {
            let dataConlusao = values[2]

            // Convert date format if needed
            if (dataConlusao && dataConlusao.includes("/")) {
              const dateParts = dataConlusao.split("/")
              if (dateParts.length === 3) {
                const day = dateParts[0].padStart(2, "0")
                const month = dateParts[1].padStart(2, "0")
                const year = dateParts[2]
                dataConlusao = `${year}-${month}-${day}`
              }
            }

            operadoresImportados.push({
              nome: values[0],
              assunto: values[1] || "Treinamento Geral",
              dataConlusao: dataConlusao || new Date().toISOString().split("T")[0],
            })
          }
        }

        if (operadoresImportados.length > 0) {
          importOperadores(operadoresImportados)
          alert(`${operadoresImportados.length} operadores importados com sucesso!`)
        } else {
          alert("Nenhum operador válido encontrado no arquivo CSV.")
        }
      } catch (error) {
        console.error("Erro ao importar arquivo:", error)
        alert("Erro ao processar o arquivo CSV. Verifique o formato e tente novamente.")
      }
    }
    reader.readAsText(file)

    event.target.value = ""
  }

  const handleConfirmarFiltro = () => {
    setFiltrosAplicados({
      data: filtroData,
      nome: filtroNome,
      assunto: filtroAssunto,
    })
    setShowFilters(false)
  }

  const handleRemoverFiltro = () => {
    setFiltroData("")
    setFiltroNome("")
    setFiltroAssunto("")
    setFiltrosAplicados({
      data: "",
      nome: "",
      assunto: "",
    })
    setShowFilters(false)
  }

  const handleAddOperador = () => {
    if (!formData.nome || !formData.assunto || !formData.dataConlusao) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    // Split names by line breaks and create multiple operators
    const nomes = formData.nome
      .split("\n")
      .map((nome) => nome.trim())
      .filter((nome) => nome.length > 0)

    if (nomes.length === 0) {
      alert("Por favor, digite pelo menos um nome.")
      return
    }

    // Add each operator
    nomes.forEach((nome) => {
      addOperador({
        nome,
        assunto: formData.assunto,
        dataConlusao: formData.dataConlusao,
      })
    })

    alert(`${nomes.length} operador(es) adicionado(s) com sucesso!`)

    setFormData({
      nome: "",
      assunto: "",
      dataConlusao: "",
    })
    setShowAddDialog(false)
  }

  const handleSaveEdit = () => {
    if (!formData.nome || !formData.assunto || !formData.dataConlusao) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    updateOperador(editingOperador.id, formData)
    setEditingOperador(null)
    setFormData({
      nome: "",
      assunto: "",
      dataConlusao: "",
    })
    setShowAddDialog(false)
  }

  const handleDeleteOperador = (operadorId: number) => {
    if (confirm("Tem certeza que deseja excluir este operador?")) {
      deleteOperador(operadorId)
    }
  }

  const handleDownloadPlanilha = () => {
    try {
      // Create CSV content without turno
      const headers = ["Nome", "Assunto", "Data Conclusão"]
      const csvContent = [
        headers.join(","),
        ...treinadosFiltrados.map((operador) =>
          [
            `"${operador.nome}"`,
            `"${operador.assunto}"`,
            `"${new Date(operador.dataConlusao).toLocaleDateString("pt-BR")}"`,
          ].join(","),
        ),
      ].join("\n")

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      link.setAttribute("href", url)
      link.setAttribute("download", `operadores_treinados_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao exportar planilha:", error)
      alert("Erro ao exportar planilha. Tente novamente.")
    }
  }

  const handleEditOperador = (operador: any) => {
    setEditingOperador(operador)
    setFormData({
      nome: operador.nome,
      assunto: operador.assunto,
      dataConlusao: operador.dataConlusao,
    })
    setShowAddDialog(true)
  }

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".csv" style={{ display: "none" }} />

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <Filter className="h-4 w-4" />
          {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
        </Button>

        {(filtrosAplicados.data || filtrosAplicados.nome || filtrosAplicados.assunto) && (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="filtro-data">Data</Label>
                <Input
                  id="filtro-data"
                  type="date"
                  value={filtroData}
                  onChange={(e) => setFiltroData(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="filtro-nome">Nome</Label>
                <Input
                  id="filtro-nome"
                  placeholder="Digite o nome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="filtro-assunto">Assunto</Label>
                <Input
                  id="filtro-assunto"
                  placeholder="Digite o assunto..."
                  value={filtroAssunto}
                  onChange={(e) => setFiltroAssunto(e.target.value)}
                />
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Operadores Treinados
          </CardTitle>
          <CardDescription>Controle completo de operadores com treinamento concluído</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Adicionar Operador
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingOperador ? "Editar Operador" : "Adicionar Novo Operador"}</DialogTitle>
                        <DialogDescription>
                          {editingOperador
                            ? "Edite as informações do operador treinado."
                            : "Adicione um ou mais operadores treinados ao sistema. Para adicionar múltiplos operadores, digite um nome por linha."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label htmlFor="nome">
                            {editingOperador ? "Nome do Operador" : "Nome(s) do(s) Operador(es)"}
                          </Label>
                          {editingOperador ? (
                            <Input
                              id="nome"
                              value={formData.nome}
                              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                              placeholder="Digite o nome completo"
                            />
                          ) : (
                            <Textarea
                              id="nome"
                              value={formData.nome}
                              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                              placeholder="Digite um nome por linha&#10;Exemplo:&#10;João Silva&#10;Maria Santos&#10;Pedro Costa"
                              rows={4}
                              className="resize-none"
                            />
                          )}
                          {!editingOperador && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Digite um nome por linha para adicionar múltiplos operadores de uma vez
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="assunto">Assunto</Label>
                          <Select
                            value={formData.assunto}
                            onValueChange={(value) => setFormData({ ...formData, assunto: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um assunto" />
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
                          <Label htmlFor="dataConlusao">Data de Conclusão</Label>
                          <Input
                            id="dataConlusao"
                            type="date"
                            value={formData.dataConlusao}
                            onChange={(e) => setFormData({ ...formData, dataConlusao: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddDialog(false)
                            setEditingOperador(null)
                            setFormData({
                              nome: "",
                              assunto: "",
                              dataConlusao: "",
                            })
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={editingOperador ? handleSaveEdit : handleAddOperador}>
                          {editingOperador ? "Salvar Alterações" : "Adicionar Operador"}
                        </Button>
                      </DialogFooter>
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Data Conclusão</TableHead>
                  {isAdmin && <TableHead>Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {treinadosFiltrados.length > 0 ? (
                  treinadosFiltrados.map((treinado) => (
                    <TableRow key={treinado.id}>
                      <TableCell className="font-medium">{treinado.nome}</TableCell>
                      <TableCell>{treinado.assunto}</TableCell>
                      <TableCell>{new Date(treinado.dataConlusao).toLocaleDateString("pt-BR")}</TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditOperador(treinado)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteOperador(treinado.id)}
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
                    <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-muted-foreground">
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
