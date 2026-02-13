"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTheme } from "../../../../context/themeContext"
import PagesHeader from "../../../../components/headers/pagesHeader"
import { Edit2, Save, X, Trash2, UserPlus } from "lucide-react"
import Loader from "../../../../components/loaders/loader"

const API_URL = import.meta.env.VITE_API_URL as string

interface UserOption {
  id: string
  username: string
  name?: string
  lastName?: string
  email?: string
  department?: string
}

interface AssignedUser {
  id: string
  username: string
  name?: string
  lastName?: string
  email?: string
}

enum PaymentFrequency {
  Annual = "Annual",
  Monthly = "Monthly",
}

const PaymentFrequencyLabels: Record<string, string> = {
  Annual: "Anual",
  Monthly: "Mensual",
}

enum ExpenseStatus {
  Active = "Active",
  Inactive = "Inactive",
  Pending = "Pending",
  Canceled = "Canceled",
  Expired = "Expired",
}

const ExpenseStatusLabels: Record<string, string> = {
  Active: "Activo",
  Inactive: "Inactivo",
  Pending: "Pendiente",
  Canceled: "Cancelado",
  Expired: "Expirado",
}

enum SoftwareCategory {
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

const SoftwareCategoryLabels: Record<string, string> = {
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

interface ExpenseData {
  id: string
  applicationName: string
  provider: string
  category: string
  status: string
  annualCost: number
  numberOfUsers: number
  costPerUser: number
  renewalDate: string
  paymentFrequency: string
  additionalNotes?: string
  assignedUsers?: AssignedUser[]
}

export default function ExpenseDetailPage() {
  const { isDarkMode } = useTheme()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [expense, setExpense] = useState<ExpenseData | null>(null)
  const [editExpense, setEditExpense] = useState<ExpenseData | null>(null)
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showAssignUserModal, setShowAssignUserModal] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([])
  const [selectedUsersToAssign, setSelectedUsersToAssign] = useState<Set<string>>(new Set())
  const [isAssigningUsers, setIsAssigningUsers] = useState(false)

  // Cargar gasto
  const loadExpense = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `${API_URL}/api/annual-software-expense/get/${id}`
      )
      if (!response.ok) {
        throw new Error("Error al cargar el gasto")
      }
      const data: ExpenseData = await response.json()
      setExpense(data)
      setEditExpense(data)
      setAssignedUsers(data.assignedUsers || [])
    } catch (error) {
      console.error("Error loading expense:", error)
      alert("No se pudo cargar el gasto")
    } finally {
      setLoading(false)
    }
  }

  // Cargar usuarios disponibles
  const loadAvailableUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/getAll`)
      if (!response.ok) {
        throw new Error("Error al cargar usuarios disponibles")
      }
      const data: UserOption[] = await response.json()
      setAvailableUsers(data)
      
      // Inicializar checkboxes con los usuarios ya asignados
      const assignedIds = new Set(assignedUsers.map((u) => u.id))
      setSelectedUsersToAssign(assignedIds)
    } catch (error) {
      console.error("Error loading available users:", error)
      alert("No se pudieron cargar los usuarios disponibles.")
    }
  }

  useEffect(() => {
    if (id) {
      loadExpense()
    }
  }, [id])

  useEffect(() => {
    if (showAssignUserModal) {
      loadAvailableUsers()
    }
  }, [showAssignUserModal])

  const handleSaveChanges = async () => {
    if (!editExpense) return

    setIsSaving(true)
    try {
      const newAnnualCost = Number(editExpense.annualCost) || 0

      const response = await fetch(
        `${API_URL}/api/annual-software-expense/update/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: editExpense.provider,
            category: editExpense.category,
            status: editExpense.status,
            annualCost: newAnnualCost,
            renewalDate: editExpense.renewalDate,
            paymentFrequency: editExpense.paymentFrequency,
            additionalNotes: editExpense.additionalNotes,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar cambios")
      }

      const updated: ExpenseData = await response.json()
      setExpense(updated)
      setEditExpense(updated)
      setAssignedUsers(updated.assignedUsers || [])
      setIsEditing(false)
      alert("✅ Cambios guardados exitosamente")
    } catch (error) {
      console.error("Error saving:", error)
      alert(
        `❌ Error: ${error instanceof Error ? error.message : "Error desconocido"}`
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Asignar múltiples usuarios
  const assignSelectedUsers = async () => {
    if (selectedUsersToAssign.size === 0) {
      alert("❌ Selecciona al menos un usuario")
      return
    }

    setIsAssigningUsers(true)
    try {
      const assignedIds = new Set(assignedUsers.map((u) => u.id))
      const newUserIds = Array.from(selectedUsersToAssign).filter(
        (id) => !assignedIds.has(id)
      )

      // Asignar cada usuario nuevo
      for (const userId of newUserIds) {
        const response = await fetch(
          `${API_URL}/api/annual-software-expense/assign-existing-user/${id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          }
        )

        if (!response.ok) {
          throw new Error("Error al asignar uno o más usuarios")
        }
      }

      // Desasignar usuarios deseleccionados
      const usersToRemove = Array.from(assignedIds).filter(
        (id) => !selectedUsersToAssign.has(id)
      )

      for (const userId of usersToRemove) {
        const response = await fetch(
          `${API_URL}/api/annual-software-expense/assigned-users/delete/${userId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expenseId: id }),
          }
        )

        if (!response.ok) {
          throw new Error("Error al desasignar uno o más usuarios")
        }
      }

      await loadExpense()
      setShowAssignUserModal(false)
      alert("✅ Usuarios asignados correctamente")
    } catch (error) {
      console.error("Error assigning users:", error)
      alert(
        `❌ Error: ${error instanceof Error ? error.message : "Error desconocido"}`
      )
    } finally {
      setIsAssigningUsers(false)
    }
  }

  const removeUser = async (userId: string) => {
    if (!confirm("¿Eliminar usuario asignado?")) return

    try {
      const response = await fetch(
        `${API_URL}/api/annual-software-expense/assigned-users/delete/${userId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expenseId: id }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar usuario")
      }

      await loadExpense()
      alert("✅ Usuario eliminado correctamente")
    } catch (error) {
      console.error("Error deleting user:", error)
      alert(
        `❌ ${error instanceof Error ? error.message : "Error desconocido"}`
      )
    }
  }

  const handleDeleteExpense = async () => {
    if (!id) return

    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar el reporte "${expense?.applicationName}"? Esta acción es irreversible.`
      )
    ) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(
        `${API_URL}/api/annual-software-expense/delete/${id}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar el reporte")
      }

      alert("✅ Reporte eliminado exitosamente")
      navigate(-1)
    } catch (error) {
      console.error("Error deleting expense:", error)
      alert(
        `❌ Error al eliminar reporte: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExpenseChange = (field: string, value: unknown) => {
    if (!editExpense) return
    setEditExpense({ ...editExpense, [field]: value })
  }

  const getDisplayName = (user: AssignedUser) => {
    if (user.name && user.lastName) {
      return `${user.name} ${user.lastName}`
    }
    return user.username || "Usuario"
  }

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsersToAssign)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUsersToAssign(newSelection)
  }

  if (loading) {
    return (
      <Loader/>
    )
  }

  if (!expense) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-950" : "bg-gray-100"
        }`}
      >
        <p
          className={`text-lg ${
            isDarkMode ? "text-red-400" : "text-red-600"
          }`}
        >
          Gasto no encontrado
        </p>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen space-y-4 transition-colors ${
        isDarkMode ? " text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Botón Volver */}
      <button
        onClick={() => navigate(-1)}
        className={`text-sm transition-colors ${
          isDarkMode
            ? "text-gray-400 hover:text-gray-300"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        ← Volver
      </button>

      {/* Header */}
      <div className="flex justify-between items-center">
        <PagesHeader
          title={`Reporte: ${expense.applicationName}`}
          description="Gasto anual de software"
        />
        <button
          onClick={handleDeleteExpense}
          disabled={isDeleting}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
            isDarkMode
              ? "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              : "bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
          }`}
        >
          <Trash2 size={16} />
          {isDeleting ? "Eliminando..." : "Eliminar Reporte"}
        </button>
      </div>

      {/* INFO DEL GASTO - EDITABLE */}
      <div
        className={`rounded-xl p-6 transition-colors ${
          isDarkMode ? "bg-gray-800" : "bg-white border border-gray-200"
        }`}
      >
        {!isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Proveedor
                </p>
                <p
                  className={`text-lg ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {expense.provider}
                </p>
              </div>

              <div>
                <p
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Categoría
                </p>
                <p
                  className={`text-lg ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {SoftwareCategoryLabels[expense.category] || expense.category}
                </p>
              </div>

              <div>
                <p
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Estado
                </p>
                <p
                  className={`text-lg ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {ExpenseStatusLabels[expense.status] || expense.status}
                </p>
              </div>

              <div>
                <p
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Frecuencia de Pago
                </p>
                <p
                  className={`text-lg ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {PaymentFrequencyLabels[expense.paymentFrequency] ||
                    expense.paymentFrequency}
                </p>
              </div>

              <div>
                <p
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Costo Anual
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  }`}
                >
                  ${Number(expense.annualCost).toFixed(2)}
                </p>
              </div>

              <div>
                <p
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Número de Usuarios
                </p>
                <p
                  className={`text-lg ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {assignedUsers.length}
                </p>
              </div>

              <div>
                <p
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Costo por Usuario
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  ${(
                    (Number(expense.annualCost) || 0) /
                    (assignedUsers.length || 1)
                  ).toFixed(2)}
                </p>
              </div>

              <div>
                <p
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Fecha de Renovación
                </p>
                <p
                  className={`text-lg ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {new Date(expense.renewalDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {expense.additionalNotes && (
              <div>
                <p
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Notas Adicionales
                </p>
                <p
                  className={`mt-2 p-3 rounded ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  {expense.additionalNotes}
                </p>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsEditing(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                <Edit2 size={16} />
                Editar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Proveedor
                </label>
                <input
                  type="text"
                  value={editExpense?.provider || ""}
                  onChange={(e) =>
                    handleExpenseChange("provider", e.target.value)
                  }
                  className={`w-full mt-1 rounded p-2 border transition-colors focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:ring-blue-400"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Categoría
                </label>
                <select
                  value={editExpense?.category || ""}
                  onChange={(e) =>
                    handleExpenseChange("category", e.target.value)
                  }
                  className={`w-full mt-1 rounded p-2 border transition-colors focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:ring-blue-400"
                  }`}
                >
                  <option value="">Selecciona categoría</option>
                  {Object.entries(SoftwareCategory).map(([key, value]) => (
                    <option key={key} value={value}>
                      {SoftwareCategoryLabels[value]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Estado
                </label>
                <select
                  value={editExpense?.status || ""}
                  onChange={(e) => handleExpenseChange("status", e.target.value)}
                  className={`w-full mt-1 rounded p-2 border transition-colors focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:ring-blue-400"
                  }`}
                >
                  <option value="">Selecciona estado</option>
                  {Object.entries(ExpenseStatus).map(([key, value]) => (
                    <option key={key} value={value}>
                      {ExpenseStatusLabels[value]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Frecuencia de Pago
                </label>
                <select
                  value={editExpense?.paymentFrequency || ""}
                  onChange={(e) =>
                    handleExpenseChange("paymentFrequency", e.target.value)
                  }
                  className={`w-full mt-1 rounded p-2 border transition-colors focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:ring-blue-400"
                  }`}
                >
                  {Object.entries(PaymentFrequency).map(([key, value]) => (
                    <option key={key} value={value}>
                      {PaymentFrequencyLabels[value]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Costo Anual
                </label>
                <input
                  type="number"
                  value={editExpense?.annualCost || 0}
                  onChange={(e) =>
                    handleExpenseChange("annualCost", parseFloat(e.target.value))
                  }
                  className={`w-full mt-1 rounded p-2 border transition-colors focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:ring-blue-400"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Número de Usuarios (Automático)
                </label>
                <input
                  type="text"
                  readOnly
                  value={assignedUsers.length.toString()}
                  className={`w-full mt-1 rounded p-2 border transition-colors ${
                    isDarkMode
                      ? "bg-gray-600 border-gray-500 text-gray-300"
                      : "bg-gray-200 border-gray-300 text-gray-600"
                  }`}
                />
                <p
                  className={`text-xs mt-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Se actualiza automáticamente según usuarios asignados
                </p>
              </div>

              <div>
                <label
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Costo por Usuario (Automático)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$ ${(
                    (editExpense?.annualCost || 0) /
                    (assignedUsers.length || 1)
                  ).toFixed(2)}`}
                  className={`w-full mt-1 rounded p-2 border transition-colors ${
                    isDarkMode
                      ? "bg-gray-600 border-gray-500 text-gray-300"
                      : "bg-gray-200 border-gray-300 text-gray-600"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Fecha de Renovación
                </label>
                <input
                  type="date"
                  value={editExpense?.renewalDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    handleExpenseChange("renewalDate", e.target.value)
                  }
                  className={`w-full mt-1 rounded p-2 border transition-colors focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:ring-blue-400"
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                className={`text-xs font-semibold ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Notas Adicionales
              </label>
              <textarea
                value={editExpense?.additionalNotes || ""}
                onChange={(e) =>
                  handleExpenseChange("additionalNotes", e.target.value)
                }
                rows={3}
                className={`w-full mt-1 rounded p-2 border transition-colors focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-blue-400"
                } resize-none`}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditExpense(expense)
                }}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50"
                    : "bg-gray-300 hover:bg-gray-400 text-gray-900 disabled:opacity-50"
                }`}
              >
                <X size={16} />
                Cancelar
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                    : "bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                }`}
              >
                <Save size={16} />
                {isSaving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* USUARIOS ASIGNADOS */}
      <div
        className={`rounded-xl p-6 transition-colors ${
          isDarkMode ? "bg-gray-800" : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Usuarios Asignados</h3>
          <button
            onClick={() => setShowAssignUserModal(true)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <UserPlus size={16} className="inline-block mr-2" />
            Asignar Usuarios
          </button>
        </div>

        {assignedUsers.length === 0 ? (
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No hay usuarios asignados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className={`border-b ${
                    isDarkMode
                      ? "text-gray-400 border-gray-700"
                      : "text-gray-600 border-gray-300"
                  }`}
                >
                  <th className="text-left py-3 px-2">Nombre</th>
                  <th className="text-left py-3 px-2">Email</th>
                  <th className="text-right py-3 px-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {assignedUsers.map((u) => (
                  <tr
                    key={u.id}
                    className={`border-b transition-colors ${
                      isDarkMode
                        ? "border-gray-700 hover:bg-gray-700/50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <td
                      className={`py-3 px-2 ${
                        isDarkMode ? "" : "text-gray-900"
                      }`}
                    >
                      {getDisplayName(u)}
                    </td>
                    <td
                      className={`py-3 px-2 ${
                        isDarkMode ? "" : "text-gray-900"
                      }`}
                    >
                      {u.email || "-"}
                    </td>
                    <td className="text-right py-3 px-2">
                      <button
                        onClick={() => removeUser(u.id)}
                        className={`transition-colors ${
                          isDarkMode
                            ? "text-red-400 hover:text-red-300"
                            : "text-red-600 hover:text-red-700"
                        }`}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL ASIGNAR USUARIOS CON TABLA DE CHECKBOXES */}
      {showAssignUserModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-xl w-full max-w-4xl p-6 space-y-4 transition-colors max-h-[90vh] overflow-y-auto ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
          >
            <h2
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Asignar Usuarios
            </h2>

            <div
              className={`rounded-lg overflow-x-auto border ${
                isDarkMode
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className={`border-b ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedUsersToAssign.size === availableUsers.length && availableUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsersToAssign(
                              new Set(availableUsers.map((u) => u.id))
                            )
                          } else {
                            setSelectedUsersToAssign(new Set())
                          }
                        }}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-semibold ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Nombre
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-semibold ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Email
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-semibold ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Departamento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {availableUsers.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={`border-b transition-colors ${
                        isDarkMode
                          ? `border-gray-700 ${
                              idx % 2 === 0
                                ? "bg-gray-800 hover:bg-gray-700"
                                : "bg-gray-800/50 hover:bg-gray-700"
                            }`
                          : `border-gray-300 ${
                              idx % 2 === 0
                                ? "bg-white hover:bg-gray-50"
                                : "bg-gray-50 hover:bg-gray-100"
                            }`
                      }`}
                    >
                      <td className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUsersToAssign.has(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td
                        className={`py-3 px-4 ${
                          isDarkMode ? "text-gray-300" : "text-gray-900"
                        }`}
                      >
                        {user.name && user.lastName
                          ? `${user.name} ${user.lastName}`
                          : user.username}
                      </td>
                      <td
                        className={`py-3 px-4 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {user.email || "-"}
                      </td>
                      <td
                        className={`py-3 px-4 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {user.department || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAssignUserModal(false)}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  isDarkMode
                    ? "border-gray-700 text-white hover:bg-gray-800"
                    : "border-gray-300 text-gray-900 hover:bg-gray-100"
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={assignSelectedUsers}
                disabled={isAssigningUsers || selectedUsersToAssign.size === 0}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    : "bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                }`}
              >
                {isAssigningUsers ? "Asignando..." : "Asignar Seleccionados"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}