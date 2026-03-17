"use client"

import { useState, useEffect } from "react"
import { Edit2, Trash2, ChevronDown, ChevronUp, Plus, Building2, Users, Monitor, Wrench, FolderOpen, Phone, Mail, Hash, CheckCircle } from "lucide-react"
import { useCompany } from "../../../../context/routerContext"
import { useTheme } from "../../../../context/themeContext"
import Loader from "../../../../components/loaders/loader"
import PagesHeader from "../../../../components/headers/pagesHeader"
// import { usePageName } from "../../../../hook/usePageName"
import { useSearch } from "../../../../context/searchContext"

const VITE_API_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000"

interface Department {
  id: string
  name: string
  description?: string
  isActive: boolean
}

interface Company {
  id: string
  name: string
  code: string
  address?: string
  phone?: string
  email?: string
  ruc?: string
  logoUrl?: string
  isActive: boolean
  departments?: Department[]
  _count?: {
    users: number
    equipments: number
    licenses: number
    documents: number
    maintenances: number
    departments: number
    networks?: number
  }
}

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt") || ""
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
}

export default function AllSettingsPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { search } = useSearch()
  const { isDarkMode } = useTheme()
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showDeleteDeptConfirm, setShowDeleteDeptConfirm] = useState<{ companyId: string; deptId: string } | null>(null)
  const { selectedCompany } = useCompany()
  // const { pageName } = usePageName()

  const cardBg = isDarkMode ? "bg-[#1e1e20] border-white/[0.07]" : "bg-white border-gray-100 shadow-sm"
  const textMain = isDarkMode ? "text-white" : "text-gray-900"
  const textSub = isDarkMode ? "text-[#8e8e93]" : "text-gray-500"

  useEffect(() => { loadCompanies() }, [])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${VITE_API_URL}/api/companies/all`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setCompanies(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${VITE_API_URL}/api/companies/${id}`, { method: "DELETE", headers: authHeaders() })
      if (res.ok) {
        setCompanies((prev) => prev.filter((c) => c.id !== id))
        setShowDeleteConfirm(null)
      } else {
        const d = await res.json()
        alert(`Error: ${d.error || "Error al eliminar"}`)
      }
    } catch (err: any) {
      alert("Error: " + err.message)
    }
  }

  const handleDeleteDepartment = async (companyId: string, deptId: string) => {
    try {
      const res = await fetch(`${VITE_API_URL}/api/departments/${deptId}`, { method: "DELETE", headers: authHeaders() })
      if (res.ok) {
        setCompanies((prev) => prev.map((c) =>
          c.id === companyId ? { ...c, departments: c.departments?.filter((d) => d.id !== deptId) } : c
        ))
        setShowDeleteDeptConfirm(null)
      } else {
        const d = await res.json()
        alert(`Error: ${d.error || "Error al eliminar"}`)
      }
    } catch (err: any) {
      alert("Error: " + err.message)
    }
  }

  const toggleExpandRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.ruc || "").toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Loader />

  if (error) return (
    <div className="p-6">
      <div className={`rounded-2xl p-5 border ${isDarkMode ? "bg-red-900/20 border-red-500/30 text-red-400" : "bg-red-50 border-red-200 text-red-700"}`}>
        <p className="font-semibold mb-1">Error de acceso</p>
        <p className="text-sm mb-3">{error}</p>
        <button onClick={loadCompanies} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">Reintentar</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <PagesHeader
        title="Ajustes"
        description={selectedCompany ? `Configuración de ${selectedCompany.name}` : "Gestión de compañías y departamentos"}
        showCreate
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Compañías", value: filteredCompanies.length, icon: Building2, color: "text-blue-500" },
          { label: "Activas", value: filteredCompanies.filter((c) => c.isActive).length, icon: CheckCircle, color: "text-emerald-500" },
          { label: "Departamentos", value: filteredCompanies.reduce((acc, c) => acc + (c.departments?.length || 0), 0), icon: FolderOpen, color: "text-purple-500" },
          { label: "Usuarios", value: filteredCompanies.reduce((acc, c) => acc + (c._count?.users || 0), 0), icon: Users, color: "text-orange-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-xl p-3 sm:p-4 border ${cardBg}`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <p className={`text-xs ${textSub}`}>{label}</p>
            </div>
            <p className={`text-2xl font-bold ${textMain}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Company cards */}
      <div className="space-y-3">
        {filteredCompanies.length === 0 ? (
          <div className={`rounded-2xl p-10 border text-center ${cardBg}`}>
            <Building2 className={`w-10 h-10 mx-auto mb-3 ${textSub}`} />
            <p className={`text-sm ${textSub}`}>No se encontraron compañías</p>
          </div>
        ) : filteredCompanies.map((company) => {
          const isExpanded = expandedRows.has(company.id)
          const isSelected = selectedCompany?.id === company.id

          return (
            <div key={company.id} className={`rounded-2xl border overflow-hidden transition-all ${
              isSelected
                ? isDarkMode ? "border-blue-500/50 bg-blue-500/[0.06]" : "border-blue-300 bg-blue-50/60"
                : cardBg
            }`}>
              {/* Company row */}
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
                      <h3 className={`text-sm font-semibold ${textMain}`}>{company.name}</h3>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white">Seleccionada</span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        company.isActive
                          ? isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                          : isDarkMode ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700"
                      }`}>
                        {company.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </div>

                    {/* Meta pills */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                      <span className={`flex items-center gap-1 text-xs ${textSub}`}>
                        <Hash className="w-3 h-3" />{company.code}
                      </span>
                      {company.email && (
                        <span className={`flex items-center gap-1 text-xs ${textSub}`}>
                          <Mail className="w-3 h-3" />{company.email}
                        </span>
                      )}
                      {company.phone && (
                        <span className={`flex items-center gap-1 text-xs ${textSub}`}>
                          <Phone className="w-3 h-3" />{company.phone}
                        </span>
                      )}
                    </div>

                    {/* Count pills */}
                    {company._count && (
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {[
                          { icon: Users, val: company._count.users, label: "usuarios" },
                          { icon: Monitor, val: company._count.equipments, label: "equipos" },
                          { icon: Wrench, val: company._count.maintenances, label: "mant." },
                          { icon: FolderOpen, val: company._count.departments, label: "deptos" },
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
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <a
                      href={`edit/${company.id}`}
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? "text-[#8e8e93] hover:text-white hover:bg-white/[0.08]" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
                      title="Editar"
                    >
                      <Edit2 size={15} />
                    </a>
                    <button
                      onClick={() => setShowDeleteConfirm(company.id)}
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? "text-[#8e8e93] hover:text-red-400 hover:bg-red-500/[0.08]" : "text-gray-500 hover:text-red-600 hover:bg-red-50"}`}
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      onClick={() => toggleExpandRow(company.id)}
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? "text-[#8e8e93] hover:text-white hover:bg-white/[0.08]" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Departments panel */}
              {isExpanded && (
                <div className={`border-t px-4 sm:px-5 py-4 ${isDarkMode ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-100 bg-gray-50/60"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs font-semibold uppercase tracking-wide ${textSub}`}>
                      Departamentos ({company.departments?.length || 0})
                    </p>
                    <a
                      href={`departments/create?companyId=${company.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <Plus size={13} />
                      Agregar
                    </a>
                  </div>

                  {company.departments && company.departments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {company.departments.map((dept) => (
                        <div key={dept.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                          isDarkMode ? "bg-white/[0.04] border-white/[0.06]" : "bg-white border-gray-200"
                        }`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isDarkMode ? "bg-white/[0.06]" : "bg-gray-100"
                          }`}>
                            <FolderOpen className={`w-4 h-4 ${isDarkMode ? "text-[#8e8e93]" : "text-gray-400"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold truncate ${textMain}`}>{dept.name}</p>
                            {dept.description && (
                              <p className={`text-[10px] truncate ${textSub}`}>{dept.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className={`w-1.5 h-1.5 rounded-full ${dept.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                            <a
                              href={`departments/edit?companyId=${company.id}&id=${dept.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "text-[#636366] hover:text-white hover:bg-white/[0.08]" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
                            >
                              <Edit2 size={12} />
                            </a>
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowDeleteDeptConfirm({ companyId: company.id, deptId: dept.id }) }}
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
                      <FolderOpen className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">Sin departamentos</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Delete company modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className={`rounded-2xl p-6 max-w-sm w-full border shadow-2xl ${isDarkMode ? "bg-[#1c1c1e] border-white/[0.08]" : "bg-white border-gray-100"}`} onClick={(e) => e.stopPropagation()}>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${isDarkMode ? "bg-red-500/20" : "bg-red-100"}`}>
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h2 className={`text-base font-semibold mb-1 ${textMain}`}>Eliminar compañía</h2>
            <p className={`text-sm mb-5 ${textSub}`}>Esta acción no se puede deshacer. Todos los datos asociados serán eliminados.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(null)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${isDarkMode ? "bg-white/[0.06] hover:bg-white/[0.1] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>Cancelar</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete dept modal */}
      {showDeleteDeptConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowDeleteDeptConfirm(null)}>
          <div className={`rounded-2xl p-6 max-w-sm w-full border shadow-2xl ${isDarkMode ? "bg-[#1c1c1e] border-white/[0.08]" : "bg-white border-gray-100"}`} onClick={(e) => e.stopPropagation()}>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${isDarkMode ? "bg-red-500/20" : "bg-red-100"}`}>
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h2 className={`text-base font-semibold mb-1 ${textMain}`}>Eliminar departamento</h2>
            <p className={`text-sm mb-5 ${textSub}`}>Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteDeptConfirm(null)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${isDarkMode ? "bg-white/[0.06] hover:bg-white/[0.1] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>Cancelar</button>
              <button onClick={() => handleDeleteDepartment(showDeleteDeptConfirm.companyId, showDeleteDeptConfirm.deptId)} className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
