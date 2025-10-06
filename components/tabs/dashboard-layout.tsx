"use client"

import { useState } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const DashboardLayout = () => {
  const [filters, setFilters] = useState({
    turno: "",
    carteira: "",
    status: "",
    motivo: "",
    secao: "",
  })

  const carteiras = [{ name: "Carteira 1" }, { name: "Carteira 2" }, { name: "Carteira 3" }]

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }))
  }

  return (
    <div>
      <div>
        <Label htmlFor="filter-turno">Turno</Label>
        <Select value={filters.turno} onValueChange={(value) => handleFilterChange("turno", value)}>
          <SelectTrigger id="filter-turno">
            <SelectValue placeholder="Todos os turnos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os turnos</SelectItem>
            <SelectItem value="Manhã">Manhã</SelectItem>
            <SelectItem value="Tarde">Tarde</SelectItem>
            <SelectItem value="Integral">Integral</SelectItem>
            <SelectItem value="Geral">Geral</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="filter-carteira">Carteira</Label>
        <Select value={filters.carteira} onValueChange={(value) => handleFilterChange("carteira", value)}>
          <SelectTrigger id="filter-carteira">
            <SelectValue placeholder="Todas as carteiras" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas as carteiras</SelectItem>
            {carteiras.map((carteira) => (
              <SelectItem key={carteira.name} value={carteira.name}>
                {carteira.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="filter-status">Status</Label>
        <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
          <SelectTrigger id="filter-status">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os status</SelectItem>
            <SelectItem value="Aplicado">Aplicado</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="filter-motivo">Motivo</Label>
        <Select value={filters.motivo} onValueChange={(value) => handleFilterChange("motivo", value)}>
          <SelectTrigger id="filter-motivo">
            <SelectValue placeholder="Todos os motivos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os motivos</SelectItem>
            <SelectItem value="Pedido de Demissão">Pedido de Demissão</SelectItem>
            <SelectItem value="Justa Causa">Justa Causa</SelectItem>
            <SelectItem value="Término de Contrato">Término de Contrato</SelectItem>
            <SelectItem value="Demissão sem Justa Causa">Demissão sem Justa Causa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="filter-secao">Seção</Label>
        <Select value={filters.secao} onValueChange={(value) => handleFilterChange("secao", value)}>
          <SelectTrigger id="filter-secao">
            <SelectValue placeholder="Todas as seções" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas as seções</SelectItem>
            <SelectItem value="Caixa">Caixa</SelectItem>
            <SelectItem value="Cobrança">Cobrança</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default DashboardLayout
