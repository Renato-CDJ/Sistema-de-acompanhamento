"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Tipos de dados
interface Carteira {
  id: string
  name: string
  total: number
  aplicados: number
  pendentes: number
  taxa: number
  createdAt: string
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
  date: string
  turno: string
  total: number
  ativos: number
  ferias: number
  afastamento: number
  desaparecidos: number
  inss: number
  secao: "Caixa" | "Cobrança"
}

interface EstatisticasCarteira {
  id: number
  date: string
  carteira: string
  turno: string
  total: number
  presentes: number
  faltas: number
}

interface Operador {
  id: number
  nome: string
  assunto: string
  dataConlusao: string
  carteira: string
  turno: string
}

interface DataContextType {
  // Capacitação
  carteiras: Carteira[]
  treinamentos: Treinamento[]
  assuntos: string[]
  addCarteira: (name: string) => void
  updateCarteira: (id: string, name: string) => void
  removeCarteira: (id: string) => void
  addTreinamento: (treinamento: Omit<Treinamento, "id">) => void
  addAssunto: (assunto: string) => void
  updateAssunto: (index: number, novoAssunto: string) => void
  deleteAssunto: (index: number) => void
  updateTreinamento: (id: number, treinamento: Partial<Treinamento>) => void

  // Desligamentos
  desligamentos: Desligamento[]
  addDesligamento: (desligamento: Omit<Desligamento, "id">) => void
  updateDesligamento: (id: number, desligamento: Partial<Desligamento>) => void
  deleteDesligamento: (id: number) => void

  // Quadro
  dadosDiarios: DadosDiarios[]
  estatisticasCarteiras: EstatisticasCarteira[]
  addDadosDiarios: (dados: Omit<DadosDiarios, "id">) => void
  updateDadosDiarios: (id: number, dados: Partial<DadosDiarios>) => void
  deleteDadosDiarios: (id: number) => void
  addEstatisticasCarteira: (stats: Omit<EstatisticasCarteira, "id">) => void

