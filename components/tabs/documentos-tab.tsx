"use client"

import type React from "react"

import { useState } from "react"
import { useDocuments } from "@/contexts/documents-context"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  FolderOpen,
  File,
  Trash2,
  Download,
  Upload,
  FolderPlus,
  Search,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  ChevronRight,
  Home,
  Eye,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Document, Folder } from "@/lib/types"

export function DocumentosTab() {
  const { folders, documents, createFolder, deleteFolder, uploadDocument, deleteDocument, searchDocuments } =
    useDocuments()
  const { user } = useAuth()
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [folderName, setFolderName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadData, setUploadData] = useState({
    name: "",
    type: "pdf" as Document["type"],
    size: 0,
    url: "",
  })

  const isAdmin = hasPermission(user, "edit")
  const currentFolder = folders.find((f) => f.id === currentFolderId)
  const subfolders = folders.filter((f) => f.parentId === currentFolderId)
  const currentDocuments = documents.filter((d) => d.folderId === currentFolderId)
  const searchResults = searchQuery ? searchDocuments(searchQuery) : []

  const handleCreateFolder = () => {
    if (!user || !isAdmin || !folderName.trim()) return

    createFolder({
      name: folderName,
      parentId: currentFolderId,
      createdBy: user.id,
    })

    setFolderName("")
    setIsFolderDialogOpen(false)
  }

  const handleUploadDocument = () => {
    if (!user || !uploadData.name.trim()) return

    uploadDocument({
      ...uploadData,
      folderId: currentFolderId,
      uploadedBy: user.id,
    })

    setUploadData({ name: "", type: "pdf", size: 0, url: "" })
    setIsUploadDialogOpen(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileType = getFileType(file.type)
    setUploadData({
      name: file.name,
      type: fileType,
      size: file.size,
      url: URL.createObjectURL(file),
    })
  }

  const getFileType = (mimeType: string): Document["type"] => {
    if (mimeType.includes("pdf")) return "pdf"
    if (mimeType.includes("word") || mimeType.includes("document")) return "doc"
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "xls"
    if (mimeType.includes("image")) return "img"
    if (mimeType.includes("video")) return "video"
    return "other"
  }

  const getFileIcon = (type: Document["type"]) => {
    switch (type) {
      case "pdf":
      case "doc":
        return <FileText className="h-5 w-5" />
      case "xls":
        return <FileSpreadsheet className="h-5 w-5" />
      case "img":
        return <FileImage className="h-5 w-5" />
      case "video":
        return <FileVideo className="h-5 w-5" />
      default:
        return <File className="h-5 w-5" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const getBreadcrumbs = () => {
    const breadcrumbs: Folder[] = []
    let current = currentFolder

    while (current) {
      breadcrumbs.unshift(current)
      current = folders.find((f) => f.id === current?.parentId)
    }

    return breadcrumbs
  }

  const handleDeleteFolder = (folderId: string) => {
    if (confirm("Tem certeza que deseja excluir esta pasta? Todos os documentos dentro dela serão excluídos.")) {
      deleteFolder(folderId)
      if (currentFolderId === folderId) {
        setCurrentFolderId(null)
      }
    }
  }

  const handleDeleteDocument = (docId: string) => {
    if (confirm("Tem certeza que deseja excluir este documento?")) {
      deleteDocument(docId)
    }
  }

  const handlePreview = (doc: Document) => {
    setPreviewDocument(doc)
    setIsPreviewDialogOpen(true)
  }

  const renderPreviewContent = () => {
    if (!previewDocument) return null

    switch (previewDocument.type) {
      case "img":
        return (
          <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
            <img
              src={previewDocument.url || "/placeholder.svg"}
              alt={previewDocument.name}
              className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
            />
          </div>
        )
      case "pdf":
        return (
          <div className="space-y-4">
            <iframe
              src={previewDocument.url}
              className="w-full h-[60vh] border rounded-lg"
              title={previewDocument.name}
            />
            <p className="text-sm text-muted-foreground text-center">
              Se o PDF não carregar, você pode{" "}
              <a href={previewDocument.url} download={previewDocument.name} className="text-primary hover:underline">
                baixá-lo aqui
              </a>
            </p>
          </div>
        )
      case "video":
        return (
          <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
            <video controls className="max-w-full max-h-[60vh] rounded-lg shadow-lg">
              <source src={previewDocument.url} />
              Seu navegador não suporta a reprodução de vídeo.
            </video>
          </div>
        )
      default:
        return (
          <div className="text-center py-12 space-y-4">
            <div className="flex justify-center">{getFileIcon(previewDocument.type)}</div>
            <div className="space-y-2">
              <p className="font-medium text-lg">{previewDocument.name}</p>
              <p className="text-sm text-muted-foreground">
                Tipo: {previewDocument.type.toUpperCase()} • Tamanho: {formatFileSize(previewDocument.size)}
              </p>
              <p className="text-sm text-muted-foreground">Enviado em: {formatDate(previewDocument.uploadedAt)}</p>
            </div>
            <Button asChild>
              <a href={previewDocument.url} download={previewDocument.name}>
                <Download className="mr-2 h-4 w-4" />
                Baixar Arquivo
              </a>
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Documentos</h2>
          <p className="text-muted-foreground">Gerencie e organize seus arquivos</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Nova Pasta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Pasta</DialogTitle>
                  <DialogDescription>Organize seus documentos criando uma nova pasta</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folderName">Nome da Pasta</Label>
                    <Input
                      id="folderName"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      placeholder="Digite o nome da pasta"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateFolder}>Criar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload de Documento</DialogTitle>
                  <DialogDescription>Selecione um arquivo para fazer upload na pasta atual</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">Selecionar Arquivo</Label>
                    <Input id="file" type="file" onChange={handleFileSelect} />
                  </div>
                  {uploadData.name && (
                    <>
                      <div>
                        <Label htmlFor="docName">Nome do Documento</Label>
                        <Input
                          id="docName"
                          value={uploadData.name}
                          onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Tamanho</Label>
                        <p className="text-sm text-muted-foreground">{formatFileSize(uploadData.size)}</p>
                      </div>
                    </>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleUploadDocument} disabled={!uploadData.name}>
                      Upload
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar documentos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {searchQuery ? (
        /* Search Results */
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Busca</CardTitle>
            <CardDescription>{searchResults.length} documento(s) encontrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum documento encontrado</p>
            ) : (
              <div className="space-y-2">
                {searchResults.map((doc) => {
                  const folder = folders.find((f) => f.id === doc.folderId)
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getFileIcon(doc.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {folder ? `${folder.name} • ` : ""}
                            {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handlePreview(doc)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={doc.url} download={doc.name}>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        {isAdmin && (
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* File Explorer */
        <>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFolderId(null)}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4" />
            </Button>
            {getBreadcrumbs().map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  {folder.name}
                </Button>
              </div>
            ))}
          </div>

          <div className="grid gap-4">
            {/* Folders */}
            {subfolders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pastas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {subfolders.map((folder) => (
                      <div
                        key={folder.id}
                        className="group relative p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setCurrentFolderId(folder.id)}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <FolderOpen className="h-12 w-12 text-primary" />
                          <p className="text-sm font-medium text-center truncate w-full">{folder.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {documents.filter((d) => d.folderId === folder.id).length} arquivo(s)
                          </p>
                        </div>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteFolder(folder.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documentos</CardTitle>
                <CardDescription>
                  {currentDocuments.length} documento(s) nesta {currentFolder ? "pasta" : "localização"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentDocuments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum documento nesta {currentFolder ? "pasta" : "localização"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {currentDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getFileIcon(doc.type)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                          <Badge variant="secondary">{doc.type.toUpperCase()}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handlePreview(doc)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={doc.url} download={doc.name}>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewDocument && getFileIcon(previewDocument.type)}
              {previewDocument?.name}
            </DialogTitle>
            <DialogDescription>Visualização do documento</DialogDescription>
          </DialogHeader>
          <div className="py-4">{renderPreviewContent()}</div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
