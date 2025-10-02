"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Wallet } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"
import { useData } from "@/contexts/data-context"
import { toast } from "@/hooks/use-toast"

interface CarteirasTabProps {
  filters?: any
}

export function CarteirasTab({ filters }: CarteirasTabProps) {
  const { user } = useAuth()
  const isAdmin = hasPermission(user, "edit")

  const { carteiras, addCarteira, updateCarteira, removeCarteira } = useData()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCarteira, setEditingCarteira] = useState<{ id: string; name: string } | null>(null)
  const [newCarteiraName, setNewCarteiraName] = useState("")

  const handleAddCarteira = () => {
    if (newCarteiraName.trim()) {
      addCarteira(newCarteiraName.trim())
      setNewCarteiraName("")
      setIsAddDialogOpen(false)
      toast({
        title: "Carteira adicionada",
        description: `A carteira "${newCarteiraName.trim()}" foi adicionada com sucesso.`,
      })
    }
  }

  const handleEditCarteira = () => {
    if (editingCarteira && newCarteiraName.trim()) {
      updateCarteira(editingCarteira.id, newCarteiraName.trim())
      setNewCarteiraName("")
      setEditingCarteira(null)
      setIsEditDialogOpen(false)
      toast({
        title: "Carteira atualizada",
        description: `A carteira foi atualizada para "${newCarteiraName.trim()}".`,
      })
    }
  }

  const handleDeleteCarteira = (id: string, name: string) => {
    removeCarteira(id)
    toast({
      title: "Carteira removida",
      description: `A carteira "${name}" foi removida com sucesso.`,
    })
  }

  const openEditDialog = (carteira: { id: string; name: string }) => {
    setEditingCarteira(carteira)
    setNewCarteiraName(carteira.name)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gerenciar Carteiras</h2>
          <p className="text-muted-foreground">
            Gerencie todas as carteiras do sistema. As carteiras criadas aqui estarão disponíveis em todas as outras
            abas.
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Carteira
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Carteira</DialogTitle>
                <DialogDescription>Digite o nome da nova carteira que será adicionada ao sistema.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="carteira-name">Nome da Carteira</Label>
                  <Input
                    id="carteira-name"
                    placeholder="Digite o nome da carteira"
                    value={newCarteiraName}
                    onChange={(e) => setNewCarteiraName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddCarteira()
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddCarteira} disabled={!newCarteiraName.trim()}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Carteiras List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Carteiras Cadastradas
          </CardTitle>
          <CardDescription>
            {carteiras.length === 0
              ? "Nenhuma carteira cadastrada ainda."
              : `${carteiras.length} carteira${carteiras.length > 1 ? "s" : ""} cadastrada${carteiras.length > 1 ? "s" : ""}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {carteiras.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma carteira cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando sua primeira carteira para organizar melhor seus dados.
              </p>
              {isAdmin && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Primeira Carteira
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Carteira</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  {isAdmin && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {carteiras.map((carteira) => (
                  <TableRow key={carteira.id}>
                    <TableCell className="font-medium">{carteira.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(carteira.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(carteira)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-destructive hover:text-destructive bg-transparent"
                              >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a carteira "{carteira.name}"? Esta ação não pode ser
                                  desfeita e a carteira será removida de todas as abas do sistema.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCarteira(carteira.id, carteira.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Carteira</DialogTitle>
            <DialogDescription>
              Altere o nome da carteira. Esta alteração será refletida em todas as abas do sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-carteira-name">Nome da Carteira</Label>
              <Input
                id="edit-carteira-name"
                placeholder="Digite o novo nome da carteira"
                value={newCarteiraName}
                onChange={(e) => setNewCarteiraName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEditCarteira()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditCarteira} disabled={!newCarteiraName.trim()}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
