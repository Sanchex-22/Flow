"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR, { mutate } from "swr"
import Loader from "../../../../components/loaders/loader"
import { Company, useCompany } from "../../../../context/routerContext"
import { usePageName } from "../../../../hook/usePageName"
import PagesHeader from "../../../../components/headers/pagesHeader"
import { useSearch } from "../../../../context/searchContext"
import Tabla from "../../../../components/tables/Table"
import { X, Ticket, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import * as XLSX from 'xlsx'
import { useTheme } from "../../../../context/themeContext"
import useUserProfile from "../../../../hook/userUserProfile"
import { useTranslation } from "react-i18next"

const fetcher = (url: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt") || ""}` },
  }).then((res) => res.json())

// ==================== USERS ====================
export interface UsuarioFull {
  id: string
  username: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  companyId: string | null
  person: {
    id: string
    userId: string
    firstName: string
    lastName: string
    fullName: string
    contactEmail: string
    phoneNumber: string
    departmentId: string
    position: string
    status: "Con Equipos" | "Sin Equipos"
    userCode: string
    createdAt: string
    updatedAt: string
    department: {
      id: string
      name: string
      description: string
      companyId: string
      isActive: boolean
    } | null
  }
}

type NotificationType = "success" | "error"

interface Notification {
  type: NotificationType
  message: string
  show: boolean
}

interface DeleteConfirmation {
  show: boolean
  user: UsuarioFull | null
  isDeleting: boolean
}

const getAvatarColor = (nombre: string) => {
  const colors = ["bg-blue-600", "bg-green-600", "bg-purple-600", "bg-orange-600", "bg-pink-600", "bg-indigo-600", "bg-teal-600", "bg-red-600"]
  const index = nombre?.length % colors?.length
  return colors[index]
}

const getStatusBadge = (user: UsuarioFull) => {
  if (user.person?.status === "Con Equipos") return "bg-blue-600 text-blue-100"
  if (user.isActive) return "bg-green-600 text-green-100"
  return "bg-red-600 text-red-100"
}

