"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"

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

interface MotivoDesligamento {
  id: number
  nome: string
}

interface Agente {
  id: number
  operador: string
  carteira: string
  gestor: string
  status: "Ativo" | "Desligado" | "Férias"
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

interface ActivityLog {
  id: string
  timestamp: string
  user: string
  action: string
  entity: string
  entityId: string | number
  details: string
  changes?: {
    field: string
    oldValue: string
    newValue: string
  }[]
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
  deleteTreinamento: (id: number) => void

  // Desligamentos
  desligamentos: Desligamento[]
  motivosDesligamento: MotivoDesligamento[]
  addMotivoDesligamento: (nome: string) => void
  updateMotivoDesligamento: (id: number, nome: string) => void
  deleteMotivoDesligamento: (id: number) => void
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

  // Agentes
  agentes: Agente[]
  addAgente: (agente: Omit<Agente, "id">) => void
  updateAgente: (id: number, agente: Partial<Agente>) => void
  deleteAgente: (id: number) => void
  importAgentes: (agentes: Omit<Agente, "id">[]) => void

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
      turno: string
      quantidade: number
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

  activityLogs: ActivityLog[]
  getActivityLogs: (filters?: {
    dateRange?: { start: string; end: string }
    user?: string
    action?: string
    entity?: string
  }) => ActivityLog[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const initialAssuntos: string[] = []

const initialMotivosDesligamento: MotivoDesligamento[] = []

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const [carteiras, setCarteiras] = useState<Carteira[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("carteiras")
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error("Error loading carteiras from localStorage:", error)
        return []
      }
    }
    return []
  })

  const [treinamentos, setTreinamentos] = useState<Treinamento[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("treinamentos")
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error("Error loading treinamentos from localStorage:", error)
        return []
      }
    }
    return []
  })

  const [assuntos, setAssuntos] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("assuntos")
        return stored ? JSON.parse(stored) : initialAssuntos
      } catch (error) {
        console.error("Error loading assuntos from localStorage:", error)
        return initialAssuntos
      }
    }
    return initialAssuntos
  })

  const [desligamentos, setDesligamentos] = useState<Desligamento[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("desligamentos")
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error("Error loading desligamentos from localStorage:", error)
        return []
      }
    }
    return []
  })

  const [motivosDesligamento, setMotivosDesligamento] = useState<MotivoDesligamento[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("motivosDesligamento")
        return stored ? JSON.parse(stored) : initialMotivosDesligamento
      } catch (error) {
        console.error("Error loading motivosDesligamento from localStorage:", error)
        return initialMotivosDesligamento
      }
    }
    return initialMotivosDesligamento
  })

  const [dadosDiarios, setDadosDiarios] = useState<DadosDiarios[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("dadosDiarios")
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error("Error loading dadosDiarios from localStorage:", error)
        return []
      }
    }
    return []
  })

  const [estatisticasCarteiras, setEstatisticasCarteiras] = useState<EstatisticasCarteira[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("estatisticasCarteiras")
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error("Error loading estatisticasCarteiras from localStorage:", error)
        return []
      }
    }
    return []
  })

  const [operadores, setOperadores] = useState<Operador[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("operadores")
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error("Error loading operadores from localStorage:", error)
        return []
      }
    }
    return []
  })

  const [agentes, setAgentes] = useState<Agente[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("agentes")
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error("Error loading agentes from localStorage:", error)
        return []
      }
    }
    return []
  })

  const [monitoringData, setMonitoringData] = useState<MonthData[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("monitoringData")
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error("Error loading monitoringData from localStorage:", error)
        return []
      }
    }
    return []
  })

  const [tiaData, setTiaData] = useState<TIAEntry[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tiaData")
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error("Error loading tiaData from localStorage:", error)
        return []
      }
    }
    return []
  })

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("activityLogs")
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error("Error loading activityLogs from localStorage:", error)
        return []
      }
    }
    return []
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("carteiras", JSON.stringify(carteiras))
      } catch (error) {
        console.error("Error saving carteiras to localStorage:", error)
      }
    }
  }, [carteiras])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("treinamentos", JSON.stringify(treinamentos))
      } catch (error) {
        console.error("Error saving treinamentos to localStorage:", error)
      }
    }
  }, [treinamentos])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("assuntos", JSON.stringify(assuntos))
      } catch (error) {
        console.error("Error saving assuntos to localStorage:", error)
      }
    }
  }, [assuntos])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("desligamentos", JSON.stringify(desligamentos))
      } catch (error) {
        console.error("Error saving desligamentos to localStorage:", error)
      }
    }
  }, [desligamentos])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("motivosDesligamento", JSON.stringify(motivosDesligamento))
      } catch (error) {
        console.error("Error saving motivosDesligamento to localStorage:", error)
      }
    }
  }, [motivosDesligamento])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("dadosDiarios", JSON.stringify(dadosDiarios))
      } catch (error) {
        console.error("Error saving dadosDiarios to localStorage:", error)
      }
    }
  }, [dadosDiarios])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("estatisticasCarteiras", JSON.stringify(estatisticasCarteiras))
      } catch (error) {
        console.error("Error saving estatisticasCarteiras to localStorage:", error)
      }
    }
  }, [estatisticasCarteiras])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("operadores", JSON.stringify(operadores))
      } catch (error) {
        console.error("Error saving operadores to localStorage:", error)
      }
    }
  }, [operadores])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("agentes", JSON.stringify(agentes))
      } catch (error) {
        console.error("Error saving agentes to localStorage:", error)
      }
    }
  }, [agentes])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("monitoringData", JSON.stringify(monitoringData))
      } catch (error) {
        console.error("Error saving monitoringData to localStorage:", error)
      }
    }
  }, [monitoringData])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tiaData", JSON.stringify(tiaData))
      } catch (error) {
        console.error("Error saving tiaData to localStorage:", error)
      }
    }
  }, [tiaData])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("activityLogs", JSON.stringify(activityLogs))
      } catch (error) {
        console.error("Error saving activityLogs to localStorage:", error)
      }
    }
  }, [activityLogs])

  const logActivity = (
    action: string,
    entity: string,
    entityId: string | number,
    details: string,
    changes?: ActivityLog["changes"],
  ) => {
    const log: ActivityLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      user: user?.username || "Sistema",
      action,
      entity,
      entityId,
      details,
      changes,
    }
    setActivityLogs((prev) => [log, ...prev])
  }

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
    logActivity("Criar", "Carteira", carteira.id, `Carteira "${name}" criada`)
  }

  const updateCarteira = (id: string, newName: string) => {
    const oldCarteira = carteiras.find((c) => c.id === id)
    setCarteiras((prev) => prev.map((carteira) => (carteira.id === id ? { ...carteira, name: newName } : carteira)))
    if (oldCarteira) {
      logActivity("Editar", "Carteira", id, `Carteira renomeada`, [
        { field: "Nome", oldValue: oldCarteira.name, newValue: newName },
      ])
    }
  }

  const deleteCarteira = (id: string) => {
    const carteira = carteiras.find((c) => c.id === id)
    setCarteiras((prev) => prev.filter((c) => c.id !== id))
    if (carteira) {
      logActivity("Excluir", "Carteira", id, `Carteira "${carteira.name}" excluída`)
    }
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

    logActivity(
      "Criar",
      "Treinamento",
      treinamento.id,
      `Treinamento "${treinamento.assunto}" adicionado para ${treinamento.quantidade} operadores`,
    )
  }

  const addAssunto = (novoAssunto: string) => {
    setAssuntos((prev) => [...prev, novoAssunto])
    logActivity("Criar", "Assunto", novoAssunto, `Assunto "${novoAssunto}" criado`)
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

      logActivity("Editar", "Assunto", index, `Assunto renomeado`, [
        { field: "Nome", oldValue: assuntoAntigo, newValue: novoAssunto },
      ])

      return novosAssuntos
    })
  }

  const deleteAssunto = (index: number) => {
    const assunto = assuntos[index]
    setAssuntos((prev) => prev.filter((_, i) => i !== index))
    logActivity("Excluir", "Assunto", index, `Assunto "${assunto}" excluído`)
  }

  const addDesligamento = (novoDesligamento: Omit<Desligamento, "id">) => {
    const desligamento: Desligamento = {
      ...novoDesligamento,
      id: Date.now(),
    }
    setDesligamentos((prev) => [...prev, desligamento])
    logActivity("Criar", "Desligamento", desligamento.id, `Desligamento de "${desligamento.nome}" registrado`)
  }

  const addDadosDiarios = (novosDados: Omit<DadosDiarios, "id">) => {
    const dados: DadosDiarios = {
      ...novosDados,
      id: Date.now(),
    }
    setDadosDiarios((prev) => [...prev, dados])
    logActivity("Criar", "Dados Diários", dados.id, `Dados diários adicionados para ${dados.date}`)
  }

  const addEstatisticasCarteira = (novasStats: Omit<EstatisticasCarteira, "id">) => {
    const stats: EstatisticasCarteira = {
      ...novasStats,
      id: Date.now(),
    }
    setEstatisticasCarteiras((prev) => [...prev, stats])
    logActivity("Criar", "Estatísticas", stats.id, `Estatísticas adicionadas para carteira "${stats.carteira}"`)
  }

  const updateEstatisticasCarteira = (id: number, statsAtualizadas: Partial<EstatisticasCarteira>) => {
    setEstatisticasCarteiras((prev) =>
      prev.map((stats) => (stats.id === id ? { ...stats, ...statsAtualizadas } : stats)),
    )
    logActivity("Editar", "Estatísticas", id, `Estatísticas de carteira atualizadas`)
  }

  const deleteEstatisticasCarteira = (id: number) => {
    const stats = estatisticasCarteiras.find((s) => s.id === id)
    setEstatisticasCarteiras((prev) => prev.filter((s) => s.id !== id))
    if (stats) {
      logActivity("Excluir", "Estatísticas", id, `Estatísticas da carteira "${stats.carteira}" excluídas`)
    }
  }

  const updateDadosDiarios = (id: number, dadosAtualizados: Partial<DadosDiarios>) => {
    setDadosDiarios((prev) => prev.map((dados) => (dados.id === id ? { ...dados, ...dadosAtualizados } : dados)))
    logActivity("Editar", "Dados Diários", id, `Dados diários atualizados`)
  }

  const deleteDadosDiarios = (id: number) => {
    const dados = dadosDiarios.find((d) => d.id === id)
    setDadosDiarios((prev) => prev.filter((d) => d.id !== id))
    if (dados) {
      logActivity("Excluir", "Dados Diários", id, `Dados diários de ${dados.date} excluídos`)
    }
  }

  const updateTreinamento = (id: number, treinamentoAtualizado: Partial<Treinamento>) => {
    setTreinamentos((prev) => {
      const treinamentoAntigo = prev.find((t) => t.id === id)
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

      if (treinamentoAntigo) {
        logActivity("Editar", "Treinamento", id, `Treinamento "${treinamentoAntigo.assunto}" atualizado`)
      }

      return updated
    })
  }

  const deleteTreinamento = (id: number) => {
    setTreinamentos((prev) => {
      const treinamentoToDelete = prev.find((t) => t.id === id)
      const updated = prev.filter((t) => t.id !== id)

      // Recalculate carteira stats after deletion
      if (treinamentoToDelete) {
        setCarteiras((prevCarteiras) =>
          prevCarteiras.map((carteira) => {
            if (carteira.name === treinamentoToDelete.carteira) {
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
            }
            return carteira
          }),
        )

        logActivity("Excluir", "Treinamento", id, `Treinamento "${treinamentoToDelete.assunto}" excluído`)
      }

      return updated
    })
  }

  const updateDesligamento = (id: number, desligamentoAtualizado: Partial<Desligamento>) => {
    setDesligamentos((prev) =>
      prev.map((desligamento) =>
        desligamento.id === id ? { ...desligamento, ...desligamentoAtualizado } : desligamento,
      ),
    )
    logActivity("Editar", "Desligamento", id, `Desligamento atualizado`)
  }

  const deleteDesligamento = (id: number) => {
    const desligamento = desligamentos.find((d) => d.id === id)
    setDesligamentos((prev) => prev.filter((d) => d.id !== id))
    if (desligamento) {
      logActivity("Excluir", "Desligamento", id, `Desligamento de "${desligamento.nome}" excluído`)
    }
  }

  const addOperador = (novoOperador: Omit<Operador, "id">) => {
    const operador: Operador = {
      ...novoOperador,
      id: Date.now(),
    }
    setOperadores((prev) => [...prev, operador])
    logActivity("Criar", "Operador", operador.id, `Operador "${operador.nome}" adicionado`)
  }

  const updateOperador = (id: number, operadorAtualizado: Partial<Operador>) => {
    setOperadores((prev) =>
      prev.map((operador) => (operador.id === id ? { ...operador, ...operadorAtualizado } : operador)),
    )
    logActivity("Editar", "Operador", id, `Operador atualizado`)
  }

  const deleteOperador = (id: number) => {
    const operador = operadores.find((o) => o.id === id)
    setOperadores((prev) => prev.filter((o) => o.id !== id))
    if (operador) {
      logActivity("Excluir", "Operador", id, `Operador "${operador.nome}" excluído`)
    }
  }

  const importOperadores = (novosOperadores: Omit<Operador, "id">[]) => {
    const operadoresComId = novosOperadores.map((operador, index) => ({
      ...operador,
      id: Date.now() + index,
    }))
    setOperadores((prev) => [...prev, ...operadoresComId])
    logActivity("Importar", "Operadores", "bulk", `${novosOperadores.length} operadores importados`)
  }

  const addAgente = (novoAgente: Omit<Agente, "id">) => {
    const agente: Agente = {
      ...novoAgente,
      id: Date.now(),
    }
    setAgentes((prev) => [...prev, agente])
    logActivity("Criar", "Agente", agente.id, `Agente "${agente.operador}" adicionado`)
  }

  const updateAgente = (id: number, agenteAtualizado: Partial<Agente>) => {
    setAgentes((prev) => prev.map((agente) => (agente.id === id ? { ...agente, ...agenteAtualizado } : agente)))
    logActivity("Editar", "Agente", id, `Agente atualizado`)
  }

  const deleteAgente = (id: number) => {
    const agente = agentes.find((a) => a.id === id)
    setAgentes((prev) => prev.filter((a) => a.id !== id))
    if (agente) {
      logActivity("Excluir", "Agente", id, `Agente "${agente.operador}" excluído`)
    }
  }

  const importAgentes = (novosAgentes: Omit<Agente, "id">[]) => {
    const agentesComId = novosAgentes.map((agente, index) => ({
      ...agente,
      id: Date.now() + index,
    }))
    setAgentes((prev) => [...prev, ...agentesComId])
    logActivity("Importar", "Agentes", "bulk", `${novosAgentes.length} agentes importados`)
  }

  const addOrUpdateMonitoringMonth = (monthData: MonthData) => {
    setMonitoringData((prev) => {
      const existingIndex = prev.findIndex((m) => m.year === monthData.year && m.month === monthData.month)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = monthData
        logActivity("Editar", "Monitoria", `${monthData.year}-${monthData.month}`, `Dados de monitoria atualizados`)
        return updated
      }
      logActivity("Criar", "Monitoria", `${monthData.year}-${monthData.month}`, `Dados de monitoria adicionados`)
      return [...prev, monthData]
    })
  }

  const deleteMonitoringWeek = (year: number, month: number, weekId: string) => {
    setMonitoringData((prev) => {
      return prev.map((monthData) => {
        if (monthData.year === year && monthData.month === month) {
          logActivity("Excluir", "Monitoria", weekId, `Semana de monitoria excluída`)
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
          logActivity("Editar", "Monitoria", weekId, `Semana de monitoria atualizada`)
          return {
            ...monthData,
            weeks: monthData.weeks.map((week) => (week.id === weekId ? weekData : week)),
          }
        }
        return monthData
      })
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
    const treinamentosAplicados = treinamentos.filter((t) => t.status === "Aplicado")
    const totalTreinados = treinamentosAplicados.reduce((sum, t) => sum + t.quantidade, 0)
    const assuntosUnicos = [...new Set(treinamentosAplicados.map((t) => t.assunto))]

    // Create detailed list of trained operators from training sessions
    const operadoresTreinados = treinamentosAplicados.map((t) => ({
      id: t.id,
      nome: `${t.quantidade} operadores`, // Show quantity instead of individual names
      assunto: t.assunto,
      dataConlusao: t.data,
      carteira: t.carteira,
      turno: t.turno,
      quantidade: t.quantidade,
    }))

    return {
      totalTreinados,
      assuntosUnicos,
      operadoresTreinados,
    }
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
    logActivity("Criar", "TIA", entry.id, `Entrada TIA adicionada para ${entry.date}`)
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
    logActivity("Editar", "TIA", id, `Entrada TIA atualizada`)
  }

  const deleteTIAEntry = (id: string) => {
    const entry = tiaData.find((e) => e.id === id)
    setTiaData((prev) => prev.filter((entry) => entry.id !== id))
    if (entry) {
      logActivity("Excluir", "TIA", id, `Entrada TIA de ${entry.date} excluída`)
    }
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
    const mediaPercent = totalQuantidade > 0 ? ((totalAnalisados / totalQuantidade) * 100).toFixed(2) : "0.00"

    return {
      totalEntries,
      totalAnalisados,
      totalQuantidade,
      mediaPercent,
    }
  }

  const addMotivoDesligamento = (nome: string) => {
    const motivo: MotivoDesligamento = {
      id: Date.now(),
      nome,
    }
    setMotivosDesligamento((prev) => [...prev, motivo])
    logActivity("Criar", "Motivo Desligamento", motivo.id, `Motivo "${nome}" criado`)
  }

  const updateMotivoDesligamento = (id: number, nome: string) => {
    setMotivosDesligamento((prev) => {
      const motivoAntigo = prev.find((m) => m.id === id)
      const updated = prev.map((m) => (m.id === id ? { ...m, nome } : m))

      // Update all desligamentos that use this motivo
      if (motivoAntigo) {
        setDesligamentos((prevDesligamentos) =>
          prevDesligamentos.map((d) => (d.motivo === motivoAntigo.nome ? { ...d, motivo: nome } : d)),
        )
        logActivity("Editar", "Motivo Desligamento", id, `Motivo renomeado`, [
          { field: "Nome", oldValue: motivoAntigo.nome, newValue: nome },
        ])
      }

      return updated
    })
  }

  const deleteMotivoDesligamento = (id: number) => {
    const motivo = motivosDesligamento.find((m) => m.id === id)
    setMotivosDesligamento((prev) => prev.filter((m) => m.id !== id))
    if (motivo) {
      logActivity("Excluir", "Motivo Desligamento", id, `Motivo "${motivo.nome}" excluído`)
    }
  }

  const getActivityLogs = (filters?: {
    dateRange?: { start: string; end: string }
    user?: string
    action?: string
    entity?: string
  }) => {
    let filtered = activityLogs

    if (filters?.dateRange?.start) {
      filtered = filtered.filter((log) => new Date(log.timestamp) >= new Date(filters.dateRange!.start))
    }
    if (filters?.dateRange?.end) {
      filtered = filtered.filter((log) => new Date(log.timestamp) <= new Date(filters.dateRange!.end))
    }
    if (filters?.user && filters.user !== "Todos os usuários") {
      filtered = filtered.filter((log) => log.user === filters.user)
    }
    if (filters?.action && filters.action !== "Todas as ações") {
      filtered = filtered.filter((log) => log.action === filters.action)
    }
    if (filters?.entity && filters.entity !== "Todas as entidades") {
      filtered = filtered.filter((log) => log.entity === filters.entity)
    }

    return filtered
  }

  const value: DataContextType = {
    carteiras,
    treinamentos,
    assuntos,
    desligamentos,
    motivosDesligamento,
    addMotivoDesligamento,
    updateMotivoDesligamento,
    deleteMotivoDesligamento,
    dadosDiarios,
    estatisticasCarteiras,
    operadores,
    agentes,
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
    deleteTreinamento,
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
    addAgente,
    updateAgente,
    deleteAgente,
    importAgentes,
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
    activityLogs,
    getActivityLogs,
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
