"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { Chat, ChatMessage, ChatAttachment } from "@/lib/types"
import { useAuth } from "./auth-context"
import { useNotifications } from "@/contexts/notifications-context"

interface ChatContextType {
  chats: Chat[]
  messages: ChatMessage[]
  activeChat: string | null
  setActiveChat: (chatId: string | null) => void
  createChat: (chat: Omit<Chat, "id" | "createdAt">) => string
  deleteChat: (chatId: string) => void
  sendMessage: (chatId: string, content: string, attachments?: ChatAttachment[], mentions?: string[]) => void
  getMessagesForChat: (chatId: string) => ChatMessage[]
  markAsRead: (messageId: string) => void
  addUserToGroup: (chatId: string, userId: string) => void
  removeUserFromGroup: (chatId: string, userId: string) => void
  promoteUser: (userId: string) => void
  demoteUser: (userId: string) => void
  editMessage: (messageId: string, newContent: string) => void
  deleteMessage: (messageId: string) => void
  pinMessage: (messageId: string) => void
  unpinMessage: (messageId: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const { user } = useAuth()
  const { addNotification } = useNotifications()

  // Load data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedChats = localStorage.getItem("chats")
        const storedMessages = localStorage.getItem("messages")

        if (storedChats) {
          const parsed = JSON.parse(storedChats)
          if (Array.isArray(parsed)) setChats(parsed)
        }
        if (storedMessages) {
          const parsed = JSON.parse(storedMessages)
          if (Array.isArray(parsed)) setMessages(parsed)
        }
      } catch (error) {
        console.error("Error loading chat data from localStorage:", error)
      }
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("chats", JSON.stringify(chats))
      } catch (error) {
        console.error("Error saving chats to localStorage:", error)
      }
    }
  }, [chats])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("messages", JSON.stringify(messages))
      } catch (error) {
        console.error("Error saving messages to localStorage:", error)
      }
    }
  }, [messages])

  // Create global chat on first load if it doesn't exist
  useEffect(() => {
    if (chats.length === 0 && user) {
      const globalChat: Chat = {
        id: "global",
        type: "global",
        name: "Chat Global",
        participants: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
      }
      setChats([globalChat])
    }
  }, [user])

  const createChat = (newChat: Omit<Chat, "id" | "createdAt">) => {
    const chat: Chat = {
      ...newChat,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setChats((prev) => [...prev, chat])
    return chat.id
  }

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId))
    setMessages((prev) => prev.filter((msg) => msg.chatId !== chatId))
  }

  const sendMessage = useCallback(
    (chatId: string, content: string, attachments?: any[], mentions?: string[]) => {
      if (!user) return

      const newMessage: ChatMessage = {
        id: Date.now().toString() + Math.random(),
        chatId,
        senderId: user.id,
        senderName: user.name,
        content,
        attachments,
        timestamp: new Date().toISOString(),
        read: false,
        mentions, // Store mentions in message
      }

      setMessages((prev) => [...prev, newMessage])

      // Update last message in chat
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                lastMessage: content || "Anexo enviado",
                lastMessageTime: newMessage.timestamp,
              }
            : chat,
        ),
      )

      const chat = chats.find((c) => c.id === chatId)
      if (chat) {
        chat.participants.forEach((participantId) => {
          if (participantId !== user.id) {
            addNotification({
              type: "info",
              title: `Nova mensagem em ${chat.name}`,
              message: `${user.name}: ${content || "Enviou um anexo"}`,
            })
          }
        })
      }
    },
    [user, chats, addNotification],
  )

  const getMessagesForChat = (chatId: string) => {
    return messages
      .filter((msg) => msg.chatId === chatId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const markAsRead = (messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg)))
  }

  const addUserToGroup = (chatId: string, userId: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId && !chat.participants.includes(userId)
          ? { ...chat, participants: [...chat.participants, userId] }
          : chat,
      ),
    )
  }

  const removeUserFromGroup = (chatId: string, userId: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, participants: chat.participants.filter((id) => id !== userId) } : chat,
      ),
    )
  }

  const promoteUser = (userId: string) => {
    // This would update user permissions in a real app
  }

  const demoteUser = (userId: string) => {
    // This would update user permissions in a real app
  }

  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              content: newContent,
              edited: true,
              editedAt: new Date().toISOString(),
            }
          : msg,
      ),
    )
  }, [])

  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              deleted: true,
              content: "Mensagem excluída",
              attachments: undefined,
            }
          : msg,
      ),
    )
  }, [])

  const pinMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, pinned: true } : msg)))
  }, [])

  const unpinMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, pinned: false } : msg)))
  }, [])

  return (
    <ChatContext.Provider
      value={{
        chats,
        messages,
        activeChat,
        setActiveChat,
        createChat,
        deleteChat,
        sendMessage,
        getMessagesForChat,
        markAsRead,
        addUserToGroup,
        removeUserFromGroup,
        promoteUser,
        demoteUser,
        editMessage,
        deleteMessage,
        pinMessage,
        unpinMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