export const AllUsers: React.FC = () => {
    const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const { selectedCompany }: { selectedCompany: Company | null } = useCompany()
  const { data, error, isLoading } = useSWR<UsuarioFull[]>(`${import.meta.env.VITE_API_URL}/api/users/full/${selectedCompany?.id}`, fetcher)
  const { pageName } = usePageName()
  const { search } = useSearch()
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [notification, setNotification] = useState<Notification>({ type: "success", message: "", show: false })
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({ show: false, user: null, isDeleting: false })

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message, show: true })
  }

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification.show])

  const openDeleteConfirmation = (user: UsuarioFull) => {
    setDeleteConfirmation({ show: true, user, isDeleting: false })
  }

  const closeDeleteConfirmation = () => {
    if (!deleteConfirmation.isDeleting) {
      setDeleteConfirmation({ show: false, user: null, isDeleting: false })
    }
  }

  const deleteUser = async () => {
    if (!deleteConfirmation.user) return
    setDeleteConfirmation((prev) => ({ ...prev, isDeleting: true }))

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/delete/${deleteConfirmation?.user?.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || t("error.deleteData"))
      }

      mutate(`${import.meta.env.VITE_API_URL}/api/users/full/${selectedCompany?.id}`)
      showNotification("success", `${deleteConfirmation.user.person.fullName} - ${t("common.success")}`)
      closeDeleteConfirmation()
    } catch (error: any) {
      console.error("Error deleting user:", error)
      showNotification("error", error.message || t("error.deleteData"))
      setDeleteConfirmation((prev) => ({ ...prev, isDeleting: false }))
    }
  }

  const filteredUsers = useMemo(() => {
    if (!data || !Array.isArray(data)) return []

    return data.filter((user) => {
      const statusMatch =
        statusFilter === "Todos" ||
        (statusFilter === "Activos" && user?.isActive) ||
        (statusFilter === "Inactivos" && !user?.isActive) ||
        (statusFilter === "Con Equipos" && user.person?.status === "Con Equipos") ||
        (statusFilter === "Sin Equipos" && user.person?.status === "Sin Equipos")

      const searchMatch =
        search.trim() === "" ||
        user?.person?.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        user?.person?.department?.name?.toLowerCase().includes(search.toLowerCase()) ||
        user?.person?.position?.toLowerCase().includes(search.toLowerCase())

      return statusMatch && searchMatch
    })
  }, [data, search, statusFilter])

  const columnConfig = {
    [t("users.title")]: (item: UsuarioFull) => (
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(item?.person?.fullName)}`}>
          {item?.person?.fullName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-medium text-sm">{item?.person?.fullName}</div>
          <div className="text-xs text-gray-400">{item?.id}</div>
        </div>
      </div>
    ),
    [t("users.email")]: (item: UsuarioFull) => (
      <div className="text-sm">
        <div className="flex items-center space-x-1 mb-1">
          <span>{item.email}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>{item?.person?.phoneNumber}</span>
        </div>
      </div>
    ),
    [t("persons.department")]: (item: UsuarioFull) => (
      <div>
        <div className="font-medium text-sm">{item.person?.department?.name || t("persons.noDepartment")}</div>
        <div className="text-xs text-gray-400">{item.person?.position}</div>
      </div>
    ),
    [t("common.status")]: (item: UsuarioFull) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item)}`}>
        {item.isActive ? t("common.active") : t("common.inactive")}
      </span>
    ),
  }

  if (isLoading) return <Loader />
  if (error || !data) return <div className="text-center p-8 text-red-500">{t("error.loadData")}</div>

  const totalUsers = data?.length || 0
  const activeUsers = data?.filter((u) => u.isActive).length || 0
  const usersWithEquipment = data?.filter((u) => u.person?.status === "Con Equipos").length || 0
  const departments = Array.from(new Set(data?.map((u) => u.person?.department?.name).filter(Boolean))).length || 0

  return (
    <div className={`transition-colors ${
      isDarkMode
        ? 'bg-[#1c1c1e] text-gray-100'
        : 'bg-[#f5f5f7] text-gray-900'
    }`}>
      <PagesHeader
        title={pageName}
        description={pageName ? `${pageName} in ${selectedCompany?.name}` : t("common.loading")}
        showCreate
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className={`rounded-xl p-3 sm:p-4 border transition-colors ${
            isDarkMode
              ? 'bg-[#1c1c1e] border-white/[0.08]'
              : 'bg-white border-gray-100'
          }`}>          <span className="text-gray-400 text-sm">{t("users.totalUsers")}</span>
          <div className="text-2xl sm:text-3xl font-bold mb-1">{totalUsers}</div>
          <div className="text-sm text-gray-400">{t("common.total")}</div>
        </div>
          <div className={`rounded-xl p-3 sm:p-4 border transition-colors ${
            isDarkMode
              ? 'bg-[#1c1c1e] border-white/[0.08]'
              : 'bg-white border-gray-100'
          }`}>          <span className="text-gray-400 text-sm">{t("common.active")}</span>
          <div className="text-2xl sm:text-3xl font-bold mb-1">{activeUsers}</div>
          <div className="text-sm text-gray-400">{t("common.total")}</div>
        </div>
          <div className={`rounded-xl p-3 sm:p-4 border transition-colors ${
            isDarkMode
              ? 'bg-[#1c1c1e] border-white/[0.08]'
              : 'bg-white border-gray-100'
          }`}>          <span className="text-gray-400 text-sm">{t("persons.withDevice")}</span>
          <div className="text-2xl sm:text-3xl font-bold mb-1">{usersWithEquipment}</div>
          <div className="text-sm text-gray-400">{t("devices.assigned")}</div>
        </div>
          <div className={`rounded-xl p-3 sm:p-4 border transition-colors ${
            isDarkMode
              ? 'bg-[#1c1c1e] border-white/[0.08]'
              : 'bg-white border-gray-100'
          }`}>          <span className="text-gray-400 text-sm">{t("persons.department")}</span>
          <div className="text-2xl sm:text-3xl font-bold mb-1">{departments}</div>
          <div className="text-sm text-gray-400">{t("common.total")}</div>
        </div>
      </div>

      {/* Users List */}
      <div className={`rounded-xl border mb-5 transition-colors ${
        isDarkMode
          ? 'bg-[#1c1c1e] border-white/[0.08]'
          : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b transition-colors ${
          isDarkMode
            ? 'border-white/[0.08]'
            : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold mb-2 transition-colors ${
            isDarkMode
              ? 'text-white'
              : 'text-gray-900'
          }`}>{t("users.all")}</h2>
          <p className={`text-sm mb-6 transition-colors ${
            isDarkMode
              ? 'text-gray-400'
              : 'text-gray-500'
          }`}>{filteredUsers?.length} / {data?.length || 0}</p>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              className={`border rounded-lg px-4 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDarkMode
                  ? 'bg-white/[0.06] border-white/[0.06] text-white hover:bg-white/[0.1]'
                  : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
              }`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Todos">{t("common.all")}</option>
              <option value="Activos">{t("common.active")}</option>
              <option value="Inactivos">{t("common.inactive")}</option>
              <option value="Con Equipos">Con Equipos</option>
              <option value="Sin Equipos">Sin Equipos</option>
            </select>
          </div>

          {filteredUsers.length === 0 ? (
            <div className={`p-8 text-center transition-colors ${
              isDarkMode
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}>
              <p className={`font-medium transition-colors ${
                isDarkMode
                  ? 'text-white'
                  : 'text-gray-900'
              }`}>{t("common.noData")}</p>
            </div>
          ) : (
            <Tabla
              datos={filteredUsers}
              titulo=""
              columnasPersonalizadas={columnConfig}
              onEditar={(item) => window.location.href = `edit/${item.id}`}
              onEliminar={openDeleteConfirmation}
              mostrarAcciones={true}
            />
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-md w-full mx-4 border transition-colors ${
            isDarkMode
              ? 'bg-[#1c1c1e] border-white/[0.08]'
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-medium transition-colors ${
                isDarkMode
                  ? 'text-white'
                  : 'text-gray-900'
              }`}>{t("common.confirmDelete")}</h3>
              <button onClick={closeDeleteConfirmation} disabled={deleteConfirmation.isDeleting} className={`transition-colors ${
                isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <p className={`mb-2 transition-colors ${
                isDarkMode
                  ? 'text-gray-300'
                  : 'text-gray-700'
              }`}>{t("users.deleteConfirm")}</p>
              <div className={`rounded-lg p-3 border transition-colors ${
                isDarkMode
                  ? 'bg-white/[0.06] border-white/[0.06]'
                  : 'bg-gray-100 border-gray-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(deleteConfirmation.user?.person.fullName || "")}`}>
                    {deleteConfirmation.user?.person.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={`font-medium text-sm transition-colors ${
                      isDarkMode
                        ? 'text-white'
                        : 'text-gray-900'
                    }`}>{deleteConfirmation.user?.person.fullName}</div>
                    <div className={`text-xs transition-colors ${
                      isDarkMode
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    }`}>{deleteConfirmation.user?.email}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button onClick={closeDeleteConfirmation} disabled={deleteConfirmation.isDeleting} className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-50 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800'
              }`}>
                {t("action.cancel")}
              </button>
              <button onClick={deleteUser} disabled={deleteConfirmation.isDeleting} className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg">
                {deleteConfirmation.isDeleting ? t("common.deleting") : t("action.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 rounded-lg p-4 shadow-lg border ${notification.type === "success" ? "bg-green-800 border-green-600 text-green-100" : "bg-red-800 border-red-600 text-red-100"}`}>
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}
    </div>
  )
}

// ==================== TICKETS ====================
export interface Ticket {
  id: string
  ticketNumber: number
  title: string
  description: string
  status: string
  priority: string
  createdAt: Date
  updatedAt: Date
  companyId: string
}

const getStatusBadgeTicket = (status: string) => {
  switch (status) {
    case "open": return "bg-yellow-600 text-yellow-100"
    case "pending": return "bg-purple-600 text-purple-100"
    case "approved": return "bg-green-600 text-green-100"
    case "rejected": return "bg-red-600 text-red-100"
    case "closed": return "bg-red-600 text-red-100"
    default: return "bg-gray-600 text-gray-100"
  }
}

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "urgent": return "bg-red-600 text-red-100"
    case "high": return "bg-orange-600 text-orange-100"
    case "medium": return "bg-yellow-600 text-yellow-100"
    case "low": return "bg-green-600 text-green-100"
    case "trivial": return "bg-gray-600 text-gray-100"
    default: return "bg-gray-600 text-gray-100"
  }
}

