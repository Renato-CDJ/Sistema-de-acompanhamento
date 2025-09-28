export type UserRole = "admin" | "user"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
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
    name: "Administrador",
    role: "admin",
  },
  {
    id: "2",
    email: "usuario@empresa.com",
    name: "Usuário Comum",
    role: "user",
  },
]

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  // Mock authentication logic
  const user = mockUsers.find((u) => u.email === email)
  if (user) {
    if (user.email === "admin@empresa.com" && password === "qualidade@$.") {
      return user
    }
    if (user.email === "usuario@empresa.com" && password === "123456") {
      return user
    }
  }
  return null
}

export const hasPermission = (user: User | null, action: "create" | "edit" | "delete"): boolean => {
  if (!user) return false
  return user.role === "admin"
}
