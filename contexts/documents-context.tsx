"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import useSWR from "swr"
import type { Document, Folder } from "@/lib/types"
import { useAuth } from "./auth-context"
import { useNotifications } from "@/contexts/notifications-context"
import { createClient } from "@/lib/supabase/client"

interface DocumentsContextType {
  documents: Document[]
  folders: Folder[]
  currentFolder: string | null
  setCurrentFolder: (folderId: string | null) => void
  addDocument: (document: Omit<Document, "id" | "uploadedAt">) => Promise<string>
  deleteDocument: (id: string) => Promise<void>
  uploadDocument: (document: Omit<Document, "id" | "uploadedAt">) => Promise<string>
  createFolder: (folder: { name: string; parentId: string | null; createdBy: string }) => Promise<string>
  deleteFolder: (id: string) => Promise<void>
  getDocumentsInFolder: (folderId: string | null) => Document[]
  getFoldersInFolder: (folderId: string | null) => Folder[]
  getFolderPath: (folderId: string | null) => Folder[]
  searchDocuments: (query: string) => Document[]
  isLoading: boolean
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined)

const documentsFetcher = async (key: string) => {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error("Not authenticated")

  const { data, error } = await supabase.from("documents").select("*").order("uploaded_at", { ascending: false })

  if (error) throw error

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    size: item.size,
    url: item.url,
    path: item.path,
    uploadedBy: item.uploaded_by,
    uploadedAt: item.uploaded_at,
  }))
}

const foldersFetcher = async (key: string) => {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error("Not authenticated")

  const { data, error } = await supabase.from("folders").select("*").order("name", { ascending: true })

  if (error) throw error

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    parentId: item.parent_id,
    createdBy: item.created_by,
    createdAt: item.created_at,
  }))
}

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const { user, isLoading: authLoading } = useAuth()
  const { addNotification } = useNotifications()

  const shouldFetch = user && !authLoading

  const {
    data: documents = [],
    mutate: mutateDocuments,
    isLoading: docsLoading,
  } = useSWR(shouldFetch ? "documents" : null, documentsFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  })

  const {
    data: folders = [],
    mutate: mutateFolders,
    isLoading: foldersLoading,
  } = useSWR(shouldFetch ? "folders" : null, foldersFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  })

  const isLoading = docsLoading || foldersLoading

  const addDocument = useCallback(
    async (newDocument: Omit<Document, "id" | "uploadedAt">) => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("documents")
        .insert({
          name: newDocument.name,
          type: newDocument.type,
          size: newDocument.size,
          url: newDocument.url,
          path: newDocument.path,
          uploaded_by: newDocument.uploadedBy,
        })
        .select()
        .single()

      if (error) throw error

      await mutateDocuments()

      addNotification({
        type: "success",
        title: "Documento enviado",
        message: `${newDocument.name} foi adicionado com sucesso`,
      })

      return data.id
    },
    [addNotification, mutateDocuments],
  )

  const uploadDocument = useCallback(
    async (newDocument: Omit<Document, "id" | "uploadedAt">) => {
      return await addDocument(newDocument)
    },
    [addDocument],
  )

  const deleteDocument = async (id: string) => {
    const supabase = createClient()

    const { error } = await supabase.from("documents").delete().eq("id", id)

    if (error) throw error

    await mutateDocuments()
  }

  const createFolder = useCallback(
    async (folderData: { name: string; parentId: string | null; createdBy: string }) => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("folders")
        .insert({
          name: folderData.name,
          parent_id: folderData.parentId,
          created_by: folderData.createdBy,
        })
        .select()
        .single()

      if (error) throw error

      await mutateFolders()

      addNotification({
        type: "success",
        title: "Pasta criada",
        message: `A pasta "${folderData.name}" foi criada com sucesso`,
      })

      return data.id
    },
    [addNotification, mutateFolders],
  )

  const deleteFolder = async (id: string) => {
    const supabase = createClient()

    const deleteFolderRecursive = async (folderId: string) => {
      // Delete documents in folder
      await supabase.from("documents").delete().eq("path", folderId)

      // Find and delete subfolders
      const { data: subfolders } = await supabase.from("folders").select("id").eq("parent_id", folderId)

      if (subfolders) {
        for (const subfolder of subfolders) {
          await deleteFolderRecursive(subfolder.id)
        }
      }

      // Delete the folder itself
      await supabase.from("folders").delete().eq("id", folderId)
    }

    await deleteFolderRecursive(id)
    await mutateDocuments()
    await mutateFolders()
  }

  const getDocumentsInFolder = (folderId: string | null) => {
    return documents.filter((doc) => doc.path === (folderId || "root"))
  }

  const getFoldersInFolder = (folderId: string | null) => {
    return folders.filter((folder) => folder.parentId === folderId)
  }

  const getFolderPath = (folderId: string | null): Folder[] => {
    if (!folderId) return []

    const path: Folder[] = []
    let currentId: string | null = folderId

    while (currentId) {
      const folder = folders.find((f) => f.id === currentId)
      if (folder) {
        path.unshift(folder)
        currentId = folder.parentId
      } else {
        break
      }
    }

    return path
  }

  const searchDocuments = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase()
      return documents.filter((doc) => doc.name.toLowerCase().includes(lowerQuery))
    },
    [documents],
  )

  return (
    <DocumentsContext.Provider
      value={{
        documents,
        folders,
        currentFolder,
        setCurrentFolder,
        addDocument,
        deleteDocument,
        uploadDocument,
        createFolder,
        deleteFolder,
        getDocumentsInFolder,
        getFoldersInFolder,
        getFolderPath,
        searchDocuments,
        isLoading,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  )
}

export function useDocuments() {
  const context = useContext(DocumentsContext)
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentsProvider")
  }
  return context
}
