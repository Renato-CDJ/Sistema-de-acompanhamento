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
  cargaHoraria: string
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

interface WeekData {
  id: string
  conforme: number
  inconforme: number
}

interface MonthData {
  year: number
  month: number
  weeks: WeekData[]
}

interface TIAEntry {
  id: string
  date: string
  analisados: number
  quantidade: number
  totalPercent: number
}

interface DataContextType {
  // Capacitação
  carteiras: Carteira[]
  treinamentos: Treinamento[]
  assuntos: string[]
  addCarteira: (name: string) => void
  updateCarteira: (id: string, name: string) => void
  deleteCarteira: (id: string) => void
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
  updateEstatisticasCarteira: (id: number, stats: Partial<EstatisticasCarteira>) => void
  deleteEstatisticasCarteira: (id: number) => void

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

  monitoringData: MonthData[]
  addOrUpdateMonitoringMonth: (monthData: MonthData) => void
  deleteMonitoringWeek: (year: number, month: number, weekId: string) => void
  updateMonitoringWeek: (year: number, month: number, weekId: string, weekData: WeekData) => void
  getMonitoringStats: (
    year?: number,
    month?: number,
  ) => {
    conforme: number
    inconforme: number
    total: number
    mediaConforme: string
    mediaInconforme: string
  }

