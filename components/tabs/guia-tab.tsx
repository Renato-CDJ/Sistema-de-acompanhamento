"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Users,
  GraduationCap,
  UserCheck,
  UserX,
  Wallet,
  FileText,
  Calendar,
  MessageSquare,
  FolderOpen,
  ShieldCheck,
  ClipboardCheck,
  BookOpen,
  History,
  UserCog,
  Briefcase,
  Info,
  CheckCircle2,
} from "lucide-react"

export function GuiaTab() {
  const guideItems = [
    {
      id: "visao-geral",
      title: "Visão Geral",
      icon: BarChart3,
      description: "Dashboard principal com métricas e indicadores",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            A tela de Visão Geral apresenta um resumo completo do sistema com os principais indicadores e métricas.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Como usar:
            </h4>
            <ul className="text-sm space-y-1 ml-6 list-disc text-muted-foreground">
              <li>Visualize os cards com totais de operadores, treinamentos e monitorias</li>
              <li>Acompanhe gráficos de desempenho e tendências</li>
              <li>Use os filtros no topo para refinar os dados por período, turno ou carteira</li>
              <li>Clique nos cards para ver detalhes específicos</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "agendas",
      title: "Agendas",
      icon: Calendar,
      description: "Gerenciamento de reuniões e compromissos",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Organize e acompanhe todas as reuniões, treinamentos e compromissos da equipe.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Como usar:
            </h4>
            <ul className="text-sm space-y-1 ml-6 list-disc text-muted-foreground">
              <li>Clique em "Nova Agenda" para criar um novo compromisso</li>
              <li>Preencha título, data, horário e descrição</li>
              <li>Selecione os participantes que devem ser notificados</li>
              <li>Visualize o calendário para ver todos os compromissos agendados</li>
              <li>Edite ou exclua agendas clicando nos ícones de ação</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "administrativo",
      title: "Administrativo",
      icon: Briefcase,
      description: "Gestão de operadores, carteiras e documentos",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Área administrativa para gerenciar toda a estrutura operacional da equipe.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                Quadro
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                Visualize o quadro completo de colaboradores com informações de cargo, turno e carteira.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                Operadores
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                Cadastre e gerencie operadores. Adicione novos colaboradores com nome, matrícula, cargo, turno e
                carteira.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-primary" />
                Carteiras
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                Gerencie as carteiras de atendimento. Crie, edite ou exclua carteiras conforme necessário.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <UserX className="h-4 w-4 text-primary" />
                Desligamentos
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                Registre desligamentos de colaboradores com data, motivo e observações.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <History className="h-4 w-4 text-primary" />
                Histórico de Atividades
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                Acompanhe todas as ações realizadas no sistema com registro de usuário, data e tipo de ação.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                Documentos
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                Faça upload e organize documentos importantes. Adicione tags para facilitar a busca.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "monitoria",
      title: "Monitoria",
      icon: ClipboardCheck,
      description: "Relatórios e apuração de monitorias",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Acompanhe e analise as monitorias realizadas com relatórios detalhados.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                Relatório de Monitorias
              </h4>
              <ul className="text-sm space-y-1 ml-6 list-disc text-muted-foreground">
                <li>Cadastre novas monitorias com operador, data e resultado</li>
                <li>Visualize o consolidado mensal com taxas de conformidade</li>
                <li>Acompanhe gráficos de evolução e desempenho</li>
                <li>Exporte relatórios para Excel</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                Apuração TIA
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                Registre e acompanhe as apurações de TIA (Tempo de Intervalo de Atendimento) dos operadores.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "treinamento",
      title: "Treinamento",
      icon: BookOpen,
      description: "Gestão de capacitações e treinamentos",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Organize e acompanhe todos os treinamentos e capacitações da equipe.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Capacitação
              </h4>
              <ul className="text-sm space-y-1 ml-6 list-disc text-muted-foreground">
                <li>Cadastre novos treinamentos com tema, data e instrutor</li>
                <li>Selecione os participantes que devem realizar o treinamento</li>
                <li>Marque o status como "Aplicado" ou "Pendente"</li>
                <li>Adicione observações e materiais de apoio</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Treinados
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                Visualize o histórico completo de treinamentos realizados por cada operador com datas e status.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "area-qualidade",
      title: "Área Qualidade",
      icon: Users,
      description: "Controle de qualidade e agentes",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Gerencie a área de qualidade com controle de agentes e indicadores.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Visão Geral
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                Dashboard específico da área de qualidade com métricas e indicadores de desempenho.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <UserCog className="h-4 w-4 text-primary" />
                Controle de Agentes
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                Gerencie os agentes de qualidade com informações de desempenho, metas e avaliações.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "chat",
      title: "Chat",
      icon: MessageSquare,
      description: "Comunicação em tempo real",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Comunique-se com sua equipe em tempo real através do chat integrado.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Como usar:
            </h4>
            <ul className="text-sm space-y-1 ml-6 list-disc text-muted-foreground">
              <li>Use o Chat Global para mensagens para toda a equipe</li>
              <li>Crie conversas privadas clicando em "Novo Chat"</li>
              <li>Mencione usuários usando @ ou # seguido do nome</li>
              <li>Adicione emojis clicando no ícone de smile</li>
              <li>Anexe arquivos usando o ícone de clipe</li>
              <li>Edite mensagens clicando no ícone de lápis (apenas suas mensagens)</li>
              <li>Fixe mensagens importantes clicando no ícone de pin</li>
              <li>Exclua mensagens clicando no ícone de lixeira</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "admin-panel",
      title: "Painel Admin",
      icon: ShieldCheck,
      description: "Administração de usuários e permissões",
      badge: "Super Admin",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Painel exclusivo para Super Administradores gerenciarem usuários e permissões do sistema.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Funcionalidades:
            </h4>
            <ul className="text-sm space-y-1 ml-6 list-disc text-muted-foreground">
              <li>Cadastre novos usuários com email e senha</li>
              <li>Defina funções (Visualizador, Editor, Admin, Super Admin)</li>
              <li>Configure permissões de acesso para cada tela</li>
              <li>Bloqueie ou desbloqueie usuários</li>
              <li>Altere senhas de usuários</li>
              <li>Promova ou rebaixe usuários entre funções</li>
              <li>Visualize estatísticas de usuários ativos e bloqueados</li>
            </ul>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Info className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Guia do Sistema</CardTitle>
              <CardDescription>Aprenda a utilizar todas as funcionalidades do sistema de forma simples</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg border mb-6">
            <p className="text-sm text-muted-foreground">
              Bem-vindo ao guia do Sistema de Acompanhamento! Aqui você encontrará instruções detalhadas sobre como
              utilizar cada funcionalidade. Clique em cada seção abaixo para expandir e ver as instruções.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {guideItems.map((item) => {
              const Icon = item.icon
              return (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-[52px] pr-4 pt-2">{item.content}</div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dicas Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Filtros</h4>
                <p className="text-sm text-muted-foreground">
                  Use o botão "Mostrar Filtros" no topo das telas para refinar os dados por período, turno, carteira e
                  outros critérios.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Exportação</h4>
                <p className="text-sm text-muted-foreground">
                  A maioria das telas possui botão de exportação para Excel, permitindo análises externas dos dados.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Tema</h4>
                <p className="text-sm text-muted-foreground">
                  Alterne entre tema claro e escuro usando o botão no menu lateral inferior para melhor conforto visual.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Notificações</h4>
                <p className="text-sm text-muted-foreground">
                  Fique atento ao ícone de sino no topo da tela para receber notificações importantes do sistema.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Perfil</h4>
                <p className="text-sm text-muted-foreground">
                  Clique no seu nome no menu lateral para acessar suas informações de perfil e alterar sua senha.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
