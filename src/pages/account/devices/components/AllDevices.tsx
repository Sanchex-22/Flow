"use client"

import useSWR, { mutate } from "swr"
import { useEffect, useState } from "react"
import * as XLSX from 'xlsx'
import { useTheme } from "../../../../context/themeContext"
import Loader from "../../../../components/loaders/loader"
import { useCompany } from "../../../../context/routerContext"
import { usePageName } from "../../../../hook/usePageName"
import PagesHeader from "../../../../components/headers/pagesHeader"
import { useSearch } from "../../../../context/searchContext"
import Tabla from "../../../../components/tables/Table"
import { X } from "lucide-react"

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
    assignedToPersonId?: string; // ✅ Cambiado
    assignedToPerson?: {         // ✅ Cambiado
        fullName: string | null;
        firstName: string | null;
        lastName: string | null;
        position: string | null;
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

interface DeleteConfirmation {
    show: boolean
    equipo: CreateEquipmentData | null
    isDeleting: boolean
}

export default function AllDevices() {
    const { isDarkMode } = useTheme()
    const { search } = useSearch()
    const [selectedType, ] = useState("Todos los...")
    const [activeTab, setActiveTab] = useState("Todos los Equipos")
    const { selectedCompany } = useCompany();
    const { pageName } = usePageName();
    const [notification, setNotification] = useState<Notification>({
        type: "success",
        message: "",
        show: false,
    })
    const { data, error, isLoading } = useSWR<CreateEquipmentData[]>(
        `${VITE_API_URL}/api/devices/${selectedCompany?.id}/all`,
        fetcher
    )
    const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
        show: false,
        equipo: null,
        isDeleting: false,
    })

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification((prev) => ({ ...prev, show: false }))
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [notification.show])

    const exportToExcel = () => {
        const excelData = filteredEquipos.map((equipo) => ({
            'Modelo': equipo?.model || 'N/A',
            'Marca': equipo?.brand || 'N/A',
            'Número de Placa': equipo?.plateNumber || 'N/A',
            'Número de Serie': equipo?.serialNumber || 'N/A',
            // ✅ Cambiado: assignedToPerson en lugar de assignedToUser.person
            'Persona Asignada': equipo?.assignedToPerson?.fullName || 'Sin asignar',
            'Empresa': equipo?.company?.name || 'N/A',
            'Ubicación': equipo?.location || 'N/A',
            'Estado': equipo?.status || 'Activo',
            'Garantía': equipo?.warrantyDetails || 'N/A',
            'Costo': equipo?.cost || 'N/A',
            'Tipo': equipo?.type || 'N/A',
            'Fecha de Adquisición': equipo?.acquisitionDate || 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Equipos');

        const maxWidth = 50;
        const columnWidths = Object.keys(excelData[0] || {}).map(key => {
            const maxLength = Math.max(
                key.length,
                ...excelData.map(row => String(row[key as keyof typeof row]).length)
            );
            return { wch: Math.min(maxLength + 2, maxWidth) };
        });
        worksheet['!cols'] = columnWidths;

        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `equipos_${timestamp}.xlsx`);
        showNotification("success", `Archivo Excel exportado exitosamente con ${filteredEquipos.length} equipos.`);
    };

    if (isLoading) return <Loader />

    if (error || !data) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors ${
                isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
            }`}>
                <span>Error al cargar los dispositivos.</span>
            </div>
        )
    }

    const equipos = Array.isArray(data) ? data : [];

    const filteredEquipos = equipos.filter(equipo => {
        const searchTermLower = search.toLowerCase()
        const matchesSearch =
            equipo?.model?.toLowerCase()?.includes(searchTermLower) ||
            equipo?.brand?.toLowerCase()?.includes(searchTermLower) ||
            equipo?.serialNumber?.toLowerCase()?.includes(searchTermLower) ||
            // ✅ Cambiado: assignedToPerson en lugar de assignedToUser.person
            equipo?.assignedToPerson?.fullName?.toLowerCase()?.includes(searchTermLower) ||
            equipo?.plateNumber?.toLowerCase()?.includes(searchTermLower)

        const matchesType = selectedType === "Todos los..." || equipo?.type === selectedType

        return matchesSearch && matchesType
    })

    const totalEquipos = filteredEquipos.length
    // ✅ Cambiado: assignedToPersonId en lugar de assignedToUserId
    const enUso = filteredEquipos.filter(e => e.assignedToPersonId != null).length
    const disponibles = filteredEquipos.filter(e => !e.assignedToPersonId).length

    const getGarantiasPorVencer = () => {
        const proximos30Dias = new Date(new Date().setDate(new Date().getDate() + 30));
        return filteredEquipos.filter(equipo => {
            if (!equipo.warrantyDetails) return false;
            try {
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
                return isDarkMode ? "bg-blue-600 text-blue-100" : "bg-blue-100 text-blue-800"
            case "Mantenimiento":
                return isDarkMode ? "bg-yellow-600 text-yellow-100" : "bg-yellow-100 text-yellow-800"
            case "Activo":
                return isDarkMode ? "bg-green-600 text-green-100" : "bg-green-100 text-green-800"
            default:
                return isDarkMode ? "bg-gray-600 text-gray-100" : "bg-gray-200 text-gray-800"
        }
    }

    const showNotification = (type: NotificationType, message: string) => {
        setNotification({ type, message, show: true })
    }

    const openDeleteConfirmation = (equipo: CreateEquipmentData) => {
        setDeleteConfirmation({ show: true, equipo, isDeleting: false })
    }

    const closeDeleteConfirmation = () => {
        if (!deleteConfirmation.isDeleting) {
            setDeleteConfirmation({ show: false, equipo: null, isDeleting: false })
        }
    }

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

            mutate(`${VITE_API_URL}/api/devices/${selectedCompany?.id}/all`)
            showNotification("success", `Equipo ${deleteConfirmation.equipo.model} eliminado exitosamente.`)
            closeDeleteConfirmation()
        } catch (error: any) {
            console.error("Error al eliminar equipo:", error)
            showNotification("error", error.message || "Error inesperado al eliminar el equipo.")
            setDeleteConfirmation((prev) => ({ ...prev, isDeleting: false }))
        }
    }

    const columnConfig = {
        "Equipo": (item: CreateEquipmentData) => (
            <div>
                <div className="font-medium">{item?.model || "N/A"}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item?.brand || "N/A"}
                </div>
                <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {item?.plateNumber || "N/A"} | {item?.serialNumber || "N/A"}
                </div>
            </div>
        ),
        "Persona/Ubicación": (item: CreateEquipmentData) => ( // ✅ Label actualizado
            <div className="flex items-start space-x-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
                </svg>
                <div>
                    {/* ✅ Cambiado: assignedToPerson en lugar de assignedToUser.person */}
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item?.assignedToPerson?.fullName || "Sin asignar"}
                    </div>
                    {item?.assignedToPerson?.position && (
                        <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {item.assignedToPerson.position}
                        </div>
                    )}
                    <div className={`flex items-center space-x-1 text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{item?.company?.name || "N/A"}</span>
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        {item?.location || "N/A"}
                    </div>
                </div>
            </div>
        ),
        "Estado": (item: CreateEquipmentData) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status || "Activo")}`}>
                {item?.status || "Activo"}
            </span>
        ),
        "Garantía": (item: CreateEquipmentData) => (
            <div className={`flex items-center space-x-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{item?.warrantyDetails || "N/A"}</span>
            </div>
        ),
        "Costo": (item: CreateEquipmentData) => (
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item?.cost || "N/A"}
            </span>
        ),
    };

    const getTabData = () => {
        switch (activeTab) {
            case 'Todos los Equipos':
                return filteredEquipos;
            case 'Asignaciones':
                // ✅ Cambiado: assignedToPersonId en lugar de assignedToUserId
                return filteredEquipos.filter(e => e.assignedToPersonId);
            case 'Garantías':
                return filteredEquipos.filter(e => e.warrantyDetails);
            default:
                return filteredEquipos;
        }
    };

    return (
        <div className={`transition-colors ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>

            {/* Notificación */}
            {notification.show && (
                <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white max-w-sm z-50 transition-transform transform ${notification.show ? 'translate-x-0' : 'translate-x-full'} ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    <p className="font-bold">{notification.type === 'success' ? 'Éxito' : 'Error'}</p>
                    <p>{notification.message}</p>
                </div>
            )}

            {/* Modal de Confirmación de Borrado */}
            {deleteConfirmation.show && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40">
                    <div className={`rounded-lg p-8 shadow-2xl max-w-md w-full border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Confirmar Eliminación
                            </h2>
                            <button
                                onClick={closeDeleteConfirmation}
                                disabled={deleteConfirmation.isDeleting}
                                className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            ¿Estás seguro de que quieres eliminar el equipo{" "}
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {deleteConfirmation.equipo?.model} ({deleteConfirmation.equipo?.serialNumber})
                            </span>? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={closeDeleteConfirmation}
                                disabled={deleteConfirmation.isDeleting}
                                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'}`}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={deleteEquipment}
                                disabled={deleteConfirmation.isDeleting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-white"
                            >
                                {deleteConfirmation.isDeleting && (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                {deleteConfirmation.isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PagesHeader
                title={`Equipos`}
                description={pageName ? `${pageName} in ${selectedCompany?.name}` : "Cargando compañía..."}
                onExport={exportToExcel}
                showCreate
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className={`rounded-lg p-6 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Equipos</span>
                        <div className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                <line x1="8" y1="21" x2="16" y2="21" />
                                <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                        </div>
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalEquipos}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>En {selectedCompany?.name}</div>
                </div>

                <div className={`rounded-lg p-6 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>En Uso</span>
                        <div className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
                            </svg>
                        </div>
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{enUso}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Equipos asignados</div>
                </div>

                <div className={`rounded-lg p-6 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Disponibles</span>
                        <div className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                <line x1="8" y1="21" x2="16" y2="21" />
                                <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                        </div>
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{disponibles}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sin asignar</div>
                </div>

                <div className={`rounded-lg p-6 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Garantías por Vencer</span>
                        <div className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                <path d="M12 9v4" />
                                <path d="m12 17 .01 0" />
                            </svg>
                        </div>
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{garantiasPorVencer}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Próximos 30 días</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className={`flex space-x-1 p-1 rounded-lg w-fit transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    {['Todos los Equipos', 'Asignaciones', 'Garantías'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                activeTab === tab
                                    ? isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                                    : isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <Tabla
                datos={getTabData()}
                titulo={`${pageName || "Dispositivos"} List`}
                columnasPersonalizadas={columnConfig}
                onEditar={(item) => window.location.href = `edit/${item.id}`}
                onEliminar={openDeleteConfirmation}
                mostrarAcciones={true}
            />
        </div>
    )
}