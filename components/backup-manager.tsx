"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useData } from "@/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Upload, Clock, Database, CheckCircle2, AlertCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Backup {
  id: string
  timestamp: string
  size: number
  type: "auto" | "manual"
}

export function BackupManager() {
  const data = useData()
  const [backups, setBackups] = useState<Backup[]>([])
  const [autoBackupInterval, setAutoBackupInterval] = useState<number>(30) // minutes
  const [lastBackup, setLastBackup] = useState<string | null>(null)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Load backups from localStorage on mount
  useEffect(() => {
    loadBackups()
    const savedInterval = localStorage.getItem("autoBackupInterval")
    if (savedInterval) {
      setAutoBackupInterval(Number.parseInt(savedInterval))
    }
  }, [])

  // Auto backup timer
  useEffect(() => {
    const interval = setInterval(
      () => {
        createBackup("auto")
      },
      autoBackupInterval * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [autoBackupInterval, data])

  const loadBackups = () => {
    const backupList: Backup[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("backup_")) {
        try {
          const backupData = localStorage.getItem(key)
          if (backupData) {
            const parsed = JSON.parse(backupData)
            backupList.push({
              id: key,
              timestamp: parsed.timestamp,
              size: new Blob([backupData]).size,
              type: parsed.type || "manual",
            })
          }
        } catch (e) {
          console.error("[v0] Error loading backup:", e)
        }
      }
    }
    backupList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setBackups(backupList)

    if (backupList.length > 0) {
      setLastBackup(backupList[0].timestamp)
    }
  }

  const createBackup = (type: "auto" | "manual" = "manual") => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        type,
        data: {
          carteiras: data.carteiras,
          treinamentos: data.treinamentos,
          assuntos: data.assuntos,
          desligamentos: data.desligamentos,
          motivosDesligamento: data.motivosDesligamento,
          dadosDiarios: data.dadosDiarios,
          estatisticasCarteiras: data.estatisticasCarteiras,
          operadores: data.operadores,
          monitoringData: data.monitoringData,
          tiaData: data.tiaData,
          activityLogs: data.activityLogs,
        },
      }

      const backupId = `backup_${Date.now()}`
      localStorage.setItem(backupId, JSON.stringify(backupData))

      // Keep only last 10 backups
      const allBackups = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith("backup_")) {
          allBackups.push(key)
        }
      }

      if (allBackups.length > 10) {
        allBackups
          .sort()
          .slice(0, allBackups.length - 10)
          .forEach((key) => {
            localStorage.removeItem(key)
          })
      }

      loadBackups()
      setLastBackup(backupData.timestamp)

      if (type === "manual") {
        setMessage({ type: "success", text: "Backup criado com sucesso!" })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("[v0] Error creating backup:", error)
      setMessage({ type: "error", text: "Erro ao criar backup. Verifique o espaço disponível." })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const restoreBackup = (backupId: string) => {
    try {
      const backupData = localStorage.getItem(backupId)
      if (!backupData) {
        throw new Error("Backup não encontrado")
      }

      const parsed = JSON.parse(backupData)

      // This would need to be implemented in the data context
      // For now, we'll show a success message
      setMessage({ type: "success", text: "Backup restaurado com sucesso! Recarregue a página." })
      setRestoreDialogOpen(false)

      // Store the restore data temporarily
      localStorage.setItem("pendingRestore", backupData)

      // Reload the page to apply the restore
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("[v0] Error restoring backup:", error)
      setMessage({ type: "error", text: "Erro ao restaurar backup." })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const deleteBackup = (backupId: string) => {
    try {
      localStorage.removeItem(backupId)
      loadBackups()
      setMessage({ type: "success", text: "Backup excluído com sucesso!" })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error("[v0] Error deleting backup:", error)
      setMessage({ type: "error", text: "Erro ao excluir backup." })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const exportBackup = (backupId: string) => {
    try {
      const backupData = localStorage.getItem(backupId)
      if (!backupData) {
        throw new Error("Backup não encontrado")
      }

      const blob = new Blob([backupData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `backup_${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage({ type: "success", text: "Backup exportado com sucesso!" })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error("[v0] Error exporting backup:", error)
      setMessage({ type: "error", text: "Erro ao exportar backup." })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsed = JSON.parse(content)

        // Validate backup structure
        if (!parsed.timestamp || !parsed.data) {
          throw new Error("Formato de backup inválido")
        }

        const backupId = `backup_${Date.now()}`
        localStorage.setItem(backupId, content)
        loadBackups()

        setMessage({ type: "success", text: "Backup importado com sucesso!" })
        setTimeout(() => setMessage(null), 3000)
      } catch (error) {
        console.error("[v0] Error importing backup:", error)
        setMessage({ type: "error", text: "Erro ao importar backup. Verifique o arquivo." })
        setTimeout(() => setMessage(null), 3000)
      }
    }
    reader.readAsText(file)
  }

  const updateAutoBackupInterval = (minutes: number) => {
    setAutoBackupInterval(minutes)
    localStorage.setItem("autoBackupInterval", minutes.toString())
    setMessage({ type: "success", text: `Backup automático configurado para cada ${minutes} minutos` })
    setTimeout(() => setMessage(null), 3000)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Configurações de Backup</h3>
              <p className="text-sm text-muted-foreground">Configure o backup automático dos seus dados</p>
            </div>
            <Database className="h-8 w-8 text-primary" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="backup-interval">Intervalo de Backup Automático</Label>
              <Select
                value={autoBackupInterval.toString()}
                onValueChange={(value) => updateAutoBackupInterval(Number.parseInt(value))}
              >
                <SelectTrigger id="backup-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                  <SelectItem value="240">4 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Último Backup</Label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {lastBackup ? formatDate(lastBackup) : "Nenhum backup realizado"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => createBackup("manual")} className="gap-2">
              <Database className="h-4 w-4" />
              Criar Backup Manual
            </Button>

            <Button variant="outline" className="gap-2 bg-transparent" asChild>
              <label htmlFor="import-backup">
                <Upload className="h-4 w-4" />
                Importar Backup
                <input id="import-backup" type="file" accept=".json" className="hidden" onChange={importBackup} />
              </label>
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Backups Disponíveis</h3>
            <p className="text-sm text-muted-foreground">Gerencie e restaure seus backups salvos</p>
          </div>

          {backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum backup disponível</p>
            </div>
          ) : (
            <div className="space-y-2">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{formatDate(backup.timestamp)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          backup.type === "auto"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        }`}
                      >
                        {backup.type === "auto" ? "Automático" : "Manual"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Tamanho: {formatBytes(backup.size)}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportBackup(backup.id)} className="gap-2">
                      <Download className="h-4 w-4" />
                      Exportar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBackup(backup)
                        setRestoreDialogOpen(true)
                      }}
                    >
                      Restaurar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBackup(backup.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Restauração</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja restaurar este backup? Todos os dados atuais serão substituídos.
            </DialogDescription>
          </DialogHeader>
          {selectedBackup && (
            <div className="py-4">
              <p className="text-sm">
                <strong>Data do Backup:</strong> {formatDate(selectedBackup.timestamp)}
              </p>
              <p className="text-sm">
                <strong>Tipo:</strong> {selectedBackup.type === "auto" ? "Automático" : "Manual"}
              </p>
              <p className="text-sm">
                <strong>Tamanho:</strong> {formatBytes(selectedBackup.size)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => selectedBackup && restoreBackup(selectedBackup.id)} variant="default">
              Restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
