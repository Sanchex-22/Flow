"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR, { mutate } from "swr"
import Loader from "../../../../components/loaders/loader"
import { Company, useCompany } from "../../../../context/routerContext"
import { usePageName } from "../../../../hook/usePageName"
import PagesHeader from "../../../../components/headers/pagesHeader"
import { useSearch } from "../../../../context/searchContext"
import Tabla from "../../../../components/tables/Table"
import { X } from "lucide-react"
import { useTheme } from "../../../../context/themeContext"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// ==================== PERSONS ====================
export interface PersonFull {
    id: string
    userId: string | null
    firstName: string
    lastName: string
    fullName: string
    contactEmail: string | null
    phoneNumber: string | null
    departmentId: string | null
    position: string | null
    status: "Activo" | "Inactivo"
    userCode: string
    createdAt: string
    updatedAt: string
    user: {
        id: string
        username: string
        email: string
        role: string
        isActive: boolean
    } | null
    department: {
        id: string
        name: string
        description: string
        isActive: boolean
    } | null
}

type NotificationType = "success" | "error"

interface Notification {
    type: NotificationType
    message: string
    show: boolean
}

interface DeleteConfirmation {
    show: boolean
    person: PersonFull | null
    isDeleting: boolean
}

const getAvatarColor = (nombre: string) => {
    const colors = ["bg-blue-600", "bg-green-600", "bg-purple-600", "bg-orange-600", "bg-pink-600", "bg-indigo-600", "bg-teal-600", "bg-red-600"]
    const index = nombre?.length % colors?.length
    return colors[index]
}

const getStatusBadge = (person: PersonFull) => {
    if (person.status === "Activo") return "bg-green-600 text-green-100"
    return "bg-red-600 text-red-100"
}

const getUserStatusBadge = (person: PersonFull) => {
    if (!person.user) return "bg-gray-600 text-gray-100"
    if (person.user.isActive) return "bg-blue-600 text-blue-100"
    return "bg-yellow-600 text-yellow-100"
}

