"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useData } from "@/contexts/data-context"
import { Pencil, Trash2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export function ApuracaoTIATab() {
  const { tiaData, addTIAEntry, updateTIAEntry, deleteTIAEntry } = useData()

  const [formData, setFormData] = useState({
    date: "",
    analisados: "",
    quantidade: "",
  })

  const [editingEntry, setEditingEntry] = useState<{
    id: string
    date: string
    analisados: number
    quantidade: number
  } | null>(null)

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.date || !formData.analisados || !formData.quantidade) {
      alert("Por favor, preencha todos os campos")
      return
    }

    const analisados = Number.parseInt(formData.analisados)
    const quantidade = Number.parseInt(formData.quantidade)

    if (isNaN(analisados) || isNaN(quantidade) || quantidade === 0) {
      alert("Por favor, insira valores válidos")
      return
    }

    addTIAEntry({
      date: formData.date,
      analisados,
      quantidade,
    })

    setFormData({
      date: "",
      analisados: "",
      quantidade: "",
    })
  }

  const handleEdit = () => {
    if (!editingEntry) return

    updateTIAEntry(editingEntry.id, {
      date: editingEntry.date,
      analisados: editingEntry.analisados,
      quantidade: editingEntry.quantidade,
    })

    setEditingEntry(null)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteTIAEntry(deleteId)
      setDeleteId(null)
    }
  }

  const totalAnalisados = tiaData.reduce((sum, entry) => sum + entry.analisados, 0)
  const totalQuantidade = tiaData.reduce((sum, entry) => sum + entry.quantidade, 0)
  const totalConformes = totalQuantidade - totalAnalisados

  const pieData = [
    { name: "Conformes", value: totalConformes, color: "#22c55e" },
    { name: "Inconformes", value: totalAnalisados, color: "#ef4444" },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-6">
      {/* Form to add new entry */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Registro TIA</CardTitle>
          <CardDescription>Registre os dados de Tabulação Indevida de Acionamento</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="analisados">Analisados (Inconformes)</Label>
                <Input
                  id="analisados"
                  type="number"
                  min="0"
                  value={formData.analisados}
                  onChange={(e) => setFormData({ ...formData, analisados: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="gap-2">
              <Plus className="h-4 w-4" />
              Registrar
            </Button>
          </form>
        </CardContent>
      </Card>

      {tiaData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Conformidade</CardTitle>
            <CardDescription>Percentual de conformes vs inconformes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(2)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Table with all entries */}
      <Card>
        <CardHeader>
          <CardTitle>Registros TIA</CardTitle>
          <CardDescription>Histórico de Tabulação Indevida de Acionamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Analisados (Inconformes)</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Total %</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiaData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  tiaData.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.date).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">{entry.analisados}</TableCell>
                      <TableCell className="text-right">{entry.quantidade}</TableCell>
                      <TableCell className="text-right">{entry.totalPercent.toFixed(10)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setEditingEntry({
                                id: entry.id,
                                date: entry.date,
                                analisados: entry.analisados,
                                quantidade: entry.quantidade,
                              })
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(entry.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Registro TIA</DialogTitle>
            <DialogDescription>Atualize os dados do registro</DialogDescription>
          </DialogHeader>
          {editingEntry && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-date">Data</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingEntry.date}
                  onChange={(e) => setEditingEntry({ ...editingEntry, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-analisados">Analisados (Inconformes)</Label>
                <Input
                  id="edit-analisados"
                  type="number"
                  min="0"
                  value={editingEntry.analisados}
                  onChange={(e) => setEditingEntry({ ...editingEntry, analisados: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-quantidade">Quantidade</Label>
                <Input
                  id="edit-quantidade"
                  type="number"
                  min="1"
                  value={editingEntry.quantidade}
                  onChange={(e) => setEditingEntry({ ...editingEntry, quantidade: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEntry(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
