"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"

export function UserProfileDialog() {
  const { user, login } = useAuth()
  const [open, setOpen] = useState(false)
  const [cargo, setCargo] = useState(user?.cargo || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const supabase = createClient()

      // Update profile in Supabase
      const { error } = await supabase.from("profiles").update({ cargo }).eq("id", user.id)

      if (error) {
        console.error("[v0] Error updating profile:", error)
        return
      }

      // Update current user session
      const updatedUser = {
        ...user,
        cargo,
      }
      login(updatedUser)
      setOpen(false)
    } catch (error) {
      console.error("[v0] Error in handleSave:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.cargo || (user.role === "superadmin" ? "Super Admin" : user.role === "admin" ? "Admin" : "Usuário")}
            </p>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Perfil do Usuário</DialogTitle>
          <DialogDescription>Atualize suas informações de perfil</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={user.name} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                placeholder="Ex: Analista de Qualidade, Supervisor, etc."
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função no Sistema</Label>
              <Input
                id="role"
                value={
                  user.role === "superadmin"
                    ? "Super Administrador"
                    : user.role === "admin"
                      ? "Administrador"
                      : "Usuário"
                }
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
