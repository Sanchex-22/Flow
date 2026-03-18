"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useCompany } from "../../../../context/routerContext"
import { useTheme } from "../../../../context/themeContext"
import { useParams, useNavigate } from "react-router-dom"
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Notification } from "../components/notification"
import useUserProfile from "../../../../hook/userUserProfile"

export default function EditTicketPage() {
  const { selectedCompany } = useCompany()
  const { isDarkMode } = useTheme()
  const {profile} = useUserProfile()
  const { id } = useParams()
  const router = useNavigate()

  const [isCreating, setIsCreating] = useState(!id)
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(!isCreating)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const API = import.meta.env.VITE_API_URL

  const emptyTicket = {
    title: "",
    description: "",
    img: "",
    comment: "",
    type: "ticket",
    priority: "medium",
    status: "open",
    startDate: "",
    endDate: "",
    requestDays: 0,
    approvedDays: 0,
    reviewed: false,
    view: false,
    sendToId: "",
  }

  // ============================
  //  LOAD USERS
  // ============================
  useEffect(() => {
    const fetchUsers = async () => {
      if (!selectedCompany?.id) return

      setLoadingUsers(true)
      try {
        const res = await fetch(`${API}/api/users/full/${selectedCompany.id}`)
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users || data || [])
        }
      } catch (err) {
        console.error("Error loading users:", err)
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [selectedCompany?.id, API])

  // ============================
  //  LOAD DATA OR CREATE MODE
  // ============================
  useEffect(() => {
    if (!id) {
    setIsCreating(true)
    setTicket({
      ...emptyTicket,
      sendById: profile?.id || "",
    })
      setLoading(false)
      return
    }

    const fetchTicket = async () => {
      try {
        const res = await fetch(`${API}/api/companies/tickets/${selectedCompany?.id}/${id}`)
        if (!res.ok) {
          setIsCreating(true)
          setTicket(emptyTicket)
          return
        }

        const data = await res.json()
        setTicket(data.ticket || data)
      } catch (err) {
        console.error(err)
        setIsCreating(true)
        setTicket(emptyTicket)
      } finally {
        setLoading(false)
      }
    }

    if (selectedCompany?.id) fetchTicket()
  }, [id, selectedCompany])

  const handleChange = (field: string, value: any) => {
    setTicket((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  // ============================
  //        SAVE / CREATE
  // ============================
  const saveChanges = async () => {
    setSaving(true)
    setError(null)

    try {
      const method = isCreating ? "POST" : "PUT"
      const url = isCreating
        ? `${API}/api/companies/tickets/${selectedCompany?.id}/create`
        : `${API}/api/companies/tickets/${selectedCompany?.id}/${id}`

      const body = {
        title: ticket.title,
        description: ticket.description,
        img: ticket.img || null,
        comment: ticket.comment || null,
        type: ticket.type,
        priority: ticket.priority,
        status: ticket.status,
        startDate: ticket.startDate ? new Date(ticket.startDate).toISOString() : null,
        endDate: ticket.endDate ? new Date(ticket.endDate).toISOString() : null,
        requestDays: ticket.requestDays || 0,
        approvedDays: ticket.approvedDays || 0,
        reviewed: ticket.reviewed || false,
        view: ticket.view || false,
        sendTo: ticket.sendToId || null,
        sendBy: ticket.sendById || profile?.id,
      }
      console.log(body)
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error(isCreating ? "Error al crear ticket" : "Error al actualizar ticket")

      setNotification({
        message: isCreating ? "Ticket creado exitosamente" : "Cambios guardados exitosamente",
        type: "success",
      })

      setTimeout(() => {
        router(`/${selectedCompany?.id}/tickets/all`)
      }, 2000)
    } catch (err) {
      // console.error(err)
      setError(isCreating ? "Error al crear el ticket" : "Error al guardar los cambios")
      setNotification({
        message: isCreating ? "Error al crear el ticket" : "Error al guardar los cambios",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !ticket) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-[#1c1c1e]" : "bg-[#f5f5f7]"}`}>
        <div className="text-center">
          <div className={`inline-block animate-spin rounded-full h-10 w-10 border-b-2 mb-3 ${isDarkMode ? "border-blue-500" : "border-blue-600"}`}></div>
          <p className={`text-sm ${isDarkMode ? "text-white/50" : "text-gray-500"}`}>Cargando ticket...</p>
        </div>
      </div>
    )
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return <AlertTriangle className="h-4 w-4" />
      case "high": return <AlertCircle className="h-4 w-4" />
      case "medium": return <Clock className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default: return "bg-green-500/20 text-green-400 border-green-500/30"
    }
  }

  const bg = isDarkMode ? "bg-[#1c1c1e]" : "bg-[#f5f5f7]"
  const inputCls = isDarkMode
    ? "bg-[#3a3a3c] border-white/[0.08] text-white placeholder-white/30 focus:ring-blue-500/20 focus:border-blue-500/60"
    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500/20 focus:border-blue-500"
  const textMain = isDarkMode ? "text-white" : "text-gray-900"
  const textSub  = isDarkMode ? "text-white/50" : "text-gray-500"

  return (
    <div className={`min-h-screen ${bg}`}>
      {notification && (
        <Notification message={notification?.message} type={notification?.type} onClose={() => setNotification(null)} />
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Header */}
        <div className={`rounded-xl p-4 sm:p-5 mb-5 border flex items-start justify-between gap-4 ${isDarkMode ? "bg-[#2c2c2e] border-white/[0.08]" : "bg-white border-gray-200 shadow-sm"}`}>
          <div>
            <h1 className={`text-base sm:text-lg font-semibold ${textMain}`}>
              {isCreating ? "Crear Ticket" : "Editar Ticket"}
            </h1>
            <p className={`text-xs sm:text-sm mt-0.5 ${textSub}`}>
              {isCreating
                ? `Empresa: ${selectedCompany?.name || "—"}`
                : `Ticket #${ticket?.ticketNumber} · ${selectedCompany?.name || "—"}`}
            </p>
          </div>
          <button
            onClick={() => router(-1)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode
                ? "bg-white/[0.06] hover:bg-white/10 text-white border border-white/[0.08]"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Volver</span>
          </button>
        </div>

        {error && (
          <div className={`mb-5 p-3 sm:p-4 rounded-xl border flex items-start gap-3 ${isDarkMode ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200"}`}>
            <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-red-400" : "text-red-500"}`} />
            <p className={`text-sm ${isDarkMode ? "text-red-400" : "text-red-600"}`}>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Información básica */}
            <FormSection isDark={isDarkMode} title="Información básica" description={isCreating ? "Completa los campos para crear el ticket" : `Ticket No.${ticket?.ticketNumber} — enviado por: ${ticket?.sendBy?.username || "n/a"}`}>
              <div className="space-y-4">
                <FormField isDark={isDarkMode} label="Título" required>
                  <input
                    type="text"
                    value={ticket?.title || ""}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                    placeholder="Título del ticket"
                    required
                  />
                </FormField>

                <FormField isDark={isDarkMode} label="Descripción" required>
                  <textarea
                    value={ticket?.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all resize-none ${inputCls}`}
                    placeholder="Descripción detallada del ticket"
                    required
                  />
                </FormField>

                <FormField isDark={isDarkMode} label="Comentario">
                  <textarea
                    value={ticket?.comment || ""}
                    onChange={(e) => handleChange("comment", e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all resize-none ${inputCls}`}
                    placeholder="Comentarios adicionales"
                  />
                </FormField>

                <FormField isDark={isDarkMode} label="Imagen (URL)">
                  <input
                    type="text"
                    value={ticket?.img || ""}
                    onChange={(e) => handleChange("img", e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                    placeholder="https://..."
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Estado y tipo */}
            <FormSection isDark={isDarkMode} title="Estado y clasificación" description="Prioridad, estado y tipo de solicitud">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField isDark={isDarkMode} label="Prioridad" required>
                  <select
                    value={ticket?.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all cursor-pointer ${inputCls}`}
                  >
                    <option value="trivial">⚪ Trivial</option>
                    <option value="low">🟢 Baja</option>
                    <option value="medium">🟡 Media</option>
                    <option value="high">🟠 Alta</option>
                    <option value="urgent">🔴 Urgente</option>
                  </select>
                </FormField>

                <FormField isDark={isDarkMode} label="Tipo" required>
                  <select
                    value={ticket?.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all cursor-pointer ${inputCls}`}
                  >
                    <option value="ticket">Ticket</option>
                    <option value="vacations">Vacaciones</option>
                    <option value="permission">Permiso</option>
                  </select>
                </FormField>

                <FormField isDark={isDarkMode} label="Estado" required>
                  <select
                    value={ticket?.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all cursor-pointer ${inputCls}`}
                  >
                    <option value="open">Abierto</option>
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="approved">Aprobado</option>
                    <option value="rejected">Rechazado</option>
                    <option value="closed">Cerrado</option>
                  </select>
                </FormField>
              </div>
            </FormSection>

            {/* Fechas y días */}
            <FormSection isDark={isDarkMode} title="Fechas y duración" description="Período y días solicitados">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField isDark={isDarkMode} label="Fecha inicio">
                    <input
                      type="date"
                      value={ticket?.startDate?.substring(0, 10) || ""}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                    />
                  </FormField>

                  <FormField isDark={isDarkMode} label="Fecha fin">
                    <input
                      type="date"
                      value={ticket?.endDate?.substring(0, 10) || ""}
                      onChange={(e) => handleChange("endDate", e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField isDark={isDarkMode} label="Días solicitados">
                    <input
                      type="number"
                      value={ticket?.requestDays ?? ""}
                      onChange={(e) => handleChange("requestDays", Number(e.target.value))}
                      className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                      placeholder="0"
                    />
                  </FormField>

                  <FormField isDark={isDarkMode} label="Días aprobados">
                    <input
                      type="number"
                      value={ticket?.approvedDays ?? ""}
                      onChange={(e) => handleChange("approvedDays", Number(e.target.value))}
                      className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                      placeholder="0"
                    />
                  </FormField>
                </div>
              </div>
            </FormSection>

            {/* Asignación */}
            <FormSection isDark={isDarkMode} title="Asignación" description="Asignar a otro usuario">
              <FormField isDark={isDarkMode} label="Asignar a">
                <select
                  value={ticket?.sendToId || ""}
                  onChange={e => handleChange("sendToId", e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all cursor-pointer ${inputCls}`}
                  disabled={loadingUsers}
                >
                  <option value="">Sin asignar</option>
                  {users.map((u) => (
                    <option key={u?.id} value={u?.id}>
                      {u?.username}
                    </option>
                  ))}
                </select>
              </FormField>
            </FormSection>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* Checkboxes */}
            <FormSection isDark={isDarkMode} title="Estados adicionales">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={ticket?.reviewed || false}
                    onChange={(e) => handleChange("reviewed", e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                  />
                  <span className={`text-sm font-medium transition-colors ${isDarkMode ? "text-white/70 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900"}`}>
                    Revisado
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={ticket?.view || false}
                    onChange={(e) => handleChange("view", e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                  />
                  <span className={`text-sm font-medium transition-colors ${isDarkMode ? "text-white/70 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900"}`}>
                    Visto
                  </span>
                </label>
              </div>
            </FormSection>

            {/* Resumen */}
            <FormSection isDark={isDarkMode} title="Resumen">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className={textSub}>Tipo:</span>
                  <span className={`font-medium capitalize ${textMain}`}>{ticket?.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={textSub}>Estado:</span>
                  <span className={`font-medium capitalize ${textMain}`}>{ticket?.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={textSub}>Prioridad:</span>
                  {!isCreating && (
                    <div className={`px-3 py-1 rounded-full border ${getPriorityColor(ticket?.priority)} flex items-center gap-1.5 text-xs font-medium`}>
                      {getPriorityIcon(ticket?.priority)}
                      <span className="capitalize">{ticket?.priority}</span>
                    </div>
                  )}
                </div>
                <div className={`h-px my-2 ${isDarkMode ? "bg-white/[0.06]" : "bg-gray-100"}`}></div>
                {!isCreating && <p className={`text-xs ${textSub}`}>#{ticket?.ticketNumber}</p>}
              </div>
            </FormSection>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={saveChanges}
                disabled={saving}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {saving
                  ? isCreating ? "Creando..." : "Guardando..."
                  : isCreating ? "Crear ticket" : "Guardar cambios"}
              </button>
              <button
                onClick={() => router(-1)}
                className={`w-full px-4 py-3 rounded-xl font-medium text-sm transition-colors border ${
                  isDarkMode
                    ? "bg-white/[0.06] hover:bg-white/10 text-white border-white/[0.08]"
                    : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function FormSection({
  title,
  description,
  children,
  isDark,
}: {
  title: string
  description?: string
  children: React.ReactNode
  isDark?: boolean
}) {
  return (
    <div className={`rounded-xl p-4 sm:p-5 border ${isDark ? "bg-[#2c2c2e] border-white/[0.08]" : "bg-white border-gray-200 shadow-sm"}`}>
      <div className="mb-4">
        <h2 className={`text-sm sm:text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h2>
        {description && <p className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>{description}</p>}
      </div>
      {children}
    </div>
  )
}

function FormField({
  label,
  required,
  children,
  isDark,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  isDark?: boolean
}) {
  return (
    <div>
      <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-white/60" : "text-gray-600"}`}>
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}