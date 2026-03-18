import React from "react"
import * as XLSX from "xlsx"
import { Report } from "./allReportPage"
import { X, Download, FileText } from "lucide-react"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  report: Report | null
  isDarkMode?: boolean
}

// --- CELL FORMATTING ---
const formatCellForExport = (data: any): string | number => {
  if (data === null || data === undefined) return "N/A"
  if (typeof data === "object") {
    if (data.person?.fullName) return data.person.fullName
    if (data.username) return data.username
    if (data.name) return data.name
    if (data.serialNumber && data.type) {
      const desc = [data.type, data.brand, data.model].filter(Boolean).join(" ")
      return `${desc} (SN: ${data.serialNumber})`
    }
    return JSON.stringify(data)
  }
  if (typeof data === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(data)) {
    return new Date(data).toLocaleString()
  }
  if (typeof data === "boolean") return data ? "Sí" : "No"
  return data
}

const renderCellForDisplay = (data: any, isDark: boolean): React.ReactNode => {
  const formatted = formatCellForExport(data)
  if (typeof formatted === "string" && formatted.startsWith("{")) {
    return (
      <pre className={`text-[11px] p-1.5 rounded-lg max-w-[200px] overflow-x-auto ${
        isDark ? "bg-white/[0.06] text-white/60" : "bg-gray-50 text-gray-600"
      }`}>
        {JSON.stringify(JSON.parse(formatted), null, 2)}
      </pre>
    )
  }
  if (data === null || data === undefined) {
    return <span className={isDark ? "text-white/25" : "text-gray-300"}>—</span>
  }
  if (typeof data === "boolean") {
    return data
      ? <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDark ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-700"}`}>Sí</span>
      : <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDark ? "bg-red-500/15 text-red-400" : "bg-red-50 text-red-600"}`}>No</span>
  }
  return <span className={isDark ? "text-white/80" : "text-gray-700"}>{formatted}</span>
}

// --- COMPONENT ---
const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, report, isDarkMode = true }) => {
  if (!isOpen || !report) return null

  const hasData = report.apiData?.length > 0
  const headers = hasData ? Object.keys(report.apiData[0]) : []

  const modalBg   = isDarkMode ? "bg-[#1c1c1e]"  : "bg-white"
  const headerBg  = isDarkMode ? "bg-[#2c2c2e]"  : "bg-gray-50"
  const border    = isDarkMode ? "border-white/[0.08]" : "border-gray-200"
  const textMain  = isDarkMode ? "text-white"     : "text-gray-900"
  const textSub   = isDarkMode ? "text-white/50"  : "text-gray-500"
  const theadBg   = isDarkMode ? "bg-[#2c2c2e]"  : "bg-gray-50"
  const theadText = isDarkMode ? "text-white/40"  : "text-gray-400"
  const rowHover  = isDarkMode ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"
  const rowDivide = isDarkMode ? "border-white/[0.05]" : "border-gray-100"

  const handleDownload = () => {
    if (!report || !hasData) return
    const processed = report.apiData.map((row) => {
      const newRow: Record<string, string | number> = {}
      headers.forEach((h) => { newRow[h] = formatCellForExport(row[h]) })
      return newRow
    })
    const ws = XLSX.utils.json_to_sheet(processed)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Datos")
    XLSX.writeFile(wb, `${report.reportKey || "reporte"}.xlsx`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className={`absolute inset-0 transition-opacity ${isDarkMode ? "bg-black/70" : "bg-black/40"} backdrop-blur-sm`} />

      {/* Panel */}
      <div
        className={`relative w-full sm:max-w-5xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl border shadow-2xl overflow-hidden ${modalBg} ${border}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-start gap-3 px-4 sm:px-6 py-4 border-b flex-shrink-0 ${headerBg} ${border}`}>
          <div className="flex-1 min-w-0">
            <h2 className={`text-base sm:text-lg font-semibold truncate ${textMain}`}>{report.titulo}</h2>
            <p className={`text-xs sm:text-sm mt-0.5 ${textSub}`}>{report.descripcion}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={!hasData}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                hasData
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : isDarkMode
                    ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar</span>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                isDarkMode
                  ? "text-white/40 hover:text-white hover:bg-white/[0.08]"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Record count strip */}
        {hasData && (
          <div className={`px-4 sm:px-6 py-2 border-b flex items-center gap-2 flex-shrink-0 ${border} ${isDarkMode ? "bg-[#2c2c2e]/50" : "bg-gray-50/80"}`}>
            <FileText className={`w-3.5 h-3.5 ${textSub}`} />
            <span className={`text-xs ${textSub}`}>{report.apiData.length} registros · {headers.length} columnas</span>
          </div>
        )}

        {/* Table / empty */}
        <div className="flex-1 overflow-auto">
          {hasData ? (
            <table className="min-w-full text-sm border-collapse">
              <thead className={`${theadBg} sticky top-0 z-10`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-12 border-b ${theadText} ${border}`}>
                    #
                  </th>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap border-b ${theadText} ${border}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.apiData.map((row, i) => (
                  <tr key={i} className={`border-b transition-colors ${rowHover} ${rowDivide}`}>
                    <td className={`px-4 py-3 text-[11px] font-mono ${textSub}`}>{i + 1}</td>
                    {headers.map((h) => (
                      <td key={h} className="px-4 py-3 align-top text-xs sm:text-sm">
                        {renderCellForDisplay(row[h], isDarkMode)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-white/[0.06]" : "bg-gray-50"}`}>
                <FileText className={`w-6 h-6 ${isDarkMode ? "text-white/25" : "text-gray-400"}`} />
              </div>
              <p className={`text-sm font-medium ${textMain}`}>Sin datos disponibles</p>
              <p className={`text-xs ${textSub}`}>Este reporte no tiene registros para mostrar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportModal
