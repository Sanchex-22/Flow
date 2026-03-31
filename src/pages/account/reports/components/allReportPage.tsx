"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import ReportModal from "./ReportModal"
import * as XLSX from "xlsx"
import { useCompany } from "../../../../context/routerContext"
import Loader from "../../../../components/loaders/loader"
import { usePageName } from "../../../../hook/usePageName"
import { useTheme } from "../../../../context/themeContext"
import {
  Box, DollarSign, Users, Wrench, Calendar, BarChart2,
  Eye, Download, AlertCircle, FileText
} from "lucide-react"

const { VITE_API_URL } = import.meta.env
const fetcher = (url: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt") || ""}` },
  }).then((res) => res.json())

// --- TYPES ---
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

export type ApiReport = {
  title: string
  type: string
  data: any[]
}

type DashboardApiResponse = {
  [key: string]: ApiReport
}

// --- METADATA ---
const reportMetadata: {
  [key: string]: { descripcion: string; icono: string; estado: "Actualizado" | "Pendiente" }
} = {
  inventoryReport:         { descripcion: "Distribución de equipos por tipo y estado",         icono: "cube",     estado: "Actualizado" },
  maintenanceCostsReport:  { descripcion: "Análisis de gastos en mantenimiento mensual",        icono: "dollar",   estado: "Actualizado" },
  userAssignmentsReport:   { descripcion: "Equipos asignados por departamento y usuario",       icono: "users",    estado: "Pendiente"   },
  maintenanceHistoryReport:{ descripcion: "Registro completo de mantenimientos realizados",     icono: "wrench",   estado: "Actualizado" },
  warrantyReport:          { descripcion: "Lista de equipos con garantía próxima a vencer",     icono: "calendar", estado: "Actualizado" },
  itPerformanceReport:     { descripcion: "Métricas de eficiencia y productividad del equipo",  icono: "chart",    estado: "Pendiente"   },
}

const ICON_MAP: Record<string, React.ElementType> = {
  cube:     Box,
  dollar:   DollarSign,
  users:    Users,
  wrench:   Wrench,
  calendar: Calendar,
  chart:    BarChart2,
}

