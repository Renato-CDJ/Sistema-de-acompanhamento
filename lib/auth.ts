import { createClient } from "@/lib/supabase/client"

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

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error || !data) {
      console.error("[v0] Error fetching user profile:", error)
      return null
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role as UserRole,
      cargo: data.cargo,
      blocked: data.blocked,
      permissions: data.permissions,
    }
  } catch (error) {
    console.error("[v0] Error in getUserProfile:", error)
    return null
  }
}

export const hasPermission = (user: User | null, action: "create" | "edit" | "delete"): boolean => {
  if (!user) return false
  return user.role === "admin" || user.role === "superadmin"
}

export const isSuperAdmin = (user: User | null): boolean => {
  return user?.role === "superadmin"
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
