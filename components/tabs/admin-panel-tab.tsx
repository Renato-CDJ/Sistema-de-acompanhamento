"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useUsers } from "@/contexts/users-context"
import { isSuperAdmin } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Shield, ShieldOff, Trash2, Settings, Eye, Edit, Ban, CheckCircle, Search, Key } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const availableTabs = [
  { id: "overview", label: "Visão Geral" },
  { id: "quadro", label: "Quadro" },
  { id: "capacitacao", label: "Capacitação" },
  { id: "treinados", label: "Treinados" },
  { id: "desligamentos", label: "Desligamentos" },
  { id: "carteiras", label: "Carteiras" },
  { id: "operadores", label: "Operadores" },
  { id: "relatorio-monitorias", label: "Relatório de Monitorias" },
  { id: "apuracao-tia", label: "Apuração TIA" },
  { id: "agendas", label: "Agendas" },
  { id: "chat", label: "Chat" },
  { id: "documentos", label: "Documentos" },
  { id: "area-qualidade", label: "Área Qualidade" },
  { id: "controle-agentes", label: "Controle de Agentes" },
  { id: "admin-panel", label: "Painel Admin" },
  { id: "activity-log", label: "Log de Atividades" },
]

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function AdminPanelTab() {
  const { user } = useAuth()
  const {
    users,
    addUser,
    deleteUser,
    promoteUser,
    demoteUser,
    updateUserPermissions,
    blockUser,
    unblockUser,
    changeUserPassword,
  } = useUsers()
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null)
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false)
  const [userToBlock, setUserToBlock] = useState<{ id: string; name: string; blocked: boolean } | null>(null)
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false)
  const [userToChangePassword, setUserToChangePassword] = useState<{ id: string; name: string } | null>(null)
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" })
  const [passwordErrors, setPasswordErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
    cargo: "",
  })
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; password?: string; cargo?: string }>({})

  if (!isSuperAdmin(user)) {
    return (
      <Alert>
        <AlertDescription>Acesso negado. Apenas o administrador principal pode acessar este painel.</AlertDescription>
      </Alert>
    )
  }

  const validateForm = (): boolean => {
    const errors: { name?: string; email?: string; password?: string; cargo?: string } = {}

    if (!newUser.name.trim()) {
      errors.name = "Nome é obrigatório"
    }

    if (!newUser.email.trim()) {
      errors.email = "Email é obrigatório"
    } else if (!isValidEmail(newUser.email)) {
      errors.email = "Email inválido"
    } else if (users.some((u) => u.email === newUser.email)) {
      errors.email = "Este email já está em uso"
    }

    if (!newUser.password.trim()) {
      errors.password = "Senha é obrigatória"
    } else if (newUser.password.length < 6) {
      errors.password = "Senha deve ter no mínimo 6 caracteres"
    }

    if (!newUser.cargo.trim()) {
      errors.cargo = "Cargo é obrigatório"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddUser = () => {
    if (!validateForm()) {
      return
    }

    const defaultPermissions = {
      canCreateGroups: newUser.role === "admin",
      canManageUsers: false,
      tabPermissions: availableTabs.map((tab) => ({
        tabId: tab.id,
        canView: newUser.role === "admin",
        canEdit: newUser.role === "admin",
      })),
    }

    addUser({
      ...newUser,
      permissions: defaultPermissions,
    })

    setNewUser({ name: "", email: "", password: "", role: "user", cargo: "" })
    setFormErrors({})
    setIsAddUserOpen(false)
  }

  const handleToggleTabPermission = (userId: string, tabId: string, type: "view" | "edit") => {
    const targetUser = users.find((u) => u.id === userId)
    if (!targetUser || !targetUser.permissions) return

    const updatedPermissions = { ...targetUser.permissions }
    const tabIndex = updatedPermissions.tabPermissions.findIndex((p) => p.tabId === tabId)

    if (tabIndex === -1) {
      updatedPermissions.tabPermissions.push({
        tabId,
        canView: type === "view",
        canEdit: type === "edit",
      })
    } else {
      if (type === "view") {
        updatedPermissions.tabPermissions[tabIndex].canView = !updatedPermissions.tabPermissions[tabIndex].canView
        if (!updatedPermissions.tabPermissions[tabIndex].canView) {
          updatedPermissions.tabPermissions[tabIndex].canEdit = false
        }
      } else {
        updatedPermissions.tabPermissions[tabIndex].canEdit = !updatedPermissions.tabPermissions[tabIndex].canEdit
        if (updatedPermissions.tabPermissions[tabIndex].canEdit) {
          updatedPermissions.tabPermissions[tabIndex].canView = true
        }
      }
    }

    updateUserPermissions(userId, updatedPermissions)
  }

  const getTabPermission = (userId: string, tabId: string) => {
    const targetUser = users.find((u) => u.id === userId)
    if (!targetUser || !targetUser.permissions) return { canView: false, canEdit: false }

    const permission = targetUser.permissions.tabPermissions.find((p) => p.tabId === tabId)
    return permission || { canView: false, canEdit: false }
  }

  const handleDeleteClick = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName })
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id)
      setUserToDelete(null)
      setDeleteConfirmOpen(false)
    }
  }

  const cancelDelete = () => {
    setUserToDelete(null)
    setDeleteConfirmOpen(false)
  }

  const handleBlockClick = (userId: string, userName: string, isBlocked: boolean) => {
    setUserToBlock({ id: userId, name: userName, blocked: isBlocked })
    setBlockConfirmOpen(true)
  }

  const confirmBlock = () => {
    if (userToBlock) {
      if (userToBlock.blocked) {
        unblockUser(userToBlock.id)
      } else {
        blockUser(userToBlock.id)
      }
      setUserToBlock(null)
      setBlockConfirmOpen(false)
    }
  }

  const cancelBlock = () => {
    setUserToBlock(null)
    setBlockConfirmOpen(false)
  }

  const handlePasswordChangeClick = (userId: string, userName: string) => {
    setUserToChangePassword({ id: userId, name: userName })
    setPasswordChangeOpen(true)
  }

  const confirmPasswordChange = () => {
    if (!validatePasswordChange() || !userToChangePassword) {
      return
    }

    changeUserPassword(userToChangePassword.id, passwordData.newPassword)
    setPasswordData({ newPassword: "", confirmPassword: "" })
    setPasswordErrors({})
    setUserToChangePassword(null)
    setPasswordChangeOpen(false)
  }

  const cancelPasswordChange = () => {
    setPasswordData({ newPassword: "", confirmPassword: "" })
    setPasswordErrors({})
    setUserToChangePassword(null)
    setPasswordChangeOpen(false)
  }

  const validatePasswordChange = (): boolean => {
    const errors: { newPassword?: string; confirmPassword?: string } = {}

    if (!passwordData.newPassword.trim()) {
      errors.newPassword = "Nova senha é obrigatória"
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Senha deve ter no mínimo 6 caracteres"
    }

    if (!passwordData.confirmPassword.trim()) {
      errors.confirmPassword = "Confirmação de senha é obrigatória"
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem"
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const filteredUsers = users
    .filter((u) => u.email !== "admin@empresa.com")
    .filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  const activeUsers = filteredUsers.filter((u) => !u.blocked).length
  const blockedUsers = filteredUsers.filter((u) => u.blocked).length

  return (
    <div className="space-y-6">
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>Confirme a exclusão permanente do usuário do sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>? Esta ação não pode ser
              desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelDelete}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={blockConfirmOpen} onOpenChange={setBlockConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{userToBlock?.blocked ? "Desbloquear" : "Bloquear"} Usuário</DialogTitle>
            <DialogDescription>Confirme a alteração do status de acesso do usuário</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja {userToBlock?.blocked ? "desbloquear" : "bloquear"} o usuário{" "}
              <strong>{userToBlock?.name}</strong>?
              {!userToBlock?.blocked && " O usuário não poderá mais acessar o sistema."}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelBlock}>
                Cancelar
              </Button>
              <Button variant={userToBlock?.blocked ? "default" : "destructive"} onClick={confirmBlock}>
                {userToBlock?.blocked ? "Desbloquear" : "Bloquear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordChangeOpen} onOpenChange={setPasswordChangeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Alterar senha do usuário <strong>{userToChangePassword?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                  if (passwordErrors.newPassword) setPasswordErrors({ ...passwordErrors, newPassword: undefined })
                }}
                placeholder="Mínimo 6 caracteres"
                className={passwordErrors.newPassword ? "border-destructive" : ""}
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-destructive mt-1">{passwordErrors.newPassword}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  if (passwordErrors.confirmPassword)
                    setPasswordErrors({ ...passwordErrors, confirmPassword: undefined })
                }}
                placeholder="Digite a senha novamente"
                className={passwordErrors.confirmPassword ? "border-destructive" : ""}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelPasswordChange}>
                Cancelar
              </Button>
              <Button onClick={confirmPasswordChange}>Alterar Senha</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div>
        <h2 className="text-2xl font-bold">Painel de Administração</h2>
        <p className="text-muted-foreground">Gerencie usuários e permissões do sistema</p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredUsers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Bloqueados</CardTitle>
              <Ban className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{blockedUsers}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                <DialogDescription>Crie um novo usuário e defina suas permissões iniciais</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => {
                      setNewUser({ ...newUser, name: e.target.value })
                      if (formErrors.name) setFormErrors({ ...formErrors, name: undefined })
                    }}
                    placeholder="Nome completo"
                    className={formErrors.name ? "border-destructive" : ""}
                  />
                  {formErrors.name && <p className="text-sm text-destructive mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => {
                      setNewUser({ ...newUser, email: e.target.value })
                      if (formErrors.email) setFormErrors({ ...formErrors, email: undefined })
                    }}
                    placeholder="usuario@empresa.com"
                    className={formErrors.email ? "border-destructive" : ""}
                  />
                  {formErrors.email && <p className="text-sm text-destructive mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={newUser.cargo}
                    onChange={(e) => {
                      setNewUser({ ...newUser, cargo: e.target.value })
                      if (formErrors.cargo) setFormErrors({ ...formErrors, cargo: undefined })
                    }}
                    placeholder="Ex: Analista, Coordenador, Gerente"
                    className={formErrors.cargo ? "border-destructive" : ""}
                  />
                  {formErrors.cargo && <p className="text-sm text-destructive mt-1">{formErrors.cargo}</p>}
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => {
                      setNewUser({ ...newUser, password: e.target.value })
                      if (formErrors.password) setFormErrors({ ...formErrors, password: undefined })
                    }}
                    placeholder="Mínimo 6 caracteres"
                    className={formErrors.password ? "border-destructive" : ""}
                  />
                  {formErrors.password && <p className="text-sm text-destructive mt-1">{formErrors.password}</p>}
                </div>
                <div>
                  <Label htmlFor="role">Tipo de Usuário</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: "admin" | "user") => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário Comum</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddUser} className="w-full">
                  Criar Usuário
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
            <CardDescription>Gerencie os usuários e suas permissões de acesso às telas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                          {u.role === "admin" ? "Administrador" : "Usuário"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.blocked ? "destructive" : "default"}>
                          {u.blocked ? "Bloqueado" : "Ativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedUser(u.id)}>
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Permissões de {u.name}</DialogTitle>
                                <DialogDescription>
                                  Configure quais telas o usuário pode visualizar e editar
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Tela</TableHead>
                                      <TableHead className="text-center">
                                        <Eye className="h-4 w-4 inline mr-1" />
                                        Visualizar
                                      </TableHead>
                                      <TableHead className="text-center">
                                        <Edit className="h-4 w-4 inline mr-1" />
                                        Editar
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {availableTabs.map((tab) => {
                                      const permission = getTabPermission(u.id, tab.id)
                                      return (
                                        <TableRow key={tab.id}>
                                          <TableCell>{tab.label}</TableCell>
                                          <TableCell className="text-center">
                                            <Switch
                                              checked={permission.canView}
                                              onCheckedChange={() => handleToggleTabPermission(u.id, tab.id, "view")}
                                            />
                                          </TableCell>
                                          <TableCell className="text-center">
                                            <Switch
                                              checked={permission.canEdit}
                                              onCheckedChange={() => handleToggleTabPermission(u.id, tab.id, "edit")}
                                            />
                                          </TableCell>
                                        </TableRow>
                                      )
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {u.role === "user" ? (
                            <Button variant="outline" size="sm" onClick={() => promoteUser(u.id)} className="gap-1">
                              <Shield className="h-4 w-4" />
                              Promover
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => demoteUser(u.id)} className="gap-1">
                              <ShieldOff className="h-4 w-4" />
                              Rebaixar
                            </Button>
                          )}
                          <Button
                            variant={u.blocked ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleBlockClick(u.id, u.name, u.blocked || false)}
                            className="gap-1"
                          >
                            {u.blocked ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Desbloquear
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4" />
                                Bloquear
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePasswordChangeClick(u.id, u.name)}
                            className="gap-1"
                            title="Alterar senha"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(u.id, u.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
