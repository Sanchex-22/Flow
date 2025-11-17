export type TicketStatus = "open" | "in-progress" | "resolved" | "closed"
export type TicketPriority = "low" | "medium" | "high" | "urgent"

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: Date
  updatedAt: Date
  userId: string
  userName: string
  userEmail: string
  companyId: string
  companyName: string
  assignedTo?: string
  tags?: string[]
}

export interface Company {
  id: string
  name: string
  ticketCount: number
}

export interface User {
  id: string
  name: string
  email: string
  companyId: string
  ticketCount: number
}
