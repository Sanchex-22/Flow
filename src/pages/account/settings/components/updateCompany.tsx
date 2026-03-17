"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTheme } from "../../../../context/themeContext"
import Loader from "../../../../components/loaders/loader"
import { useCompany } from "../../../../context/routerContext"
import { Building2, Hash, Mail, Phone, MapPin, FileText, ArrowLeft, Save, CheckCircle } from "lucide-react"

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

export default function UpdateCompany() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { isDarkMode } = useTheme()
  const isEdit = Boolean(id)
  const { selectedCompany } = useCompany()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "", code: "", address: "", phone: "", email: "", ruc: "", logoUrl: "", isActive: true,
  })

  const cardBg = isDarkMode ? "bg-[#1e1e20] border-white/[0.07]" : "bg-white border-gray-100 shadow-sm"
  const textMain = isDarkMode ? "text-white" : "text-gray-900"
  const textSub = isDarkMode ? "text-[#8e8e93]" : "text-gray-500"
  const inputCls = `w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-colors ${
    isDarkMode
      ? "bg-white/[0.06] border-white/[0.08] text-white placeholder-[#636366] focus:border-blue-500"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400"
  }`

  useEffect(() => {
    if (!id) return
    const loadCompany = async () => {
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
    loadCompany()
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
      navigate(`/${selectedCompany?.code}/settings/all`)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const set = (key: keyof FormData) => (value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  if (loading) return <Loader />

  const fields: { key: keyof FormData; label: string; icon: React.ElementType; type?: string; disabled?: boolean; placeholder?: string }[] = [
    { key: "name", label: "Nombre", icon: Building2, placeholder: "Nombre de la compañía" },
    { key: "code", label: "Código", icon: Hash, disabled: true, placeholder: "Generado automáticamente" },
    { key: "ruc", label: "RUC", icon: FileText, placeholder: "Número de RUC" },
    { key: "email", label: "Email", icon: Mail, type: "email", placeholder: "contacto@empresa.com" },
    { key: "phone", label: "Teléfono", icon: Phone, type: "tel", placeholder: "+593 99 999 9999" },
    { key: "address", label: "Dirección", icon: MapPin, placeholder: "Dirección de la empresa" },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className={`p-2 rounded-xl transition-colors ${isDarkMode ? "hover:bg-white/[0.06] text-[#8e8e93] hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className={`text-lg font-semibold ${textMain}`}>{isEdit ? "Editar Compañía" : "Nueva Compañía"}</h1>
          <p className={`text-xs ${textSub}`}>{isEdit ? "Actualiza la información de la compañía" : "Completa los datos para crear una nueva compañía"}</p>
        </div>
      </div>

      {/* Form card */}
      <div className={`rounded-2xl border p-5 sm:p-6 space-y-5 ${cardBg}`}>

        {/* Avatar preview */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {formData.name ? formData.name[0].toUpperCase() : <Building2 className="w-7 h-7" />}
          </div>
          <div>
            <p className={`text-sm font-semibold ${textMain}`}>{formData.name || "Nueva Compañía"}</p>
            <p className={`text-xs ${textSub}`}>{formData.code || "Código pendiente"}</p>
          </div>
        </div>

        <div className={`h-px ${isDarkMode ? "bg-white/[0.06]" : "bg-gray-100"}`} />

        {/* Fields grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ key, label, icon: Icon, type = "text", disabled, placeholder }) => (
            <div key={key} className={key === "address" ? "sm:col-span-2" : ""}>
              <label className={`block text-xs font-medium mb-1.5 ${textSub}`}>
                {label}{key === "name" || key === "ruc" ? <span className="text-red-500 ml-0.5">*</span> : ""}
              </label>
              <div className="relative">
                <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? "text-[#48484a]" : "text-gray-400"}`} />
                <input
                  type={type}
                  value={formData[key] as string}
                  onChange={(e) => !disabled && set(key)(e.target.value)}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={`${inputCls} pl-9 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className={`h-px ${isDarkMode ? "bg-white/[0.06]" : "bg-gray-100"}`} />

        {/* Active toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${textMain}`}>Compañía activa</p>
            <p className={`text-xs ${textSub}`}>Las compañías inactivas no aparecen en el selector</p>
          </div>
          <button
            onClick={() => set("isActive")(!formData.isActive)}
            className={`relative w-11 h-6 rounded-full transition-colors ${formData.isActive ? "bg-blue-600" : isDarkMode ? "bg-white/[0.1]" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${isDarkMode ? "bg-white/[0.06] hover:bg-white/[0.1] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          ) : isEdit ? (
            <><Save className="w-4 h-4" /> Guardar cambios</>
          ) : (
            <><CheckCircle className="w-4 h-4" /> Crear compañía</>
          )}
        </button>
      </div>
    </div>
  )
}
