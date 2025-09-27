"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Tipos de dados
interface Carteira {
  name: string
  total: number
  aplicados: number
  pendentes: number
  taxa: number
}

interface Treinamento {
  id: number
  quantidade: number
  turno: string
  carteira: string
  data: string
  responsavel: string
  status: "Aplicado" | "Pendente"
  assunto: string
}

interface Desligamento {
  id: number
  nome: string
  carteira: string
  turno: string
  data: string
  motivo: string
  avisoPrevia: "Com" | "Sem"
  responsavel: string
  veioAgencia: "Sim" | "Não"
  observacao: string
}

interface DadosDiarios {
  id: number
  data: string
  turno: string
  total: number
  ativos: number
  ferias: number
  afastamento: number
  secao: "Caixa" | "Cobrança"
}

interface EstatisticasCarteira {
  id: number
  data: string
  carteira: string
  turno: string
  total: number
  presentes: number
  faltas: number
}

interface DataContextType {
  // Capacitação
  carteiras: Carteira[]
  treinamentos: Treinamento[]
  assuntos: string[]
  addCarteira: (carteira: Omit<Carteira, "total" | "aplicados" | "pendentes" | "taxa">) => void
  updateCarteira: (index: number, carteira: Carteira) => void
  deleteCarteira: (index: number) => void
  addTreinamento: (treinamento: Omit<Treinamento, "id">) => void
  addAssunto: (assunto: string) => void
  updateTreinamento: (id: number, treinamento: Partial<Treinamento>) => void

  // Desligamentos
  desligamentos: Desligamento[]
  addDesligamento: (desligamento: Omit<Desligamento, "id">) => void

  // Quadro
  dadosDiarios: DadosDiarios[]
  estatisticasCarteiras: EstatisticasCarteira[]
  addDadosDiarios: (dados: Omit<DadosDiarios, "id">) => void
  addEstatisticasCarteira: (stats: Omit<EstatisticasCarteira, "id">) => void

