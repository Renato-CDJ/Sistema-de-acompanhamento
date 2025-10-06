"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, AuthState } from "@/lib/auth"
import { getUserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/client"

interface AuthContextType extends AuthState {
  login: (user: User) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const profile = await getUserProfile(session.user.id)
          if (profile && !profile.blocked) {
            setAuthState({ user: profile, isAuthenticated: true })
          }
        }
      } catch (error) {
        console.error("[v0] Error checking session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await getUserProfile(session.user.id)
        if (profile && !profile.blocked) {
          setAuthState({ user: profile, isAuthenticated: true })
        }
      } else if (event === "SIGNED_OUT") {
        setAuthState({ user: null, isAuthenticated: false })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = (user: User) => {
    setAuthState({ user, isAuthenticated: true })
  }

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setAuthState({ user: null, isAuthenticated: false })
  }

  const refreshUser = async () => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      const profile = await getUserProfile(session.user.id)
      if (profile) {
        setAuthState({ user: profile, isAuthenticated: true })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
