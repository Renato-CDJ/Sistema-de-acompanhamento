"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { Document, Folder } from "@/lib/types"
import { useAuth } from "./auth-context"
import { useNotifications } from "@/contexts/notifications-context"

interface DocumentsContextType {
  documents: Document[]
  folders: Folder[]
  currentFolder: string | null
  setCurrentFolder: (folderId: string | null) => void
  addDocument: (document: Omit<Document, "id" | "uploadedAt">) => void
  deleteDocument: (id: string) => void
  uploadDocument: (document: Omit<Document, "id" | "uploadedAt">) => string
  createFolder: (folder: { name: string; parentId: string | null; createdBy: string }) => string
  deleteFolder: (id: string) => void
  getDocumentsInFolder: (folderId: string | null) => Document[]
  getFoldersInFolder: (folderId: string | null) => Folder[]
  getFolderPath: (folderId: string | null) => Folder[]
  searchDocuments: (query: string) => Document[]
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined)

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const { user } = useAuth()
  const { addNotification } = useNotifications()

  // Load data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDocs = localStorage.getItem("documents")
      const storedFolders = localStorage.getItem("folders")

      if (storedDocs) setDocuments(JSON.parse(storedDocs))
      if (storedFolders) setFolders(JSON.parse(storedFolders))
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("documents", JSON.stringify(documents))
    }
  }, [documents])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("folders", JSON.stringify(folders))
    }
  }, [folders])

  const addDocument = useCallback(
    (newDocument: Omit<Document, "id" | "uploadedAt">) => {
      const document: Document = {
        ...newDocument,
        id: Date.now().toString() + Math.random(),
        uploadedAt: new Date().toISOString(),
      }
      setDocuments((prev) => [...prev, document])

      addNotification({
        type: "success",
        title: "Documento enviado",
        message: `${newDocument.name} foi adicionado com sucesso`,
      })

      return document.id
    },
    [addNotification],
  )

  const uploadDocument = useCallback(
    (newDocument: Omit<Document, "id" | "uploadedAt">) => {
      const document: Document = {
        ...newDocument,
        id: Date.now().toString() + Math.random(),
        uploadedAt: new Date().toISOString(),
      }
      setDocuments((prev) => [...prev, document])

      addNotification({
        type: "success",
        title: "Documento enviado",
        message: `${newDocument.name} foi adicionado com sucesso`,
      })

      return document.id
    },
    [addNotification],
  )

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const createFolder = useCallback(
    (folderData: { name: string; parentId: string | null; createdBy: string }) => {
      const folder: Folder = {
        id: Date.now().toString() + Math.random(),
        name: folderData.name,
        parentId: folderData.parentId,
        createdBy: folderData.createdBy,
        createdAt: new Date().toISOString(),
      }
      setFolders((prev) => [...prev, folder])

      addNotification({
        type: "success",
        title: "Pasta criada",
        message: `A pasta "${folderData.name}" foi criada com sucesso`,
      })

      return folder.id
    },
    [addNotification],
  )

  const deleteFolder = (id: string) => {
    // Delete folder and all its contents recursively
    const deleteFolderRecursive = (folderId: string) => {
      // Delete documents in folder
      setDocuments((prev) => prev.filter((doc) => doc.path !== folderId))

      // Find and delete subfolders
      const subfolders = folders.filter((f) => f.parentId === folderId)
      subfolders.forEach((subfolder) => deleteFolderRecursive(subfolder.id))

      // Delete the folder itself
      setFolders((prev) => prev.filter((f) => f.id !== folderId))
    }

    deleteFolderRecursive(id)
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
