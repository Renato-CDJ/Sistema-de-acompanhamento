export interface Agenda {
  id: string
  title: string
  description: string
  date: string
  time: string
  participants: string[] // User IDs
  createdBy: string
  createdAt: string
  notified24h: boolean
  notifiedHours: boolean
}

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  senderName: string
  content: string
  attachments?: ChatAttachment[]
  timestamp: string
  read: boolean
  mentions?: string[] // Array of user IDs that were mentioned
  edited?: boolean
  editedAt?: string
  pinned?: boolean
  deleted?: boolean
}

export interface ChatAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

export interface Chat {
  id: string
  type: "global" | "group" | "private"
  name?: string
  participants: string[]
  createdBy: string
  createdAt: string
  lastMessage?: string
  lastMessageTime?: string
}

export interface Document {
  id: string
  name: string
  type: string
  size: number
  path: string
  uploadedBy: string
  uploadedAt: string
  url: string
}

export interface Folder {
  id: string
  name: string
  parentId: string | null
  createdBy: string
  createdAt: string
}

export interface TabPermission {
  tabId: string
  canView: boolean
  canEdit: boolean
}

export interface UserPermissions {
  userId: string
  role: "superadmin" | "admin" | "user"
  canCreateGroups: boolean
  canManageUsers: boolean
  tabPermissions: TabPermission[]
}

export interface SystemUser {
  id: string
  email: string
  name: string
  password: string
  role: "superadmin" | "admin" | "user"
  permissions: UserPermissions
  createdAt: string
  createdBy: string
  active: boolean
  blocked?: boolean
  cargo?: string
}
