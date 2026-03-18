"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Link } from "react-router-dom"
import {
  Building2, Plus, Edit2, Trash2, ChevronDown, ChevronUp,
  Hash, Mail, Phone, Users, Monitor, Wrench, FolderOpen,
} from "lucide-react"
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

interface Department { id: string; name: string; description?: string; isActive: boolean }
interface Company {
  id: string; name: string; code: string; address?: string
  phone?: string; email?: string; ruc?: string; isActive: boolean
  departments?: Department[]
  _count?: { users: number; equipments: number; licenses: number; documents: number; maintenances: number; departments: number }
}

const fetcher = (url: string) => fetch(url, { headers: authHeaders() }).then((r) => r.json())

export default function AllCompaniesPage() {
  const { selectedCompany } = useCompany()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const { search } = useSearch()
  const code = selectedCompany?.code || "code"

  const { data, isLoading, error } = useSWR<Company[]>(`${VITE_API_URL}/api/companies/all`, fetcher)
  const companies = Array.isArray(data) ? data : []

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm]   = useState<string | null>(null)
  const [deleteDeptConfirm, setDeleteDeptConfirm] = useState<{ companyId: string; deptId: string } | null>(null)

  const filtered = companies.filter((c) =>
    `${c.name} ${c.code} ${c.email || ""} ${c.ruc || ""}`.toLowerCase().includes(search.toLowerCase())
  )

  const toggleRow = (id: string) =>
    setExpandedRows((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  const handleDelete = async (id: string) => {
    await fetch(`${VITE_API_URL}/api/companies/${id}`, { method: "DELETE", headers: authHeaders() })
    setDeleteConfirm(null)
    mutate(`${VITE_API_URL}/api/companies/all`)
  }

  const handleDeleteDept = async (deptId: string) => {
    await fetch(`${VITE_API_URL}/api/departments/${deptId}`, { method: "DELETE", headers: authHeaders() })
    setDeleteDeptConfirm(null)
    mutate(`${VITE_API_URL}/api/companies/all`)
  }

  // ── Tokens ──────────────────────────────────────────────────────────────
  const cardBg   = isDarkMode ? "bg-[#1e1e20] border-white/[0.07]" : "bg-white border-gray-200 shadow-sm"
  const textMain = isDarkMode ? "text-white"     : "text-gray-900"
  const textSub  = isDarkMode ? "text-[#8e8e93]" : "text-gray-500"
  const divider  = isDarkMode ? "border-white/[0.06]" : "border-gray-100"

  if (isLoading) return <Loader />
  if (error)     return (
    <div className={`rounded-2xl p-5 border ${isDarkMode ? "bg-red-900/20 border-red-500/30 text-red-400" : "bg-red-50 border-red-200 text-red-700"}`}>
      <p className="font-semibold">{t("companies.loadError")}</p>
      <p className="text-sm mt-1">{error.message}</p>
    </div>
  )

  return (
    <div className="space-y-4">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className={`text-base font-semibold ${textMain}`}>{t("settings.tab.companies")}</h2>
          <p className={`text-xs mt-0.5 ${textSub}`}>{filtered.length} {t("companies.registered")}</p>
        </div>
        <Link
          to={`/${code}/settings/create`}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("companies.new")}
        </Link>
      </div>

      {/* ── List ──────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className={`rounded-2xl p-12 border text-center ${cardBg}`}>
          <Building2 className={`w-10 h-10 mx-auto mb-3 ${textSub}`} />
          <p className={`text-sm ${textSub}`}>{t("companies.noCompanies")}</p>
        </div>
      ) : filtered.map((company) => {
        const isExpanded = expandedRows.has(company.id)
        const isSelected = selectedCompany?.id === company.id

        return (
          <div
            key={company.id}
            className={`rounded-2xl border overflow-hidden transition-all ${
              isSelected
                ? isDarkMode ? "border-blue-500/50 bg-blue-500/[0.06]" : "border-blue-300 bg-blue-50/50"
                : cardBg
            }`}
          >
            {/* Row */}
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                  isSelected ? "bg-blue-600" : "bg-gradient-to-br from-indigo-500 to-purple-600"
                }`}>
                  {company.name[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${textMain}`}>{company.name}</span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white">{t("common.selected")}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      company.isActive
                        ? isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                        : isDarkMode ? "bg-red-500/20 text-red-400"         : "bg-red-100 text-red-700"
                    }`}>{company.isActive ? t("common.active") : t("common.inactive")}</span>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    <span className={`flex items-center gap-1 text-xs ${textSub}`}><Hash className="w-3 h-3" />{company.code}</span>
                    {company.email && <span className={`flex items-center gap-1 text-xs ${textSub}`}><Mail className="w-3 h-3" />{company.email}</span>}
                    {company.phone && <span className={`flex items-center gap-1 text-xs ${textSub}`}><Phone className="w-3 h-3" />{company.phone}</span>}
                  </div>

                  {company._count && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        { icon: Users,      val: company._count.users,        label: t("companies.users") },
                        { icon: Monitor,    val: company._count.equipments,   label: t("companies.equipments")  },
                        { icon: Wrench,     val: company._count.maintenances, label: t("companies.maintenances")    },
                        { icon: FolderOpen, val: company._count.departments,  label: t("companies.depts")   },
                      ].map(({ icon: Icon, val, label }) => (
                        <span key={label} className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs ${
                          isDarkMode ? "bg-white/[0.06] text-[#8e8e93]" : "bg-gray-100 text-gray-500"
                        }`}>
                          <Icon className="w-3 h-3" />{val} {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link
                    to={`/${code}/settings/edit/${company.id}`}
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? "text-[#8e8e93] hover:text-white hover:bg-white/[0.08]" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
                    title="Editar"
                  >
                    <Edit2 size={15} />
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(company.id)}
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? "text-[#8e8e93] hover:text-red-400 hover:bg-red-500/[0.08]" : "text-gray-400 hover:text-red-600 hover:bg-red-50"}`}
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    onClick={() => toggleRow(company.id)}
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? "text-[#8e8e93] hover:text-white hover:bg-white/[0.08]" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
                  >
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Departments panel */}
            {isExpanded && (
              <div className={`border-t px-4 sm:px-5 py-4 ${isDarkMode ? `${divider} bg-white/[0.02]` : "border-gray-100 bg-gray-50/60"}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-xs font-semibold uppercase tracking-wide ${textSub}`}>
                    {t("settings.tab.departments")} ({company.departments?.length || 0})
                  </p>
                  <Link
                    to={`/${code}/settings/departments/create?companyId=${company.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <Plus size={12} /> {t("companies.add")}
                  </Link>
                </div>

                {company.departments && company.departments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {company.departments.map((dept) => (
                      <div key={dept.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                        isDarkMode ? "bg-white/[0.04] border-white/[0.06]" : "bg-white border-gray-200"
                      }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isDarkMode ? "bg-white/[0.06]" : "bg-gray-100"
                        }`}>
                          <FolderOpen className={`w-4 h-4 ${textSub}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${textMain}`}>{dept.name}</p>
                          {dept.description && <p className={`text-[10px] truncate ${textSub}`}>{dept.description}</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${dept.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                          <Link
                            to={`/${code}/settings/departments/edit?companyId=${company.id}&id=${dept.id}`}
                            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "text-[#636366] hover:text-white hover:bg-white/[0.08]" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
                          >
                            <Edit2 size={12} />
                          </Link>
                          <button
                            onClick={() => setDeleteDeptConfirm({ companyId: company.id, deptId: dept.id })}
                            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "text-[#636366] hover:text-red-400 hover:bg-red-500/[0.08]" : "text-gray-400 hover:text-red-600 hover:bg-red-50"}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-6 rounded-xl border border-dashed ${isDarkMode ? "border-white/[0.08] text-[#636366]" : "border-gray-200 text-gray-400"}`}>
                    <FolderOpen className="w-5 h-5 mx-auto mb-1 opacity-40" />
                    <p className="text-xs">{t("companies.noDepartments")}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* ── Delete company modal ───────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className={`rounded-2xl p-6 max-w-sm w-full border shadow-2xl ${isDarkMode ? "bg-[#1c1c1e] border-white/[0.08]" : "bg-white border-gray-100"}`} onClick={(e) => e.stopPropagation()}>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${isDarkMode ? "bg-red-500/20" : "bg-red-100"}`}>
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h2 className={`text-base font-semibold mb-1 ${textMain}`}>{t("companies.deleteCompany")}</h2>
            <p className={`text-sm mb-5 ${textSub}`}>{t("common.cannotUndo")}</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${isDarkMode ? "bg-white/[0.06] hover:bg-white/[0.1] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>{t("action.cancel")}</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white">{t("action.delete")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete dept modal ──────────────────────────────────────────────── */}
      {deleteDeptConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDeleteDeptConfirm(null)}>
          <div className={`rounded-2xl p-6 max-w-sm w-full border shadow-2xl ${isDarkMode ? "bg-[#1c1c1e] border-white/[0.08]" : "bg-white border-gray-100"}`} onClick={(e) => e.stopPropagation()}>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${isDarkMode ? "bg-red-500/20" : "bg-red-100"}`}>
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h2 className={`text-base font-semibold mb-1 ${textMain}`}>{t("departments.deleteDepartment")}</h2>
            <p className={`text-sm mb-5 ${textSub}`}>{t("common.cannotUndo")}</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteDeptConfirm(null)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${isDarkMode ? "bg-white/[0.06] hover:bg-white/[0.1] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>{t("action.cancel")}</button>
              <button onClick={() => handleDeleteDept(deleteDeptConfirm.deptId)} className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white">{t("action.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
