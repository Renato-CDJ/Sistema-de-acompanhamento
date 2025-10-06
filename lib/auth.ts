export type UserRole = "superadmin" | "admin" | "user"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  cargo?: string
  blocked?: boolean
  permissions?: {
    canCreateGroups: boolean
    canManageUsers: boolean
    tabPermissions: Array<{
      tabId: string
      canView: boolean
      canEdit: boolean
    }>
  }
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Mock authentication - in production, this would connect to a real auth system
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@empresa.com",
    name: "Administrador Principal",
    role: "superadmin",
    cargo: "CEO",
    blocked: false,
    permissions: {
      canCreateGroups: true,
      canManageUsers: true,
      tabPermissions: [],
    },
  },
  {
    id: "2",
    email: "usuario@empresa.com",
    name: "Usuário Comum",
    role: "user",
    cargo: "Developer",
    blocked: false,
    permissions: {
      canCreateGroups: false,
      canManageUsers: false,
      tabPermissions: [],
    },
  },
]

export const loadUsers = (): User[] => {
  if (typeof window === "undefined") return mockUsers

  try {
    const stored = localStorage.getItem("systemUsers")
    if (!stored) return mockUsers

    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : mockUsers
  } catch (error) {
    console.error("Error loading users from localStorage:", error)
    return mockUsers
  }
}

export const saveUsers = (users: User[]) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("systemUsers", JSON.stringify(users))
    } catch (error) {
      console.error("Error saving users to localStorage:", error)
    }
  }
}

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const users = loadUsers()
    const user = users.find((u) => u.email === email)

    // Check if user is blocked
    if (user?.blocked) {
      return null
    }

    if (user) {
      if (user.email === "admin@empresa.com" && password === "qualidade@$.") {
        return user
      }
      if (user.email === "usuario@empresa.com" && password === "123456") {
        return user
      }

      const storedUsers = typeof window !== "undefined" ? localStorage.getItem("systemUsers") : null
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers)
        const customUser = parsedUsers.find((u: any) => u.email === email && u.password === password)
        if (customUser && !customUser.blocked) {
          const { password: _, ...userWithoutPassword } = customUser
          return userWithoutPassword
        }
      }
    }
  } catch (error) {
    console.error("Error authenticating user:", error)
  }

  return null
}

export const hasPermission = (user: User | null, action: "create" | "edit" | "delete"): boolean => {
  if (!user) return false
  return user.role === "admin" || user.role === "superadmin"
}

export const isSuperAdmin = (user: User | null): boolean => {
  return user?.email === "admin@empresa.com" && user?.role === "superadmin"
}

export const canAccessTab = (user: User | null, tabId: string): boolean => {
  if (!user) return false
  if (user.role === "superadmin") return true

  const tabPermission = user.permissions?.tabPermissions.find((p) => p.tabId === tabId)
  return tabPermission?.canView ?? false
}

export const canEditTab = (user: User | null, tabId: string): boolean => {
  if (!user) return false
  if (user.role === "superadmin" || user.role === "admin") return true

  const tabPermission = user.permissions?.tabPermissions.find((p) => p.tabId === tabId)
  return tabPermission?.canEdit ?? false
}