  // Operadores
  operadores: Operador[]
  addOperador: (operador: Omit<Operador, "id">) => void
  updateOperador: (id: number, operador: Partial<Operador>) => void
  deleteOperador: (id: number) => void
  importOperadores: (operadores: Omit<Operador, "id">[]) => void

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

const initialAssuntos: string[] = []

export function DataProvider({ children }: { children: ReactNode }) {
  const [carteiras, setCarteiras] = useState<Carteira[]>([])
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([])
  const [assuntos, setAssuntos] = useState<string[]>(initialAssuntos)
  const [desligamentos, setDesligamentos] = useState<Desligamento[]>([])
  const [dadosDiarios, setDadosDiarios] = useState<DadosDiarios[]>([])
  const [estatisticasCarteiras, setEstatisticasCarteiras] = useState<EstatisticasCarteira[]>([])
  const [operadores, setOperadores] = useState<Operador[]>([])

  const addCarteira = (name: string) => {
    const carteira: Carteira = {
      id: Date.now().toString(),
      name: name,
      total: 0,
      aplicados: 0,
      pendentes: 0,
      taxa: 0,
      createdAt: new Date().toISOString(),
    }
    setCarteiras((prev) => [...prev, carteira])
  }

  const updateCarteira = (id: string, newName: string) => {
    setCarteiras((prev) => prev.map((carteira) => (carteira.id === id ? { ...carteira, name: newName } : carteira)))
  }

  const removeCarteira = (id: string) => {
    setCarteiras((prev) => prev.filter((c) => c.id !== id))
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
          const newTaxa = newTotal > 0 ? Math.round((newAplicados / newTotal) * 100 * 10) / 10 : 0

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

  const addAssunto = (novoAssunto: string) => {
    setAssuntos((prev) => [...prev, novoAssunto])
  }

  const updateAssunto = (index: number, novoAssunto: string) => {
    setAssuntos((prev) => {
      const novosAssuntos = [...prev]
      const assuntoAntigo = novosAssuntos[index]
      novosAssuntos[index] = novoAssunto

      // Update all treinamentos that use this assunto
      setTreinamentos((prevTreinamentos) =>
        prevTreinamentos.map((t) => (t.assunto === assuntoAntigo ? { ...t, assunto: novoAssunto } : t)),
      )

      // Update all operadores that use this assunto
      setOperadores((prevOperadores) =>
        prevOperadores.map((o) => (o.assunto === assuntoAntigo ? { ...o, assunto: novoAssunto } : o)),
      )

      return novosAssuntos
    })
  }

  const deleteAssunto = (index: number) => {
    setAssuntos((prev) => prev.filter((_, i) => i !== index))
  }

  const addDesligamento = (novoDesligamento: Omit<Desligamento, "id">) => {
    const desligamento: Desligamento = {
      ...novoDesligamento,
      id: Date.now(),
    }
    setDesligamentos((prev) => [...prev, desligamento])
  }

  const addDadosDiarios = (novosDados: Omit<DadosDiarios, "id">) => {
    const dados: DadosDiarios = {
      ...novosDados,
      id: Date.now(),
    }
    setDadosDiarios((prev) => [...prev, dados])
  }

  const addEstatisticasCarteira = (novasStats: Omit<EstatisticasCarteira, "id">) => {
    const stats: EstatisticasCarteira = {
      ...novasStats,
      id: Date.now(),
    }
    setEstatisticasCarteiras((prev) => [...prev, stats])
  }

  const updateDadosDiarios = (id: number, dadosAtualizados: Partial<DadosDiarios>) => {
    setDadosDiarios((prev) => prev.map((dados) => (dados.id === id ? { ...dados, ...dadosAtualizados } : dados)))
  }

  const deleteDadosDiarios = (id: number) => {
    setDadosDiarios((prev) => prev.filter((d) => d.id !== id))
  }

  const updateTreinamento = (id: number, treinamentoAtualizado: Partial<Treinamento>) => {
    setTreinamentos((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...treinamentoAtualizado } : t))

      if (treinamentoAtualizado.status || treinamentoAtualizado.carteira || treinamentoAtualizado.quantidade) {
        const treinamento = updated.find((t) => t.id === id)
        if (treinamento) {
          setCarteiras((prevCarteiras) =>
            prevCarteiras.map((carteira) => {
              const treinamentosCarteira = updated.filter((t) => t.carteira === carteira.name)
              const newTotal = treinamentosCarteira.reduce((sum, t) => sum + t.quantidade, 0)
              const newAplicados = treinamentosCarteira
                .filter((t) => t.status === "Aplicado")
                .reduce((sum, t) => sum + t.quantidade, 0)
              const newPendentes = treinamentosCarteira
                .filter((t) => t.status === "Pendente")
                .reduce((sum, t) => sum + t.quantidade, 0)
              const newTaxa = newTotal > 0 ? Math.round((newAplicados / newTotal) * 100 * 10) / 10 : 0

              return {
                ...carteira,
                total: newTotal,
                aplicados: newAplicados,
                pendentes: newPendentes,
                taxa: newTaxa,
              }
            }),
          )
        }
      }

      return updated
    })
  }

  const getCapacitacaoStats = () => {
    const totalTreinamentos = treinamentos.reduce((sum, t) => sum + t.quantidade, 0)
    const aplicados = treinamentos.filter((t) => t.status === "Aplicado").reduce((sum, t) => sum + t.quantidade, 0)
    const pendentes = treinamentos.filter((t) => t.status === "Pendente").reduce((sum, t) => sum + t.quantidade, 0)
    const taxaConclusao = totalTreinamentos > 0 ? Math.round((aplicados / totalTreinamentos) * 100 * 10) / 10 : 0

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
    const taxaRotatividade =
      totalDesligamentos > 0 ? Math.round((totalDesligamentos / Math.max(100, totalDesligamentos)) * 100 * 10) / 10 : 0

    return {
      totalDesligamentos,
      comAvisoPrevia,
      semAvisoPrevia,
      taxaRotatividade,
      veioAgencia,
    }
  }

  const getTreinadosStats = () => {
    const totalTreinados = operadores.length
    const assuntosUnicos = [...new Set(operadores.map((o) => o.assunto))]

    return {
      totalTreinados,
      assuntosUnicos,
      operadoresTreinados: operadores,
    }
  }

  const updateDesligamento = (id: number, desligamentoAtualizado: Partial<Desligamento>) => {
    setDesligamentos((prev) =>
      prev.map((desligamento) =>
        desligamento.id === id ? { ...desligamento, ...desligamentoAtualizado } : desligamento,
      ),
    )
  }

  const deleteDesligamento = (id: number) => {
    setDesligamentos((prev) => prev.filter((d) => d.id !== id))
  }

  const addOperador = (novoOperador: Omit<Operador, "id">) => {
    const operador: Operador = {
      ...novoOperador,
      id: Date.now(),
    }
    setOperadores((prev) => [...prev, operador])
  }

  const updateOperador = (id: number, operadorAtualizado: Partial<Operador>) => {
    setOperadores((prev) =>
      prev.map((operador) => (operador.id === id ? { ...operador, ...operadorAtualizado } : operador)),
    )
  }

  const deleteOperador = (id: number) => {
    setOperadores((prev) => prev.filter((o) => o.id !== id))
  }

  const importOperadores = (novosOperadores: Omit<Operador, "id">[]) => {
    const operadoresComId = novosOperadores.map((operador, index) => ({
      ...operador,
      id: Date.now() + index,
    }))
    setOperadores((prev) => [...prev, ...operadoresComId])
  }

  const value: DataContextType = {
    carteiras,
    treinamentos,
    assuntos,
    desligamentos,
    dadosDiarios,
    estatisticasCarteiras,
    operadores,
    addCarteira,
    updateCarteira,
    removeCarteira,
    addTreinamento,
    addAssunto,
    updateAssunto,
    deleteAssunto,
    updateTreinamento,
    addDesligamento,
    addDadosDiarios,
    updateDadosDiarios,
    deleteDadosDiarios,
    addEstatisticasCarteira,
    updateDesligamento,
    deleteDesligamento,
    addOperador,
    updateOperador,
    deleteOperador,
    importOperadores,
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
