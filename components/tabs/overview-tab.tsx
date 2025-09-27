"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { TrendingUp, Users, GraduationCap, UserX, Eye, EyeOff } from "lucide-react"

const statsData = [
  { title: "Total de Funcionários", value: "1,247", change: "+12%", icon: Users, color: "text-blue-600" },
  { title: "Em Treinamento", value: "89", change: "+5%", icon: GraduationCap, color: "text-green-600" },
  { title: "Taxa de Rotatividade", value: "8.2%", change: "-2%", icon: UserX, color: "text-red-600" },
  { title: "Produtividade", value: "94.5%", change: "+3%", icon: TrendingUp, color: "text-primary" },
]

const pieData = [
  { name: "Ativos", value: 1058, color: "#f97316" },
  { name: "Férias", value: 127, color: "#fb923c" },
  { name: "Afastamento", value: 62, color: "#fdba74" },
]

const barData = [
  { month: "Jan", funcionarios: 1200, treinamentos: 45, desligamentos: 23 },
  { month: "Fev", funcionarios: 1220, treinamentos: 52, desligamentos: 18 },
  { month: "Mar", funcionarios: 1247, treinamentos: 48, desligamentos: 15 },
  { month: "Abr", funcionarios: 1235, treinamentos: 61, desligamentos: 28 },
  { month: "Mai", funcionarios: 1247, treinamentos: 55, desligamentos: 12 },
]

export function OverviewTab() {
  const [showCharts, setShowCharts] = useState(true)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}>{stat.change}</span>{" "}
                  em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Toggle */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setShowCharts(!showCharts)} className="gap-2">
          {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
        </Button>
      </div>

      {/* Charts */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Funcionários</CardTitle>
              <CardDescription>Status atual dos funcionários</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
              <CardDescription>Funcionários, treinamentos e desligamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="funcionarios" fill="#f97316" name="Funcionários" />
                  <Bar dataKey="treinamentos" fill="#22c55e" name="Treinamentos" />
                  <Bar dataKey="desligamentos" fill="#ef4444" name="Desligamentos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Desempenho por Carteira</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["CAIXA", "BTG", "BMG", "Carrefour"].map((carteira, index) => (
                <div key={carteira} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{carteira}</span>
                  <span className="text-sm text-muted-foreground">{95 - index * 2}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Treinamentos Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Este Mês</span>
                <span className="text-2xl font-bold text-primary">89</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Meta Mensal</span>
                <span className="text-sm text-muted-foreground">100</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "89%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">3 treinamentos pendentes</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">Taxa de rotatividade acima da meta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