  // TIA data
  tiaData: TIAEntry[]
  addTIAEntry: (entry: Omit<TIAEntry, "id" | "totalPercent">) => void
  updateTIAEntry: (id: string, entry: Partial<Omit<TIAEntry, "id">>) => void
  deleteTIAEntry: (id: string) => void
  getTIAStats: (
    year?: number,
    month?: number,
  ) => {
    totalEntries: number
    totalAnalisados: number
    totalQuantidade: number
    mediaPercent: string
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
  const [monitoringData, setMonitoringData] = useState<MonthData[]>([])
  const [tiaData, setTiaData] = useState<TIAEntry[]>([])

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

  const deleteCarteira = (id: string) => {
    setCarteiras((prev) => prev.filter((c) => c.id !== id))
  }

  const addTreinamento = (novoTreinamento: Omit<Treinamento, "id">) => {
    const treinamento: Treinamento = {
      ...novoTreinamento,
      id: Date.now(),
    }

    setTreinamentos((prev) => [...prev, treinamento])

    if (treinamento.status === "Aplicado" && treinamento.quantidade > 0) {
      const novosOperadores: Omit<Operador, "id">[] = []
      for (let i = 1; i <= treinamento.quantidade; i++) {
        novosOperadores.push({
          nome: `Operador ${i} - ${treinamento.assunto}`,
          assunto: treinamento.assunto,
          dataConlusao: treinamento.data,
          carteira: treinamento.carteira,
          turno: treinamento.turno,
        })
      }

      // Add all operators at once
      const operadoresComId = novosOperadores.map((operador, index) => ({
        ...operador,
        id: Date.now() + index + 1,
      }))
      setOperadores((prev) => [...prev, ...operadoresComId])
    }

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

  const updateEstatisticasCarteira = (id: number, statsAtualizadas: Partial<EstatisticasCarteira>) => {
    setEstatisticasCarteiras((prev) =>
      prev.map((stats) => (stats.id === id ? { ...stats, ...statsAtualizadas } : stats)),
    )
  }

  const deleteEstatisticasCarteira = (id: number) => {
    setEstatisticasCarteiras((prev) => prev.filter((s) => s.id !== id))
  }

  const updateDadosDiarios = (id: number, dadosAtualizados: Partial<DadosDiarios>) => {
    setDadosDiarios((prev) => prev.map((dados) => (dados.id === id ? { ...dados, ...dadosAtualizados } : dados)))
  }

  const deleteDadosDiarios = (id: number) => {
    setDadosDiarios((prev) => prev.filter((d) => d.id !== id))
  }

  const updateTreinamento = (id: number, treinamentoAtualizado: Partial<Treinamento>) => {
    setTreinamentos((prev) => {
      const treinamentoAntigo = prev.find((t) => t.id === id)
      const updated = prev.map((t) => (t.id === id ? { ...t, ...treinamentoAtualizado } : t))

      if (treinamentoAntigo && treinamentoAtualizado.status === "Aplicado" && treinamentoAntigo.status === "Pendente") {
        const treinamento = updated.find((t) => t.id === id)
        if (treinamento) {
          // Create operator records for this training
          const novosOperadores: Omit<Operador, "id">[] = []
          for (let i = 1; i <= treinamento.quantidade; i++) {
            novosOperadores.push({
              nome: `Operador ${i} - ${treinamento.assunto}`,
              assunto: treinamento.assunto,
              dataConlusao: treinamento.data,
              carteira: treinamento.carteira,
              turno: treinamento.turno,
            })
          }

          const operadoresComId = novosOperadores.map((operador, index) => ({
            ...operador,
            id: Date.now() + index + 1,
          }))
          setOperadores((prevOp) => [...prevOp, ...operadoresComId])
        }
      }

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

  const addOrUpdateMonitoringMonth = (monthData: MonthData) => {
    setMonitoringData((prev) => {
      const existingIndex = prev.findIndex((m) => m.year === monthData.year && m.month === monthData.month)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = monthData
        return updated
      }
      return [...prev, monthData]
    })
  }

  const deleteMonitoringWeek = (year: number, month: number, weekId: string) => {
    setMonitoringData((prev) => {
      return prev.map((monthData) => {
        if (monthData.year === year && monthData.month === month) {
          return {
            ...monthData,
            weeks: monthData.weeks.filter((week) => week.id !== weekId),
          }
        }
        return monthData
      })
    })
  }

  const updateMonitoringWeek = (year: number, month: number, weekId: string, weekData: WeekData) => {
    setMonitoringData((prev) => {
      return prev.map((monthData) => {
        if (monthData.year === year && monthData.month === month) {
          return {
            ...monthData,
            weeks: monthData.weeks.map((week) => (week.id === weekId ? weekData : week)),
          }
        }
        return monthData
      })
    })
  }

  const getMonitoringStats = (year?: number, month?: number) => {
    let dataToAnalyze: MonthData[]

    if (year !== undefined && month !== undefined) {
      dataToAnalyze = monitoringData.filter((m) => m.year === year && m.month === month)
    } else {
      dataToAnalyze = monitoringData
    }

    const totalConforme = dataToAnalyze.reduce(
      (sum, monthData) => sum + monthData.weeks.reduce((weekSum, week) => weekSum + week.conforme, 0),
      0,
    )
    const totalInconforme = dataToAnalyze.reduce(
      (sum, monthData) => sum + monthData.weeks.reduce((weekSum, week) => weekSum + week.inconforme, 0),
      0,
    )
    const total = totalConforme + totalInconforme

    return {
      conforme: totalConforme,
      inconforme: totalInconforme,
      total,
      mediaConforme: total > 0 ? ((totalConforme / total) * 100).toFixed(2) : "0.00",
      mediaInconforme: total > 0 ? ((totalInconforme / total) * 100).toFixed(2) : "0.00",
    }
  }

  const addTIAEntry = (newEntry: Omit<TIAEntry, "id" | "totalPercent">) => {
    const totalPercent = (newEntry.analisados / newEntry.quantidade) * 100
    const entry: TIAEntry = {
      ...newEntry,
      id: Date.now().toString(),
      totalPercent,
    }
    setTiaData((prev) => [...prev, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
  }

  const updateTIAEntry = (id: string, updatedEntry: Partial<Omit<TIAEntry, "id">>) => {
    setTiaData((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          const updated = { ...entry, ...updatedEntry }
          if (updatedEntry.analisados !== undefined || updatedEntry.quantidade !== undefined) {
            updated.totalPercent = (updated.analisados / updated.quantidade) * 100
          }
          return updated
        }
        return entry
      }),
    )
  }

  const deleteTIAEntry = (id: string) => {
    setTiaData((prev) => prev.filter((entry) => entry.id !== id))
  }

  const getTIAStats = (year?: number, month?: number) => {
    let dataToAnalyze = tiaData

    if (year !== undefined && month !== undefined) {
      dataToAnalyze = tiaData.filter((entry) => {
        const entryDate = new Date(entry.date)
        return entryDate.getFullYear() === year && entryDate.getMonth() === month
      })
    }

    const totalEntries = dataToAnalyze.length
    const totalAnalisados = dataToAnalyze.reduce((sum, entry) => sum + entry.analisados, 0)
    const totalQuantidade = dataToAnalyze.reduce((sum, entry) => sum + entry.quantidade, 0)
    const mediaPercent = totalQuantidade > 0 ? ((totalAnalisados / totalQuantidade) * 100).toFixed(10) : "0.0000000000"

    return {
      totalEntries,
      totalAnalisados,
      totalQuantidade,
      mediaPercent,
    }
  }

  const value: DataContextType = {
    carteiras,
    treinamentos,
    assuntos,
    desligamentos,
    dadosDiarios,
    estatisticasCarteiras,
    operadores,
    monitoringData,
    tiaData,
    addCarteira,
    updateCarteira,
    deleteCarteira,
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
    updateEstatisticasCarteira,
    deleteEstatisticasCarteira,
    updateDesligamento,
    deleteDesligamento,
    addOperador,
    updateOperador,
    deleteOperador,
    importOperadores,
    getCapacitacaoStats,
    getDesligamentosStats,
    getTreinadosStats,
    addOrUpdateMonitoringMonth,
    deleteMonitoringWeek,
    updateMonitoringWeek,
    getMonitoringStats,
    addTIAEntry,
    updateTIAEntry,
    deleteTIAEntry,
    getTIAStats,
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
