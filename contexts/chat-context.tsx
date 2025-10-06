"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { Chat, ChatMessage, ChatAttachment } from "@/lib/types"
import { useAuth } from "./auth-context"
import { useNotifications } from "@/contexts/notifications-context"
import { createBrowserClient } from "@/lib/supabase/client"
import useSWR, { mutate } from "swr"

interface ChatContextType {
  chats: Chat[]
  messages: ChatMessage[]
  activeChat: string | null
  setActiveChat: (chatId: string | null) => void
  createChat: (chat: Omit<Chat, "id" | "createdAt">) => Promise<string>
  deleteChat: (chatId: string) => Promise<void>
  sendMessage: (chatId: string, content: string, attachments?: ChatAttachment[], mentions?: string[]) => Promise<void>
  getMessagesForChat: (chatId: string) => ChatMessage[]
  markAsRead: (messageId: string) => Promise<void>
  addUserToGroup: (chatId: string, userId: string) => Promise<void>
  removeUserFromGroup: (chatId: string, userId: string) => Promise<void>
  promoteUser: (userId: string) => void
  demoteUser: (userId: string) => void
  editMessage: (messageId: string, newContent: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  pinMessage: (messageId: string) => Promise<void>
  unpinMessage: (messageId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const fetcher = async (table: string) => {
  const supabase = createBrowserClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false })

  if (error) {
    console.error(`Error fetching ${table}:`, error)
    throw error
  }

  return data || []
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const { user, isLoading } = useAuth()
  const { addNotification } = useNotifications()
  const supabase = createBrowserClient()

  const shouldFetch = user && !isLoading
  const { data: chats = [] } = useSWR<Chat[]>(shouldFetch ? "chats" : null, fetcher)
  const { data: messages = [] } = useSWR<ChatMessage[]>(shouldFetch ? "chat_messages" : null, fetcher)

  // Create global chat on first load if it doesn't exist
  useEffect(() => {
    const initializeGlobalChat = async () => {
      if (chats.length === 0 && user) {
        const globalChat = {
          type: "global",
          name: "Chat Global",
          participants: [],
          created_by: "system",
        }

        const { data, error } = await supabase.from("chats").insert([globalChat])
        if (error) {
          console.error("Error creating global chat:", error)
        } else {
          mutate("chats")
        }
      }
    }

    initializeGlobalChat()
  }, [user, chats.length])

  const createChat = async (newChat: Omit<Chat, "id" | "createdAt">) => {
    const chat = {
      type: newChat.type,
      name: newChat.name,
      participants: newChat.participants,
      created_by: newChat.createdBy,
    }

    const { data, error } = await supabase.from("chats").insert([chat]).select().single()
    if (error) {
      console.error("Error creating chat:", error)
      return ""
    }

    mutate("chats")
    return data.id
  }

  const deleteChat = async (chatId: string) => {
    // Delete all messages in the chat first
    await supabase.from("chat_messages").delete().eq("chat_id", chatId)

    // Delete the chat
    const { error } = await supabase.from("chats").delete().eq("id", chatId)
    if (error) {
      console.error("Error deleting chat:", error)
      return
    }

    mutate("chats")
    mutate("chat_messages")
  }

  const sendMessage = useCallback(
    async (chatId: string, content: string, attachments?: any[], mentions?: string[]) => {
      if (!user) return

      const newMessage = {
        chat_id: chatId,
        sender_id: user.id,
        sender_name: user.name,
        content,
        attachments,
        read: false,
        mentions,
      }

      const { data, error } = await supabase.from("chat_messages").insert([newMessage]).select().single()
      if (error) {
        console.error("Error sending message:", error)
        return
      }

      // Update last message in chat
      await supabase
        .from("chats")
        .update({
          last_message: content || "Anexo enviado",
          last_message_time: data.created_at,
        })
        .eq("id", chatId)

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

      mutate("chat_messages")
      mutate("chats")
    },
    [user, chats, addNotification, supabase],
  )

  const getMessagesForChat = (chatId: string) => {
    return messages
      .filter((msg) => msg.chatId === chatId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const markAsRead = async (messageId: string) => {
    const { error } = await supabase.from("chat_messages").update({ read: true }).eq("id", messageId)
    if (error) {
      console.error("Error marking message as read:", error)
      return
    }

    mutate("chat_messages")
  }

  const addUserToGroup = async (chatId: string, userId: string) => {
    const chat = chats.find((c) => c.id === chatId)
    if (chat && !chat.participants.includes(userId)) {
      const updatedParticipants = [...chat.participants, userId]
      const { error } = await supabase.from("chats").update({ participants: updatedParticipants }).eq("id", chatId)
      if (error) {
        console.error("Error adding user to group:", error)
        return
      }

      mutate("chats")
    }
  }

  const removeUserFromGroup = async (chatId: string, userId: string) => {
    const chat = chats.find((c) => c.id === chatId)
    if (chat) {
      const updatedParticipants = chat.participants.filter((id) => id !== userId)
      const { error } = await supabase.from("chats").update({ participants: updatedParticipants }).eq("id", chatId)
      if (error) {
        console.error("Error removing user from group:", error)
        return
      }

      mutate("chats")
    }
  }

  const promoteUser = (userId: string) => {
    // This would update user permissions in a real app
  }

  const demoteUser = (userId: string) => {
    // This would update user permissions in a real app
  }

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      const { error } = await supabase
        .from("chat_messages")
        .update({
          content: newContent,
          edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq("id", messageId)

      if (error) {
        console.error("Error editing message:", error)
        return
      }

      mutate("chat_messages")
    },
    [supabase],
  )

  const deleteMessage = useCallback(
    async (messageId: string) => {
      const { error } = await supabase
        .from("chat_messages")
        .update({
          deleted: true,
          content: "Mensagem excluída",
          attachments: null,
        })
        .eq("id", messageId)

      if (error) {
        console.error("Error deleting message:", error)
        return
      }

      mutate("chat_messages")
    },
    [supabase],
  )

  const pinMessage = useCallback(
    async (messageId: string) => {
      const { error } = await supabase.from("chat_messages").update({ pinned: true }).eq("id", messageId)
      if (error) {
        console.error("Error pinning message:", error)
        return
      }

      mutate("chat_messages")
    },
    [supabase],
  )

  const unpinMessage = useCallback(
    async (messageId: string) => {
      const { error } = await supabase.from("chat_messages").update({ pinned: false }).eq("id", messageId)
      if (error) {
        console.error("Error unpinning message:", error)
        return
      }

      mutate("chat_messages")
    },
    [supabase],
  )

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