export const AllPersons: React.FC = () => {
    const { isDarkMode } = useTheme()
    const { selectedCompany }: { selectedCompany: Company | null } = useCompany()
    
    // ✅ CORREGIDO: Usar selectedCompany.id correctamente
    const personUrl = selectedCompany?.id 
        ? `${import.meta.env.VITE_API_URL}/api/persons/company/${selectedCompany.id}`
        : null;
    
    const { data, error, isLoading } = useSWR<PersonFull[]>(personUrl, fetcher)
    const { pageName } = usePageName()
    const { search } = useSearch()
    const [statusFilter, setStatusFilter] = useState("Todos")
    const [notification, setNotification] = useState<Notification>({ type: "success", message: "", show: false })
    const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({ show: false, person: null, isDeleting: false })

    const showNotification = (type: NotificationType, message: string) => {
        setNotification({ type, message, show: true })
    }

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 5000)
            return () => clearTimeout(timer)
        }
    }, [notification.show])

    const openDeleteConfirmation = (person: PersonFull) => {
        setDeleteConfirmation({ show: true, person, isDeleting: false })
    }

    const closeDeleteConfirmation = () => {
        if (!deleteConfirmation.isDeleting) {
            setDeleteConfirmation({ show: false, person: null, isDeleting: false })
        }
    }

    const deletePerson = async () => {
        if (!deleteConfirmation.person) return
        setDeleteConfirmation((prev) => ({ ...prev, isDeleting: true }))

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/persons/delete/${deleteConfirmation?.person?.id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Error al eliminar la persona")
            }

            // ✅ Actualizar lista después de eliminar
            if (selectedCompany?.id) {
                mutate(`${import.meta.env.VITE_API_URL}/api/persons/company/${selectedCompany.id}`)
            }
            showNotification("success", `Persona ${deleteConfirmation.person.fullName} eliminada exitosamente`)
            closeDeleteConfirmation()
        } catch (error: any) {
            console.error("Error al eliminar persona:", error)
            showNotification("error", error.message || "Error inesperado al eliminar la persona")
            setDeleteConfirmation((prev) => ({ ...prev, isDeleting: false }))
        }
    }

    const filteredPersons = useMemo(() => {
        if (!data || !Array.isArray(data)) return []

        return data?.filter((person) => {
            const statusMatch =
                statusFilter === "Todos" ||
                (statusFilter === "Activos" && person?.status === "Activo") ||
                (statusFilter === "Inactivos" && person?.status === "Inactivo") ||
                (statusFilter === "Con Usuario" && person?.user !== null) ||
                (statusFilter === "Sin Usuario" && person?.user === null)

            const searchMatch =
                search.trim() === "" ||
                person?.fullName.toLowerCase().includes(search.toLowerCase()) ||
                person?.contactEmail?.toLowerCase().includes(search.toLowerCase()) ||
                person?.department?.name?.toLowerCase().includes(search.toLowerCase()) ||
                person?.position?.toLowerCase().includes(search.toLowerCase()) ||
                person?.user?.username?.toLowerCase().includes(search.toLowerCase())

            return statusMatch && searchMatch
        })
    }, [data, search, statusFilter])

    const columnConfig = {
        "Nombre Completo": (item: PersonFull) => (
            <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(item?.fullName)}`}>
                    {item?.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                    <div className="font-medium text-sm">{item?.fullName}</div>
                    <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{item?.userCode}</div>
                </div>
            </div>
        ),
        "Contacto": (item: PersonFull) => (
            <div className="text-sm">
                <div className="flex items-center space-x-1 mb-1">
                    <span>{item.contactEmail || "-"}</span>
                </div>
                <div className="flex items-center space-x-1">
                    <span>{item?.phoneNumber || "-"}</span>
                </div>
            </div>
        ),
        "Departamento": (item: PersonFull) => (
            <div>
                <div className="font-medium text-sm">{item?.department?.name || "Sin departamento"}</div>
                <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{item?.position || "-"}</div>
            </div>
        ),
        "Usuario": (item: PersonFull) => (
            <div>
                <div className="font-medium text-sm">{item?.user?.username || "Sin usuario"}</div>
                <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{item?.user?.email || "-"}</div>
            </div>
        ),
        "Estado Persona": (item: PersonFull) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item)}`}>
                {item.status}
            </span>
        ),
        "Estado Usuario": (item: PersonFull) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserStatusBadge(item)}`}>
                {!item.user ? "Sin Usuario" : item.user.isActive ? "Activo" : "Inactivo"}
            </span>
        ),
    }

    if (isLoading) return <Loader />
    if (error || !data) return <div className={`text-center p-8 ${isDarkMode ? "text-red-500" : "text-red-600"}`}>Error al cargar personas</div>

    const isDataArray = Array.isArray(data)

    const totalPersons = isDataArray ? data.length : 0
    const activePersons = isDataArray ? data.filter((p) => p?.status === "Activo").length : 0
    const personsWithUser = isDataArray ? data.filter((p) => p.user !== null).length : 0
    const departments = isDataArray
        ? Array.from(new Set(data.map((p) => p?.department?.name).filter(Boolean))).length
        : 0

    return (
        <div className="relative">
            <PagesHeader
                title={"Personas"}
                description={pageName ? `${pageName} in ${selectedCompany?.name}` : "Cargando compañía..."}
                showCreate
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className={`rounded-lg p-6 border transition-colors ${
                    isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Total Personas</span>
                    <div className="text-3xl font-bold mb-1">{totalPersons}</div>
                    <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Registradas en el sistema</div>
                </div>
                <div className={`rounded-lg p-6 border transition-colors ${
                    isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Personas Activas</span>
                    <div className="text-3xl font-bold mb-1">{activePersons}</div>
                    <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Con estado activo</div>
                </div>
                <div className={`rounded-lg p-6 border transition-colors ${
                    isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Con Usuario</span>
                    <div className="text-3xl font-bold mb-1">{personsWithUser}</div>
                    <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Vinculadas a usuario</div>
                </div>
                <div className={`rounded-lg p-6 border transition-colors ${
                    isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Departamentos</span>
                    <div className="text-3xl font-bold mb-1">{departments}</div>
                    <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Diferentes áreas</div>
                </div>
            </div>

            {/* Persons List */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <select
                    className={`border rounded-lg px-4 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                            : "bg-gray-50 border-gray-300 text-gray-900 hover:bg-gray-100"
                    }`}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option>Todos</option>
                    <option>Activos</option>
                    <option>Inactivos</option>
                    <option>Con Usuario</option>
                    <option>Sin Usuario</option>
                </select>
            </div>

            {filteredPersons?.length === 0 ? (
                <div className={`p-8 text-center rounded-lg border ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                    <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>No se encontraron personas</p>
                </div>
            ) : (
                <Tabla
                    datos={filteredPersons}
                    titulo={`${pageName} in ${selectedCompany?.name}`}
                    columnasPersonalizadas={columnConfig}
                    onEditar={(item) => (window.location.href = `edit/${item.id}`)}
                    onEliminar={openDeleteConfirmation}
                    mostrarAcciones={true}
                />
            )}

            {/* Delete Modal */}
            {deleteConfirmation.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`rounded-lg p-6 max-w-md w-full mx-4 border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Confirmar Eliminación</h3>
                            <button onClick={closeDeleteConfirmation} disabled={deleteConfirmation.isDeleting} className={isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>¿Estás seguro de que deseas eliminar a la persona:</p>
                            <div className={`rounded-lg p-3 border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(deleteConfirmation.person?.fullName || "")}`}>
                                        {deleteConfirmation.person?.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>{deleteConfirmation.person?.fullName}</div>
                                        <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{deleteConfirmation.person?.userCode}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button onClick={closeDeleteConfirmation} disabled={deleteConfirmation.isDeleting} className={`flex-1 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? "bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white" : "bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300 text-gray-900"}`}>
                                Cancelar
                            </button>
                            <button onClick={deletePerson} disabled={deleteConfirmation.isDeleting} className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors">
                                {deleteConfirmation.isDeleting ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification.show && (
                <div
                    className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 rounded-lg p-4 shadow-lg border ${
                        notification.type === "success" ? "bg-green-800 border-green-600 text-green-100" : "bg-red-800 border-red-600 text-red-100"
                    }`}
                >
                    <p className="text-sm font-medium">{notification.message}</p>
                </div>
            )}
        </div>
    )
}