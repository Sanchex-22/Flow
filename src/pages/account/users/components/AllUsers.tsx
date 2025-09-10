"use client"
import type React from "react"
import { useState, useEffect, useMemo } from "react"
import useSWR, { mutate } from "swr"
import Loader from "../../../../components/loaders/loader"

const { VITE_API_URL } = import.meta.env

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
    status: "Con Equipos" | "Sin Equipos" // Estado de la persona respecto a equipos
    userCode: string
    createdAt: string
    updatedAt: string
    department: {
      id: string
      name: string
      description: string
      companyId: string
      isActive: boolean
    } | null // Puede ser null si la persona no tiene departamento
  }
}

interface SubRoutesProps {
  subroutes?: {
    name: string
    href: string
  }[]
}

// Tipos para las notificaciones
type NotificationType = "success" | "error"

interface Notification {
  type: NotificationType
  message: string
  show: boolean
}

// Tipos para el modal de confirmación
interface DeleteConfirmation {
  show: boolean
  user: UsuarioFull | null
  isDeleting: boolean
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const AllUsers: React.FC<SubRoutesProps> = () => {
  const { data, error, isLoading } = useSWR<UsuarioFull[]>(`${VITE_API_URL}/api/users/full`, fetcher)

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")

  // Estados para notificaciones
  const [notification, setNotification] = useState<Notification>({
    type: "success",
    message: "",
    show: false,
  })

  // Estados para el modal de confirmación
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    show: false,
    user: null,
    isDeleting: false,
  })

  // Función para mostrar notificaciones
  const showNotification = (type: NotificationType, message: string) => {
    setNotification({
      type,
      message,
      show: true,
    })
  }

  // Auto-ocultar notificación después de 5 segundos
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification.show])

  // Función para abrir el modal de confirmación
  const openDeleteConfirmation = (user: UsuarioFull) => {
    setDeleteConfirmation({
      show: true,
      user,
      isDeleting: false,
    })
  }

  // Función para cerrar el modal de confirmación
  const closeDeleteConfirmation = () => {
    if (!deleteConfirmation.isDeleting) {
      setDeleteConfirmation({
        show: false,
        user: null,
        isDeleting: false,
      })
    }
  }

  // Función para eliminar usuario
  const deleteUser = async () => {
    if (!deleteConfirmation.user) return

    setDeleteConfirmation((prev) => ({ ...prev, isDeleting: true }))

    try {
      const response = await fetch(`${VITE_API_URL}/api/users/delete/${deleteConfirmation.user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al eliminar el usuario")
      }

      // Actualizar la caché de SWR
      mutate(`${VITE_API_URL}/api/users/full`)

      // Mostrar notificación de éxito
      showNotification("success", `Usuario ${deleteConfirmation.user.person.fullName} eliminado exitosamente`)

      // Cerrar modal
      closeDeleteConfirmation()
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error)
      showNotification("error", error.message || "Error inesperado al eliminar el usuario")
      setDeleteConfirmation((prev) => ({ ...prev, isDeleting: false }))
    }
  }

  // Filtrar y buscar usuarios
  const filteredUsers = useMemo(() => {
    if (!data) return []

    return data.filter((user) => {
      // Lógica de filtrado por estado
      const statusMatch =
        statusFilter === "Todos" ||
        (statusFilter === "Activos" && user.isActive) ||
        (statusFilter === "Inactivos" && !user.isActive) ||
        (statusFilter === "Con Equipos" && user.person.status === "Con Equipos") ||
        (statusFilter === "Sin Equipos" && user.person.status === "Sin Equipos")

      // Lógica de búsqueda por término
      const searchMatch =
        searchTerm.trim() === "" ||
        user.person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.person.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.person.position.toLowerCase().includes(searchTerm.toLowerCase())

      return statusMatch && searchMatch
    })
  }, [data, searchTerm, statusFilter])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Loader/>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <span>Error al cargar el usuarios.</span>
      </div>
    )
  }

  const getStatusBadge = (user: UsuarioFull) => {
    if (user.person.status === "Con Equipos") {
      return "bg-blue-600 text-blue-100"
    }
    if (user.isActive) {
      return "bg-green-600 text-green-100"
    }
    return "bg-red-600 text-red-100"
  }

  const getAvatarColor = (nombre: string) => {
    const colors = [
      "bg-blue-600",
      "bg-green-600",
      "bg-purple-600",
      "bg-orange-600",
      "bg-pink-600",
      "bg-indigo-600",
      "bg-teal-600",
      "bg-red-600",
    ]
    const index = nombre.length % colors.length
    return colors[index]
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Usuarios</h1>
          <p className="text-gray-400">Gestiona los usuarios y sus asignaciones de equipos</p>
        </div>
        <div>
          {/* Usar el componente Link de Next.js */}
          <a href="create" className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Agregar Usuario</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Usuarios</span>
            <div className="w-6 h-6">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-400">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{data?.length || 0}</div>
          <div className="text-sm text-gray-400">Registrados en el sistema</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Usuarios Activos</span>
            <div className="w-6 h-6">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-400">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{data?.filter((u) => u.isActive).length || 0}</div>
          <div className="text-sm text-gray-400">Con acceso al sistema</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Con Equipos</span>
            <div className="w-6 h-6">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-400">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{data?.filter((u) => u.person.status === "Con Equipos").length || 0}</div>
          <div className="text-sm text-gray-400">Tienen equipos asignados</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Departamentos</span>
            <div className="w-6 h-6">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-400">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">
            {Array.from(new Set(data?.map((u) => u.person.department?.name).filter(Boolean))).length || 0}
          </div>
          <div className="text-sm text-gray-400">Diferentes áreas</div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold mb-2">Lista de Usuarios</h2>
          <p className="text-gray-400 text-sm mb-6">{filteredUsers.length} de {data?.length || 0} usuarios encontrados</p>
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="ml-4">
              <div className="relative">
                <select
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>Todos</option>
                  <option>Activos</option>
                  <option>Inactivos</option>
                  <option>Con Equipos</option>
                  <option>Sin Equipos</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400">
                    <polyline points="6,9 12,15 18,9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-sm font-medium text-gray-300">Usuario</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Contacto</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Departamento</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Estado</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Equipos</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((usuario) => (
                <tr key={usuario.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(usuario.person.fullName)}`}
                      >
                        {usuario.person.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{usuario.person.fullName}</div>
                        <div className="text-xs text-gray-400">{usuario.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="flex items-center space-x-1 mb-1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-gray-400">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <span>{usuario.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-gray-400">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>{usuario.person.phoneNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-sm">{usuario.person.department?.name || "Sin departamento"}</div>
                      <div className="text-xs text-gray-400">{usuario.person.position}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(usuario)}`}>
                      {usuario.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                      {/* Esto es solo un placeholder, necesitarías un endpoint para obtener el conteo de equipos */}
                      <span className="text-sm font-medium">0</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      {/* Usar el componente Link de Next.js */}
                      <a href={`edit/${usuario.id}`} className="p-1 text-gray-400 hover:text-white transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </a>
                      {/* Botón de eliminar */}
                      <button
                        onClick={() => openDeleteConfirmation(usuario)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <polyline points="3,6 5,6 21,6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                  </div>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Confirmar Eliminación</h3>
                <p className="text-sm text-gray-400">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-2">¿Estás seguro de que deseas eliminar al usuario:</p>
              <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(deleteConfirmation.user?.person.fullName || "")}`}>
                    {deleteConfirmation.user?.person.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-white">{deleteConfirmation.user?.person.fullName}</div>
                    <div className="text-xs text-gray-400">{deleteConfirmation.user?.email}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button onClick={closeDeleteConfirmation} disabled={deleteConfirmation.isDeleting} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={deleteUser} disabled={deleteConfirmation.isDeleting} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors">
                {deleteConfirmation.isDeleting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>Eliminar</span>
                  </>
                )}
              </button>
          </div>
        </div>
      </div>
      )}

      {/* Notificación Toast */}
      {notification.show && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 transition-all duration-300 ease-in-out ${notification.show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <div className={`rounded-lg p-4 shadow-lg border ${notification.type === "success" ? "bg-green-800 border-green-600 text-green-100" : "bg-red-800 border-red-600 text-red-100"}`}>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {notification.type === "success" ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button onClick={() => setNotification((prev) => ({ ...prev, show: false }))} className="flex-shrink-0 text-current hover:opacity-75 transition-opacity">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default AllUsers