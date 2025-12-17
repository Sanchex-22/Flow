import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

const API_URL = import.meta.env.VITE_API_URL

export default function ExpenseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const navigate2 = useNavigate()
  const [expense, setExpense] = useState<any>(null)
  const [assignedUsers, setAssignedUsers] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/annual-software-expense/get/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setExpense(data)
        setAssignedUsers(data.assignedUsers || "")
      })
      .finally(() => setLoading(false))
  }, [id])

  const save = async () => {
    await fetch(`${API_URL}/api/annual-software-expense/edit/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedUsers }),
    })
    navigate("/expenses")
  }

  if (loading) return <p className="p-6">Cargando...</p>

  return (
    <div className="p-6 space-y-6">
      <button onClick={() => navigate2(-1)} className="text-sm text-gray-400">
        ← Volver
      </button>

      <h1 className="text-2xl font-semibold">
        Reporte: {expense.applicationName}
      </h1>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 bg-gray-800 p-4 rounded-xl">
        <p><strong>Proveedor:</strong> {expense.provider}</p>
        <p><strong>Categoría:</strong> {expense.category}</p>
        <p><strong>Estado:</strong> {expense.status}</p>
        <p><strong>Costo anual:</strong> ${expense.annualCost}</p>
      </div>

      {/* Usuarios */}
      <div className="bg-gray-800 p-4 rounded-xl space-y-2">
        <h3 className="font-medium">Usuarios Asignados</h3>
        <textarea
          rows={4}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
          value={assignedUsers}
          onChange={(e) => setAssignedUsers(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancelar
        </button>
        <button
          onClick={save}
          className="px-4 py-2 bg-white text-black rounded-lg"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  )
}
