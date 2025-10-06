"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/lib/auth"
import { loadUsers, saveUsers } from "@/lib/auth"

interface UsersContextType {
  users: User[]
  addUser: (user: Omit<User, "id"> & { password: string }) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  updateUserPermissions: (userId: string, permissions: User["permissions"]) => void
  promoteUser: (userId: string) => void
  demoteUser: (userId: string) => void
  blockUser: (userId: string) => void
  unblockUser: (userId: string) => void
  changeUserPassword: (userId: string, newPassword: string) => void
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const loadedUsers = loadUsers()
    setUsers(loadedUsers)
  }, [])

  const addUser = (userData: Omit<User, "id"> & { password: string }) => {
    const newUser = {
      ...userData,
      id: Date.now().toString(),
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)

    if (typeof window !== "undefined") {
      saveUsers(updatedUsers)
    }
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    if (typeof window !== "undefined") {
      try {
        // Load current users with passwords from localStorage
        const storedUsers = localStorage.getItem("systemUsers")
        const existingUsers = storedUsers ? JSON.parse(storedUsers) : []

        // Update the specific user while preserving password
        const updatedUsersWithPasswords = existingUsers.map((user: User & { password?: string }) => {
          if (user.id === id) {
            // Merge updates but keep the password
            return { ...user, ...updates, password: user.password }
          }
          return user
        })

        // Save back to localStorage with passwords preserved
        localStorage.setItem("systemUsers", JSON.stringify(updatedUsersWithPasswords))

        // Update state (without passwords for security)
        const updatedUsers = users.map((user) => (user.id === id ? { ...user, ...updates } : user))
        setUsers(updatedUsers)
      } catch (error) {
        console.error("Error updating user:", error)
      }
    }
  }

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter((user) => user.id !== id)
    setUsers(updatedUsers)

    if (typeof window !== "undefined") {
      try {
        const storedUsers = localStorage.getItem("systemUsers")
        if (storedUsers) {
          const allUsers = JSON.parse(storedUsers)
          const updatedAllUsers = allUsers.filter((user: any) => user.id !== id)
          localStorage.setItem("systemUsers", JSON.stringify(updatedAllUsers))
        }
      } catch (error) {
        console.error("Error deleting user:", error)
      }
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

  const changeUserPassword = (userId: string, newPassword: string) => {
    if (typeof window !== "undefined") {
      try {
        const storedUsers = localStorage.getItem("systemUsers")
        if (storedUsers) {
          const allUsers = JSON.parse(storedUsers)
          const updatedUsers = allUsers.map((user: User & { password: string }) =>
            user.id === userId ? { ...user, password: newPassword } : user,
          )
          localStorage.setItem("systemUsers", JSON.stringify(updatedUsers))
        }
      } catch (error) {
        console.error("Error changing password:", error)
      }
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
