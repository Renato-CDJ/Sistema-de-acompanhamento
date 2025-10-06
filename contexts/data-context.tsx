"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createBrowserClient } from "@/lib/supabase/client"
import useSWR, { mutate } from "swr"

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
  addCarteira: (name: string) => Promise<void>
  updateCarteira: (id: string, name: string) => Promise<void>
  deleteCarteira: (id: string) => Promise<void>
  addTreinamento: (treinamento: Omit<Treinamento, "id">) => Promise<void>
  addAssunto: (assunto: string) => Promise<void>
  updateAssunto: (index: number, novoAssunto: string) => Promise<void>
  deleteAssunto: (index: number) => Promise<void>
  updateTreinamento: (id: number, treinamento: Partial<Treinamento>) => Promise<void>
  deleteTreinamento: (id: number) => Promise<void>

  // Desligamentos
  desligamentos: Desligamento[]
  motivosDesligamento: MotivoDesligamento[]
  addMotivoDesligamento: (nome: string) => Promise<void>
  updateMotivoDesligamento: (id: number, nome: string) => Promise<void>
  deleteMotivoDesligamento: (id: number) => Promise<void>
  addDesligamento: (desligamento: Omit<Desligamento, "id">) => Promise<void>
  updateDesligamento: (id: number, desligamento: Partial<Desligamento>) => Promise<void>
  deleteDesligamento: (id: number) => Promise<void>

  // Quadro
  dadosDiarios: DadosDiarios[]
  estatisticasCarteiras: EstatisticasCarteira[]
  addDadosDiarios: (dados: Omit<DadosDiarios, "id">) => Promise<void>
  updateDadosDiarios: (id: number, dados: Partial<DadosDiarios>) => Promise<void>
  deleteDadosDiarios: (id: number) => Promise<void>
  addEstatisticasCarteira: (stats: Omit<EstatisticasCarteira, "id">) => Promise<void>
  updateEstatisticasCarteira: (id: number, stats: Partial<EstatisticasCarteira>) => Promise<void>
  deleteEstatisticasCarteira: (id: number) => Promise<void>

  // Operadores
  operadores: Operador[]
  addOperador: (operador: Omit<Operador, "id">) => Promise<void>
  updateOperador: (id: number, operador: Partial<Operador>) => Promise<void>
  deleteOperador: (id: number) => Promise<void>
  importOperadores: (operadores: Omit<Operador, "id">[]) => Promise<void>

  // Agentes
  agentes: Agente[]
  addAgente: (agente: Omit<Agente, "id">) => Promise<void>
  updateAgente: (id: number, agente: Partial<Agente>) => Promise<void>
  deleteAgente: (id: number) => Promise<void>
  importAgentes: (agentes: Omit<Agente, "id">[]) => Promise<void>

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
  addOrUpdateMonitoringMonth: (monthData: MonthData) => Promise<void>
  deleteMonitoringWeek: (year: number, month: number, weekId: string) => Promise<void>
  updateMonitoringWeek: (year: number, month: number, weekId: string, weekData: WeekData) => Promise<void>
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
  addTIAEntry: (entry: Omit<TIAEntry, "id" | "totalPercent">) => Promise<void>
  updateTIAEntry: (id: string, entry: Partial<Omit<TIAEntry, "id">>) => Promise<void>
  deleteTIAEntry: (id: string) => Promise<void>
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

