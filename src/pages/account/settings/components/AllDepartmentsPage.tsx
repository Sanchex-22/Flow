"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Link } from "react-router-dom"
import { FolderOpen, Plus, Edit2, Trash2, Building2 } from "lucide-react"
import { useCompany } from "../../../../context/routerContext"
import { useTheme } from "../../../../context/themeContext"
import { useSearch } from "../../../../context/searchContext"
import Loader from "../../../../components/loaders/loader"
import { useTranslation } from "react-i18next"

const VITE_API_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000"

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("jwt") || sessionStorage.getItem("jwt") || ""}`,
})

interface Department {
  id: string
  name: string
  description?: string
  isActive: boolean
  companyId: string
  company?: { id: string; name: string; code: string }
}

interface Company {
  id: string
  name: string
  code: string
  departments?: Department[]
}

const fetcher = (url: string) => fetch(url, { headers: authHeaders() }).then((r) => r.json())

export default function AllDepartmentsPage() {
  const { selectedCompany } = useCompany()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const { search } = useSearch()
  const code = selectedCompany?.code || "code"

  // Fetch all companies (which include their departments)
  const { data, isLoading, error } = useSWR<Company[]>(`${VITE_API_URL}/api/companies/all`, fetcher)
  const companies = Array.isArray(data) ? data : []

  // Flatten all departments across all companies
  const allDepts: (Department & { companyName: string; companyCode: string })[] = companies.flatMap((c) =>
    (c.departments || []).map((d) => ({
      ...d,
      companyName: c.name,
      companyCode: c.code,
    }))
  )

  const filtered = allDepts.filter((d) =>
    `${d.name} ${d.description || ""} ${d.companyName}`.toLowerCase().includes(search.toLowerCase())
  )

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    await fetch(`${VITE_API_URL}/api/departments/${id}`, { method: "DELETE", headers: authHeaders() })
    setDeleteConfirm(null)
    mutate(`${VITE_API_URL}/api/companies/all`)
  }

  // ── Tokens ────────────────────────────────────────────────────────────────
  const cardBg   = isDarkMode ? "bg-[#1e1e20] border-white/[0.07]" : "bg-white border-gray-200 shadow-sm"
  const textMain = isDarkMode ? "text-white"     : "text-gray-900"
  const textSub  = isDarkMode ? "text-[#8e8e93]" : "text-gray-500"

  if (isLoading) return <Loader />
  if (error)     return (
    <div className={`rounded-2xl p-5 border ${isDarkMode ? "bg-red-900/20 border-red-500/30 text-red-400" : "bg-red-50 border-red-200 text-red-700"}`}>
      <p className="font-semibold">{t("departments.loadError")}</p>
      <p className="text-sm mt-1">{error.message}</p>
    </div>
  )

  return (
    <div className="space-y-4">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className={`text-base font-semibold ${textMain}`}>{t("settings.tab.departments")}</h2>
          <p className={`text-xs mt-0.5 ${textSub}`}>{filtered.length} {t("common.total").toLowerCase()}</p>
        </div>
        <Link
          to={`/${code}/settings/departments/create`}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("departments.new")}
        </Link>
      </div>

      {/* ── List ──────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className={`rounded-2xl p-12 border text-center ${cardBg}`}>
          <FolderOpen className={`w-10 h-10 mx-auto mb-3 ${textSub}`} />
          <p className={`text-sm ${textSub}`}>{t("departments.noDepartments")}</p>
        </div>
      ) : filtered.map((dept) => (
        <div key={dept.id} className={`rounded-2xl border overflow-hidden ${cardBg}`}>
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isDarkMode ? "bg-white/[0.06]" : "bg-gray-100"
              }`}>
                <FolderOpen className={`w-5 h-5 ${isDarkMode ? "text-[#8e8e93]" : "text-gray-400"}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-semibold ${textMain}`}>{dept.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    dept.isActive
                      ? isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                      : isDarkMode ? "bg-red-500/20 text-red-400"         : "bg-red-100 text-red-700"
                  }`}>{dept.isActive ? t("common.active") : t("common.inactive")}</span>
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <Building2 className={`w-3 h-3 ${textSub}`} />
                  <span className={`text-xs ${textSub}`}>{dept.companyName}</span>
                  {dept.description && (
                    <>
                      <span className={`text-xs ${textSub} opacity-40`}>·</span>
                      <span className={`text-xs ${textSub} truncate`}>{dept.description}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  to={`/${code}/settings/departments/edit?id=${dept.id}&companyId=${dept.companyId}`}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? "text-[#8e8e93] hover:text-white hover:bg-white/[0.08]" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
                  title="Editar"
                >
                  <Edit2 size={15} />
                </Link>
                <button
                  onClick={() => setDeleteConfirm(dept.id)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? "text-[#8e8e93] hover:text-red-400 hover:bg-red-500/[0.08]" : "text-gray-400 hover:text-red-600 hover:bg-red-50"}`}
                  title="Eliminar"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ── Delete modal ──────────────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className={`rounded-2xl p-6 max-w-sm w-full border shadow-2xl ${isDarkMode ? "bg-[#1c1c1e] border-white/[0.08]" : "bg-white border-gray-100"}`} onClick={(e) => e.stopPropagation()}>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${isDarkMode ? "bg-red-500/20" : "bg-red-100"}`}>
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h2 className={`text-base font-semibold mb-1 ${textMain}`}>{t("departments.deleteDepartment")}</h2>
            <p className={`text-sm mb-5 ${textSub}`}>{t("common.cannotUndo")}</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${isDarkMode ? "bg-white/[0.06] hover:bg-white/[0.1] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>{t("action.cancel")}</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white">{t("action.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
