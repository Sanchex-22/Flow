"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import ReportModal from "./components/ReportModal"
import * as XLSX from "xlsx" 

const { VITE_API_URL } = import.meta.env
const fetcher = (url: string) => fetch(url).then((res) => res.json())

// --- TIPOS DE DATOS ---
// Se añade 'reportKey' para identificar el reporte y 'apiData' para la descarga.
export type Report = {
  id: number
  titulo: string
  descripcion: string
  icono: string
  estado: "Actualizado" | "Pendiente"
  tipo: string
  ultimaActualizacion: string
  reportKey: string
  apiData: any[]
}

// Estructura esperada de la respuesta de la API
export type ApiReport = {
  title: string
  type: string
  data: any[]
}

type DashboardApiResponse = {
  [key: string]: ApiReport
}

// --- FUNCIONES DE AYUDA (HELPERS) ---

// Mapeo para añadir metadatos (descripción, icono) a los reportes de la API
const reportMetadata: { [key: string]: { descripcion: string; icono: string; estado: "Actualizado" | "Pendiente" } } = {
  inventoryReport: { descripcion: "Distribución de equipos por tipo y estado", icono: "cube", estado: "Actualizado" },
  maintenanceCostsReport: { descripcion: "Análisis de gastos en mantenimiento mensual", icono: "dollar", estado: "Actualizado" },
  userAssignmentsReport: { descripcion: "Equipos asignados por departamento y usuario", icono: "users", estado: "Pendiente" },
  maintenanceHistoryReport: { descripcion: "Registro completo de mantenimientos realizados", icono: "wrench", estado: "Actualizado" },
  warrantyReport: { descripcion: "Lista de equipos con garantía próxima a vencer", icono: "calendar", estado: "Actualizado" },
  itPerformanceReport: { descripcion: "Métricas de eficiencia y productividad", icono: "chart", estado: "Pendiente" },
}

// Función para obtener los iconos SVG
const getIcon = (iconName: string) => {
  const iconProps = {
    className: "w-full h-full",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const; // <--- LA SOLUCIÓN ESTÁ AQUÍ

  switch (iconName) {
    case "cube":
      return (
        <svg {...iconProps}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      );
    case "dollar":
      return (
        <svg {...iconProps}>
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      );
    case "users":
      return (
        <svg {...iconProps}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      );
    case "wrench":
      return (
        <svg {...iconProps}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      );
    case "calendar":
      return (
        <svg {...iconProps}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      );
    case "chart":
      return (
        <svg {...iconProps}>
          <path d="M3 3v18h18"></path>
          <path d="m19 9-5 5-4-4-3 3"></path>
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      );
  }
};

// --- COMPONENTE PRINCIPAL ---
export default function ReportsPage() {
  const { data, error, isLoading } = useSWR<DashboardApiResponse>(`${VITE_API_URL}/api/reports/all`, fetcher)
    // ESTADO PARA EL MODAL
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  // --- TRANSFORMACIÓN DE DATOS (Corregida para ser dinámica) ---
  const reportsData: Report[] = useMemo(() => {
    if (!data) return []

    // Itera sobre las llaves del objeto de respuesta de la API (ej: 'inventoryReport', 'maintenanceCostsReport')
    return Object.keys(data).map((key, index) => {
      const apiReport = data[key]
      const meta = reportMetadata[key] || { descripcion: "Descripción no disponible", icono: "default", estado: "Pendiente" }

      return {
        id: index + 1,
        titulo: apiReport.title,
        descripcion: meta.descripcion,
        icono: meta.icono,
        estado: meta.estado,
        tipo: apiReport.type,
        ultimaActualizacion: new Date().toISOString().split("T")[0],
        reportKey: key, // Guardamos la clave para referencias futuras
        apiData: apiReport.data, // Guardamos los datos crudos para la descarga
      }
    })
  }, [data])

  const reportesRapidos = [
    { titulo: "Inventario Actual", icono: "cube" },
    { titulo: "Mantenimientos Mes", icono: "wrench" },
    { titulo: "Asignaciones Activas", icono: "users" },
    { titulo: "Costos Mensuales", icono: "dollar" },
  ]

  // --- MANEJADORES DE EVENTOS PARA BOTONES ---
  const handleViewReport = (reporte: Report) => {
    setSelectedReport(reporte)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedReport(null)
  }

  const handleDownloadReport = (reporte: Report) => {
    if (!reporte.apiData || reporte.apiData.length === 0) {
      // Puedes usar una notificación más amigable si tienes un sistema para ello
      alert("No hay datos disponibles para descargar en este reporte.")
      return
    }

    // Paso 1: Crear una "hoja de trabajo" (worksheet) a partir de tus datos JSON
    const worksheet = XLSX.utils.json_to_sheet(reporte.apiData)

    // Paso 2: Crear un "libro de trabajo" (workbook) nuevo
    const workbook = XLSX.utils.book_new()

    // Paso 3: Añadir la hoja de trabajo al libro, dándole un nombre a la pestaña (ej: "Datos")
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos")

    // Paso 4: Generar el archivo .xlsx y disparar la descarga
    // El nombre del archivo será algo como "inventoryReport.xlsx"
    XLSX.writeFile(workbook, `${reporte.reportKey}.xlsx`)
  }


  // --- FUNCIONES DE ESTILO (sin cambios) ---
  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Actualizado":
        return "bg-green-600 text-green-100"
      case "Pendiente":
        return "bg-yellow-600 text-yellow-100"
      default:
        return "bg-gray-600 text-gray-100"
    }
  }

  const getTypeBadge = (tipo: string) => {
    switch (tipo) {
      case "Inventario":
        return "bg-blue-600 text-blue-100"
      case "Financiero":
        return "bg-green-600 text-green-100"
      case "Usuarios":
        return "bg-purple-600 text-purple-100"
      case "Mantenimiento":
        return "bg-orange-600 text-orange-100"
      case "Rendimiento":
        return "bg-cyan-600 text-cyan-100"
      default:
        return "bg-gray-600 text-gray-100"
    }
  }

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
            <h1 className="text-3xl font-bold">Reportes y Analíticas</h1>
            <p className="text-gray-400">Visualiza el rendimiento y estado de tus activos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading && <p className="col-span-full text-center text-gray-400">Cargando reportes...</p>}
        {error && <p className="col-span-full text-center text-red-500">Error al cargar los datos. Por favor, intente de nuevo.</p>}
        {data && reportsData.map((reporte) => (
          <div key={reporte.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 text-gray-400">{getIcon(reporte.icono)}</div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(reporte.estado)}`}>
                  {reporte.estado}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{reporte.titulo}</h3>
              <p className="text-gray-400 text-sm mb-4">{reporte.descripcion}</p>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-xs">Tipo:</span>
                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeBadge(reporte.tipo)}`}>
                    {reporte.tipo}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Última actualización:</span>
                  <span className="ml-2 text-sm">{reporte.ultimaActualizacion}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => handleViewReport(reporte)}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-1 mr-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span className="text-sm font-medium">Ver Reporte</span>
              </button>
              <button
                onClick={() => handleDownloadReport(reporte)}
                className="p-2.5 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <ReportModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        report={selectedReport}
      />
    </div>
  )
}