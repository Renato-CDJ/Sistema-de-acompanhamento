"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@/contexts/chat-context"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission, mockUsers } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageSquare,
  Plus,
  Send,
  Paperclip,
  Users,
  Trash2,
  UserPlus,
  UserMinus,
  Globe,
  Search,
  Edit2,
  Pin,
  PinOff,
  Smile,
  Check,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ChatAttachment } from "@/lib/types"

const EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🤩",
  "🥳",
  "😏",
  "😒",
  "😞",
  "😔",
  "😟",
  "😕",
  "🙁",
  "😣",
  "😖",
  "😫",
  "😩",
  "🥺",
  "😢",
  "😭",
  "😤",
  "😠",
  "😡",
  "🤬",
  "🤯",
  "😳",
  "🥵",
  "🥶",
  "😱",
  "😨",
  "😰",
  "😥",
  "😓",
  "🤗",
  "🤔",
  "🤭",
  "🤫",
  "🤥",
  "😶",
  "😐",
  "😑",
  "😬",
  "🙄",
  "😯",
  "😦",
  "😧",
  "😮",
  "😲",
  "🥱",
  "😴",
  "🤤",
  "😪",
  "😵",
  "🤐",
  "🥴",
  "🤢",
  "🤮",
  "🤧",
  "😷",
  "🤒",
  "🤕",
  "👍",
  "👎",
  "👌",
  "✌️",
  "🤞",
  "🤟",
  "🤘",
  "🤙",
  "👏",
  "🙌",
  "👐",
  "🤲",
  "🤝",
  "🙏",
  "✍️",
  "💪",
  "🦾",
  "🦿",
  "🦵",
  "🦶",
  "👂",
  "🦻",
  "👃",
  "🧠",
  "🫀",
  "🫁",
  "🦷",
  "🦴",
  "👀",
  "👁️",
  "👅",
  "👄",
  "💋",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "🤍",
  "🤎",
  "💔",
  "❣️",
  "💕",
  "💞",
  "💓",
  "💗",
  "💖",
  "💘",
  "💝",
  "🔥",
  "✨",
  "💫",
  "⭐",
  "🌟",
  "💯",
  "✅",
  "❌",
]

