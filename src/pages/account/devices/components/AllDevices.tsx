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
    assignedToPersonId?: string;
    assignedToPerson?: {
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

interface Department {
    id: string;
    name: string;
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
    const [selectedType, setSelectedType] = useState<string>("todos")
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
    const [departments, setDepartments] = useState<Department[]>([])
    const [selectedDepartment, setSelectedDepartment] = useState<string>("todos")

    // ✅ Cargar departamentos
    useEffect(() => {
        const fetchDepartments = async () => {
            if (!selectedCompany?.code) return;
            try {
                const res = await fetch(`${VITE_API_URL}/api/companies/departments/by-code/${selectedCompany.code}`);
                if (res.ok) {
                    const data = await res.json();
                    setDepartments(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Error cargando departamentos:", error);
            }
        };
        fetchDepartments();
    }, [selectedCompany?.code]);

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification((prev) => ({ ...prev, show: false }))
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [notification.show])

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new()

        // ===== HOJA 1: RESUMEN GENERAL =====
        const summaryData: Record<string, unknown>[] = []

        const headerRow: Record<string, unknown> = {
            'Marca': 'Marca',
            'Modelo': 'Modelo',
            'Tipo': 'Tipo',
            'Placa': 'Placa',
            'Serie': 'Serie',
            'Departamento': 'Departamento',
            'Lo tiene': 'Lo tiene',
            'Posición': 'Posición',
            'Estado': 'Estado',
            'Garantía': 'Garantía',
            'Costo': 'Costo',
            'Empresa': 'Empresa',
        }
        summaryData.push(headerRow)

        filteredEquipos.forEach((equipo) => {
            summaryData.push({
                'Marca': equipo.brand || '-',
                'Modelo': equipo.model || '-',
                'Tipo': equipo.type || '-',
                'Placa': equipo.plateNumber || '-',
                'Serie': equipo.serialNumber || '-',
                'Departamento': getDepartmentName(equipo.location) || '-',
                'Lo tiene': equipo.assignedToPerson?.fullName || '-',
                'Posición': equipo.assignedToPerson?.position || '-',
                'Estado': equipo.status || 'Activo',
                'Garantía': equipo.warrantyDetails || '-',
                'Costo': equipo.cost ? `$${equipo.cost}` : '-',
                'Empresa': equipo.company?.name || '-',
            })
        })

        const wsSummary = XLSX.utils.json_to_sheet(summaryData)
        wsSummary['!cols'] = [15, 15, 12, 12, 15, 18, 20, 15, 12, 12, 10, 15].map(
            (w) => ({ wch: w })
        )

        const summaryRange = XLSX.utils.decode_range(wsSummary['!ref'] || 'A1')
        for (let col = 0; col <= summaryRange.e.c; col++) {
            const cellRef = XLSX.utils.encode_col(col) + '1'
            wsSummary[cellRef] = wsSummary[cellRef] || { t: 's', v: '' }
            wsSummary[cellRef].s = {
                fill: { fgColor: { rgb: '4472C4' } },
                font: { bold: true, color: { rgb: 'FFFFFF' } },
            }
        }

        for (let row = 2; row <= summaryRange.e.r; row++) {
            const rowColor = row % 2 === 0 ? 'FFFFFF' : 'F2F2F2'
            for (let col = 0; col <= summaryRange.e.c; col++) {
                const cellRef = XLSX.utils.encode_col(col) + row.toString()
                wsSummary[cellRef] = wsSummary[cellRef] || { t: 's', v: '' }
                wsSummary[cellRef].s = {
                    fill: { fgColor: { rgb: rowColor } },
                }
            }
        }

        wsSummary['!autofilter'] = { ref: XLSX.utils.encode_range(summaryRange) }

        XLSX.utils.book_append_sheet(wb, wsSummary, 'Todos los Dispositivos')

        // ===== HOJAS POR DEPARTAMENTO =====
        const departmentMap = new Map<string, CreateEquipmentData[]>()

        filteredEquipos.forEach((equipo) => {
            const deptName = getDepartmentName(equipo.location)
            if (!departmentMap.has(deptName)) {
                departmentMap.set(deptName, [])
            }
            departmentMap.get(deptName)!.push(equipo)
        })

        Array.from(departmentMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([deptName, equiposInDept]) => {
                const deptData: Record<string, unknown>[] = []

                const deptHeaderRow: Record<string, unknown> = {
                    'Marca': 'Marca',
                    'Modelo': 'Modelo',
                    'Tipo': 'Tipo',
                    'Placa': 'Placa',
                    'Serie': 'Serie',
                    'Lo tiene': 'Lo tiene',
                    'Posición': 'Posición',
                    'Estado': 'Estado',
                    'Garantía': 'Garantía',
                    'Costo': 'Costo',
                }
                deptData.push(deptHeaderRow)

                equiposInDept.forEach((equipo) => {
                    deptData.push({
                        'Marca': equipo.brand || '-',
                        'Modelo': equipo.model || '-',
                        'Tipo': equipo.type || '-',
                        'Placa': equipo.plateNumber || '-',
                        'Serie': equipo.serialNumber || '-',
                        'Lo tiene': equipo.assignedToPerson?.fullName || '-',
                        'Posición': equipo.assignedToPerson?.position || '-',
                        'Estado': equipo.status || 'Activo',
                        'Garantía': equipo.warrantyDetails || '-',
                        'Costo': equipo.cost ? `$${equipo.cost}` : '-',
                    })
                })

                const totalCost = equiposInDept.reduce((sum, eq) => sum + (eq.cost || 0), 0)
                deptData.push({
                    'Marca': 'TOTAL',
                    'Modelo': '',
                    'Tipo': '',
                    'Placa': '',
                    'Serie': '',
                    'Lo tiene': '',
                    'Posición': '',
                    'Estado': '',
                    'Garantía': '',
                    'Costo': `$${totalCost.toFixed(2)}`,
                })

                const wsDept = XLSX.utils.json_to_sheet(deptData)
                wsDept['!cols'] = [15, 15, 12, 12, 15, 20, 15, 12, 12, 10].map(
                    (w) => ({ wch: w })
                )

                const deptRange = XLSX.utils.decode_range(wsDept['!ref'] || 'A1')
                for (let col = 0; col <= deptRange.e.c; col++) {
                    const cellRef = XLSX.utils.encode_col(col) + '1'
                    wsDept[cellRef] = wsDept[cellRef] || { t: 's', v: '' }
                    wsDept[cellRef].s = {
                        fill: { fgColor: { rgb: '70AD47' } },
                        font: { bold: true, color: { rgb: 'FFFFFF' } },
                    }
                }

                const deptTotalRowIndex = deptData.length
                const deptTotalRowNumber = deptTotalRowIndex.toString()
                for (let col = 0; col <= deptRange.e.c; col++) {
                    const cellRef = XLSX.utils.encode_col(col) + deptTotalRowNumber
                    wsDept[cellRef] = wsDept[cellRef] || { t: 's', v: '' }
                    wsDept[cellRef].s = {
                        fill: { fgColor: { rgb: 'E2EFD9' } },
                        font: { bold: true },
                    }
                }

                for (let row = 2; row < deptTotalRowIndex; row++) {
                    const rowColor = row % 2 === 0 ? 'FFFFFF' : 'F2F2F2'
                    for (let col = 0; col <= deptRange.e.c; col++) {
                        const cellRef = XLSX.utils.encode_col(col) + row.toString()
                        wsDept[cellRef] = wsDept[cellRef] || { t: 's', v: '' }
                        wsDept[cellRef].s = {
                            fill: { fgColor: { rgb: rowColor } },
                        }
                    }
                }

                wsDept['!autofilter'] = { ref: XLSX.utils.encode_range(deptRange) }

                const sheetName = deptName === '-' ? 'Sin Departamento' : deptName.substring(0, 31)
                XLSX.utils.book_append_sheet(wb, wsDept, sheetName)
            })

        // ===== HOJA FINAL: RESUMEN POR TIPO =====
        const typeData: Record<string, unknown>[] = []
        const typeHeaderRow: Record<string, unknown> = {
            'Tipo': 'Tipo',
            'Cantidad': 'Cantidad',
            'Costo Total': 'Costo Total',
            'Costo Promedio': 'Costo Promedio',
        }
        typeData.push(typeHeaderRow)

        const typeMap = new Map<string, { count: number; totalCost: number }>()
        filteredEquipos.forEach((equipo) => {
            const type = equipo.type || 'Sin tipo'
            if (!typeMap.has(type)) {
                typeMap.set(type, { count: 0, totalCost: 0 })
            }
            const data = typeMap.get(type)!
            data.count += 1
            data.totalCost += equipo.cost || 0
        })

        let grandTotalCount = 0
        let grandTotalCost = 0

        Array.from(typeMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([type, data]) => {
                const avgCost = data.count > 0 ? (data.totalCost / data.count).toFixed(2) : '0'
                typeData.push({
                    'Tipo': type,
                    'Cantidad': data.count,
                    'Costo Total': `$${data.totalCost.toFixed(2)}`,
                    'Costo Promedio': `$${avgCost}`,
                })
                grandTotalCount += data.count
                grandTotalCost += data.totalCost
            })

        typeData.push({
            'Tipo': 'TOTAL',
            'Cantidad': grandTotalCount,
            'Costo Total': `$${grandTotalCost.toFixed(2)}`,
            'Costo Promedio': grandTotalCount > 0 ? `$${(grandTotalCost / grandTotalCount).toFixed(2)}` : '$0',
        })

        const wsType = XLSX.utils.json_to_sheet(typeData)
        wsType['!cols'] = [20, 12, 15, 18].map((w) => ({ wch: w }))

        const typeRange = XLSX.utils.decode_range(wsType['!ref'] || 'A1')
        for (let col = 0; col <= typeRange.e.c; col++) {
            const cellRef = XLSX.utils.encode_col(col) + '1'
            wsType[cellRef] = wsType[cellRef] || { t: 's', v: '' }
            wsType[cellRef].s = {
                fill: { fgColor: { rgb: 'ED7D31' } },
                font: { bold: true, color: { rgb: 'FFFFFF' } },
            }
        }

        const typeTotalRowIndex = typeData.length
        const typeTotalRowNumber = typeTotalRowIndex.toString()
        for (let col = 0; col <= typeRange.e.c; col++) {
            const cellRef = XLSX.utils.encode_col(col) + typeTotalRowNumber
            wsType[cellRef] = wsType[cellRef] || { t: 's', v: '' }
            wsType[cellRef].s = {
                fill: { fgColor: { rgb: 'FCE4D6' } },
                font: { bold: true },
            }
        }

        for (let row = 2; row < typeTotalRowIndex; row++) {
            const rowColor = row % 2 === 0 ? 'FFFFFF' : 'F2F2F2'
            for (let col = 0; col <= typeRange.e.c; col++) {
                const cellRef = XLSX.utils.encode_col(col) + row.toString()
                wsType[cellRef] = wsType[cellRef] || { t: 's', v: '' }
                wsType[cellRef].s = {
                    fill: { fgColor: { rgb: rowColor } },
                }
            }
        }

        wsType['!autofilter'] = { ref: XLSX.utils.encode_range(typeRange) }

        XLSX.utils.book_append_sheet(wb, wsType, 'Resumen por Tipo')

        const timestamp = new Date().toISOString().split('T')[0]
        XLSX.writeFile(wb, `dispositivos_${timestamp}.xlsx`)
        showNotification("success", `Archivo Excel exportado exitosamente con ${filteredEquipos.length} dispositivos.`)
    };

    // ✅ Función para obtener nombre del departamento
    const getDepartmentName = (departmentId: string | null | undefined): string => {
        if (!departmentId) return "-";
        const dept = departments.find(d => d.id === departmentId);
        return dept ? dept.name : departmentId;
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
    const uniqueTypes = Array.from(new Set(equipos.map(e => e.type).filter(Boolean)));

    const filteredEquipos = equipos.filter(equipo => {
        const searchTermLower = search.toLowerCase()
        const matchesSearch =
            equipo?.model?.toLowerCase()?.includes(searchTermLower) ||
            equipo?.brand?.toLowerCase()?.includes(searchTermLower) ||
            equipo?.type?.toLowerCase()?.includes(searchTermLower) ||
            equipo?.serialNumber?.toLowerCase()?.includes(searchTermLower) ||
            equipo?.assignedToPerson?.fullName?.toLowerCase()?.includes(searchTermLower) ||
            equipo?.plateNumber?.toLowerCase()?.includes(searchTermLower)

        const matchesType = selectedType === "todos" || equipo?.type === selectedType
        const matchesDepartment = selectedDepartment === "todos" || equipo?.location === selectedDepartment

        return matchesSearch && matchesType && matchesDepartment
    })

    // ✅ CÁLCULOS DETALLADOS DE KPIs
    const totalEquipos = filteredEquipos.length
    const enUso = filteredEquipos.filter(e => e.assignedToPersonId != null).length
    const disponibles = filteredEquipos.filter(e => !e.assignedToPersonId).length
    const activos = filteredEquipos.filter(e => e.status === "Activo").length
    const enMantenimiento = filteredEquipos.filter(e => e.status === "Mantenimiento").length
    const dañados = filteredEquipos.filter(e => e.status === "DAMAGED").length
    const totalCost = filteredEquipos.reduce((sum, e) => sum + (e.cost || 0), 0)

    // Garantías
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

    // Usuario con más equipos
    const getUserStats = () => {
        const userMap = new Map<string, number>();
        filteredEquipos.forEach(e => {
            const user = e.assignedToPerson?.fullName || "Sin asignar";
            userMap.set(user, (userMap.get(user) || 0) + 1);
        });
        const sorted = Array.from(userMap.entries()).sort((a, b) => b[1] - a[1]);
        return {
            max: sorted[0] || ["Sin datos", 0],
            min: sorted[sorted.length - 1] || ["Sin datos", 0]
        };
    };
    const userStats = getUserStats();

    // Departamento con más equipos
    const getDeptStats = () => {
        const deptMap = new Map<string, number>();
        filteredEquipos.forEach(e => {
            const dept = getDepartmentName(e.location);
            deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
        });
        const sorted = Array.from(deptMap.entries()).sort((a, b) => b[1] - a[1]);
        return sorted.slice(0, 3);
    };
    const topDepts = getDeptStats();

    // Equipos por tipo
    const getTypeStats = () => {
        const typeMap = new Map<string, number>();
        filteredEquipos.forEach(e => {
            const type = e.type || "Sin tipo";
            typeMap.set(type, (typeMap.get(type) || 0) + 1);
        });
        return Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1]);
    };
    const typeStats = getTypeStats();

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
        "Marca/Modelo": (item: CreateEquipmentData) => (
            <div>
                <div className="font-medium">{item?.brand || "N/A"}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item?.model || "N/A"}
                </div>
            </div>
        ),
        "Tipo": (item: CreateEquipmentData) => (
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item?.type || "N/A"}
            </span>
        ),
        "Placa/Serie": (item: CreateEquipmentData) => (
            <div>
                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item?.plateNumber || "-"}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    {item?.serialNumber || "N/A"}
                </div>
            </div>
        ),
        "Departamento": (item: CreateEquipmentData) => (
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {getDepartmentName(item?.location) || "-"}
            </div>
        ),
        "Lo tiene": (item: CreateEquipmentData) => (
            <div>
                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item?.assignedToPerson?.fullName || "-"}
                </div>
                {item?.assignedToPerson?.position && (
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.assignedToPerson.position}
                    </div>
                )}
            </div>
        ),
        "Estado": (item: CreateEquipmentData) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status || "Activo")}`}>
                {item?.status || "Activo"}
            </span>
        ),
        "Garantía": (item: CreateEquipmentData) => (
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item?.warrantyDetails || "-"}
            </span>
        ),
        "Costo": (item: CreateEquipmentData) => (
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                ${item?.cost || "-"}
            </span>
        ),
    };

    const getTabData = () => {
        switch (activeTab) {
            case 'Todos los Equipos':
                return filteredEquipos;
            case 'Asignaciones':
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
                            ¿Estás seguro de que quieres eliminar el dispositivo{" "}
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
                title={`Dispositivos`}
                description={pageName ? `${pageName} in ${selectedCompany?.name}` : "Cargando compañía..."}
                onExport={exportToExcel}
                showCreate
            />

            {/* ===== KPIs PRINCIPALES (Fila 1) ===== */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-3">
                {/* Total */}
                <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</span>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalEquipos}</div>
                </div>

                {/* En Uso */}
                <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>En Uso</span>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{enUso}</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{totalEquipos > 0 ? ((enUso / totalEquipos) * 100).toFixed(0) : 0}%</div>
                </div>

                {/* Disponibles */}
                <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Disponibles</span>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{disponibles}</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{totalEquipos > 0 ? ((disponibles / totalEquipos) * 100).toFixed(0) : 0}%</div>
                </div>

                {/* Activos */}
                <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Activos</span>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-500' : 'text-green-700'}`}>{activos}</div>
                </div>

                {/* En Mantenimiento */}
                <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Mant.</span>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{enMantenimiento}</div>
                </div>

                {/* Dañados */}
                <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dañados</span>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{dañados}</div>
                </div>

                {/* Garantías */}
                <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Garantías</span>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{garantiasPorVencer}</div>
                </div>

                {/* Costo Total */}
                <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Costo</span>
                    <div className={`text-lg font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>${(totalCost / 1000).toFixed(1)}k</div>
                </div>
            </div>

            {/* ===== ANÁLISIS POR USUARIO (Fila 2) ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                {/* Usuario con más equipos */}
                <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>👤 Más Equipos</span>
                    <div className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userStats.max[0]}</div>
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{userStats.max[1]}</div>
                </div>

                {/* Departamentos top 3 */}
                <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>📍 Top Deptos</span>
                    {topDepts.slice(0, 3).map((dept, idx) => (
                        <div key={idx} className={`text-xs truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {dept[0]}: <span className="font-bold">{dept[1]}</span>
                        </div>
                    ))}
                </div>

                {/* Tipos de equipos */}
                <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>🖥️ Tipos</span>
                    {typeStats.slice(0, 3).map((type, idx) => (
                        <div key={idx} className={`text-xs truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {type[0]}: <span className="font-bold">{type[1]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== TABS Y FILTROS ===== */}
            <div className="mb-3 flex flex-col md:flex-row gap-3 items-start md:items-center flex-wrap">
                <div className={`flex space-x-1 p-1 rounded-lg w-fit transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    {['Todos los Equipos', 'Asignaciones', 'Garantías'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                activeTab === tab
                                    ? isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                                    : isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Filtro por Tipo */}
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        isDarkMode
                            ? 'bg-gray-800 border border-gray-700 text-white'
                            : 'bg-white border border-gray-300 text-gray-900'
                    }`}
                >
                    <option value="todos">🖥️ Todos</option>
                    {uniqueTypes.map(type => (
                        <option key={type} value={type}>
                            🖥️ {type}
                        </option>
                    ))}
                </select>

                {/* Filtro por Departamento */}
                <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        isDarkMode
                            ? 'bg-gray-800 border border-gray-700 text-white'
                            : 'bg-white border border-gray-300 text-gray-900'
                    }`}
                >
                    <option value="todos">📍 Todos</option>
                    {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                            📍 {dept.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* ===== TABLA ===== */}
            <div className="px-0">
                <Tabla
                    datos={getTabData()}
                    titulo={`${pageName || "Dispositivos"} List`}
                    columnasPersonalizadas={columnConfig}
                    onEditar={(item) => window.location.href = `edit/${item.id}`}
                    onEliminar={openDeleteConfirmation}
                    mostrarAcciones={true}
                />
            </div>
        </div>
    )
}