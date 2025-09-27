// Tipos de dados para o sistema de acompanhamento

export interface Carteira {
  name: string
  total: number
  aplicados: number
  pendentes: number
  taxa: number
}

export interface Treinamento {
  id: number
  quantidade: number
  turno: string
  carteira: string
  data: string
  responsavel: string
  status: "Aplicado" | "Pendente"
  assunto: string
}

export interface Desligamento {
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

export interface DadosDiarios {
  id: number
  data: string
  turno: string
  total: number
  ativos: number
  ferias: number
  afastamento: number
  secao: "Caixa" | "Cobrança"
}

export interface EstatisticasCarteira {
  id: number
  data: string
  carteira: string
  turno: string
  total: number
  presentes: number
  faltas: number
}

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "viewer"
}

export interface CapacitacaoStats {
  totalTreinamentos: number
  aplicados: number
  pendentes: number
  taxaConclusao: number
}

export interface DesligamentosStats {
  totalDesligamentos: number
  comAvisoPrevia: number
  semAvisoPrevia: number
  taxaRotatividade: number
  veioAgencia: number
}

export interface TreinadosStats {
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