export function ChatTab() {
  const {
    chats,
    messages,
    activeChat,
    setActiveChat,
    createChat,
    deleteChat,
    sendMessage,
    getMessagesForChat,
    addUserToGroup,
    removeUserFromGroup,
    editMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
  } = useChat()
  const { user } = useAuth()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const [chatName, setChatName] = useState("")
  const [chatType, setChatType] = useState<"group" | "private">("group")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState("")
  const [mentionPosition, setMentionPosition] = useState(0)
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)
  const [chatSearch, setChatSearch] = useState("")
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  const isAdmin = hasPermission(user, "edit")
  const currentChat = chats.find((c) => c.id === activeChat)
  const currentMessages = activeChat ? getMessagesForChat(activeChat) : []
  const pinnedMessages = currentMessages.filter((msg) => msg.pinned && !msg.deleted)
  const regularMessages = currentMessages.filter((msg) => !msg.pinned)

  const filteredChats = chats.filter((chat) => chat.name?.toLowerCase().includes(chatSearch.toLowerCase()))

  const getMentionableUsers = () => {
    if (!currentChat) return []
    const searchLower = mentionSearch.toLowerCase()
    return mockUsers
      .filter((u) => {
        if (u.id === user?.id) return false
        if (currentChat.type === "global") return true
        return currentChat.participants.includes(u.id)
      })
      .filter((u) => u.name.toLowerCase().includes(searchLower))
  }

  const getUserColor = (userId: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-orange-500",
      "bg-teal-500",
      "bg-indigo-500",
      "bg-red-500",
    ]
    const index = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[index % colors.length]
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentMessages])

  // Set global chat as active by default
  useEffect(() => {
    if (!activeChat && chats.length > 0) {
      const globalChat = chats.find((c) => c.type === "global")
      if (globalChat) {
        setActiveChat(globalChat.id)
      }
    }
  }, [chats, activeChat, setActiveChat])

  useEffect(() => {
    const cursorPos = inputRef.current?.selectionStart || 0
    const textBeforeCursor = messageInput.slice(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/[@#](\w*)$/)

    if (mentionMatch && currentChat?.type === "global") {
      setShowMentions(true)
      setMentionSearch(mentionMatch[1])
      setMentionPosition(cursorPos - mentionMatch[0].length)
      setSelectedMentionIndex(0)
    } else {
      setShowMentions(false)
    }
  }, [messageInput, currentChat])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showEmojiPicker])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showMentions) {
      const mentionableUsers = getMentionableUsers()
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedMentionIndex((prev) => (prev + 1) % mentionableUsers.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedMentionIndex((prev) => (prev - 1 + mentionableUsers.length) % mentionableUsers.length)
      } else if (e.key === "Enter" && mentionableUsers.length > 0) {
        e.preventDefault()
        insertMention(mentionableUsers[selectedMentionIndex])
      } else if (e.key === "Escape") {
        setShowMentions(false)
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const insertMention = (mentionedUser: (typeof mockUsers)[0]) => {
    const cursorPos = inputRef.current?.selectionStart || 0
    const textBeforeMention = messageInput.slice(0, mentionPosition)
    const textAfterCursor = messageInput.slice(cursorPos)
    const newText = `${textBeforeMention}@${mentionedUser.name} ${textAfterCursor}`
    setMessageInput(newText)
    setShowMentions(false)

    // Set cursor position after mention
    setTimeout(() => {
      const newCursorPos = mentionPosition + mentionedUser.name.length + 2
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos)
      inputRef.current?.focus()
    }, 0)
  }

  const insertEmoji = (emoji: string) => {
    const cursorPos = inputRef.current?.selectionStart || messageInput.length
    const textBefore = messageInput.slice(0, cursorPos)
    const textAfter = messageInput.slice(cursorPos)
    const newText = textBefore + emoji + textAfter
    setMessageInput(newText)
    setShowEmojiPicker(false)

    setTimeout(() => {
      const newCursorPos = cursorPos + emoji.length
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos)
      inputRef.current?.focus()
    }, 0)
  }

  const startEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId)
    setEditingContent(content)
  }

  const saveEditMessage = () => {
    if (editingMessageId && editingContent.trim()) {
      editMessage(editingMessageId, editingContent.trim())
      setEditingMessageId(null)
      setEditingContent("")
    }
  }

  const cancelEditMessage = () => {
    setEditingMessageId(null)
    setEditingContent("")
  }

  const handleDeleteMessage = (messageId: string) => {
    setMessageToDelete(messageId)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteMessage = () => {
    if (messageToDelete) {
      deleteMessage(messageToDelete)
      setMessageToDelete(null)
      setDeleteConfirmOpen(false)
    }
  }

  const cancelDeleteMessage = () => {
    setMessageToDelete(null)
    setDeleteConfirmOpen(false)
  }

  const handleTogglePin = (messageId: string, isPinned: boolean) => {
    if (isPinned) {
      unpinMessage(messageId)
    } else {
      pinMessage(messageId)
    }
  }

  const handleCreateChat = () => {
    if (!user || !isAdmin) return

    if (chatType === "group" && !chatName.trim()) {
      alert("Por favor, insira um nome para o grupo")
      return
    }

    if (chatType === "private" && selectedUsers.length !== 1) {
      alert("Selecione exatamente um usuário para chat privado")
      return
    }

    const newChatId = createChat({
      type: chatType,
      name: chatType === "group" ? chatName : `Chat com ${mockUsers.find((u) => u.id === selectedUsers[0])?.name}`,
      participants: [...selectedUsers, user.id],
      createdBy: user.id,
    })

    setActiveChat(newChatId)
    setChatName("")
    setSelectedUsers([])
    setIsCreateDialogOpen(false)
  }

  const canSendMessage = () => {
    if (!user || !activeChat) return false
    return messageInput.trim().length > 0 || attachments.length > 0
  }

  const handleSendMessage = () => {
    if (!canSendMessage()) return

    const mentionRegex = /@(\w+(?:\s+\w+)*)/g
    const mentions: string[] = []
    let match
    while ((match = mentionRegex.exec(messageInput)) !== null) {
      const mentionedUser = mockUsers.find((u) => u.name === match[1])
      if (mentionedUser) {
        mentions.push(mentionedUser.id)
      }
    }

    sendMessage(activeChat!, messageInput, attachments.length > 0 ? attachments : undefined, mentions)
    setMessageInput("")
    setAttachments([])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newAttachments: ChatAttachment[] = Array.from(files).map((file) => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }))

    setAttachments((prev) => [...prev, ...newAttachments])
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleAddUserToGroup = (userId: string) => {
    if (activeChat) {
      addUserToGroup(activeChat, userId)
    }
  }

  const handleRemoveUserFromGroup = (userId: string) => {
    if (activeChat && confirm("Tem certeza que deseja remover este usuário do grupo?")) {
      removeUserFromGroup(activeChat, userId)
    }
  }

  const handleDeleteChat = (chatId: string) => {
    if (confirm("Tem certeza que deseja excluir este chat?")) {
      deleteChat(chatId)
      if (activeChat === chatId) {
        setActiveChat(null)
      }
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const renderMessageContent = (content: string, mentions?: string[]) => {
    if (!mentions || mentions.length === 0) {
      return <p className="text-sm break-words">{content}</p>
    }

    const parts: React.ReactNode[] = []
    let lastIndex = 0
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g
    let match

    while ((match = mentionRegex.exec(content)) !== null) {
      const mentionedUser = mockUsers.find((u) => u.name === match[1])
      if (mentionedUser && mentions.includes(mentionedUser.id)) {
        // Add text before mention
        if (match.index > lastIndex) {
          parts.push(content.slice(lastIndex, match.index))
        }
        // Add highlighted mention
        parts.push(
          <span key={match.index} className="bg-primary/20 text-primary font-semibold px-1 rounded">
            @{match[1]}
          </span>,
        )
        lastIndex = match.index + match[0].length
      }
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex))
    }

    return <p className="text-sm break-words">{parts}</p>
  }

  const getOtherUsers = () => {
    return mockUsers.filter((u) => u.id !== user?.id)
  }

  const getChatParticipants = () => {
    if (!currentChat) return []
    return mockUsers.filter((u) => currentChat.participants.includes(u.id))
  }

  const getNonParticipants = () => {
    if (!currentChat) return []
    return mockUsers.filter((u) => !currentChat.participants.includes(u.id) && u.id !== user?.id)
  }

  return (
    <div className="space-y-6">
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Mensagem</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelDeleteMessage}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDeleteMessage}>
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Chat</h2>
          <p className="text-muted-foreground">Converse com sua equipe em tempo real</p>
        </div>
        {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="mr-2 h-4 w-4" />
                Novo Chat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Chat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Tabs value={chatType} onValueChange={(v) => setChatType(v as "group" | "private")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="group">Grupo</TabsTrigger>
                    <TabsTrigger value="private">Privado</TabsTrigger>
                  </TabsList>
                </Tabs>

                {chatType === "group" && (
                  <div>
                    <Label htmlFor="chatName">Nome do Grupo</Label>
                    <Input
                      id="chatName"
                      value={chatName}
                      onChange={(e) => setChatName(e.target.value)}
                      placeholder="Digite o nome do grupo"
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <Label>Selecionar Usuários</Label>
                  <ScrollArea className="h-[200px] mt-2 border rounded-lg p-2">
                    <div className="space-y-2">
                      {getOtherUsers().map((u) => (
                        <Button
                          key={u.id}
                          type="button"
                          variant={selectedUsers.includes(u.id) ? "default" : "outline"}
                          onClick={() => toggleUserSelection(u.id)}
                          className="w-full justify-start"
                        >
                          <Avatar className={`h-6 w-6 mr-2 ${getUserColor(u.id)}`}>
                            <AvatarFallback className="text-white text-xs">{u.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {u.name}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateChat}>Criar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-250px)]">
        <Card className="flex flex-col shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversas
            </CardTitle>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-2">
                {filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChat(chat.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      activeChat === chat.id
                        ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                          activeChat === chat.id ? "bg-primary-foreground/20" : "bg-primary/10"
                        }`}
                      >
                        {chat.type === "global" ? (
                          <Globe className="h-5 w-5" />
                        ) : chat.type === "group" ? (
                          <Users className="h-5 w-5" />
                        ) : (
                          <MessageSquare className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{chat.name}</p>
                        {chat.lastMessage && <p className="text-xs truncate opacity-70 mt-0.5">{chat.lastMessage}</p>}
                      </div>
                      {isAdmin && chat.type !== "global" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteChat(chat.id)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col shadow-lg">
          {currentChat ? (
            <>
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {currentChat.type === "global" ? (
                        <Globe className="h-5 w-5 text-primary" />
                      ) : currentChat.type === "group" ? (
                        <Users className="h-5 w-5 text-primary" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{currentChat.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {currentChat.type === "global"
                          ? "Todos os membros"
                          : `${currentChat.participants.length} participantes`}
                      </p>
                    </div>
                  </div>
                  {isAdmin && currentChat.type === "group" && (
                    <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Users className="mr-2 h-4 w-4" />
                          Gerenciar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Gerenciar Participantes</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Participantes Atuais</Label>
                            <ScrollArea className="h-[200px] mt-2 border rounded-lg p-2">
                              <div className="space-y-2">
                                {getChatParticipants().map((u) => (
                                  <div
                                    key={u.id}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Avatar className={`h-8 w-8 ${getUserColor(u.id)}`}>
                                        <AvatarFallback className="text-white text-sm">
                                          {u.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="font-medium">{u.name}</span>
                                    </div>
                                    {u.id !== currentChat.createdBy && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleRemoveUserFromGroup(u.id)}
                                      >
                                        <UserMinus className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>

                          {getNonParticipants().length > 0 && (
                            <div>
                              <Label>Adicionar Usuários</Label>
                              <ScrollArea className="h-[150px] mt-2 border rounded-lg p-2">
                                <div className="space-y-2">
                                  {getNonParticipants().map((u) => (
                                    <Button
                                      key={u.id}
                                      variant="outline"
                                      className="w-full justify-between bg-transparent"
                                      onClick={() => handleAddUserToGroup(u.id)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Avatar className={`h-6 w-6 ${getUserColor(u.id)}`}>
                                          <AvatarFallback className="text-white text-xs">
                                            {u.name.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        {u.name}
                                      </div>
                                      <UserPlus className="h-4 w-4" />
                                    </Button>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-4 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {pinnedMessages.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-muted-foreground">
                          <Pin className="h-4 w-4" />
                          Mensagens Fixadas
                        </div>
                        <div className="space-y-3 pb-4 border-b">
                          {pinnedMessages.map((msg) => {
                            const isOwn = msg.senderId === user?.id
                            const sender = mockUsers.find((u) => u.id === msg.senderId)

                            return (
                              <div
                                key={msg.id}
                                className="bg-primary/5 border border-primary/20 rounded-lg p-3"
                                onMouseEnter={() => setHoveredMessageId(msg.id)}
                                onMouseLeave={() => setHoveredMessageId(null)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Avatar className={`h-6 w-6 flex-shrink-0 ${getUserColor(msg.senderId)}`}>
                                      <AvatarFallback className="text-white text-xs">
                                        {msg.senderName.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-semibold">{msg.senderName}</span>
                                  </div>
                                  {isOwn && hoveredMessageId === msg.id && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 flex-shrink-0"
                                      onClick={() => handleTogglePin(msg.id, true)}
                                    >
                                      <PinOff className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                </div>
                                <p className="text-sm mt-2 break-words">{msg.content}</p>
                                <span className="text-xs text-muted-foreground mt-1 block">
                                  {formatTime(msg.timestamp)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {regularMessages.length === 0 && pinnedMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-12">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Nenhuma mensagem ainda</p>
                        <p className="text-sm mt-1">Seja o primeiro a enviar uma mensagem!</p>
                      </div>
                    ) : (
                      regularMessages.map((msg, index) => {
                        const isOwn = msg.senderId === user?.id
                        const prevMsg = index > 0 ? regularMessages[index - 1] : null
                        const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId
                        const sender = mockUsers.find((u) => u.id === msg.senderId)
                        const isEditing = editingMessageId === msg.id

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                            onMouseEnter={() => setHoveredMessageId(msg.id)}
                            onMouseLeave={() => setHoveredMessageId(null)}
                          >
                            <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                              {!isOwn && showAvatar && (
                                <div className="flex items-center gap-2 ml-1">
                                  <Avatar className={`h-6 w-6 ${getUserColor(msg.senderId)}`}>
                                    <AvatarFallback className="text-white text-xs">
                                      {msg.senderName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-semibold text-foreground">{msg.senderName}</span>
                                </div>
                              )}

                              {isEditing ? (
                                <div className="w-full space-y-2">
                                  <Input
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        saveEditMessage()
                                      } else if (e.key === "Escape") {
                                        cancelEditMessage()
                                      }
                                    }}
                                    className="text-sm"
                                    autoFocus
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <Button size="sm" variant="ghost" onClick={cancelEditMessage}>
                                      <X className="h-3.5 w-3.5 mr-1" />
                                      Cancelar
                                    </Button>
                                    <Button size="sm" onClick={saveEditMessage}>
                                      <Check className="h-3.5 w-3.5 mr-1" />
                                      Salvar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative group w-full">
                                  <div
                                    className={`rounded-2xl px-4 py-2.5 shadow-sm transition-all hover:shadow-md ${
                                      msg.deleted
                                        ? "bg-muted/50 italic opacity-60"
                                        : isOwn
                                          ? "bg-primary text-primary-foreground rounded-br-sm"
                                          : "bg-muted rounded-bl-sm"
                                    }`}
                                  >
                                    {msg.content && renderMessageContent(msg.content, msg.mentions)}
                                    {msg.attachments && msg.attachments.length > 0 && !msg.deleted && (
                                      <div className="space-y-2 mt-2">
                                        {msg.attachments.map((att) => (
                                          <a
                                            key={att.id}
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                                              isOwn
                                                ? "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                                                : "bg-background hover:bg-background/80"
                                            }`}
                                          >
                                            <Paperclip className="h-4 w-4 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs font-medium truncate">{att.name}</p>
                                              <p className="text-xs opacity-70">{formatFileSize(att.size)}</p>
                                            </div>
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                    {msg.edited && !msg.deleted && <p className="text-xs opacity-60 mt-1">(editada)</p>}
                                  </div>

                                  {isOwn && !msg.deleted && hoveredMessageId === msg.id && (
                                    <div
                                      className={`absolute top-0 ${isOwn ? "left-0 -translate-x-full" : "right-0 translate-x-full"} flex gap-1 px-2`}
                                    >
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 bg-background shadow-md hover:bg-muted"
                                        onClick={() => startEditMessage(msg.id, msg.content)}
                                      >
                                        <Edit2 className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 bg-background shadow-md hover:bg-muted"
                                        onClick={() => handleTogglePin(msg.id, msg.pinned || false)}
                                      >
                                        {msg.pinned ? (
                                          <PinOff className="h-3.5 w-3.5" />
                                        ) : (
                                          <Pin className="h-3.5 w-3.5" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 bg-background shadow-md hover:bg-destructive hover:text-destructive-foreground"
                                        onClick={() => handleDeleteMessage(msg.id)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}

                              <span className={`text-xs text-muted-foreground ${isOwn ? "mr-1" : "ml-1"}`}>
                                {formatTime(msg.timestamp)}
                                {msg.edited && msg.editedAt && ` • editada ${formatTime(msg.editedAt)}`}
                              </span>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              <div className="border-t p-4 bg-muted/30">
                {attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2 text-sm shadow-sm"
                      >
                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate max-w-[200px] font-medium">{att.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 ml-1"
                          onClick={() => removeAttachment(att.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {showMentions && currentChat?.type === "global" && (
                  <div className="mb-2 bg-background border rounded-lg shadow-lg overflow-hidden">
                    <div className="p-2 text-xs font-semibold text-muted-foreground border-b">Mencionar usuário</div>
                    <ScrollArea className="max-h-[200px]">
                      {getMentionableUsers().map((u, index) => (
                        <button
                          key={u.id}
                          onClick={() => insertMention(u)}
                          className={`w-full flex items-center gap-2 p-2 text-left transition-colors ${
                            index === selectedMentionIndex ? "bg-primary/10" : "hover:bg-muted/50"
                          }`}
                        >
                          <Avatar className={`h-7 w-7 ${getUserColor(u.id)}`}>
                            <AvatarFallback className="text-white text-xs">{u.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{u.name}</span>
                        </button>
                      ))}
                    </ScrollArea>
                  </div>
                )}

                <div className="flex gap-2">
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>

                  <div className="relative" ref={emojiPickerRef}>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="flex-shrink-0"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>

                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-2 bg-background border rounded-lg shadow-xl p-2 w-[320px] z-50">
                        <div className="text-xs font-semibold text-muted-foreground mb-2 px-1">Selecione um emoji</div>
                        <ScrollArea className="h-[200px]">
                          <div className="grid grid-cols-8 gap-1">
                            {EMOJIS.map((emoji, index) => (
                              <button
                                key={index}
                                onClick={() => insertEmoji(emoji)}
                                className="text-2xl hover:bg-muted rounded p-1 transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>

                  <div className="relative flex-1">
                    <Input
                      ref={inputRef}
                      placeholder={
                        currentChat?.type === "global"
                          ? "Digite sua mensagem... (use @ para mencionar)"
                          : "Digite sua mensagem..."
                      }
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="pr-12"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!canSendMessage()}
                    className="flex-shrink-0 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {currentChat?.type === "global" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Dica: Use @ ou # seguido do nome para mencionar usuários
                  </p>
                )}
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold">Selecione uma conversa</p>
                <p className="text-sm mt-1">Escolha um chat para começar a conversar</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
