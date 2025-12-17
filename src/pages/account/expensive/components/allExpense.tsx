import { useEffect, useMemo, useState } from "react"
import { Plus, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useCompany } from "../../../../context/routerContext"
import { CreateExpenseModal } from "./updateExpenseModal"


const API_URL = import.meta.env.VITE_API_URL

export interface AnnualSoftwareExpense {
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
  additionalNotes?: string | null
  assignedUsers?: string | null
  createdAt: string
}

export default function AllExpensePage() {
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState<AnnualSoftwareExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const {selectedCompany} = useCompany()

  useEffect(() => {
    fetch(`${API_URL}/api/annual-software-expense/getAll`)
      .then((r) => r.json())
      .then(setExpenses)
      .finally(() => setLoading(false))
  }, [])

  const totalAnnualCost = useMemo(
    () => expenses.reduce((a, e) => a + e.annualCost, 0),
    [expenses]
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gestión de Gastos</h1>
          <p className="text-sm text-gray-400">
            Suscripciones y aplicaciones empresariales
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl"
        >
          <Plus size={16} /> Agregar Gasto
        </button>
      </div>

      {/* Stats */}
      <div className="bg-gray-800 rounded-xl p-4">
        <p className="text-sm text-gray-400">Gasto Total Anual</p>
        <p className="text-2xl font-semibold">${totalAnnualCost.toFixed(2)}</p>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl p-4">
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th>Aplicación</th>
                <th>Proveedor</th>
                <th>Costo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b">
                  <td>{e.applicationName}</td>
                  <td>{e.provider}</td>
                  <td>${e.annualCost.toFixed(2)}</td>
                  <td className="text-right">
                    <button
                      onClick={() => navigate(`/${selectedCompany?.code}/expenses/edit/${e.id}`)}
                      className="flex items-center gap-1 px-3 py-1 border rounded-lg"
                    >
                      <Eye size={14} /> Ver Reporte
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isCreateOpen && (
        <CreateExpenseModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={(e) => setExpenses((prev) => [e, ...prev])}
        />
      )}
    </div>
  )
}