  // Estatísticas calculadas
  getCapacitacaoStats: () => {
    totalTreinamentos: number
    aplicados: number
    pendentes: number
    taxaConclusao: number
  }
  getDesligamentosStats: () => {
    totalDesligamentos: number
    comAvisoPrevia: number
    semAvisoPrevia: number
    taxaRotatividade: number
    veioAgencia: number
  }
  getTreinadosStats: () => {
    totalTreinados: number
    assuntosUnicos: string[]
    operadoresTreinados: Array<{
      id: number
      nome: string
      assunto: string
      dataConlusao: string
      carteira: string
    }>
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const initialAssuntos = [
  "Treinamento Inicial",
  "Calibragem",
  "Feedback",
  "SARB",
  "Prevenção ao Assédio",
  "Compliance",
  "Atendimento ao Cliente",
]

export function DataProvider({ children }: { children: ReactNode }) {
  const [carteiras, setCarteiras] = useState<Carteira[]>([])
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([])
  const [assuntos, setAssuntos] = useState<string[]>(initialAssuntos)
  const [desligamentos, setDesligamentos] = useState<Desligamento[]>([])
  const [dadosDiarios, setDadosDiarios] = useState<DadosDiarios[]>([])
  const [estatisticasCarteiras, setEstatisticasCarteiras] = useState<EstatisticasCarteira[]>([])

  const addCarteira = (novaCarteira: Omit<Carteira, "total" | "aplicados" | "pendentes" | "taxa">) => {
    const carteira: Carteira = {
      ...novaCarteira,
      total: 0,
      aplicados: 0,
      pendentes: 0,
      taxa: 0,
    }
    setCarteiras((prev) => [...prev, carteira])
    console.log("[v0] Nova carteira adicionada:", carteira)
  }

  const updateCarteira = (index: number, carteiraAtualizada: Carteira) => {
    setCarteiras((prev) => {
      const updated = [...prev]
      updated[index] = carteiraAtualizada
      return updated
    })
    console.log("[v0] Carteira atualizada:", carteiraAtualizada)
  }

  const deleteCarteira = (index: number) => {
    setCarteiras((prev) => {
      const carteira = prev[index]
      console.log("[v0] Carteira removida:", carteira)
      return prev.filter((_, i) => i !== index)
    })
  }

  const addTreinamento = (novoTreinamento: Omit<Treinamento, "id">) => {
    const treinamento: Treinamento = {
      ...novoTreinamento,
      id: Date.now(),
    }

    setTreinamentos((prev) => [...prev, treinamento])

    setCarteiras((prev) =>
      prev.map((carteira) => {
        if (carteira.name === treinamento.carteira) {
          const newTotal = carteira.total + treinamento.quantidade
          const newAplicados =
            treinamento.status === "Aplicado" ? carteira.aplicados + treinamento.quantidade : carteira.aplicados
          const newPendentes =
            treinamento.status === "Pendente" ? carteira.pendentes + treinamento.quantidade : carteira.pendentes
          const newTaxa = newTotal > 0 ? (newAplicados / newTotal) * 100 : 0

          return {
            ...carteira,
            total: newTotal,
            aplicados: newAplicados,
            pendentes: newPendentes,
            taxa: newTaxa,
          }
        }
        return carteira
      }),
    )

    console.log("[v0] Treinamento adicionado e estatísticas atualizadas:", treinamento)
  }

  const addAssunto = (novoAssunto: string) => {
    setAssuntos((prev) => [...prev, novoAssunto])
    console.log("[v0] Novo assunto adicionado:", novoAssunto)
  }

  const addDesligamento = (novoDesligamento: Omit<Desligamento, "id">) => {
    const desligamento: Desligamento = {
      ...novoDesligamento,
      id: Date.now(),
    }
    setDesligamentos((prev) => [...prev, desligamento])
    console.log("[v0] Novo desligamento registrado:", desligamento)
  }

  const addDadosDiarios = (novosDados: Omit<DadosDiarios, "id">) => {
    const dados: DadosDiarios = {
      ...novosDados,
      id: Date.now(),
    }
    setDadosDiarios((prev) => [...prev, dados])
    console.log("[v0] Novos dados diários adicionados:", dados)
  }

  const addEstatisticasCarteira = (novasStats: Omit<EstatisticasCarteira, "id">) => {
    const stats: EstatisticasCarteira = {
      ...novasStats,
      id: Date.now(),
    }
    setEstatisticasCarteiras((prev) => [...prev, stats])
    console.log("[v0] Novas estatísticas por carteira adicionadas:", stats)
  }

  const updateTreinamento = (id: number, treinamentoAtualizado: Partial<Treinamento>) => {
    setTreinamentos((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...treinamentoAtualizado } : t))

      if (treinamentoAtualizado.status) {
        const treinamento = updated.find((t) => t.id === id)
        if (treinamento) {
          setCarteiras((prevCarteiras) =>
            prevCarteiras.map((carteira) => {
              if (carteira.name === treinamento.carteira) {
                // Recalcular totais baseado em todos os treinamentos desta carteira
                const treinamentosCarteira = updated.filter((t) => t.carteira === carteira.name)
                const newTotal = treinamentosCarteira.reduce((sum, t) => sum + t.quantidade, 0)
                const newAplicados = treinamentosCarteira
                  .filter((t) => t.status === "Aplicado")
                  .reduce((sum, t) => sum + t.quantidade, 0)
                const newPendentes = treinamentosCarteira
                  .filter((t) => t.status === "Pendente")
                  .reduce((sum, t) => sum + t.quantidade, 0)
                const newTaxa = newTotal > 0 ? (newAplicados / newTotal) * 100 : 0

                return {
                  ...carteira,
                  total: newTotal,
                  aplicados: newAplicados,
                  pendentes: newPendentes,
                  taxa: newTaxa,
                }
              }
              return carteira
            }),
          )
        }
      }

      console.log("[v0] Treinamento atualizado:", treinamentoAtualizado)
      return updated
    })
  }

  const getCapacitacaoStats = () => {
    const totalTreinamentos = treinamentos.reduce((sum, t) => sum + t.quantidade, 0)
    const aplicados = treinamentos.filter((t) => t.status === "Aplicado").reduce((sum, t) => sum + t.quantidade, 0)
    const pendentes = treinamentos.filter((t) => t.status === "Pendente").reduce((sum, t) => sum + t.quantidade, 0)
    const taxaConclusao = totalTreinamentos > 0 ? (aplicados / totalTreinamentos) * 100 : 0

    return {
      totalTreinamentos,
      aplicados,
      pendentes,
      taxaConclusao,
    }
  }

  const getDesligamentosStats = () => {
    const totalDesligamentos = desligamentos.length
    const comAvisoPrevia = desligamentos.filter((d) => d.avisoPrevia === "Com").length
    const semAvisoPrevia = desligamentos.filter((d) => d.avisoPrevia === "Sem").length
    const veioAgencia = desligamentos.filter((d) => d.veioAgencia === "Sim").length
    const taxaRotatividade = totalDesligamentos > 0 ? (totalDesligamentos / 100) * 100 : 0

    return {
      totalDesligamentos,
      comAvisoPrevia,
      semAvisoPrevia,
      taxaRotatividade,
      veioAgencia,
    }
  }

  const getTreinadosStats = () => {
    const operadoresTreinados = treinamentos
      .filter((t) => t.status === "Aplicado")
      .flatMap((t) =>
        Array.from({ length: t.quantidade }, (_, index) => ({
          id: t.id * 1000 + index,
          nome: `Operador ${t.id}-${index + 1}`,
          assunto: t.assunto,
          dataConlusao: t.data,
          carteira: t.carteira,
        })),
      )

    const totalTreinados = operadoresTreinados.length
    const assuntosUnicos = [...new Set(operadoresTreinados.map((o) => o.assunto))]

    return {
      totalTreinados,
      assuntosUnicos,
      operadoresTreinados,
    }
  }

  const value: DataContextType = {
    carteiras,
    treinamentos,
    assuntos,
    desligamentos,
    dadosDiarios,
    estatisticasCarteiras,
    addCarteira,
    updateCarteira,
    deleteCarteira,
    addTreinamento,
    addAssunto,
    updateTreinamento,
    addDesligamento,
    addDadosDiarios,
    addEstatisticasCarteira,
    getCapacitacaoStats,
    getDesligamentosStats,
    getTreinadosStats,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
