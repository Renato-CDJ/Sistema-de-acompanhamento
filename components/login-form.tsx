"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { authenticateUser } from "@/lib/auth"
import { Building2, Lock, Mail } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const [displayText, setDisplayText] = useState("")
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const fullText = "Área de Qualidade"
    let typeInterval: NodeJS.Timeout
    let hideTimeout: NodeJS.Timeout
    let restartTimeout: NodeJS.Timeout

    const typewriterEffect = () => {
      setDisplayText("")
      setIsVisible(true)

      let currentIndex = 0
      typeInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setDisplayText(fullText.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(typeInterval)

          hideTimeout = setTimeout(() => {
            setIsVisible(false)

            restartTimeout = setTimeout(() => {
              typewriterEffect()
            }, 1000)
          }, 2000)
        }
      }, 100)
    }

    typewriterEffect()

    return () => {
      clearInterval(typeInterval)
      clearTimeout(hideTimeout)
      clearTimeout(restartTimeout)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const user = await authenticateUser(email, password)
      if (user) {
        login(user)
      } else {
        setError("Email ou senha inválidos")
      }
    } catch (err) {
      setError("Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-accent/20 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur animate-in zoom-in duration-500">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center animate-in zoom-in duration-700 hover:scale-110 transition-transform">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="animate-in slide-in-from-bottom duration-500 delay-100">
            <CardTitle className="text-2xl font-bold text-balance">Sistema de Acompanhamento</CardTitle>
            <CardDescription className="text-muted-foreground">Faça login para acessar o sistema</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="animate-in slide-in-from-bottom duration-500 delay-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="animate-in slide-in-from-top duration-300">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 h-8 flex items-center justify-center">
        <div
          className={`text-orange-500 font-medium text-lg italic transition-opacity duration-1000 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ fontFamily: "monospace" }}
        >
          {displayText}
          <span className="animate-pulse">|</span>
        </div>
      </div>
    </div>
  )
}
