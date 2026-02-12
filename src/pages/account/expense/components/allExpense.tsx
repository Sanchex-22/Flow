"use client"

import { useEffect, useMemo, useState } from "react"
// import { Download, Filter } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useCompany } from "../../../../context/routerContext"
import * as XLSX from "xlsx"
import { usePageName } from "../../../../hook/usePageName"
import PagesHeader from "../../../../components/headers/pagesHeader"
// import { useSearch } from "../../../../context/searchContext"
import { useTheme } from "../../../../context/themeContext"

const API_URL = import.meta.env.VITE_API_URL as string

interface AssignedUser {
  id: string
  name: string
  lastName: string
  email?: string
  department?: string
}

interface AnnualSoftwareExpense {
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
  assignedUsers?: AssignedUser[]
  createdAt: string
}

export default function AllExpensePage() {
  const navigate = useNavigate()
  const { pageName } = usePageName()
  const { selectedCompany } = useCompany()
  // const { search } = useSearch()
  const { isDarkMode } = useTheme()

  const [expenses, setExpenses] = useState<AnnualSoftwareExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [allUsers, setAllUsers] = useState<
    Set<string>
  >(new Set())

  useEffect(() => {
    fetch(`${API_URL}/api/annual-software-expense/getAll`)
      .then((r) => r.json())
      .then((data: AnnualSoftwareExpense[]) => {
        setExpenses(data)

        // Extraer todos los usuarios únicos
        const usersSet = new Set<string>()
        data.forEach((expense) => {
          if (expense.assignedUsers && Array.isArray(expense.assignedUsers)) {
            expense.assignedUsers.forEach((user) => {
              usersSet.add(`${user.name} ${user.lastName}`)
            })
          }
        })
        setAllUsers(usersSet)
      })
      .finally(() => setLoading(false))
  }, [])

  // Crear tabla tipo Excel
  const tableData = useMemo(() => {
    const usersArray = Array.from(allUsers).sort()
    const applicationsArray = expenses.map((e) => e.applicationName).sort()

    // Crear objeto con datos
    const data: Record<string, Record<string, number>> = {}

    usersArray.forEach((userName) => {
      data[userName] = {}
      applicationsArray.forEach((app) => {
        data[userName][app] = 0
      })

      // Llenar con costos
      expenses.forEach((expense) => {
        if (
          expense.assignedUsers &&
          Array.isArray(expense.assignedUsers)
        ) {
          const userInExpense = expense.assignedUsers.find(
            (u) => `${u.name} ${u.lastName}` === userName
          )
          if (userInExpense) {
            data[userName][expense.applicationName] = expense.costPerUser
          }
        }
      })
    })

    return { users: usersArray, applications: applicationsArray, data }
  }, [expenses, allUsers])

  const handleExportExcel = () => {
    const wsData: Record<string, unknown>[] = []

    // Header row
    const headerRow: Record<string, unknown> = {
      Empleado: "Empleado",
      Departamento: "Departamento"
    }
    tableData.applications.forEach((app) => {
      headerRow[app] = app
    })
    headerRow.Total = "Total"

    wsData.push(headerRow)

    // Data rows
    tableData.users.forEach((user) => {
      const row: Record<string, unknown> = {
        Empleado: user,
        Departamento: "" // Puedes extraer esto del usuario si lo tienes
      }

      let total = 0
      tableData.applications.forEach((app) => {
        const cost = tableData.data[user][app]
        row[app] = cost === 0 ? "-" : cost.toFixed(2)
        total += cost
      })
      row.Total = total.toFixed(2)

      wsData.push(row)
    })

    // Totales por aplicación
    const totalsRow: Record<string, unknown> = {
      Empleado: "TOTAL",
      Departamento: ""
    }
    let grandTotal = 0
    tableData.applications.forEach((app) => {
      let appTotal = 0
      tableData.users.forEach((user) => {
        appTotal += tableData.data[user][app]
      })
      totalsRow[app] = appTotal.toFixed(2)
      grandTotal += appTotal
    })
    totalsRow.Total = grandTotal.toFixed(2)
    wsData.push(totalsRow)

    // Crear sheet
    const ws = XLSX.utils.json_to_sheet(wsData)
    ws["!cols"] = [25, 25, ...Array(tableData.applications.length).fill(15), 15].map(
      (w) => ({ wch: w })
    )

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Costos Usuario")
    XLSX.writeFile(
      wb,
      `costos_usuario_${new Date().toISOString().split("T")[0]}.xlsx`
    )
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors ${
          isDarkMode
            ? "bg-gray-950 text-gray-100"
            : "bg-gray-50 text-gray-900"
        }`}
      >
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen space-y-6 transition-colors ${
        isDarkMode
          ? "bg-gray-950 text-gray-100"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <PagesHeader
        title={pageName}
        description={
          pageName ? `${pageName} in ${selectedCompany?.name}` : "Cargando compañía..."
        }
        showCreate
        onExport={handleExportExcel}
      />

      {/* Table */}
      <div
        className={`rounded-xl overflow-hidden border transition-colors ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200 shadow"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className={`transition-colors ${
                  isDarkMode
                    ? "bg-blue-900 border-b border-gray-700"
                    : "bg-blue-100 border-b border-gray-300"
                }`}
              >
                <th
                  className={`text-left py-3 px-4 font-bold transition-colors ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Empleado
                </th>
                <th
                  className={`text-left py-3 px-4 font-bold transition-colors ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Departamento
                </th>
                {tableData.applications.map((app) => {
                  // Encontrar el gasto correspondiente a esta aplicación
                  const expense = expenses.find((e) => e.applicationName === app)
                  return (
                    <th
                      key={app}
                      className={`text-center py-3 px-2 font-bold transition-colors ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-xs break-words">{app}</div>
                        {expense && (
                          <button
                            onClick={() =>
                              navigate(
                                `/${selectedCompany?.code}/expenses/edit/${expense.id}`
                              )
                            }
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              isDarkMode
                                ? "bg-orange-600 hover:bg-orange-700 text-white"
                                : "bg-orange-500 hover:bg-orange-600 text-white"
                            }`}
                            title="Editar aplicación"
                          >
                            ✎ Editar
                          </button>
                        )}
                      </div>
                    </th>
                  )
                })}
                <th
                  className={`text-right py-3 px-4 font-bold transition-colors ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.users.map((user, userIdx) => {
                const userTotal = tableData.applications.reduce(
                  (sum, app) => sum + tableData.data[user][app],
                  0
                )
                return (
                  <tr
                    key={user}
                    className={`border-b transition-colors ${
                      isDarkMode
                        ? `border-gray-700 ${
                            userIdx % 2 === 0
                              ? "bg-gray-800 hover:bg-gray-700"
                              : "bg-gray-800/50 hover:bg-gray-700"
                          }`
                        : `border-gray-200 ${
                            userIdx % 2 === 0
                              ? "bg-gray-50 hover:bg-gray-100"
                              : "bg-white hover:bg-gray-50"
                          }`
                    }`}
                  >
                    <td
                      className={`py-3 px-4 font-semibold transition-colors ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user}
                    </td>
                    <td
                      className={`py-3 px-4 transition-colors ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      -
                    </td>
                    {tableData.applications.map((app) => {
                      const cost = tableData.data[user][app]
                      return (
                        <td
                          key={`${user}-${app}`}
                          className={`py-3 px-3 text-center text-xs transition-colors ${
                            cost > 0
                              ? isDarkMode
                                ? "text-green-400 font-medium"
                                : "text-green-700 font-medium"
                              : isDarkMode
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          {cost > 0 ? cost.toFixed(2) : "-"}
                        </td>
                      )
                    })}
                    <td
                      className={`py-3 px-4 text-right font-bold transition-colors ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      ${userTotal.toFixed(2)}
                    </td>
                  </tr>
                )
              })}

              {/* Total Row */}
              <tr
                className={`font-bold transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 border-t-2 border-gray-600"
                    : "bg-gray-100 border-t-2 border-gray-300"
                }`}
              >
                <td
                  className={`py-4 px-4 transition-colors ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  TOTAL
                </td>
                <td
                  className={`py-4 px-4 transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  -
                </td>
                {tableData.applications.map((app) => {
                  const appTotal = tableData.users.reduce(
                    (sum, user) => sum + tableData.data[user][app],
                    0
                  )
                  return (
                    <td
                      key={`total-${app}`}
                      className={`py-4 px-3 text-center transition-colors ${
                        isDarkMode ? "text-green-400" : "text-green-700"
                      }`}
                    >
                      {appTotal.toFixed(2)}
                    </td>
                  )
                })}
                <td
                  className={`py-4 px-4 text-right transition-colors ${
                    isDarkMode ? "text-green-400" : "text-green-700"
                  }`}
                >
                  $
                  {tableData.users
                    .reduce((total, user) => {
                      return (
                        total +
                        tableData.applications.reduce(
                          (sum, app) => sum + tableData.data[user][app],
                          0
                        )
                      )
                    }, 0)
                    .toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Help text */}
      <div
        className={`rounded-lg p-4 text-sm transition-colors ${
          isDarkMode
            ? "bg-gray-800 border border-gray-700 text-gray-400"
            : "bg-gray-100 border border-gray-300 text-gray-600"
        }`}
      >
        <p>
          💡 La tabla muestra el costo por usuario para cada aplicación. Los
          valores "-" indican que el usuario no tiene asignada esa aplicación.
        </p>
      </div>
    </div>
  )
}