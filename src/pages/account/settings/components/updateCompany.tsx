"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTheme } from "../../../../context/themeContext"
import Loader from "../../../../components/loaders/loader"
import { useCompany } from "../../../../context/routerContext"
import {
  Building2, Hash, Mail, Phone, MapPin, FileText,
  ArrowLeft, Save, CheckCircle, Pencil, X, Globe
} from "lucide-react"

const VITE_API_URL = import.meta.env.VITE_API_URL

interface FormData {
  name: string
  code: string
  address: string
  phone: string
  email: string
  ruc: string
  logoUrl: string
  isActive: boolean
}

const authHeaders = () => {
  const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt") || ""
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
}

const TABS = ["Detalles de empresa", "Configuración", "Estado"]

export default function UpdateCompany() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { isDarkMode } = useTheme()
  const isEdit = Boolean(id)
  const { selectedCompany } = useCompany()
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(!isEdit) // new company starts in edit mode
  const [activeTab, setActiveTab] = useState(0)
  const [saved, setSaved] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: "", code: "", address: "", phone: "", email: "", ruc: "", logoUrl: "", isActive: true,
  })

  // ── Theme tokens ───────────────────────────────────────────────────────
  const pageBg   = isDarkMode ? "bg-[#1c1c1e]"          : "bg-[#f5f5f7]"
  const cardBg   = isDarkMode ? "bg-[#2c2c2e] border-white/[0.08]" : "bg-white border-gray-200 shadow-sm"
  const textMain = isDarkMode ? "text-white"              : "text-gray-900"
  const textSub  = isDarkMode ? "text-white/50"           : "text-gray-500"
  const divider  = isDarkMode ? "border-white/[0.06]"     : "border-gray-100"
  const inputCls = `w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-colors ${
    isDarkMode
      ? "bg-[#3a3a3c] border-white/[0.08] text-white placeholder-white/30 focus:border-blue-500/60"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400"
  }`
  const tabActive  = isDarkMode ? "border-blue-500 text-white"     : "border-blue-600 text-blue-700"
  const tabInactive = isDarkMode ? "border-transparent text-white/40 hover:text-white/70" : "border-transparent text-gray-400 hover:text-gray-600"

  // ── Load company ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${VITE_API_URL}/api/companies/${id}`, { headers: authHeaders() })
        if (!res.ok) throw new Error("Error al cargar la compañía")
        const data = await res.json()
        setFormData({
          name: data.name, code: data.code, address: data.address || "",
          phone: data.phone || "", email: data.email || "", ruc: data.ruc || "",
          logoUrl: data.logoUrl || "", isActive: data.isActive,
        })
      } catch (err: any) {
        alert(err.message)
        navigate(-1)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const handleSave = async () => {
    if (!formData.name.trim()) { alert("El nombre es requerido"); return }
    try {
      setLoading(true)
      const res = await fetch(
        isEdit ? `${VITE_API_URL}/api/companies/${id}` : `${VITE_API_URL}/api/companies/create`,
        { method: isEdit ? "PUT" : "POST", headers: authHeaders(), body: JSON.stringify(formData) }
      )
      if (!res.ok) throw new Error("Error al guardar la compañía")
      setSaved(true)
      setEditMode(false)
      setTimeout(() => {
        setSaved(false)
        navigate(`/${selectedCompany?.code}/settings/all`)
      }, 1500)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const set = (key: keyof FormData) => (value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  if (loading && isEdit && !formData.name) return <Loader />

  const infoRows: { label: string; value: string; icon: React.ElementType; key: keyof FormData; type?: string }[] = [
    { label: "Nombre",    value: formData.name,    icon: Building2, key: "name" },
    { label: "RUC",       value: formData.ruc,     icon: FileText,  key: "ruc" },
    { label: "Email",     value: formData.email,   icon: Mail,      key: "email",   type: "email" },
    { label: "Teléfono",  value: formData.phone,   icon: Phone,     key: "phone",   type: "tel" },
    { label: "Dirección", value: formData.address, icon: MapPin,    key: "address" },
    { label: "URL",       value: formData.logoUrl, icon: Globe,     key: "logoUrl" },
  ]

  return (
    <div className={`min-h-screen ${pageBg} transition-colors`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-0">

        {/* Back + title bar */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-xl transition-colors ${isDarkMode ? "hover:bg-white/[0.06] text-white/50 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"}`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className={`text-base font-semibold ${textMain}`}>
            {isEdit ? "Compañía" : "Nueva Compañía"}
          </h1>
          {saved && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-green-500 font-medium">
              <CheckCircle className="w-4 h-4" /> Guardado
            </span>
          )}
        </div>

        {/* Main card */}
        <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>

          {/* Company identity header */}
          <div className={`px-5 sm:px-6 pt-5 pb-4 flex items-start gap-4 border-b ${divider}`}>
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md">
              {formData.name ? formData.name[0].toUpperCase() : <Building2 className="w-7 h-7" />}
            </div>

            {/* Name + ID */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-semibold truncate ${textMain}`}>
                  {formData.name || "Sin nombre"}
                </h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className={`p-1 rounded-lg transition-colors flex-shrink-0 ${isDarkMode ? "text-white/30 hover:text-white/70 hover:bg-white/[0.05]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Hash className={`w-3 h-3 flex-shrink-0 ${textSub}`} />
                <span className={`text-xs font-mono ${textSub}`}>{formData.code || "código pendiente"}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  formData.isActive
                    ? isDarkMode ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-700"
                    : isDarkMode ? "bg-red-500/15 text-red-400" : "bg-red-50 text-red-600"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${formData.isActive ? "bg-green-500" : "bg-red-500"}`} />
                  {formData.isActive ? "Activa" : "Inactiva"}
                </span>
              </div>
            </div>

            {/* Edit / Save actions */}
            {editMode ? (
              <div className="flex gap-2 flex-shrink-0">
                {isEdit && (
                  <button
                    onClick={() => setEditMode(false)}
                    className={`p-2 rounded-xl transition-colors ${isDarkMode ? "text-white/50 hover:text-white hover:bg-white/[0.06]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {isEdit ? "Guardar" : "Crear"}
                </button>
              </div>
            ) : null}
          </div>

          {/* Tabs */}
          <div className={`flex border-b ${divider} px-5 sm:px-6`}>
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`py-3 px-1 mr-6 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === i ? tabActive : tabInactive
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-5 sm:px-6 py-4">

            {/* ── Tab 0: Detalles ── */}
            {activeTab === 0 && (
              <div className="space-y-0">
                {infoRows.map(({ label, value, icon: Icon, key, type = "text" }, i) => (
                  <div
                    key={key}
                    className={`flex items-start gap-3 py-3 ${i < infoRows.length - 1 ? `border-b ${divider}` : ""}`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${textSub}`} />
                    {editMode ? (
                      <div className="flex-1">
                        <label className={`block text-[11px] font-medium mb-1 ${textSub}`}>{label}</label>
                        <input
                          type={type}
                          value={value}
                          onChange={(e) => set(key)(e.target.value)}
                          disabled={key === "code"}
                          className={`${inputCls} ${key === "code" ? "opacity-40 cursor-not-allowed" : ""}`}
                          placeholder={key === "code" ? "Generado automáticamente" : `${label}...`}
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <p className={`text-[11px] font-medium mb-0.5 ${textSub}`}>{label}</p>
                        <p className={`text-sm ${value ? textMain : textSub}`}>
                          {value || <span className="italic opacity-50">Sin datos</span>}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Tab 1: Configuración ── */}
            {activeTab === 1 && (
              <div className="py-2 space-y-4">
                {/* Active toggle */}
                <div className={`flex items-center justify-between py-3 border-b ${divider}`}>
                  <div>
                    <p className={`text-sm font-medium ${textMain}`}>Compañía activa</p>
                    <p className={`text-xs mt-0.5 ${textSub}`}>Las compañías inactivas no aparecen en el selector</p>
                  </div>
                  <button
                    onClick={() => set("isActive")(!formData.isActive)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${formData.isActive ? "bg-blue-600" : isDarkMode ? "bg-white/[0.1]" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>

                {/* Logo URL */}
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${textSub}`}>URL del Logo</label>
                  <div className="flex gap-2 items-center">
                    {formData.logoUrl && (
                      <img src={formData.logoUrl} alt="logo" className="w-9 h-9 rounded-lg object-contain border border-white/10" />
                    )}
                    <input
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => set("logoUrl")(e.target.value)}
                      className={`${inputCls} flex-1`}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab 2: Estado ── */}
            {activeTab === 2 && (
              <div className="py-3 space-y-3">
                <div className={`rounded-xl p-4 border ${isDarkMode ? "bg-white/[0.03] border-white/[0.06]" : "bg-gray-50 border-gray-100"}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${textSub}`}>Información del sistema</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={textSub}>Código</span>
                      <span className={`font-mono font-medium ${textMain}`}>{formData.code || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={textSub}>Estado</span>
                      <span className={`font-medium ${formData.isActive ? "text-green-500" : "text-red-500"}`}>
                        {formData.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Bottom actions for new company */}
        {!isEdit && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => navigate(-1)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${isDarkMode ? "bg-white/[0.06] hover:bg-white/[0.1] text-white" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"}`}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Crear compañía
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
