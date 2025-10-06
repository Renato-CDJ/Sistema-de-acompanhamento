"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText, FileJson } from "lucide-react"
import { exportToCSV, exportToPDF, exportToJSON } from "@/lib/export-utils"

interface ExportMenuProps {
  data: any[]
  filename: string
  title: string
  disabled?: boolean
}

export function ExportMenu({ data, filename, title, disabled = false }: ExportMenuProps) {
  const handleExportCSV = () => {
    exportToCSV(data, filename)
  }

  const handleExportPDF = () => {
    exportToPDF(title, data, filename)
  }

  const handleExportJSON = () => {
    exportToJSON(data, filename)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || data.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Formato de Exportação</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar como CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar como PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Exportar como JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
