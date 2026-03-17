"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTheme } from "../../../../context/themeContext"
import { useCompany } from "../../../../context/routerContext"
import PagesHeader from "../../../../components/headers/pagesHeader"
import Loader from "../../../../components/loaders/loader"

const { VITE_API_URL } = import.meta.env

interface LicenseForm {
  softwareName: string
  licenseKey: string
  provider: string
  activationDate: string
  expirationDate: string
  notes: string
}

export default function UpdateLicense() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { isDarkMode } = useTheme()
  const { selectedCompany } = useCompany()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<LicenseForm>({
    softwareName: "",
    licenseKey: "",
    provider: "",
    activationDate: "",
    expirationDate: "",
    notes: "",
  })
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<LicenseForm>>({})

  const cardBg = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
  const _textMain = isDarkMode ? "text-white" : "text-gray-900"
  const _textSub = isDarkMode ? "text-gray-400" : "text-gray-600"
  const inputClass = isDarkMode
    ? "bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    : "bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = isDarkMode ? "text-gray-300 text-sm font-medium" : "text-gray-700 text-sm font-medium"

  useEffect(() => {
    if (isEdit && id) {
      fetch(`${VITE_API_URL}/api/licenses/${id}`)
        .then((r) => r.json())
        .then((data) => {
          setForm({
            softwareName: data.softwareName || "",
            licenseKey: data.licenseKey || "",
            provider: data.provider || "",
            activationDate: data.activationDate ? data.activationDate.split("T")[0] : "",
            expirationDate: data.expirationDate ? data.expirationDate.split("T")[0] : "",
            notes: data.notes || "",
          })
        })
        .catch(() => alert("Error al cargar la licencia"))
        .finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const validate = (): boolean => {
    const newErrors: Partial<LicenseForm> = {}
    if (!form.softwareName.trim()) newErrors.softwareName = "Requerido"
    if (!form.licenseKey.trim()) newErrors.licenseKey = "Requerido"
    if (!form.activationDate) newErrors.activationDate = "Requerido"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (!selectedCompany) {
      alert("Selecciona una empresa primero")
      return
    }

    setSaving(true)
    const body = {
      softwareName: form.softwareName,
      licenseKey: form.licenseKey,
      provider: form.provider || undefined,
      activationDate: form.activationDate,
      expirationDate: form.expirationDate || undefined,
      notes: form.notes || undefined,
      companyId: selectedCompany.id,
    }

    try {
      const url = isEdit
        ? `${VITE_API_URL}/api/licenses/${id}`
        : `${VITE_API_URL}/api/licenses/create`
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al guardar")
      }

      navigate(`/${selectedCompany.code}/licenses/all`)
    } catch (error: any) {
      alert(error.message || "Error al guardar la licencia")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="space-y-4">
      <PagesHeader
        title={isEdit ? "Editar Licencia" : "Nueva Licencia"}
        description={isEdit ? "Modifica los datos de la licencia" : "Registra una nueva licencia de software"}
      />

      <div className={`rounded-xl border p-6 ${cardBg}`}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Software *</label>
            <input
              className={inputClass}
              value={form.softwareName}
              onChange={(e) => setForm({ ...form, softwareName: e.target.value })}
              placeholder="Ej: Microsoft Office 365"
            />
            {errors.softwareName && <span className="text-red-500 text-xs">{errors.softwareName}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Clave de Licencia *</label>
            <input
              className={inputClass}
              value={form.licenseKey}
              onChange={(e) => setForm({ ...form, licenseKey: e.target.value })}
              placeholder="XXXX-XXXX-XXXX-XXXX"
            />
            {errors.licenseKey && <span className="text-red-500 text-xs">{errors.licenseKey}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Proveedor</label>
            <input
              className={inputClass}
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
              placeholder="Ej: Microsoft, Adobe..."
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Fecha de Activación *</label>
            <input
              type="date"
              className={inputClass}
              value={form.activationDate}
              onChange={(e) => setForm({ ...form, activationDate: e.target.value })}
            />
            {errors.activationDate && <span className="text-red-500 text-xs">{errors.activationDate}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Fecha de Expiración</label>
            <input
              type="date"
              className={inputClass}
              value={form.expirationDate}
              onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className={labelClass}>Notas</label>
            <textarea
              className={`${inputClass} resize-none h-24`}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Información adicional sobre esta licencia..."
            />
          </div>

          <div className="md:col-span-2 flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`px-5 py-2 rounded-lg text-sm font-medium ${isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear Licencia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
