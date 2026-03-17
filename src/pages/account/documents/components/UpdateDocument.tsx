"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTheme } from "../../../../context/themeContext"
import { useCompany } from "../../../../context/routerContext"
import PagesHeader from "../../../../components/headers/pagesHeader"
import Loader from "../../../../components/loaders/loader"

const { VITE_API_URL } = import.meta.env

const DOCUMENT_CATEGORIES = [
  "Manual",
  "Contrato",
  "Factura",
  "Garantía",
  "Certificado",
  "Política",
  "Procedimiento",
  "Reporte",
  "Otro",
]

interface DocumentForm {
  title: string
  description: string
  fileUrl: string
  fileType: string
  category: string
  equipmentId: string
}

interface Equipment {
  id: string
  type: string
  brand: string
  model: string
  serialNumber: string
}

export default function UpdateDocument() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { isDarkMode } = useTheme()
  const { selectedCompany } = useCompany()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<DocumentForm>({
    title: "",
    description: "",
    fileUrl: "",
    fileType: "",
    category: "",
    equipmentId: "",
  })
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<DocumentForm>>({})

  const cardBg = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
  const _textMain = isDarkMode ? "text-white" : "text-gray-900"
  const inputClass = isDarkMode
    ? "bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    : "bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = isDarkMode ? "text-gray-300 text-sm font-medium" : "text-gray-700 text-sm font-medium"

  useEffect(() => {
    if (selectedCompany) {
      fetch(`${VITE_API_URL}/api/inventory/${selectedCompany.id}/inventory/all`)
        .then((r) => r.json())
        .then((data) => setEquipment(Array.isArray(data) ? data : []))
        .catch(() => {})
    }

    if (isEdit && id) {
      fetch(`${VITE_API_URL}/api/documents/${id}`)
        .then((r) => r.json())
        .then((data) => {
          setForm({
            title: data.title || "",
            description: data.description || "",
            fileUrl: data.fileUrl || "",
            fileType: data.fileType || "",
            category: data.category || "",
            equipmentId: data.equipmentId || "",
          })
        })
        .catch(() => alert("Error al cargar el documento"))
        .finally(() => setLoading(false))
    }
  }, [id, isEdit, selectedCompany])

  const validate = (): boolean => {
    const newErrors: Partial<DocumentForm> = {}
    if (!form.title.trim()) newErrors.title = "Requerido"
    if (!form.fileUrl.trim()) newErrors.fileUrl = "Requerido"
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
      title: form.title,
      description: form.description || undefined,
      fileUrl: form.fileUrl,
      fileType: form.fileType || undefined,
      category: form.category || undefined,
      companyId: selectedCompany.id,
      equipmentId: form.equipmentId || undefined,
    }

    try {
      const url = isEdit
        ? `${VITE_API_URL}/api/documents/${id}`
        : `${VITE_API_URL}/api/documents/create`
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

      navigate(`/${selectedCompany.code}/documents/all`)
    } catch (error: any) {
      alert(error.message || "Error al guardar el documento")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="space-y-4">
      <PagesHeader
        title={isEdit ? "Editar Documento" : "Nuevo Documento"}
        description={isEdit ? "Modifica los datos del documento" : "Registra un nuevo documento"}
      />

      <div className={`rounded-xl border p-6 ${cardBg}`}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className={labelClass}>Título *</label>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Manual de Usuario - Laptop Dell"
            />
            {errors.title && <span className="text-red-500 text-xs">{errors.title}</span>}
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className={labelClass}>URL del Archivo *</label>
            <input
              className={inputClass}
              value={form.fileUrl}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
              placeholder="https://... o ruta al archivo"
            />
            {errors.fileUrl && <span className="text-red-500 text-xs">{errors.fileUrl}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Categoría</label>
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Sin categoría</option>
              {DOCUMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Tipo de Archivo</label>
            <input
              className={inputClass}
              value={form.fileType}
              onChange={(e) => setForm({ ...form, fileType: e.target.value })}
              placeholder="Ej: PDF, DOCX, PNG..."
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className={labelClass}>Equipo Asociado</label>
            <select
              className={inputClass}
              value={form.equipmentId}
              onChange={(e) => setForm({ ...form, equipmentId: e.target.value })}
            >
              <option value="">Sin equipo asociado</option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.type} - {eq.brand} {eq.model} ({eq.serialNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className={labelClass}>Descripción</label>
            <textarea
              className={`${inputClass} resize-none h-24`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción del documento..."
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
              {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear Documento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
