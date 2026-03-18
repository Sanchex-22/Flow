"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../../../context/themeContext"
import { useCompany } from "../../../../context/routerContext"
import { usePageName } from "../../../../hook/usePageName"
import { useSearch } from "../../../../context/searchContext"
import PagesHeader from "../../../../components/headers/pagesHeader"
import Loader from "../../../../components/loaders/loader"
import SimpleTable from "../../../../components/tables/SimpleTable"
import * as XLSX from "xlsx"
import { useTranslation } from "react-i18next"

const { VITE_API_URL } = import.meta.env

interface License {
  id: string
  softwareName: string
  licenseKey: string
  provider?: string
  activationDate: string
  expirationDate?: string
  notes?: string
  companyId: string
  company?: {
    name: string
    code: string
  }
}

export default function AllLicenses() {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const { selectedCompany } = useCompany()
  usePageName()
  const { search } = useSearch()

  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const cardBg = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
  const textMain = isDarkMode ? "text-white" : "text-gray-900"
  const textSub = isDarkMode ? "text-gray-400" : "text-gray-600"

  useEffect(() => {
    fetchLicenses()
  }, [selectedCompany])

  const fetchLicenses = () => {
    setLoading(true)
    fetch(`${VITE_API_URL}/api/licenses/all`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt") || ""}` },
    })
      .then((r) => r.json())
      .then((data: License[]) => {
        const filtered = selectedCompany
          ? data.filter((l) => l.companyId === selectedCompany.id)
          : data
        setLicenses(filtered)
      })
      .catch(() => setError(t("error.loadData")))
      .finally(() => setLoading(false))
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await fetch(`${VITE_API_URL}/api/licenses/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt") || ""}` },
      })
      setLicenses((prev) => prev.filter((l) => l.id !== deleteId))
      setDeleteId(null)
    } catch {
      alert(t("error.deleteData"))
    } finally {
      setIsDeleting(false)
    }
  }

  const isExpiringSoon = (expirationDate?: string) => {
    if (!expirationDate) return false
    const diff = new Date(expirationDate).getTime() - Date.now()
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
  }

  const isExpired = (expirationDate?: string) => {
    if (!expirationDate) return false
    return new Date(expirationDate).getTime() < Date.now()
  }

  const exportToExcel = () => {
    const data = filteredLicenses.map((l) => ({
      [t("licenses.softwareName")]: l.softwareName,
      [t("licenses.provider")]: l.provider || "-",
      [t("licenses.licenseKey")]: l.licenseKey,
      [t("licenses.activationDate")]: new Date(l.activationDate).toLocaleDateString(),
      [t("licenses.expirationDate")]: l.expirationDate
        ? new Date(l.expirationDate).toLocaleDateString()
        : t("licenses.noExpiration"),
      [t("common.notes")]: l.notes || "-",
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    ws["!cols"] = [25, 20, 30, 20, 20, 30].map((w) => ({ wch: w }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Licencias")
    XLSX.writeFile(wb, `licencias_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const filteredLicenses = licenses.filter((l) =>
    !search ||
    l.softwareName.toLowerCase().includes(search.toLowerCase()) ||
    (l.provider || "").toLowerCase().includes(search.toLowerCase()) ||
    l.licenseKey.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: "softwareName", label: t("licenses.softwareName") },
    { key: "provider", label: t("licenses.provider") },
    { key: "licenseKey", label: t("licenses.licenseKey") },
    { key: "activationDate", label: t("licenses.activationDate") },
    { key: "expirationDate", label: t("licenses.expirationDate") },
    { key: "status", label: t("common.status") },
    { key: "actions", label: t("common.actions") },
  ]

  const tableRows = filteredLicenses.map((l) => ({
    softwareName: l.softwareName,
    provider: l.provider || "-",
    licenseKey: (
      <span className="font-mono text-xs bg-gray-100 dark:bg-white/[0.08] px-2 py-1 rounded">
        {l.licenseKey.length > 20 ? l.licenseKey.slice(0, 20) + "..." : l.licenseKey}
      </span>
    ),
    activationDate: new Date(l.activationDate).toLocaleDateString("es-ES"),
    expirationDate: l.expirationDate
      ? new Date(l.expirationDate).toLocaleDateString("es-ES")
      : t("licenses.noExpiration"),
    status: (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          isExpired(l.expirationDate)
            ? "bg-red-100 text-red-700"
            : isExpiringSoon(l.expirationDate)
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {isExpired(l.expirationDate)
          ? t("licenses.expired")
          : isExpiringSoon(l.expirationDate)
          ? t("licenses.expiringSoon")
          : t("licenses.active")}
      </span>
    ),
    actions: (
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/${selectedCompany?.code}/licenses/edit/${l.id}`)}
          className="text-blue-500 hover:text-blue-700 text-xs font-medium"
        >
          {t("action.edit")}
        </button>
        <button
          onClick={() => setDeleteId(l.id)}
          className="text-red-500 hover:text-red-700 text-xs font-medium"
        >
          {t("action.delete")}
        </button>
      </div>
    ),
  }))

  if (loading) return <Loader />
  if (error) return <div className={`text-center p-8 ${isDarkMode ? "text-red-400" : "text-red-600"}`}>{error}</div>

  return (
    <div className="space-y-4">
      <PagesHeader
        title={t("licenses.title")}
        description={selectedCompany ? `${t("licenses.title")} - ${selectedCompany.name}` : t("licenses.all")}
        showCreate
        onExport={exportToExcel}
      />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className={`rounded-xl p-3 sm:p-4 border ${cardBg}`}>
          <p className={`text-xs ${textSub}`}>{t("licenses.totalLicenses")}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${textMain}`}>{filteredLicenses.length}</p>
        </div>
        <div className={`rounded-xl p-3 sm:p-4 border ${cardBg}`}>
          <p className={`text-xs text-yellow-500`}>{t("licenses.expiringSoonCount")}</p>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-500">
            {filteredLicenses.filter((l) => isExpiringSoon(l.expirationDate)).length}
          </p>
        </div>
        <div className={`rounded-xl p-3 sm:p-4 border ${cardBg}`}>
          <p className={`text-xs text-red-500`}>{t("licenses.expiredCount")}</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-500">
            {filteredLicenses.filter((l) => isExpired(l.expirationDate)).length}
          </p>
        </div>
      </div>

      <SimpleTable columns={columns} data={tableRows} isDarkMode={isDarkMode} />

      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteId(null)}
        >
          <div
            className={`rounded-xl p-6 w-full max-w-sm shadow-xl ${cardBg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-lg font-bold mb-2 ${textMain}`}>{t("licenses.deleteConfirm")}</h3>
            <p className={`text-sm mb-4 ${textSub}`}>{t("common.cannotUndo")}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className={`px-4 py-2 rounded-lg text-sm ${isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
              >
                {t("action.cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {isDeleting ? t("common.deleting") : t("action.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
