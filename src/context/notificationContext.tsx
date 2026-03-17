"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import useSWR from "swr"
import { useCompany } from "./routerContext"

const { VITE_API_URL } = import.meta.env

const fetcher = (url: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt") || ""}` },
  }).then((r) => (r.ok ? r.json() : Promise.reject(r)))

export interface AppNotification {
  id: string
  type: "ticket" | "maintenance" | "device" | "license" | "expense"
  title: string
  message: string
  time: string
  read: boolean
  href?: string
}

interface NotificationContextValue {
  notifications: AppNotification[]
  unreadCount: number
  markAllRead: () => void
  markRead: (id: string) => void
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  markRead: () => {},
})

export const useNotifications = () => useContext(NotificationContext)

const relativeTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { selectedCompany } = useCompany()
  const cid = selectedCompany?.id
  const code = selectedCompany?.code

  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("notif_read") || "[]")) }
    catch { return new Set() }
  })

  const { data: tickets } = useSWR(
    cid ? `${VITE_API_URL}/api/tickets/company/${cid}` : null,
    fetcher, { refreshInterval: 30000 }
  )
  const { data: maintenance } = useSWR(
    cid ? `${VITE_API_URL}/api/maintenance/company/${cid}` : null,
    fetcher, { refreshInterval: 60000 }
  )
  const { data: devices } = useSWR(
    cid ? `${VITE_API_URL}/api/equipments/company/${cid}` : null,
    fetcher, { refreshInterval: 60000 }
  )

  const notifications: AppNotification[] = []

  if (Array.isArray(tickets)) {
    tickets
      .filter((t: any) => t.status === "OPEN" || t.status === "PENDING" || t.status === "IN_PROGRESS")
      .slice(0, 5)
      .forEach((t: any) => {
        notifications.push({
          id: `ticket-${t.id}`,
          type: "ticket",
          title: `Ticket: ${t.title || t.subject || "Sin título"}`,
          message: t.status === "OPEN" ? "Nuevo ticket abierto" : `Estado: ${t.status}`,
          time: relativeTime(t.createdAt || t.updatedAt),
          read: readIds.has(`ticket-${t.id}`),
          href: `/${code}/tickets/edit/${t.id}`,
        })
      })
  }

  if (Array.isArray(maintenance)) {
    maintenance
      .filter((m: any) => m.status === "PENDING" || m.status === "SCHEDULED")
      .slice(0, 5)
      .forEach((m: any) => {
        notifications.push({
          id: `maint-${m.id}`,
          type: "maintenance",
          title: `Mantenimiento: ${m.title || m.type}`,
          message: m.scheduledDate
            ? `Programado: ${new Date(m.scheduledDate).toLocaleDateString()}`
            : "Pendiente de mantenimiento",
          time: relativeTime(m.createdAt || m.updatedAt),
          read: readIds.has(`maint-${m.id}`),
          href: `/${code}/maintenance/edit/${m.id}`,
        })
      })
  }

  if (Array.isArray(devices)) {
    devices
      .filter((d: any) => d.status === "DAMAGED" || d.status === "MAINTENANCE")
      .slice(0, 3)
      .forEach((d: any) => {
        notifications.push({
          id: `device-${d.id}`,
          type: "device",
          title: `Equipo: ${d.model || d.type}`,
          message: d.status === "DAMAGED" ? "Equipo dañado requiere atención" : "En mantenimiento",
          time: relativeTime(d.createdAt || d.updatedAt),
          read: readIds.has(`device-${d.id}`),
          href: `/${code}/devices/edit/${d.id}`,
        })
      })
  }

  // Sort: unread first, then by recency
  notifications.sort((a, b) => (a.read === b.read ? 0 : a.read ? 1 : -1))

  const unreadCount = notifications.filter((n) => !n.read).length

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem("notif_read", JSON.stringify([...next]))
      return next
    })
  }, [])

  const markAllRead = useCallback(() => {
    const ids = notifications.map((n) => n.id)
    setReadIds((prev) => {
      const next = new Set([...prev, ...ids])
      localStorage.setItem("notif_read", JSON.stringify([...next]))
      return next
    })
  }, [notifications.map((n) => n.id).join(",")])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markRead }}>
      {children}
    </NotificationContext.Provider>
  )
}
