"use client"

import useSWR, { mutate } from "swr"
import { useEffect, useState } from "react"
import Loader from "../../../../components/loaders/loader"

const { VITE_API_URL } = import.meta.env
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface CreateEquipmentData {
    id: string;
    type: string;
    brand: string;
    model: string;
    serialNumber: string;
    plateNumber: string;
    location?: string;
    status?: string;
    acquisitionDate?: string;
    warrantyDetails?: string;
    qrCode?: string;
    cost?: number;
    companyId: string;
    company: {
        name: string;
    }
    assignedToUserId?: string;
    assignedToUser?: {
        username: string;
        person: {
            fullName: string;
        }
    }
    _count?: {
        maintenances?: number;
        documents?: number;
    }
}

type NotificationType = "success" | "error"

interface Notification {
    type: NotificationType
    message: string
    show: boolean
}

// Tipos para el modal de confirmación
interface DeleteConfirmation {
    show: boolean
    equipo: CreateEquipmentData | null
    isDeleting: boolean
}

export default function AllDevices() {
    // =========================================================
    // CORRECCIÓN: Todos los Hooks se declaran al inicio del componente
    // =========================================================
    const { data, error, isLoading } = useSWR<CreateEquipmentData[]>(`${VITE_API_URL}/api/devices/all`, fetcher)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedType, setSelectedType] = useState("Todos los...")
    const [activeTab, setActiveTab] = useState("Todos los Equipos")

    // Estados para notificaciones
    const [notification, setNotification] = useState<Notification>({
        type: "success",
        message: "",
        show: false,
    })

    // Estados para el modal de confirmación
    const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
        show: false,
        equipo: null,
        isDeleting: false,
    })

    // Auto-ocultar notificación después de 5 segundos
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification((prev) => ({ ...prev, show: false }))
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [notification.show])


    // =========================================================
    // La lógica condicional de renderizado ahora está después de los Hooks
    // =========================================================
    if (isLoading) {
        return (
            <Loader/>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <span>Error al cargar los dispositivos.</span>
            </div>
        )
    }
    
    // El resto de la lógica y variables que dependen de `data` permanecen aquí
    const equipos = data || []

    const filteredEquipos = equipos.filter(equipo => {
        const searchTermLower = searchTerm.toLowerCase()
        const matchesSearch =
            equipo.model.toLowerCase().includes(searchTermLower) ||
            equipo.brand.toLowerCase().includes(searchTermLower) ||
            equipo.serialNumber.toLowerCase().includes(searchTermLower) ||
            equipo.assignedToUser?.person.fullName.toLowerCase().includes(searchTermLower) ||
            equipo.plateNumber.toLowerCase().includes(searchTermLower)

        const matchesType = selectedType === "Todos los..." || equipo.type === selectedType

        return matchesSearch && matchesType
    })

    const totalEquipos = filteredEquipos.length
    const enUso = filteredEquipos.filter(e => e.assignedToUserId !== null).length
    const disponibles = filteredEquipos.filter(e => !e.assignedToUserId).length

    const getGarantiasPorVencer = () => {
        const proximos30Dias = new Date(new Date().setDate(new Date().getDate() + 30));
        return filteredEquipos.filter(equipo => {
            if (!equipo.warrantyDetails) return false;
            try {
                // Evitar parsear fechas inválidas
                if (isNaN(new Date(equipo.warrantyDetails).getTime())) return false;
                const fechaGarantia = new Date(equipo.warrantyDetails);
                return fechaGarantia <= proximos30Dias && fechaGarantia >= new Date();
            } catch (e) {
                return false;
            }
        }).length;
    }
    const garantiasPorVencer = getGarantiasPorVencer();


    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case "En Uso":
                return "bg-blue-600 text-blue-100"
            case "Mantenimiento":
                return "bg-yellow-600 text-yellow-100"
            case "Activo":
                return "bg-green-600 text-green-100"
            default:
                return "bg-gray-600 text-gray-100"
        }
    }

    // Función para mostrar notificaciones
    const showNotification = (type: NotificationType, message: string) => {
        setNotification({
            type,
            message,
            show: true,
        })
    }

    // Función para abrir el modal de confirmación
    const openDeleteConfirmation = (equipo: CreateEquipmentData) => {
        setDeleteConfirmation({
            show: true,
            equipo,
            isDeleting: false,
        })
    }

    // Función para cerrar el modal de confirmación
    const closeDeleteConfirmation = () => {
        if (!deleteConfirmation.isDeleting) {
            setDeleteConfirmation({
                show: false,
                equipo: null,
                isDeleting: false,
            })
        }
    }

    // Lógica de eliminación
    const deleteEquipment = async () => {
        if (!deleteConfirmation.equipo) return

        setDeleteConfirmation((prev) => ({ ...prev, isDeleting: true }))

        try {
            const response = await fetch(`${VITE_API_URL}/api/devices/${deleteConfirmation.equipo.id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Error al eliminar el equipo")
            }

            mutate(`${VITE_API_URL}/api/devices/all`)
            showNotification("success", `Equipo ${deleteConfirmation.equipo.model} eliminado exitosamente.`)
            closeDeleteConfirmation()
        } catch (error: any) {
            console.error("Error al eliminar equipo:", error)
            showNotification("error", error.message || "Error inesperado al eliminar el equipo.")
            setDeleteConfirmation((prev) => ({ ...prev, isDeleting: false }))
        }
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'Todos los Equipos':
                return renderTable(filteredEquipos);
            case 'Asignaciones':
                return renderTable(filteredEquipos.filter(e => e.assignedToUserId));
            case 'Garantías':
                return renderTable(filteredEquipos.filter(e => e.warrantyDetails));
            default:
                return renderTable(filteredEquipos);
        }
    };

    const renderTable = (equiposToShow: CreateEquipmentData[]) => (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-750">
                    <tr className="border-b border-gray-700">
                        <th className="text-left p-4 text-sm font-medium text-gray-300">Equipo</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-300">Usuario/Ubicación</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-300">Estado</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-300">Garantía</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-300">Costo</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-300">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {equiposToShow.map((equipo, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-750">
                            <td className="p-4">
                                <div>
                                    <div className="font-medium">{equipo.model || "N/A"}</div>
                                    <div className="text-sm text-gray-400">{equipo.brand || "N/A"}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {equipo.plateNumber || "N/A"} | {equipo.serialNumber || "N/A"}
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex items-start space-x-2">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 text-gray-400">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
                                    </svg>
                                    <div>
                                        <div className="text-sm font-medium">{equipo.assignedToUser?.person.fullName || "Sin asignar"}</div>
                                        <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                            <span>{equipo.company.name || "N/A"}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{equipo.location || "N/A"}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(equipo.status || "Activo")}`}>
                                    {equipo.status || "Activo"}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center space-x-1 text-sm">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <span>{equipo.warrantyDetails || "N/A"}</span>
                                </div>
                            </td>
                            <td className="p-4 text-sm font-medium">{equipo.cost || "N/A"}</td>
                            <td className="p-4">
                                <div className="flex space-x-2">
                                    <a href={`edit/${equipo.id}`} className="p-1 text-gray-400 hover:text-white transition-colors">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </a>
                                    <button
                                        onClick={() => openDeleteConfirmation(equipo)}
                                        className="p-1 text-gray-400 hover:text-red-400 transition-colors">
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
    );


    return (
        <div>
            {/* Componente de Notificación */}
            {notification.show && (
                <div 
                    className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white max-w-sm z-50 transition-transform transform ${notification.show ? 'translate-x-0' : 'translate-x-full' } ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
                >
                    <p className="font-bold">{notification.type === 'success' ? 'Éxito' : 'Error'}</p>
                    <p>{notification.message}</p>
                </div>
            )}

            {/* Modal de Confirmación de Borrado */}
            {deleteConfirmation.show && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40">
                    <div className="bg-gray-800 rounded-lg p-8 shadow-2xl max-w-md w-full border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
                        <p className="text-gray-300 mb-6">
                            ¿Estás seguro de que quieres eliminar el equipo <span className="font-bold text-white">{deleteConfirmation.equipo?.model} ({deleteConfirmation.equipo?.serialNumber})</span>? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={closeDeleteConfirmation}
                                disabled={deleteConfirmation.isDeleting}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={deleteEquipment}
                                disabled={deleteConfirmation.isDeleting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteConfirmation.isDeleting && (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {deleteConfirmation.isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Page Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Gestión de Equipos - Empresa Principal S.A.</h1>
                    <p className="text-gray-400">Administra el ciclo de vida completo de los equipos tecnológicos</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7,10 12,15 17,10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span>Exportar</span>
                    </button>
                    <a href="create" className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Agregar Equipo</span>
                    </a>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Total Equipos</span>
                        <div className="w-6 h-6">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-400">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                <line x1="8" y1="21" x2="16" y2="21" />
                                <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{totalEquipos}</div>
                    <div className="text-sm text-gray-400">En Empresa Principal S.A.</div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">En Uso</span>
                        <div className="w-6 h-6">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-400">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{enUso}</div>
                    <div className="text-sm text-gray-400">Equipos asignados</div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Disponibles</span>
                        <div className="w-6 h-6">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-400">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                <line x1="8" y1="21" x2="16" y2="21" />
                                <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{disponibles}</div>
                    <div className="text-sm text-gray-400">Sin asignar</div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Garantías por Vencer</span>
                        <div className="w-6 h-6">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-yellow-400">
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                <path d="M12 9v4" />
                                <path d="m12 17 .01 0" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{garantiasPorVencer}</div>
                    <div className="text-sm text-gray-400">Próximos 30 días</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('Todos los Equipos')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'Todos los Equipos' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                        Todos los Equipos
                    </button>
                    <button
                        onClick={() => setActiveTab('Asignaciones')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'Asignaciones' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                        Asignaciones
                    </button>
                    <button
                        onClick={() => setActiveTab('Garantías')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'Garantías' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                        Garantías
                    </button>
                </div>
            </div>


            {/* Equipment List */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold mb-2">Lista de Equipos</h2>
                    <p className="text-gray-400 text-sm mb-6">{totalEquipos} equipos encontrados en Empresa Principal S.A.</p>

                    <div className="flex justify-between items-center">
                        <div className="relative flex-1 max-w-md">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar por nombre, marca, modelo, serie o usuario..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="ml-4">
                            <div className="relative">
                                <select
                                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    <option>Todos los...</option>
                                    <option>Laptop</option>
                                    <option>Desktop</option>
                                    <option>Impresora</option>
                                    <option>Switch</option>
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

                {renderContent()}
            </div>
        </div>
    )
}