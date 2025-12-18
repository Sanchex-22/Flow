import { useEffect, useMemo, useState } from "react"
import { Plus, Eye, Download, Trash2, Edit } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useCompany } from "../../../../context/routerContext"
import * as XLSX from 'xlsx'

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
  const { selectedCompany } = useCompany()
  const [expenses, setExpenses] = useState<AnnualSoftwareExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [, setIsCreateOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null; name: string }>({
    open: false,
    id: null,
    name: ""
  })
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleExportExcel = () => {
    const dataToExport = expenses.map((e) => ({
      "Aplicación": e.applicationName,
      "Proveedor": e.provider,
      "Categoría": e.category,
      "Estado": e.status,
      "Costo Anual": e.annualCost,
      "Número de Usuarios": e.numberOfUsers,
      "Costo por Usuario": e.costPerUser,
      "Fecha de Renovación": new Date(e.renewalDate).toLocaleDateString('es-ES'),
      "Frecuencia de Pago": e.paymentFrequency,
      "Usuarios Asignados": e.assignedUsers || "-",
      "Notas": e.additionalNotes || "-",
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const colWidths = [25, 15, 15, 12, 15, 18, 18, 18, 18, 20, 30]
    ws['!cols'] = colWidths.map(width => ({ wch: width }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Gastos")
    XLSX.writeFile(wb, `gastos_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({ open: true, id, name })
  }

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`${API_URL}/api/annual-software-expense/delete/${deleteModal.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setExpenses((prev) => prev.filter((e) => e.id !== deleteModal.id))
        setDeleteModal({ open: false, id: null, name: "" })
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Gestión de Gastos</h1>
          <p className="text-sm text-gray-400">
            Suscripciones y aplicaciones empresariales
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition"
          >
            <Download size={16} /> Exportar Excel
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-900 transition"
          >
            <Plus size={16} /> Agregar Gasto
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-800 rounded-xl p-4">
        <p className="text-sm text-gray-400">Gasto Total Anual</p>
        <p className="text-2xl font-semibold">${totalAnnualCost.toFixed(2)}</p>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl p-4 overflow-x-auto">
        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-2 font-semibold text-gray-300">Aplicación</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-300">Proveedor</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-300">Categoría</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-300">Estado</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-300">Costo Anual</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-300">Usuarios</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-300">Costo/Usuario</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-300">Renovación</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-300">Frecuencia</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                  <td className="py-3 px-2 text-gray-100">{e.applicationName}</td>
                  <td className="py-3 px-2 text-gray-400">{e.provider}</td>
                  <td className="py-3 px-2 text-gray-400">{e.category}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      e.status === 'Active' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right text-gray-100 font-medium">${e.annualCost.toFixed(2)}</td>
                  <td className="py-3 px-2 text-center text-gray-400">{e.numberOfUsers}</td>
                  <td className="py-3 px-2 text-right text-gray-400">${e.costPerUser.toFixed(2)}</td>
                  <td className="py-3 px-2 text-gray-400 text-sm">{new Date(e.renewalDate).toLocaleDateString('es-ES')}</td>
                  <td className="py-3 px-2 text-gray-400 text-sm">{e.paymentFrequency}</td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/${selectedCompany?.code}/expenses/edit/${e.id}`)}
                        className="flex items-center gap-1 px-3 py-1 border border-blue-600 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition"
                        title="Ver Reporte"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => navigate(`/${selectedCompany?.code}/expenses/edit/${e.id}`)}
                        className="flex items-center gap-1 px-3 py-1 border border-orange-600 text-orange-400 rounded-lg hover:bg-orange-600 hover:text-white transition"
                        title="Editar Reporte"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(e.id, e.applicationName)}
                        className="flex items-center gap-1 px-3 py-1 border border-red-600 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-sm">
            <h2 className="text-xl font-semibold text-white mb-2">Confirmar eliminación</h2>
            <p className="text-gray-400 mb-6">
              ¿Está seguro de que desea eliminar <span className="font-semibold text-white">{deleteModal.name}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ open: false, id: null, name: "" })}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}