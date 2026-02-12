"use client"

import { useNavigate } from "react-router-dom"
import { useTheme } from "../../../../context/themeContext"
import { useCompany } from "../../../../context/routerContext"
import { useState, useEffect } from "react"

const API_URL = import.meta.env.VITE_API_URL

// ================================
// Enums (COMPATIBLES CON PRISMA)
// ================================
export enum PaymentFrequency {
  Annual = "Annual",
  Monthly = "Monthly",
}

export const PaymentFrequencyLabels: Record<PaymentFrequency, string> = {
  Annual: "Anual",
  Monthly: "Mensual",
}

export enum ExpenseStatus {
  Active = "Active",
  Inactive = "Inactive",
  Pending = "Pending",
  Canceled = "Canceled",
  Expired = "Expired",
}

export const ExpenseStatusLabels: Record<ExpenseStatus, string> = {
  Active: "Activo",
  Inactive: "Inactivo",
  Pending: "Pendiente",
  Canceled: "Cancelado",
  Expired: "Expirado",
}

export enum SoftwareCategory {
  Accounting = "Accounting",
  CRM = "CRM",
  Antivirus = "Antivirus",
  Productivity = "Productivity",
  Design = "Design",
  Development = "Development",
  HRManagement = "HRManagement",
  Marketing = "Marketing",
  Communication = "Communication",
  CloudStorage = "CloudStorage",
  OperatingSystem = "OperatingSystem",
  Other = "Other",
}

export const SoftwareCategoryLabels: Record<SoftwareCategory, string> = {
  Accounting: "Contabilidad",
  CRM: "CRM",
  Antivirus: "Antivirus",
  Productivity: "Productividad",
  Design: "Diseño",
  Development: "Desarrollo",
  HRManagement: "Gestión RRHH",
  Marketing: "Marketing",
  Communication: "Comunicación",
  CloudStorage: "Almacenamiento en la Nube",
  OperatingSystem: "Sistema Operativo",
  Other: "Otro",
}

// ================================
// Page Component
// ================================
export default function UpdateExpensePage() {
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()
  const { selectedCompany } = useCompany()

  const [form, setForm] = useState({
    applicationName: "",
    provider: "",
    category: "" as SoftwareCategory | "",
    status: ExpenseStatus.Active,
    annualCost: 0,
    numberOfUsers: 0,
    costPerUser: 0,
    renewalDate: "",
    paymentFrequency: PaymentFrequency.Annual,
    additionalNotes: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // ================================
  // Auto cálculo costo por usuario
  // ================================
  useEffect(() => {
    if (form.annualCost > 0 && form.numberOfUsers > 0) {
      setForm((prev) => ({
        ...prev,
        costPerUser: Number(
          (prev.annualCost / prev.numberOfUsers).toFixed(2)
        ),
      }))
    } else {
      setForm((prev) => ({ ...prev, costPerUser: 0 }))
    }
  }, [form.annualCost, form.numberOfUsers])

  // ================================
  // Submit
  // ================================
  const submit = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const payload = {
        ...form,
        renewalDate: form.renewalDate || null,
      }

      const res = await fetch(
        `${API_URL}/api/annual-software-expense/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      const data: any = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Error al crear el gasto.")
      }

      setSuccess("Gasto creado correctamente ✅")

      // redirige luego de crear
      setTimeout(() => {
        navigate(`/${selectedCompany?.code}/devices/all`)
      }, 1200)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen transition-colors ${
      isDarkMode
        ? 'bg-gray-950 text-white'
        : 'bg-white text-gray-900'
    }`}>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Agregar Nuevo Gasto</h1>
          <p className={`text-sm mt-2 transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Registra una suscripción o aplicación empresarial
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div
            className={`border rounded-lg px-4 py-3 text-sm transition-colors ${
              isDarkMode
                ? "bg-red-900/40 border-red-700 text-red-300"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            ❌ {error}
          </div>
        )}

        {success && (
          <div
            className={`border rounded-lg px-4 py-3 text-sm transition-colors ${
              isDarkMode
                ? "bg-green-900/40 border-green-700 text-green-300"
                : "bg-green-50 border-green-300 text-green-800"
            }`}
          >
            ✅ {success}
          </div>
        )}

        {/* Form */}
        <div
          className={`border rounded-2xl p-6 space-y-5 transition-colors ${
            isDarkMode
              ? 'bg-gray-900 border-gray-800'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Nombre de la aplicación"
              className={`rounded-lg p-3 border transition-colors focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-400'
              }`}
              value={form.applicationName}
              onChange={(e) =>
                setForm({ ...form, applicationName: e.target.value })
              }
            />

            <input
              placeholder="Proveedor"
              className={`rounded-lg p-3 border transition-colors focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-400'
              }`}
              value={form.provider}
              onChange={(e) =>
                setForm({ ...form, provider: e.target.value })
              }
            />

            <select
              className={`rounded-lg p-3 border transition-colors focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-400'
              }`}
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as SoftwareCategory,
                })
              }
            >
              <option value="">Selecciona categoría</option>
              {Object.values(SoftwareCategory).map((value) => (
                <option key={value} value={value}>
                  {SoftwareCategoryLabels[value]}
                </option>
              ))}
            </select>

            <select
              className={`rounded-lg p-3 border transition-colors focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-400'
              }`}
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as ExpenseStatus })
              }
            >
              {Object.values(ExpenseStatus).map((value) => (
                <option key={value} value={value}>
                  {ExpenseStatusLabels[value]}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Costo anual"
              className={`rounded-lg p-3 border transition-colors focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-400'
              }`}
              value={form.annualCost}
              onChange={(e) =>
                setForm({ ...form, annualCost: Number(e.target.value) })
              }
            />

            <input
              type="number"
              placeholder="Número de usuarios"
              className={`rounded-lg p-3 border transition-colors focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-400'
              }`}
              value={form.numberOfUsers}
              onChange={(e) =>
                setForm({ ...form, numberOfUsers: Number(e.target.value) })
              }
            />

            <input
              readOnly
              className={`rounded-lg p-3 border transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-200 border-gray-400 text-gray-900'
              }`}
              value={`$ ${form.costPerUser.toFixed(2)}`}
            />

            <input
              type="date"
              className={`rounded-lg p-3 border transition-colors focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-400'
              }`}
              value={form.renewalDate}
              onChange={(e) =>
                setForm({ ...form, renewalDate: e.target.value })
              }
            />

            <select
              className={`rounded-lg p-3 border transition-colors focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-400'
              }`}
              value={form.paymentFrequency}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentFrequency: e.target.value as PaymentFrequency,
                })
              }
            >
              {Object.values(PaymentFrequency).map((value) => (
                <option key={value} value={value}>
                  {PaymentFrequencyLabels[value]}
                </option>
              ))}
            </select>
          </div>

          <textarea
            rows={3}
            placeholder="Notas adicionales"
            className={`w-full rounded-lg p-3 border transition-colors focus:outline-none focus:ring-2 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-400'
            }`}
            value={form.additionalNotes}
            onChange={(e) =>
              setForm({ ...form, additionalNotes: e.target.value })
            }
          />

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6">
            <button
              onClick={() => navigate(-1)}
              className={`px-6 py-2.5 border rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'border-gray-700 text-white hover:bg-gray-800'
                  : 'border-gray-300 text-gray-900 hover:bg-gray-100'
              }`}
            >
              Cancelar
            </button>

            <button
              onClick={submit}
              disabled={loading}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                isDarkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {loading ? "Guardando..." : "Agregar Gasto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}