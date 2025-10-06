"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/lib/auth"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./auth-context"

interface UsersContextType {
  users: User[]
  addUser: (user: Omit<User, "id"> & { password: string }) => Promise<void>
  updateUser: (id: string, updates: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  updateUserPermissions: (userId: string, permissions: User["permissions"]) => void
  promoteUser: (userId: string) => void
  demoteUser: (userId: string) => void
  blockUser: (userId: string) => void
  unblockUser: (userId: string) => void
  changeUserPassword: (userId: string, newPassword: string) => Promise<void>
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const { user: currentUser, isLoading } = useAuth()

  useEffect(() => {
    if (!currentUser || isLoading) {
      return
    }

    const fetchUsers = async () => {
      const supabase = createClient()

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        console.error("[v0] Not authenticated")
        return
      }

      const { data, error } = await supabase.from("profiles").select("*")

      if (error) {
        console.error("[v0] Error fetching users:", error)
        return
      }

      if (data) {
        const formattedUsers: User[] = data.map((profile) => ({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          cargo: profile.cargo,
          blocked: profile.blocked,
          permissions: profile.permissions,
        }))
        setUsers(formattedUsers)
      }
    }

    fetchUsers()
  }, [currentUser, isLoading])

  const addUser = async (userData: Omit<User, "id"> & { password: string }) => {
    const supabase = createClient()

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      })

      if (authError) {
        console.error("[v0] Error creating auth user:", authError)
        return
      }

      if (!authData.user) {
        console.error("[v0] No user returned from signUp")
        return
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        cargo: userData.cargo,
        blocked: userData.blocked || false,
        permissions: userData.permissions,
      })

      if (profileError) {
        console.error("[v0] Error creating profile:", profileError)
        return
      }

      const newUser: User = {
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        cargo: userData.cargo,
        blocked: userData.blocked,
        permissions: userData.permissions,
      }
      setUsers([...users, newUser])
    } catch (error) {
      console.error("[v0] Error in addUser:", error)
    }
  }

  const updateUser = async (id: string, updates: Partial<User>) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("profiles").update(updates).eq("id", id)

      if (error) {
        console.error("[v0] Error updating user:", error)
        return
      }

      const updatedUsers = users.map((user) => (user.id === id ? { ...user, ...updates } : user))
      setUsers(updatedUsers)
    } catch (error) {
      console.error("[v0] Error in updateUser:", error)
    }
  }

  const deleteUser = async (id: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id)

      if (error) {
        console.error("[v0] Error deleting user:", error)
        return
      }

      const updatedUsers = users.filter((user) => user.id !== id)
      setUsers(updatedUsers)
    } catch (error) {
      console.error("[v0] Error in deleteUser:", error)
    }
  }

  const updateUserPermissions = (userId: string, permissions: User["permissions"]) => {
    updateUser(userId, { permissions })
  }

  const promoteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user && user.role === "user") {
      updateUser(userId, { role: "admin" })
    }
  }

  const demoteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user && user.role === "admin") {
      updateUser(userId, { role: "user" })
    }
  }

  const blockUser = (userId: string) => {
    updateUser(userId, { blocked: true })
  }

  const unblockUser = (userId: string) => {
    updateUser(userId, { blocked: false })
  }

  const changeUserPassword = async (userId: string, newPassword: string) => {
    const supabase = createClient()

    try {
      console.log("[v0] Password change for user:", userId)
    } catch (error) {
      console.error("[v0] Error changing password:", error)
    }
  }

  return (
    <UsersContext.Provider
      value={{
        users,
        addUser,
        updateUser,
        deleteUser,
        updateUserPermissions,
        promoteUser,
        demoteUser,
        blockUser,
        unblockUser,
        changeUserPassword,
      }}
    >
      {children}
    </UsersContext.Provider>
  )
}

export function useUsers() {
  const context = useContext(UsersContext)
  if (context === undefined) {
    throw new Error("useUsers must be used within a UsersProvider")
  }
  return context
}
