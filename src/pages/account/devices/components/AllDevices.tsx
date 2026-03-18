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
import { X } from "lucide-react"
import Tabla from "../../../../components/tables/Table"
import CambioSelectorModal from "./CambioSelectorModal"
import DeliveryActaGenerator from "./DeliveryPDFGenerator"
import { useTranslation } from "react-i18next"

const { VITE_API_URL } = import.meta.env
const fetcher = (url: string) =>
    fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt") || ""}` },
    }).then((res) => res.json())

export interface CreateEquipmentData {
    id: string
    type: string
    brand: string
    model: string
    serialNumber: string
    plateNumber: string
    location?: string
    status?: string
    acquisitionDate?: string
    warrantyDetails?: string
    qrCode?: string
    cost?: number
    companyId: string
    company: {
        name: string
    }
    assignedToPersonId?: string
    assignedToPerson?: {
        fullName: string | null
        firstName: string | null
        lastName: string | null
        position: string | null
    }
    endUser?: string
    operatingSystem?: string
    createdAt?: string | Date
    updatedAt?: string | Date
    _count?: {
        maintenances?: number
        documents?: number
    }
}

interface Department {
    id: string
    name: string
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

type ActaType = 'entrega' | 'retiro' | 'cambio'

interface ActaState {
    actaType: ActaType
    equiposEntregados: CreateEquipmentData[]
    equiposRetirados: CreateEquipmentData[]
    showModal: boolean
}

interface Company {
    id?: string
    name: string
    code?: string
}

const formatDate = (date: string | Date | undefined): string => {
    if (!date) return "-"
    try {
        const d = new Date(date)
        return d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
    } catch {
        return "-"
    }
}

export default function AllDevices() {
    const { isDarkMode } = useTheme()
    const { t } = useTranslation()
    const { search } = useSearch()
    const [selectedType, setSelectedType] = useState<string>("todos")
    const [activeTab, setActiveTab] = useState<string>("Todos los Equipos")
    const { selectedCompany } = useCompany() as { selectedCompany: Company | null }
    const { pageName } = usePageName()
    const [notification, setNotification] = useState<Notification>({
        type: "success",
        message: "",
        show: false,
    })
    const { data, error, isLoading } = useSWR<CreateEquipmentData[]>(
        selectedCompany?.id ? `${VITE_API_URL}/api/devices/${selectedCompany.id}/all` : null,
        fetcher
    )
    const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
        show: false,
        equipo: null,
        isDeleting: false,
    })
    const [departments, setDepartments] = useState<Department[]>([])
    const [selectedDepartment, setSelectedDepartment] = useState<string>("todos")
    const [equipmentsToDeliver, setEquipmentsToDeliver] = useState<CreateEquipmentData[]>([])
    const [actaState, setActaState] = useState<ActaState>({
        actaType: 'entrega',
        equiposEntregados: [],
        equiposRetirados: [],
        showModal: false
    })
    const [showCambioSelector, setShowCambioSelector] = useState<boolean>(false)
    
    const equipos = Array.isArray(data) ? data : []
    const uniqueTypes = Array.from(new Set(equipos.map(e => e.type).filter(Boolean)))

    const filteredEquipos = equipos.filter(equipo => {
        const searchTermLower = search.toLowerCase()
        const matchesSearch =
            equipo?.model?.toLowerCase()?.includes(searchTermLower) ||
            equipo?.brand?.toLowerCase()?.includes(searchTermLower) ||
            equipo?.type?.toLowerCase()?.includes(searchTermLower) ||
            equipo?.serialNumber?.toLowerCase()?.includes(searchTermLower) ||
            equipo?.assignedToPerson?.fullName?.toLowerCase()?.includes(searchTermLower) ||
            equipo?.plateNumber?.toLowerCase()?.includes(searchTermLower) ||
            equipo?.endUser?.toLowerCase()?.includes(searchTermLower)

        const matchesType = selectedType === "todos" || equipo?.type === selectedType
        const matchesDepartment = selectedDepartment === "todos" || equipo?.location === selectedDepartment

        return matchesSearch && matchesType && matchesDepartment
    })

    // ✅ Cargar departamentos
    useEffect(() => {
        const fetchDepartments = async () => {
            if (!selectedCompany?.code) return
            try {
                const res = await fetch(`${VITE_API_URL}/api/companies/departments/by-code/${selectedCompany.code}`)
                if (res.ok) {
                    const data = await res.json()
                    setDepartments(Array.isArray(data) ? data : [])
                }
            } catch (error) {
                console.error("Error cargando departamentos:", error)
            }
        }
        fetchDepartments()
    }, [selectedCompany?.code])

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification((prev) => ({ ...prev, show: false }))
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [notification.show])

    const getDepartmentName = (departmentId: string | null | undefined): string => {
        if (!departmentId) return "-"
        const dept = departments.find(d => d.id === departmentId)
        return dept ? dept.name : departmentId
    }

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new()

        const summaryData: Record<string, unknown>[] = []

        const headerRow: Record<string, unknown> = {
            'Marca': 'Marca',
            'Modelo': 'Modelo',
            'Tipo': 'Tipo',
            'Placa': 'Placa',
            'Serie': 'Serie',
            'Departamento': 'Departamento',
            'Lo tiene': 'Lo tiene',
            'Usuario Final': 'Usuario Final',
            'Posición': 'Posición',
            'Estado': 'Estado',
            'Garantía': 'Garantía',
            'Creado': 'Creado',
            'Actualizado': 'Actualizado',
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
                'Usuario Final': equipo.endUser || '-',
                'Posición': equipo.assignedToPerson?.position || '-',
                'Estado': equipo.status || 'Activo',
                'Garantía': equipo.warrantyDetails || '-',
                'Creado': formatDate(equipo.createdAt),
                'Actualizado': formatDate(equipo.updatedAt),
                'Costo': equipo.cost ? `$${equipo.cost}` : '-',
                'Empresa': equipo.company?.name || '-',
            })
        })

        const wsSummary = XLSX.utils.json_to_sheet(summaryData)
        wsSummary['!cols'] = [15, 15, 12, 12, 15, 18, 20, 15, 15, 12, 12, 12, 12, 10, 15].map(
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
                    'Usuario Final': 'Usuario Final',
                    'Posición': 'Posición',
                    'Estado': 'Estado',
                    'Garantía': 'Garantía',
                    'Creado': 'Creado',
                    'Actualizado': 'Actualizado',
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
                        'Usuario Final': equipo.endUser || '-',
                        'Posición': equipo.assignedToPerson?.position || '-',
                        'Estado': equipo.status || 'Activo',
                        'Garantía': equipo.warrantyDetails || '-',
                        'Creado': formatDate(equipo.createdAt),
                        'Actualizado': formatDate(equipo.updatedAt),
                        'Costo': equipo.cost ? `$${equipo.cost}` : '-',
                    })
                })

                const totalCost = equiposInDept.reduce((sum, eq) => sum + Number(eq.cost || 0), 0)
                deptData.push({
                    'Marca': 'TOTAL',
                    'Modelo': '',
                    'Tipo': '',
                    'Placa': '',
                    'Serie': '',
                    'Lo tiene': '',
                    'Usuario Final': '',
                    'Posición': '',
                    'Estado': '',
                    'Garantía': '',
                    'Creado': '',
                    'Actualizado': '',
                    'Costo': `$${totalCost.toFixed(2)}`,
                })

                const wsDept = XLSX.utils.json_to_sheet(deptData)
                wsDept['!cols'] = [15, 15, 12, 12, 15, 20, 15, 15, 12, 12, 12, 12, 10].map(
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
            const typeItem = typeMap.get(type)!
            typeItem.count += 1
            typeItem.totalCost += Number(equipo.cost || 0)
        })

        let grandTotalCount = 0
        let grandTotalCost = 0

        Array.from(typeMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([type, typeItem]) => {
                const avgCost = typeItem.count > 0 ? (typeItem.totalCost / typeItem.count).toFixed(2) : '0'
                typeData.push({
                    'Tipo': type,
                    'Cantidad': typeItem.count,
                    'Costo Total': `$${typeItem.totalCost.toFixed(2)}`,
                    'Costo Promedio': `$${avgCost}`,
                })
                grandTotalCount += typeItem.count
                grandTotalCost += typeItem.totalCost
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
    }

    if (isLoading) return <Loader />

    if (error || !data) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors ${
                isDarkMode ? 'bg-[#1c1c1e] text-white' : 'bg-[#f5f5f7] text-gray-900'
            }`}>
                <span className="text-[13px] text-gray-400">Error loading devices.</span>
            </div>
        )
    }

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
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Error inesperado al eliminar el equipo."
            console.error("Error al eliminar equipo:", error)
            showNotification("error", errorMessage)
            setDeleteConfirmation((prev) => ({ ...prev, isDeleting: false }))
        }
    }

    const handleSelectForDelivery = (selectedItems: CreateEquipmentData[]) => {
        setEquipmentsToDeliver(selectedItems)
    }

    const columnConfig = {
        [t("devices.brand") + "/" + t("devices.model")]: (item: CreateEquipmentData) => (
            <div>
                <div className="font-medium">{item?.brand || "N/A"}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item?.model || "N/A"}
                </div>
            </div>
        ),
        [t("common.type")]: (item: CreateEquipmentData) => (
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item?.type || "N/A"}
            </span>
        ),
        [t("devices.serialNumber")]: (item: CreateEquipmentData) => (
            <div>
                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item?.plateNumber || "-"}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    {item?.serialNumber || "N/A"}
                </div>
            </div>
        ),
        [t("persons.department")]: (item: CreateEquipmentData) => (
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {getDepartmentName(item?.location) || "-"}
            </div>
        ),
        [t("devices.assignedTo")]: (item: CreateEquipmentData) => (
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
        [t("users.email")]: (item: CreateEquipmentData) => (
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item?.endUser || "-"}
            </span>
        ),
        [t("common.status")]: (item: CreateEquipmentData) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status || "Activo")}`}>
                {item?.status || "Activo"}
            </span>
        ),
        [t("maintenance.scheduledDate")]: (item: CreateEquipmentData) => (
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item?.warrantyDetails || "-"}
            </span>
        ),
        [t("common.date")]: (item: CreateEquipmentData) => (
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatDate(item?.createdAt)}
            </span>
        ),
        [t("common.description")]: (item: CreateEquipmentData) => (
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatDate(item?.updatedAt)}
            </span>
        ),
        [t("maintenance.cost")]: (item: CreateEquipmentData) => (
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                ${item?.cost || "-"}
            </span>
        ),
    }

    const getTabData = () => {
        switch (activeTab) {
            case 'Todos los Equipos':
                return filteredEquipos
            case 'Asignaciones':
                return filteredEquipos.filter(e => e.assignedToPersonId)
            case 'Garantías':
                return filteredEquipos.filter(e => e.warrantyDetails)
            default:
                return filteredEquipos
        }
    }

    return (
        <div className={`transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>

            {notification.show && (
                <div className={`fixed top-4 right-4 px-4 py-3 rounded-xl shadow-xl text-white text-[13px] max-w-sm z-50 transition-all ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    <p className="font-medium">{notification.message}</p>
                </div>
            )}

            {deleteConfirmation.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4">
                    <div className={`rounded-2xl p-6 shadow-2xl max-w-sm w-full border transition-colors ${isDarkMode ? 'bg-[#1c1c1e] border-white/[0.08]' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-[15px] font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Delete Device
                            </h2>
                            <button
                                onClick={closeDeleteConfirmation}
                                disabled={deleteConfirmation.isDeleting}
                                className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-[#636366] hover:text-white hover:bg-white/[0.06]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <p className={`text-[13px] mb-5 ${isDarkMode ? 'text-[#8e8e93]' : 'text-gray-600'}`}>
                            Are you sure you want to delete{" "}
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {deleteConfirmation.equipo?.model}
                            </span>
                            {" "}({deleteConfirmation.equipo?.serialNumber})?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={closeDeleteConfirmation}
                                disabled={deleteConfirmation.isDeleting}
                                className={`flex-1 py-2 rounded-xl text-[13px] font-medium transition-colors disabled:opacity-50 ${isDarkMode ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteEquipment}
                                disabled={deleteConfirmation.isDeleting}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-[13px] font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {deleteConfirmation.isDeleting && (
                                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                )}
                                {deleteConfirmation.isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PagesHeader
                title={t("devices.title")}
                description={pageName ? `${pageName} in ${selectedCompany?.name}` : t("common.loading")}
                onExport={exportToExcel}
                showCreate
            />

            {/* TABS Y FILTROS */}
            <div className="mb-4 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                    {/* Tab pills */}
                    <div className={`flex p-1 rounded-lg transition-colors ${isDarkMode ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
                        {[['Todos los Equipos', t("devices.all"), t("common.all")], ['Asignaciones', t("devices.assigned"), t("devices.assigned")], ['Garantías', t("devices.inWarranty"), t("devices.inWarranty")]].map(([tab, label, short]) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-2.5 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                                    activeTab === tab
                                        ? isDarkMode ? 'bg-[#2c2c2e] text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
                                        : isDarkMode ? 'text-[#8e8e93] hover:text-white' : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                <span className="hidden sm:inline">{label}</span>
                                <span className="sm:hidden">{short}</span>
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className={`w-px h-6 ${isDarkMode ? 'bg-white/[0.1]' : 'bg-gray-300'}`} />

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className={`px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors border ${
                            isDarkMode
                                ? 'bg-white/[0.06] border-white/[0.06] text-white'
                                : 'bg-white border-gray-200 text-gray-700'
                        }`}
                    >
                        <option value="todos">{t("common.type")}</option>
                        {uniqueTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className={`px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors border ${
                            isDarkMode
                                ? 'bg-white/[0.06] border-white/[0.06] text-white'
                                : 'bg-white border-gray-200 text-gray-700'
                        }`}
                    >
                        <option value="todos">{t("persons.department")}</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>

                    {/* Divider */}
                    <div className={`w-px h-6 ${isDarkMode ? 'bg-white/[0.1]' : 'bg-gray-300'}`} />

                    {/* ACTA BUTTONS */}
                    <button
                        onClick={() => {
                            if (equipmentsToDeliver.length === 0) return
                            setActaState({ actaType: 'entrega', equiposEntregados: equipmentsToDeliver, equiposRetirados: [], showModal: true })
                        }}
                        disabled={equipmentsToDeliver.length === 0}
                        title={`Delivery (${equipmentsToDeliver.length})`}
                        className={`px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                            equipmentsToDeliver.length > 0
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : isDarkMode ? 'bg-white/[0.04] text-[#48484a] cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        <span className="hidden sm:inline">Delivery</span>
                        {equipmentsToDeliver.length > 0 && <span className="bg-white/20 rounded px-1">{equipmentsToDeliver.length}</span>}
                    </button>
                    <button
                        onClick={() => {
                            if (equipmentsToDeliver.length === 0) return
                            setActaState({ actaType: 'retiro', equiposEntregados: [], equiposRetirados: equipmentsToDeliver, showModal: true })
                        }}
                        disabled={equipmentsToDeliver.length === 0}
                        title={`Pickup (${equipmentsToDeliver.length})`}
                        className={`px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                            equipmentsToDeliver.length > 0
                                ? 'bg-red-600 hover:bg-red-500 text-white'
                                : isDarkMode ? 'bg-white/[0.04] text-[#48484a] cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        <span className="hidden sm:inline">Pickup</span>
                        {equipmentsToDeliver.length > 0 && <span className="bg-white/20 rounded px-1">{equipmentsToDeliver.length}</span>}
                    </button>
                    <button
                        onClick={() => {
                            if (equipmentsToDeliver.length === 0) return
                            setShowCambioSelector(true)
                        }}
                        disabled={equipmentsToDeliver.length === 0}
                        title={`Swap (${equipmentsToDeliver.length})`}
                        className={`px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                            equipmentsToDeliver.length > 0
                                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                : isDarkMode ? 'bg-white/[0.04] text-[#48484a] cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                        <span className="hidden sm:inline">Swap</span>
                        {equipmentsToDeliver.length > 0 && <span className="bg-white/20 rounded px-1">{equipmentsToDeliver.length}</span>}
                    </button>
                </div>
            </div>

            {/* TABLA */}
            <Tabla
                datos={getTabData()}
                titulo={`${pageName || t("devices.title")} List`}
                columnasPersonalizadas={columnConfig}
                onEditar={(item) => window.location.href = `edit/${item.id}`}
                onEliminar={openDeleteConfirmation}
                mostrarAcciones={true}
                onSelectItemsForDelivery={handleSelectForDelivery}
                showSelectForDelivery={true}
            />

            {/* Modal Selector de Cambio */}
            {showCambioSelector && (
                <CambioSelectorModal
                    equipos={equipmentsToDeliver}
                    onConfirm={(equiposRetirados, equiposEntregados) => {
                        setActaState({
                            actaType: 'cambio',
                            equiposEntregados,
                            equiposRetirados,
                            showModal: true
                        })
                        setShowCambioSelector(false)
                    }}
                    onCancel={() => setShowCambioSelector(false)}
                />
            )}

            {/* Modal del Acta */}
            {actaState.showModal && selectedCompany && (
                <DeliveryActaGenerator
                    actaType={actaState.actaType}
                    equiposEntregados={actaState.equiposEntregados}
                    equiposRetirados={actaState.equiposRetirados}
                    company={selectedCompany}
                    departmentNameResolver={getDepartmentName}
                    onClose={() => setActaState({ ...actaState, showModal: false })}
                />
            )}
        </div>
    )
}