const fetcher = async (table: string) => {
  const supabase = createBrowserClient()

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

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const supabase = createBrowserClient()

  const shouldFetch = !isLoading && !!user

  const { data: carteiras = [] } = useSWR<Carteira[]>(shouldFetch ? "carteiras" : null, fetcher)
  const { data: treinamentos = [] } = useSWR<Treinamento[]>(shouldFetch ? "treinamentos" : null, fetcher)
  const { data: assuntos = [] } = useSWR<string[]>(shouldFetch ? "assuntos" : null, async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) throw new Error("Not authenticated")

    const { data, error } = await supabase.from("assuntos").select("nome").order("created_at", { ascending: true })
    if (error) throw error
    return data?.map((a) => a.nome) || initialAssuntos
  })
  const { data: desligamentos = [] } = useSWR<Desligamento[]>(shouldFetch ? "desligamentos" : null, fetcher)
  const { data: motivosDesligamento = [] } = useSWR<MotivoDesligamento[]>(
    shouldFetch ? "motivos_desligamento" : null,
    fetcher,
  )
  const { data: dadosDiarios = [] } = useSWR<DadosDiarios[]>(shouldFetch ? "dados_diarios" : null, fetcher)
  const { data: estatisticasCarteiras = [] } = useSWR<EstatisticasCarteira[]>(
    shouldFetch ? "estatisticas_carteiras" : null,
    fetcher,
  )
  const { data: operadores = [] } = useSWR<Operador[]>(shouldFetch ? "operadores" : null, fetcher)
  const { data: agentes = [] } = useSWR<Agente[]>(shouldFetch ? "agentes" : null, fetcher)
  const { data: monitoringData = [] } = useSWR<MonthData[]>(shouldFetch ? "monitoring_data" : null, fetcher)
  const { data: tiaData = [] } = useSWR<TIAEntry[]>(shouldFetch ? "tia_data" : null, fetcher)
  const { data: activityLogs = [] } = useSWR<ActivityLog[]>(shouldFetch ? "activity_logs" : null, fetcher)

  const logActivity = async (
    action: string,
    entity: string,
    entityId: string | number,
    details: string,
    changes?: ActivityLog["changes"],
  ) => {
    const log = {
      timestamp: new Date().toISOString(),
      user: user?.username || "Sistema",
      action,
      entity,
      entity_id: entityId.toString(),
      details,
      changes: changes || null,
    }

    const { error } = await supabase.from("activity_logs").insert([log])
    if (error) console.error("Error logging activity:", error)

    // Revalidate activity logs
    mutate("activity_logs")
  }

  const addCarteira = async (name: string) => {
    const carteira = {
      name: name,
      total: 0,
      aplicados: 0,
      pendentes: 0,
      taxa: 0,
    }

    const { error } = await supabase.from("carteiras").insert([carteira])
    if (error) {
      console.error("Error adding carteira:", error)
      return
    }

    await logActivity("Criar", "Carteira", name, `Carteira "${name}" criada`)
    mutate("carteiras")
  }

  const updateCarteira = async (id: string, newName: string) => {
    const oldCarteira = carteiras.find((c) => c.id === id)

    const { error } = await supabase.from("carteiras").update({ name: newName }).eq("id", id)
    if (error) {
      console.error("Error updating carteira:", error)
      return
    }

    if (oldCarteira) {
      await logActivity("Editar", "Carteira", id, `Carteira renomeada`, [
        { field: "Nome", oldValue: oldCarteira.name, newValue: newName },
      ])
    }
    mutate("carteiras")
  }

  const deleteCarteira = async (id: string) => {
    const carteira = carteiras.find((c) => c.id === id)

    const { error } = await supabase.from("carteiras").delete().eq("id", id)
    if (error) {
      console.error("Error deleting carteira:", error)
      return
    }

    if (carteira) {
      await logActivity("Excluir", "Carteira", id, `Carteira "${carteira.name}" excluída`)
    }
    mutate("carteiras")
  }

  const addTreinamento = async (novoTreinamento: Omit<Treinamento, "id">) => {
    const { error } = await supabase.from("treinamentos").insert([novoTreinamento])
    if (error) {
      console.error("Error adding treinamento:", error)
      return
    }

    // Update carteira stats
    const carteira = carteiras.find((c) => c.name === novoTreinamento.carteira)
    if (carteira) {
      const newTotal = carteira.total + novoTreinamento.quantidade
      const newAplicados =
        novoTreinamento.status === "Aplicado" ? carteira.aplicados + novoTreinamento.quantidade : carteira.aplicados
      const newPendentes =
        novoTreinamento.status === "Pendente" ? carteira.pendentes + novoTreinamento.quantidade : carteira.pendentes
      const newTaxa = newTotal > 0 ? Math.round((newAplicados / newTotal) * 100 * 10) / 10 : 0

      await supabase
        .from("carteiras")
        .update({
          total: newTotal,
          aplicados: newAplicados,
          pendentes: newPendentes,
          taxa: newTaxa,
        })
        .eq("id", carteira.id)
    }

    await logActivity(
      "Criar",
      "Treinamento",
      novoTreinamento.assunto,
      `Treinamento "${novoTreinamento.assunto}" adicionado para ${novoTreinamento.quantidade} operadores`,
    )

    mutate("treinamentos")
    mutate("carteiras")
  }

  const addAssunto = async (novoAssunto: string) => {
    const { error } = await supabase.from("assuntos").insert([{ nome: novoAssunto }])
    if (error) {
      console.error("Error adding assunto:", error)
      return
    }

    await logActivity("Criar", "Assunto", novoAssunto, `Assunto "${novoAssunto}" criado`)
    mutate("assuntos")
  }

  const updateAssunto = async (index: number, novoAssunto: string) => {
    const assuntoAntigo = assuntos[index]

    // Update the assunto in the database
    const { data: assuntosData } = await supabase
      .from("assuntos")
      .select("id, nome")
      .order("created_at", { ascending: true })
    if (assuntosData && assuntosData[index]) {
      await supabase.from("assuntos").update({ nome: novoAssunto }).eq("id", assuntosData[index].id)
    }

    // Update all treinamentos that use this assunto
    await supabase.from("treinamentos").update({ assunto: novoAssunto }).eq("assunto", assuntoAntigo)

    // Update all operadores that use this assunto
    await supabase.from("operadores").update({ assunto: novoAssunto }).eq("assunto", assuntoAntigo)

    await logActivity("Editar", "Assunto", index, `Assunto renomeado`, [
      { field: "Nome", oldValue: assuntoAntigo, newValue: novoAssunto },
    ])

    mutate("assuntos")
    mutate("treinamentos")
    mutate("operadores")
  }

  const deleteAssunto = async (index: number) => {
    const assunto = assuntos[index]

    const { data: assuntosData } = await supabase.from("assuntos").select("id").order("created_at", { ascending: true })
    if (assuntosData && assuntosData[index]) {
      await supabase.from("assuntos").delete().eq("id", assuntosData[index].id)
    }

    await logActivity("Excluir", "Assunto", index, `Assunto "${assunto}" excluído`)
    mutate("assuntos")
  }

  const addDesligamento = async (novoDesligamento: Omit<Desligamento, "id">) => {
    const { error } = await supabase.from("desligamentos").insert([novoDesligamento])
    if (error) {
      console.error("Error adding desligamento:", error)
      return
    }

    await logActivity(
      "Criar",
      "Desligamento",
      novoDesligamento.nome,
      `Desligamento de "${novoDesligamento.nome}" registrado`,
    )
    mutate("desligamentos")
  }

  const updateDesligamento = async (id: number, desligamentoAtualizado: Partial<Desligamento>) => {
    const { error } = await supabase.from("desligamentos").update(desligamentoAtualizado).eq("id", id)
    if (error) {
      console.error("Error updating desligamento:", error)
      return
    }

    await logActivity("Editar", "Desligamento", id, `Desligamento atualizado`)
    mutate("desligamentos")
  }

  const deleteDesligamento = async (id: number) => {
    const desligamento = desligamentos.find((d) => d.id === id)

    const { error } = await supabase.from("desligamentos").delete().eq("id", id)
    if (error) {
      console.error("Error deleting desligamento:", error)
      return
    }

    if (desligamento) {
      await logActivity("Excluir", "Desligamento", id, `Desligamento de "${desligamento.nome}" excluído`)
    }
    mutate("desligamentos")
  }

  const addDadosDiarios = async (novosDados: Omit<DadosDiarios, "id">) => {
    const { error } = await supabase.from("dados_diarios").insert([novosDados])
    if (error) {
      console.error("Error adding dados diarios:", error)
      return
    }

    await logActivity("Criar", "Dados Diários", novosDados.date, `Dados diários adicionados para ${novosDados.date}`)
    mutate("dados_diarios")
  }

  const updateDadosDiarios = async (id: number, dadosAtualizados: Partial<DadosDiarios>) => {
    const { error } = await supabase.from("dados_diarios").update(dadosAtualizados).eq("id", id)
    if (error) {
      console.error("Error updating dados diarios:", error)
      return
    }

    await logActivity("Editar", "Dados Diários", id, `Dados diários atualizados`)
    mutate("dados_diarios")
  }

  const deleteDadosDiarios = async (id: number) => {
    const dados = dadosDiarios.find((d) => d.id === id)

    const { error } = await supabase.from("dados_diarios").delete().eq("id", id)
    if (error) {
      console.error("Error deleting dados diarios:", error)
      return
    }

    if (dados) {
      await logActivity("Excluir", "Dados Diários", id, `Dados diários de ${dados.date} excluídos`)
    }
    mutate("dados_diarios")
  }

  const addEstatisticasCarteira = async (novasStats: Omit<EstatisticasCarteira, "id">) => {
    const { error } = await supabase.from("estatisticas_carteiras").insert([novasStats])
    if (error) {
      console.error("Error adding estatisticas:", error)
      return
    }

    await logActivity(
      "Criar",
      "Estatísticas",
      novasStats.carteira,
      `Estatísticas adicionadas para carteira "${novasStats.carteira}"`,
    )
    mutate("estatisticas_carteiras")
  }

  const updateEstatisticasCarteira = async (id: number, statsAtualizadas: Partial<EstatisticasCarteira>) => {
    const { error } = await supabase.from("estatisticas_carteiras").update(statsAtualizadas).eq("id", id)
    if (error) {
      console.error("Error updating estatisticas:", error)
      return
    }

    await logActivity("Editar", "Estatísticas", id, `Estatísticas de carteira atualizadas`)
    mutate("estatisticas_carteiras")
  }

  const deleteEstatisticasCarteira = async (id: number) => {
    const stats = estatisticasCarteiras.find((s) => s.id === id)

    const { error } = await supabase.from("estatisticas_carteiras").delete().eq("id", id)
    if (error) {
      console.error("Error deleting estatisticas:", error)
      return
    }

    if (stats) {
      await logActivity("Excluir", "Estatísticas", id, `Estatísticas da carteira "${stats.carteira}" excluídas`)
    }
    mutate("estatisticas_carteiras")
  }

  const updateTreinamento = async (id: number, treinamentoAtualizado: Partial<Treinamento>) => {
    const { error } = await supabase.from("treinamentos").update(treinamentoAtualizado).eq("id", id)
    if (error) {
      console.error("Error updating treinamento:", error)
      return
    }

    // Recalculate carteira stats if needed
    if (treinamentoAtualizado.status || treinamentoAtualizado.carteira || treinamentoAtualizado.quantidade) {
      // Fetch all treinamentos for affected carteiras and recalculate
      const { data: allTreinamentos } = await supabase.from("treinamentos").select("*")
      if (allTreinamentos) {
        const carteiraNames = new Set(allTreinamentos.map((t) => t.carteira))
        for (const carteiraName of carteiraNames) {
          const treinamentosCarteira = allTreinamentos.filter((t) => t.carteira === carteiraName)
          const newTotal = treinamentosCarteira.reduce((sum, t) => sum + t.quantidade, 0)
          const newAplicados = treinamentosCarteira
            .filter((t) => t.status === "Aplicado")
            .reduce((sum, t) => sum + t.quantidade, 0)
          const newPendentes = treinamentosCarteira
            .filter((t) => t.status === "Pendente")
            .reduce((sum, t) => sum + t.quantidade, 0)
          const newTaxa = newTotal > 0 ? Math.round((newAplicados / newTotal) * 100 * 10) / 10 : 0

          await supabase
            .from("carteiras")
            .update({
              total: newTotal,
              aplicados: newAplicados,
              pendentes: newPendentes,
              taxa: newTaxa,
            })
            .eq("name", carteiraName)
        }
      }
    }

    await logActivity("Editar", "Treinamento", id, `Treinamento atualizado`)
    mutate("treinamentos")
    mutate("carteiras")
  }

  const deleteTreinamento = async (id: number) => {
    const treinamentoToDelete = treinamentos.find((t) => t.id === id)

    const { error } = await supabase.from("treinamentos").delete().eq("id", id)
    if (error) {
      console.error("Error deleting treinamento:", error)
      return
    }

    // Recalculate carteira stats after deletion
    if (treinamentoToDelete) {
      const { data: allTreinamentos } = await supabase
        .from("treinamentos")
        .select("*")
        .eq("carteira", treinamentoToDelete.carteira)
      if (allTreinamentos) {
        const newTotal = allTreinamentos.reduce((sum, t) => sum + t.quantidade, 0)
        const newAplicados = allTreinamentos
          .filter((t) => t.status === "Aplicado")
          .reduce((sum, t) => sum + t.quantidade, 0)
        const newPendentes = allTreinamentos
          .filter((t) => t.status === "Pendente")
          .reduce((sum, t) => sum + t.quantidade, 0)
        const newTaxa = newTotal > 0 ? Math.round((newAplicados / newTotal) * 100 * 10) / 10 : 0

        await supabase
          .from("carteiras")
          .update({
            total: newTotal,
            aplicados: newAplicados,
            pendentes: newPendentes,
            taxa: newTaxa,
          })
          .eq("name", treinamentoToDelete.carteira)
      }

      await logActivity("Excluir", "Treinamento", id, `Treinamento "${treinamentoToDelete.assunto}" excluído`)
    }

    mutate("treinamentos")
    mutate("carteiras")
  }

  const addOperador = async (novoOperador: Omit<Operador, "id">) => {
    const { error } = await supabase.from("operadores").insert([novoOperador])
    if (error) {
      console.error("Error adding operador:", error)
      return
    }

    await logActivity("Criar", "Operador", novoOperador.nome, `Operador "${novoOperador.nome}" adicionado`)
    mutate("operadores")
  }

  const updateOperador = async (id: number, operadorAtualizado: Partial<Operador>) => {
    const { error } = await supabase.from("operadores").update(operadorAtualizado).eq("id", id)
    if (error) {
      console.error("Error updating operador:", error)
      return
    }

    await logActivity("Editar", "Operador", id, `Operador atualizado`)
    mutate("operadores")
  }

  const deleteOperador = async (id: number) => {
    const operador = operadores.find((o) => o.id === id)

    const { error } = await supabase.from("operadores").delete().eq("id", id)
    if (error) {
      console.error("Error deleting operador:", error)
      return
    }

    if (operador) {
      await logActivity("Excluir", "Operador", id, `Operador "${operador.nome}" excluído`)
    }
    mutate("operadores")
  }

  const importOperadores = async (novosOperadores: Omit<Operador, "id">[]) => {
    const { error } = await supabase.from("operadores").insert(novosOperadores)
    if (error) {
      console.error("Error importing operadores:", error)
      return
    }

    await logActivity("Importar", "Operadores", "bulk", `${novosOperadores.length} operadores importados`)
    mutate("operadores")
  }

  const addAgente = async (novoAgente: Omit<Agente, "id">) => {
    const { error } = await supabase.from("agentes").insert([novoAgente])
    if (error) {
      console.error("Error adding agente:", error)
      return
    }

    await logActivity("Criar", "Agente", novoAgente.operador, `Agente "${novoAgente.operador}" adicionado`)
    mutate("agentes")
  }

  const updateAgente = async (id: number, agenteAtualizado: Partial<Agente>) => {
    const { error } = await supabase.from("agentes").update(agenteAtualizado).eq("id", id)
    if (error) {
      console.error("Error updating agente:", error)
      return
    }

    await logActivity("Editar", "Agente", id, `Agente atualizado`)
    mutate("agentes")
  }

  const deleteAgente = async (id: number) => {
    const agente = agentes.find((a) => a.id === id)

    const { error } = await supabase.from("agentes").delete().eq("id", id)
    if (error) {
      console.error("Error deleting agente:", error)
      return
    }

    if (agente) {
      await logActivity("Excluir", "Agente", id, `Agente "${agente.operador}" excluído`)
    }
    mutate("agentes")
  }

  const importAgentes = async (novosAgentes: Omit<Agente, "id">[]) => {
    const { error } = await supabase.from("agentes").insert(novosAgentes)
    if (error) {
      console.error("Error importing agentes:", error)
      return
    }

    await logActivity("Importar", "Agentes", "bulk", `${novosAgentes.length} agentes importados`)
    mutate("agentes")
  }

  const addOrUpdateMonitoringMonth = async (monthData: MonthData) => {
    const { data: existing } = await supabase
      .from("monitoring_data")
      .select("*")
      .eq("year", monthData.year)
      .eq("month", monthData.month)
      .single()

    if (existing) {
      await supabase
        .from("monitoring_data")
        .update({ weeks: monthData.weeks })
        .eq("year", monthData.year)
        .eq("month", monthData.month)
      await logActivity("Editar", "Monitoria", `${monthData.year}-${monthData.month}`, `Dados de monitoria atualizados`)
    } else {
      await supabase.from("monitoring_data").insert([monthData])
      await logActivity("Criar", "Monitoria", `${monthData.year}-${monthData.month}`, `Dados de monitoria adicionados`)
    }

    mutate("monitoring_data")
  }

  const deleteMonitoringWeek = async (year: number, month: number, weekId: string) => {
    const { data: monthData } = await supabase
      .from("monitoring_data")
      .select("*")
      .eq("year", year)
      .eq("month", month)
      .single()

    if (monthData) {
      const updatedWeeks = monthData.weeks.filter((week: WeekData) => week.id !== weekId)
      await supabase.from("monitoring_data").update({ weeks: updatedWeeks }).eq("year", year).eq("month", month)

      await logActivity("Excluir", "Monitoria", weekId, `Semana de monitoria excluída`)
      mutate("monitoring_data")
    }
  }

  const updateMonitoringWeek = async (year: number, month: number, weekId: string, weekData: WeekData) => {
    const { data: monthData } = await supabase
      .from("monitoring_data")
      .select("*")
      .eq("year", year)
      .eq("month", month)
      .single()

    if (monthData) {
      const updatedWeeks = monthData.weeks.map((week: WeekData) => (week.id === weekId ? weekData : week))
      await supabase.from("monitoring_data").update({ weeks: updatedWeeks }).eq("year", year).eq("month", month)

      await logActivity("Editar", "Monitoria", weekId, `Semana de monitoria atualizada`)
      mutate("monitoring_data")
    }
  }

  const addTIAEntry = async (newEntry: Omit<TIAEntry, "id" | "totalPercent">) => {
    const totalPercent = (newEntry.analisados / newEntry.quantidade) * 100
    const entry = {
      ...newEntry,
      total_percent: totalPercent,
    }

    const { error } = await supabase.from("tia_data").insert([entry])
    if (error) {
      console.error("Error adding TIA entry:", error)
      return
    }

    await logActivity("Criar", "TIA", newEntry.date, `Entrada TIA adicionada para ${newEntry.date}`)
    mutate("tia_data")
  }

  const updateTIAEntry = async (id: string, updatedEntry: Partial<Omit<TIAEntry, "id">>) => {
    const entry = tiaData.find((e) => e.id === id)
    if (entry) {
      const updated = { ...entry, ...updatedEntry }
      if (updatedEntry.analisados !== undefined || updatedEntry.quantidade !== undefined) {
        updated.totalPercent = (updated.analisados / updated.quantidade) * 100
      }

      const { error } = await supabase
        .from("tia_data")
        .update({ ...updatedEntry, total_percent: updated.totalPercent })
        .eq("id", id)

      if (error) {
        console.error("Error updating TIA entry:", error)
        return
      }

      await logActivity("Editar", "TIA", id, `Entrada TIA atualizada`)
      mutate("tia_data")
    }
  }

  const deleteTIAEntry = async (id: string) => {
    const entry = tiaData.find((e) => e.id === id)

    const { error } = await supabase.from("tia_data").delete().eq("id", id)
    if (error) {
      console.error("Error deleting TIA entry:", error)
      return
    }

    if (entry) {
      await logActivity("Excluir", "TIA", id, `Entrada TIA de ${entry.date} excluída`)
    }
    mutate("tia_data")
  }

  const addMotivoDesligamento = async (nome: string) => {
    const { error } = await supabase.from("motivos_desligamento").insert([{ nome }])
    if (error) {
      console.error("Error adding motivo:", error)
      return
    }

    await logActivity("Criar", "Motivo Desligamento", nome, `Motivo "${nome}" criado`)
    mutate("motivos_desligamento")
  }

  const updateMotivoDesligamento = async (id: number, nome: string) => {
    const motivoAntigo = motivosDesligamento.find((m) => m.id === id)

    const { error } = await supabase.from("motivos_desligamento").update({ nome }).eq("id", id)
    if (error) {
      console.error("Error updating motivo:", error)
      return
    }

    // Update all desligamentos that use this motivo
    if (motivoAntigo) {
      await supabase.from("desligamentos").update({ motivo: nome }).eq("motivo", motivoAntigo.nome)
      await logActivity("Editar", "Motivo Desligamento", id, `Motivo renomeado`, [
        { field: "Nome", oldValue: motivoAntigo.nome, newValue: nome },
      ])
    }

    mutate("motivos_desligamento")
    mutate("desligamentos")
  }

  const deleteMotivoDesligamento = async (id: number) => {
    const motivo = motivosDesligamento.find((m) => m.id === id)

    const { error } = await supabase.from("motivos_desligamento").delete().eq("id", id)
    if (error) {
      console.error("Error deleting motivo:", error)
      return
    }

    if (motivo) {
      await logActivity("Excluir", "Motivo Desligamento", id, `Motivo "${motivo.nome}" excluído`)
    }
    mutate("motivos_desligamento")
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
