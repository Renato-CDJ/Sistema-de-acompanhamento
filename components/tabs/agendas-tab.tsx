"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAgendas } from "@/contexts/agendas-context"
import { useAuth } from "@/contexts/auth-context"
import { useUsers } from "@/contexts/users-context"
import { hasPermission } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Plus, Trash2, Edit, Bell, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AgendasTab() {
  const { agendas, addAgenda, updateAgenda, deleteAgenda, getUpcomingAgendas } = useAgendas()
  const { user } = useAuth()
  const { users } = useUsers()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAgenda, setEditingAgenda] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ agenda: any; timeframe: string } | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    participants: [] as string[],
  })

  const isAdmin = hasPermission(user, "edit")
  const upcomingAgendas = getUpcomingAgendas()

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }, [])

  // Listen for agenda notifications
  useEffect(() => {
    const handleNotification = (event: any) => {
      setNotification(event.detail)
      setTimeout(() => setNotification(null), 10000) // Hide after 10 seconds
    }

    if (typeof window !== "undefined") {
      window.addEventListener("agenda-notification", handleNotification)
      return () => window.removeEventListener("agenda-notification", handleNotification)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (editingAgenda) {
      updateAgenda(editingAgenda, formData)
    } else {
      addAgenda({
        ...formData,
        createdBy: user.id,
      })
    }

    setFormData({ title: "", description: "", date: "", time: "", participants: [] })
    setEditingAgenda(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (agenda: any) => {
    setEditingAgenda(agenda.id)
    setFormData({
      title: agenda.title,
      description: agenda.description,
      date: agenda.date,
      time: agenda.time,
      participants: agenda.participants,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta agenda?")) {
      deleteAgenda(id)
    }
  }

  const toggleParticipant = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter((id) => id !== userId)
        : [...prev.participants, userId],
    }))
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const getParticipantNames = (participantIds: string[]) => {
    return participantIds
      .map((id) => users.find((u) => u.id === id)?.name)
      .filter(Boolean)
      .join(", ")
  }

  return (
    <div className="space-y-6">
      {notification && (
        <Alert className="bg-primary/10 border-primary">
          <Bell className="h-4 w-4" />
          <AlertDescription>
            <strong>Lembrete de Reunião - {notification.timeframe}</strong>
            <br />
            {notification.agenda.title} às {notification.agenda.time}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Agendas</h2>
          <p className="text-muted-foreground">Gerencie suas reuniões e compromissos</p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingAgenda(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Agenda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingAgenda ? "Editar Agenda" : "Nova Agenda"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="time">Horário</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Participantes</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {users.map((u) => (
                      <Button
                        key={u.id}
                        type="button"
                        variant={formData.participants.includes(u.id) ? "default" : "outline"}
                        onClick={() => toggleParticipant(u.id)}
                        className="justify-start"
                      >
                        {u.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingAgenda ? "Atualizar" : "Criar"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Reuniões</CardTitle>
            <CardDescription>Reuniões agendadas para os próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAgendas.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma reunião agendada</p>
            ) : (
              <div className="space-y-4">
                {upcomingAgendas.map((agenda) => (
                  <Card key={agenda.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{agenda.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{agenda.description}</p>
                          <div className="flex gap-4 mt-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(agenda.date)}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {agenda.time}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {agenda.participants.length} participantes
                            </div>
                          </div>
                          {agenda.participants.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">
                                Participantes: {getParticipantNames(agenda.participants)}
                              </p>
                            </div>
                          )}
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(agenda)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(agenda.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Todas as Agendas</CardTitle>
            <CardDescription>Histórico completo de reuniões</CardDescription>
          </CardHeader>
          <CardContent>
            {agendas.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma agenda cadastrada</p>
            ) : (
              <div className="space-y-2">
                {agendas
                  .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime())
                  .map((agenda) => {
                    const isPast = new Date(`${agenda.date}T${agenda.time}`) < new Date()
                    return (
                      <div
                        key={agenda.id}
                        className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{agenda.title}</h4>
                            {isPast && <Badge variant="secondary">Concluída</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(agenda.date)} às {agenda.time}
                          </p>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(agenda)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(agenda.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
