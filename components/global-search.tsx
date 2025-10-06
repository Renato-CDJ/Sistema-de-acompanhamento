"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useData } from "@/contexts/data-context"
import { useAuth } from "@/contexts/auth-context"
import { useAgendas } from "@/contexts/agendas-context"
import { useChat } from "@/contexts/chat-context"
import { useDocuments } from "@/contexts/documents-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, MessageSquare, FileText, Users, Briefcase, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  type: string
  title: string
  subtitle?: string
  description?: string
  tab: string
  icon: any
}

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (tab: string) => void
}

export function GlobalSearch({ open, onOpenChange, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const { carteiras, treinamentos, desligamentos, operadores } = useData()
  const { users } = useAuth()
  const { agendas } = useAgendas()
  const { chats } = useChat()
  const { documents, folders } = useDocuments()

  const searchResults = useMemo(() => {
    if (!query.trim()) return []

    const results: SearchResult[] = []
    const searchTerm = query.toLowerCase()

    // Search in Carteiras
    carteiras.forEach((carteira) => {
      if (carteira.nome.toLowerCase().includes(searchTerm)) {
        results.push({
          id: carteira.id,
          type: "Carteira",
          title: carteira.nome,
          subtitle: `Supervisor: ${carteira.supervisor}`,
          tab: "carteiras",
          icon: Briefcase,
        })
      }
    })

    // Search in Operadores
    operadores.forEach((op) => {
      if (op.nome.toLowerCase().includes(searchTerm) || op.cargo?.toLowerCase().includes(searchTerm)) {
        results.push({
          id: op.id,
          type: "Operador",
          title: op.nome,
          subtitle: op.cargo || "Sem cargo",
          tab: "operadores",
          icon: Users,
        })
      }
    })

    // Search in Treinamentos
    treinamentos.forEach((t) => {
      if (
        t.assunto.toLowerCase().includes(searchTerm) ||
        t.responsavel.toLowerCase().includes(searchTerm) ||
        t.carteira.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          id: t.id,
          type: "Treinamento",
          title: t.assunto,
          subtitle: `${t.responsavel} - ${t.carteira}`,
          description: `${t.quantidade} pessoas - ${t.turno}`,
          tab: "capacitacao",
          icon: GraduationCap,
        })
      }
    })

    // Search in Agendas
    agendas.forEach((agenda) => {
      if (agenda.title.toLowerCase().includes(searchTerm) || agenda.description?.toLowerCase().includes(searchTerm)) {
        results.push({
          id: agenda.id,
          type: "Agenda",
          title: agenda.title,
          subtitle: new Date(agenda.date).toLocaleDateString("pt-BR"),
          description: agenda.description,
          tab: "agendas",
          icon: Calendar,
        })
      }
    })

    // Search in Chats
    chats.forEach((chat) => {
      if (chat.name.toLowerCase().includes(searchTerm)) {
        results.push({
          id: chat.id,
          type: chat.type === "group" ? "Grupo" : chat.type === "global" ? "Chat Global" : "Chat Privado",
          title: chat.name,
          subtitle: `${chat.participants.length} participantes`,
          tab: "chat",
          icon: MessageSquare,
        })
      }
    })

    // Search in Documents
    documents.forEach((doc) => {
      if (doc.name.toLowerCase().includes(searchTerm)) {
        results.push({
          id: doc.id,
          type: "Documento",
          title: doc.name,
          subtitle: `${(doc.size / 1024).toFixed(2)} KB`,
          description: new Date(doc.uploadedAt).toLocaleDateString("pt-BR"),
          tab: "documentos",
          icon: FileText,
        })
      }
    })

    // Search in Folders
    folders.forEach((folder) => {
      if (folder.name.toLowerCase().includes(searchTerm)) {
        results.push({
          id: folder.id,
          type: "Pasta",
          title: folder.name,
          subtitle: "Pasta de documentos",
          tab: "documentos",
          icon: FileText,
        })
      }
    })

    return results.slice(0, 50) // Limit to 50 results
  }, [query, carteiras, operadores, treinamentos, agendas, chats, documents, folders])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) {
      setQuery("")
      setSelectedIndex(0)
    }
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === "Enter" && searchResults[selectedIndex]) {
      e.preventDefault()
      handleSelect(searchResults[selectedIndex])
    }
  }

  const handleSelect = (result: SearchResult) => {
    onNavigate(result.tab)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Busca Global</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar em todas as abas..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>
        <ScrollArea className="max-h-[400px]">
          {query.trim() === "" ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              Digite para buscar em carteiras, operadores, treinamentos, agendas, chats e documentos
            </div>
          ) : searchResults.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">Nenhum resultado encontrado</div>
          ) : (
            <div className="px-2 pb-4">
              {searchResults.map((result, index) => {
                const Icon = result.icon
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg transition-colors flex items-start gap-3",
                      index === selectedIndex ? "bg-accent" : "hover:bg-accent/50",
                    )}
                  >
                    <Icon className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{result.title}</span>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {result.type}
                        </Badge>
                      </div>
                      {result.subtitle && <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>}
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate mt-1">{result.description}</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
        <div className="px-6 py-3 border-t text-xs text-muted-foreground flex items-center justify-between">
          <span>Use ↑↓ para navegar</span>
          <span>Enter para selecionar</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