interface TicketDeleteConfirmation {
  show: boolean
  ticket: Ticket | null
  isDeleting: boolean
}

export const AllTickets: React.FC = () => {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const { search } = useSearch()
  const { selectedCompany } = useCompany()
  usePageName()
  const { profile } = useUserProfile()
  const canManage = ["SUPER_ADMIN"].includes(profile?.roles?.toUpperCase?.() ?? "")
  const [activeTab, setActiveTab] = useState("Todos")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<TicketDeleteConfirmation>({ show: false, ticket: null, isDeleting: false })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
  }

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  useEffect(() => {
    if (!selectedCompany?.id) {
      setLoading(false)
      return
    }

    const fetchTickets = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/companies/tickets/${selectedCompany.id}/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("jwt") || ""}` },
        })

        if (!res.ok) throw new Error(`${t("error.loadData")}: ${res.status}`)

        let fetchedTickets = await res.json()
        if (fetchedTickets.ticket) fetchedTickets = Array.isArray(fetchedTickets.ticket) ? fetchedTickets.ticket : [fetchedTickets.ticket]
        if (fetchedTickets.data) fetchedTickets = fetchedTickets.data
        if (!Array.isArray(fetchedTickets)) fetchedTickets = []

        fetchedTickets = fetchedTickets.map((ticket: any) => ({
          ...ticket,
          createdAt: new Date(ticket.createdAt),
          updatedAt: new Date(ticket.updatedAt),
        }))

        setTickets(fetchedTickets)
      } catch (error) {
        console.error("Error loading tickets:", error)
        showNotification(t("error.loadData"), 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [selectedCompany?.id])

  const openDeleteModal = (ticket: Ticket) => {
    setDeleteConfirmation({ show: true, ticket, isDeleting: false })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.ticket || !selectedCompany?.id) return
    setDeleteConfirmation((prev) => ({ ...prev, isDeleting: true }))

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/companies/tickets/${selectedCompany.id}/${deleteConfirmation.ticket.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("jwt") || ""}` } }
      )

      if (!res.ok) throw new Error(t("error.deleteData"))

      setTickets(tickets.filter((tk) => tk.id !== deleteConfirmation.ticket!.id))
      showNotification(`Ticket #${deleteConfirmation.ticket.ticketNumber || deleteConfirmation.ticket.id} - ${t("common.success")}`, 'success')
      closeDeleteModal()
    } catch (error) {
      console.error("Error deleting ticket:", error)
      showNotification(t("error.deleteData"), 'error')
      setDeleteConfirmation((prev) => ({ ...prev, isDeleting: false }))
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesTab =
      activeTab === "Todos" ||
      (activeTab === "Pendientes" && ["open", "pending"].includes(ticket.status)) ||
      (activeTab === "Completados" && ["approved", "closed"].includes(ticket.status))

    if (!matchesTab) return false
    if (!search.trim()) return true

    const searchLower = search.toLowerCase()
    return (
      ticket.title?.toLowerCase().includes(searchLower) ||
      ticket.description?.toLowerCase().includes(searchLower) ||
      String(ticket.ticketNumber || "").toLowerCase().includes(searchLower)
    )
  })

  const columnConfig = {
    "#": (item: Ticket) => (
      <span className="text-sm font-mono font-medium text-blue-400">#{item.ticketNumber || item.id.slice(0, 6)}</span>
    ),
    [t("tickets.subject")]: (item: Ticket) => (
      <div>
        <div className="font-medium text-sm">{item.title}</div>
        <div className="text-xs text-gray-400">{item.description?.substring(0, 50)}...</div>
      </div>
    ),
    [t("tickets.status")]: (item: Ticket) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeTicket(item.status)}`}>
        {item.status}
      </span>
    ),
    [t("tickets.priority")]: (item: Ticket) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(item.priority)}`}>
        {item.priority}
      </span>
    ),
    [t("common.date")]: (item: Ticket) => (
      <span className="text-sm">{item.createdAt?.toLocaleDateString()}</span>
    ),
  }

  if (!selectedCompany?.id) {
    return (
      <div className={`min-h-screen p-6 flex items-center justify-center transition-colors ${
        isDarkMode
          ? 'bg-[#1c1c1e] text-white'
          : 'bg-[#f5f5f7] text-gray-900'
      }`}>
        <p className={`text-xl transition-colors ${
          isDarkMode
            ? 'text-gray-400'
            : 'text-gray-600'
        }`}>{t("error.selectCompany")}</p>
      </div>
    )
  }

  const totalTickets = tickets.length
  const pendientes = tickets.filter((t) => ["open", "pending"].includes(t.status)).length
  const completados = tickets.filter((t) => ["approved", "closed"].includes(t.status)).length

  const exportToExcel = () => {
    if (tickets.length === 0) {
      showNotification(t("common.noData"), 'error')
      return
    }

    try {
      const dataToExport = tickets.map((ticket) => ({
        '# Ticket': ticket.ticketNumber || ticket.id,
        [t("tickets.subject")]: ticket.title,
        [t("common.description")]: ticket.description,
        [t("common.status")]: ticket.status,
        [t("tickets.priority")]: ticket.priority,
        [t("common.date")]: ticket.createdAt?.toLocaleDateString(),
      }))

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets")
      XLSX.writeFile(workbook, "tickets_exportados.xlsx")
      showNotification(t("common.success"), 'success')
    } catch (error) {
      console.error("Error exporting:", error)
      showNotification(t("common.error"), 'error')
    }
  }

  const closeDeleteModal = () => {
    if (!deleteConfirmation.isDeleting) {
      setDeleteConfirmation({ show: false, ticket: null, isDeleting: false })
    }
  }

  const urgentes = tickets.filter((t) => t.priority === "urgent" && ["open", "pending"].includes(t.status)).length

  return (
    <div className={`min-h-full transition-colors ${
      isDarkMode ? 'bg-[#111113] text-white' : 'bg-[#f5f5f7] text-gray-900'
    }`}>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t("tickets.title")}
            </h1>
            <p className={`text-[13px] mt-1 ${isDarkMode ? 'text-[#8e8e93]' : 'text-gray-500'}`}>
              {selectedCompany?.name} · {totalTickets} {t("tickets.totalTickets").toLowerCase()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportToExcel} className={`flex items-center gap-2 h-9 px-4 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap ${
              isDarkMode
                ? 'bg-white/[0.06] hover:bg-white/[0.1] text-[#8e8e93] hover:text-white border border-white/[0.06]'
                : 'bg-white hover:bg-gray-50 text-[#6e6e73] hover:text-gray-900 border border-gray-200'
            }`}>
              <span className="text-xs">↓</span> {t("action.export")}
            </button>
            <a href="create" className="flex items-center gap-2 h-9 px-4 rounded-lg text-[13px] font-medium bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white transition-colors whitespace-nowrap">
              + {t("tickets.create")}
            </a>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Total */}
        <div className={`rounded-xl p-3 sm:p-4 border transition-colors ${
          isDarkMode ? 'bg-[#2c2c2e] border-white/[0.08]' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-[#8e8e93]' : 'text-gray-500'}`}>Total</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
              <Ticket className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalTickets}</div>
          <div className={`text-xs ${isDarkMode ? 'text-[#636366]' : 'text-gray-400'}`}>{t("tickets.totalTickets")}</div>
        </div>

        {/* Pendientes */}
        <div className={`rounded-xl p-3 sm:p-4 border transition-colors ${
          isDarkMode ? 'bg-[#2c2c2e] border-white/[0.08]' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-[#8e8e93]' : 'text-gray-500'}`}>{t("maintenance.pending")}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pendientes}</div>
          <div className={`text-xs ${isDarkMode ? 'text-[#636366]' : 'text-gray-400'}`}>{t("maintenance.pendingCount")}</div>
        </div>

        {/* Completados */}
        <div className={`rounded-xl p-3 sm:p-4 border transition-colors ${
          isDarkMode ? 'bg-[#2c2c2e] border-white/[0.08]' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-[#8e8e93]' : 'text-gray-500'}`}>{t("maintenance.completed")}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-green-500/10' : 'bg-green-50'}`}>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{completados}</div>
          <div className={`text-xs ${isDarkMode ? 'text-[#636366]' : 'text-gray-400'}`}>{t("maintenance.completedCount")}</div>
        </div>

        {/* Urgentes */}
        <div className={`rounded-xl p-3 sm:p-4 border transition-colors ${
          isDarkMode ? 'bg-[#2c2c2e] border-white/[0.08]' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-[#8e8e93]' : 'text-gray-500'}`}>{t("tickets.critical")}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-red-500/10' : 'bg-red-50'}`}>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{urgentes}</div>
          <div className={`text-xs ${isDarkMode ? 'text-[#636366]' : 'text-gray-400'}`}>{t("tickets.critical")}</div>
        </div>
      </div>

      {/* Table Card */}
      <div className={`rounded-xl border transition-colors ${
        isDarkMode ? 'bg-[#2c2c2e] border-white/[0.08]' : 'bg-white border-gray-100'
      }`}>
        {/* Table Header */}
        <div className={`px-4 py-3 border-b flex items-center justify-between transition-colors ${
          isDarkMode ? 'border-white/[0.06]' : 'border-gray-100'
        }`}>
          <div>
            <h2 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t("tickets.all")}
            </h2>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-[#636366]' : 'text-gray-400'}`}>
              {filteredTickets.length} / {totalTickets}
            </p>
          </div>

          {/* Tabs inline */}
          <div className={`flex space-x-1 p-1 rounded-lg ${isDarkMode ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
            {[
              { value: "Todos", label: t("common.all"), count: totalTickets },
              { value: "Pendientes", label: t("maintenance.pending"), count: pendientes },
              { value: "Completados", label: t("maintenance.completed"), count: completados },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === tab.value
                    ? isDarkMode
                      ? 'bg-[#3a3a3c] text-white'
                      : 'bg-white text-gray-900 shadow-sm'
                    : isDarkMode
                      ? 'text-[#8e8e93] hover:text-white'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === tab.value
                    ? 'bg-blue-600 text-white'
                    : isDarkMode ? 'bg-white/[0.08] text-[#8e8e93]' : 'bg-gray-200 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="p-1">
          {loading ? (
            <div className={`p-12 text-center ${isDarkMode ? 'text-[#8e8e93]' : 'text-gray-500'}`}>
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm">{t("common.loading")}</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className={`p-12 text-center ${isDarkMode ? 'text-[#8e8e93]' : 'text-gray-500'}`}>
              <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">{t("common.noData")}</p>
              <p className="text-xs mt-1 opacity-60">{t("action.filter")}</p>
            </div>
          ) : (
            <Tabla
              datos={filteredTickets}
              titulo=""
              columnasPersonalizadas={columnConfig}
              onEditar={canManage ? (item) => window.location.href = `edit/${item.id}` : undefined}
              onEliminar={canManage ? openDeleteModal : undefined}
              mostrarAcciones={canManage}
            />
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteConfirmation.show && deleteConfirmation.ticket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-md w-full mx-4 border transition-colors ${
            isDarkMode
              ? 'bg-[#1c1c1e] border-white/[0.08]'
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-medium transition-colors ${
                isDarkMode
                  ? 'text-white'
                  : 'text-gray-900'
              }`}>{t("common.confirmDelete")}</h3>
              <button onClick={closeDeleteModal} disabled={deleteConfirmation.isDeleting} className={`transition-colors ${
                isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
                <X size={20} />
              </button>
            </div>

            <p className={`mb-2 transition-colors ${
              isDarkMode
                ? 'text-gray-300'
                : 'text-gray-700'
            }`}>{t("tickets.deleteConfirm")}</p>
            <p className={`font-semibold mb-6 transition-colors ${
              isDarkMode
                ? 'text-white'
                : 'text-gray-900'
            }`}>{deleteConfirmation.ticket.title}</p>

            <div className="flex space-x-3">
              <button onClick={closeDeleteModal} disabled={deleteConfirmation.isDeleting} className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-50 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800'
              }`}>
                {t("action.cancel")}
              </button>
              <button onClick={handleDeleteConfirm} disabled={deleteConfirmation.isDeleting} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg">
                {deleteConfirmation.isDeleting ? t("common.deleting") : t("action.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 rounded-lg p-4 shadow-lg border ${notification.type === "success" ? "bg-green-800 border-green-600 text-green-100" : "bg-red-800 border-red-600 text-red-100"}`}>
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-md w-full mx-4 border transition-colors ${
            isDarkMode
              ? 'bg-[#1c1c1e] border-white/[0.08]'
              : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-lg font-medium mb-4 transition-colors ${
              isDarkMode
                ? 'text-white'
                : 'text-gray-900'
            }`}>{t("tickets.create")}</h3>
            <p className={`text-sm transition-colors ${
              isDarkMode
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}>{t("tickets.create")}</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setIsCreateModalOpen(false)} className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}>
                {t("action.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}