const TYPE_CONFIG: Record<string, { color: string; darkColor: string }> = {
  Inventario:    { color: "bg-blue-50 text-blue-700 border-blue-200",     darkColor: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  Financiero:    { color: "bg-green-50 text-green-700 border-green-200",  darkColor: "bg-green-500/15 text-green-400 border-green-500/20" },
  Usuarios:      { color: "bg-purple-50 text-purple-700 border-purple-200", darkColor: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
  Mantenimiento: { color: "bg-orange-50 text-orange-700 border-orange-200", darkColor: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  Rendimiento:   { color: "bg-cyan-50 text-cyan-700 border-cyan-200",     darkColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20" },
}

const STATUS_CONFIG: Record<string, { color: string; darkColor: string; dot: string }> = {
  Actualizado: { color: "text-green-700 bg-green-50 border-green-200",  darkColor: "text-green-400 bg-green-500/15 border-green-500/20", dot: "bg-green-500" },
  Pendiente:   { color: "text-yellow-700 bg-yellow-50 border-yellow-200", darkColor: "text-yellow-400 bg-yellow-500/15 border-yellow-500/20", dot: "bg-yellow-500" },
}

// --- MAIN COMPONENT ---
export default function AllReportsPage() {
  const { selectedCompany } = useCompany()
  const { data, error, isLoading } = useSWR<DashboardApiResponse>(
    `${VITE_API_URL}/api/reports/${selectedCompany?.id}/all`,
    fetcher
  )
  usePageName()
  const { isDarkMode } = useTheme()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  // theme tokens
  const pageBg  = isDarkMode ? "bg-[#111113]"  : "bg-[#f5f5f7]"
  const cardBg  = isDarkMode ? "bg-[#2c2c2e] border-white/[0.08]" : "bg-white border-gray-200 shadow-sm"
  const textMain = isDarkMode ? "text-white"      : "text-gray-900"
  const textSub  = isDarkMode ? "text-white/50"   : "text-gray-500"
  const divider  = isDarkMode ? "border-white/[0.06]" : "border-gray-100"

  // --- DATA TRANSFORM ---
  const reportsData: Report[] = useMemo(() => {
    if (!data) return []
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
        reportKey: key,
        apiData: apiReport.data,
      }
    })
  }, [data])

  const handleViewReport = (r: Report) => { setSelectedReport(r); setIsModalOpen(true) }
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedReport(null) }

  const handleDownload = (r: Report) => {
    if (!r.apiData?.length) { alert("No hay datos disponibles para descargar."); return }
    const ws = XLSX.utils.json_to_sheet(r.apiData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, r.titulo.substring(0, 30))
    const maxWidth = 50
    if (r.apiData.length > 0) {
      ws["!cols"] = Object.keys(r.apiData[0]).map((k) => ({
        wch: Math.min(Math.max(k.length, ...r.apiData.map((row) => String(row[k] ?? "").length)) + 2, maxWidth),
      }))
    }
    XLSX.writeFile(wb, `${r.reportKey}_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  if (isLoading) return <Loader />

  return (
    <div className={`min-h-full transition-colors ${pageBg}`}>
      <div className="px-0 sm:px-0">

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className={`text-xl sm:text-2xl font-semibold ${textMain}`}>
                Reportes
              </h1>
              <p className={`text-sm mt-1 ${textSub}`}>
                {selectedCompany?.name ? `Reportes de ${selectedCompany.name}` : "Cargando..."}
              </p>
            </div>
            {data && (
              <div className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                isDarkMode ? "bg-[#2c2c2e] border-white/[0.08] text-white/60" : "bg-white border-gray-200 text-gray-500"
              }`}>
                <FileText className="w-3.5 h-3.5" />
                {reportsData.length} reportes
              </div>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className={`mb-6 rounded-xl p-4 border flex items-start gap-3 ${
            isDarkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200"
          }`}>
            <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-red-400" : "text-red-500"}`} />
            <p className={`text-sm ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
              Error al cargar los reportes. Por favor, intenta de nuevo.
            </p>
          </div>
        )}

        {/* Report cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {reportsData.map((r) => {
            const Icon = ICON_MAP[r.icono] || FileText
            const typeStyle = TYPE_CONFIG[r.tipo] || { color: "bg-gray-50 text-gray-600 border-gray-200", darkColor: "bg-white/[0.06] text-white/50 border-white/[0.08]" }
            const statusStyle = STATUS_CONFIG[r.estado] || STATUS_CONFIG["Pendiente"]
            const recordCount = r.apiData?.length ?? 0

            return (
              <div
                key={r.id}
                className={`rounded-2xl border flex flex-col overflow-hidden transition-all hover:shadow-lg ${cardBg} ${
                  isDarkMode ? "hover:border-white/[0.12]" : "hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {/* Card top */}
                <div className="p-4 sm:p-5 flex-1">
                  {/* Icon + status row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isDarkMode ? "bg-white/[0.06]" : "bg-gray-50"
                    }`}>
                      <Icon className={`w-5 h-5 ${isDarkMode ? "text-white/60" : "text-gray-500"}`} />
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                      isDarkMode ? statusStyle.darkColor : statusStyle.color
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      {r.estado}
                    </span>
                  </div>

                  {/* Title + description */}
                  <h3 className={`text-sm sm:text-base font-semibold mb-1.5 leading-snug ${textMain}`}>
                    {r.titulo}
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed ${textSub}`}>
                    {r.descripcion}
                  </p>

                  {/* Meta row */}
                  <div className={`mt-4 pt-3 border-t ${divider} flex items-center justify-between`}>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                      isDarkMode ? typeStyle.darkColor : typeStyle.color
                    }`}>
                      {r.tipo}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] ${textSub}`}>
                        {recordCount > 0 ? `${recordCount} registros` : "Sin datos"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card actions */}
                <div className={`px-4 sm:px-5 py-3 border-t ${divider} flex items-center gap-2`}>
                  <button
                    onClick={() => handleViewReport(r)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver reporte
                  </button>
                  <button
                    onClick={() => handleDownload(r)}
                    title="Descargar Excel"
                    className={`p-2 rounded-xl transition-colors border ${
                      isDarkMode
                        ? "bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white border-white/[0.08]"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 border-gray-200"
                    }`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Empty state */}
          {!isLoading && !error && reportsData.length === 0 && (
            <div className={`col-span-full rounded-2xl border py-16 flex flex-col items-center gap-3 ${cardBg}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-white/[0.06]" : "bg-gray-50"}`}>
                <FileText className={`w-6 h-6 ${isDarkMode ? "text-white/30" : "text-gray-400"}`} />
              </div>
              <p className={`text-sm font-medium ${textMain}`}>Sin reportes disponibles</p>
              <p className={`text-xs ${textSub}`}>No se encontraron datos para esta compañía</p>
            </div>
          )}
        </div>
      </div>

      <ReportModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        report={selectedReport}
        isDarkMode={isDarkMode}
      />
    </div>
  )
}
