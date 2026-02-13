"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCompany } from "../../../../context/routerContext"
import * as XLSX from "xlsx"
import { usePageName } from "../../../../hook/usePageName"
import PagesHeader from "../../../../components/headers/pagesHeader"
import { useSearch } from "../../../../context/searchContext"
import { useTheme } from "../../../../context/themeContext"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import Loader from "../../../../components/loaders/loader"

const API_URL = import.meta.env.VITE_API_URL as string

interface AssignedUser {
  id: string
  username?: string
  name?: string
  lastName?: string
  email?: string
  department?: string
  person?: {
    department?: {
      name?: string
    }
  }
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

const getFullName = (user: AssignedUser): string => {
  if (user.name && user.lastName) {
    return `${user.name} ${user.lastName}`
  }
  return user.username || "Usuario Desconocido"
}

// ✅ Helper para extraer department
const getDepartment = (user: AssignedUser | undefined): string => {
  return user?.person?.department?.name || user?.department || "-"
}

export default function AllExpensePage() {
  const navigate = useNavigate()
  const { pageName } = usePageName()
  const { selectedCompany } = useCompany()
  const { search } = useSearch()
  const { isDarkMode } = useTheme()

  const [expenses, setExpenses] = useState<AnnualSoftwareExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [allUniqueUsers, setAllUniqueUsers] = useState<AssignedUser[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserFullName, setSelectedUserFullName] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/api/annual-software-expense/getAll`)
      .then((r) => r.json())
      .then((data: AnnualSoftwareExpense[]) => {
        setExpenses(data)
        console.log("📊 Gastos cargados:", data)

        const usersMap = new Map<string, AssignedUser>()
        data.forEach((expense) => {
          if (expense.assignedUsers && Array.isArray(expense.assignedUsers)) {
            expense.assignedUsers.forEach((user) => {
              const fullName = getFullName(user)
              if (!usersMap.has(fullName)) {
                usersMap.set(fullName, user)
              }
            })
          }
        })

        const uniqueUsers = Array.from(usersMap.values()).sort((a, b) => {
          const nameA = getFullName(a).toLowerCase()
          const nameB = getFullName(b).toLowerCase()
          if (nameA < nameB) return -1
          if (nameA > nameB) return 1
          return 0
        })

        console.log("👥 Usuarios únicos extraídos:", uniqueUsers)
        setAllUniqueUsers(uniqueUsers)
      })
      .catch((error) => {
        console.error("❌ Error al cargar gastos:", error)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredExpenses = useMemo(() => {
    if (!search) {
      return expenses
    }
    const lowerCaseSearch = search.toLowerCase()
    return expenses.filter((expense) => {
      return expense.assignedUsers?.some((user) =>
        getFullName(user).toLowerCase().includes(lowerCaseSearch)
      )
    })
  }, [expenses, search])

  const tableData = useMemo(() => {
    const usersArray = allUniqueUsers.map((user) => getFullName(user))
    const applicationsArray = Array.from(
      new Set(filteredExpenses.map((e) => e.applicationName))
    ).sort()

    const data: Record<string, Record<string, number>> = {}

    usersArray.forEach((userName) => {
      data[userName] = {}
      applicationsArray.forEach((app) => {
        data[userName][app] = 0
      })

      filteredExpenses.forEach((expense) => {
        if (expense.assignedUsers && Array.isArray(expense.assignedUsers)) {
          const userInExpense = expense.assignedUsers.find(
            (u) => getFullName(u) === userName
          )
          if (userInExpense) {
            data[userName][expense.applicationName] = expense.costPerUser
          }
        }
      })
    })

    return { users: usersArray, applications: applicationsArray, data }
  }, [filteredExpenses, allUniqueUsers])

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new()

    // ===== HOJA 1: RESUMEN GENERAL =====
    const summaryData: Record<string, unknown>[] = []

    const headerRow: Record<string, unknown> = {
      Empleado: "Empleado",
      Departamento: "Departamento",
    }
    tableData.applications.forEach((app) => {
      headerRow[app] = app
    })
    headerRow.Total = "Total"

    summaryData.push(headerRow)

    let grandTotal = 0

    tableData.users.forEach((userFullName) => {
      const userObj = allUniqueUsers.find(
        (u) => getFullName(u) === userFullName
      )
      const row: Record<string, unknown> = {
        Empleado: userFullName,
        Departamento: getDepartment(userObj),
      }

      let total = 0
      tableData.applications.forEach((app) => {
        const cost = tableData.data[userFullName][app]
        row[app] = cost === 0 ? "-" : cost
        total += cost
      })
      row.Total = total
      grandTotal += total

      summaryData.push(row)
    })

    const totalsRow: Record<string, unknown> = {
      Empleado: "TOTAL",
      Departamento: "",
    }

    tableData.applications.forEach((app) => {
      let appTotal = 0
      tableData.users.forEach((userFullName) => {
        appTotal += tableData.data[userFullName][app]
      })
      totalsRow[app] = appTotal
    })
    totalsRow.Total = grandTotal
    summaryData.push(totalsRow)

    const wsSummary = XLSX.utils.json_to_sheet(summaryData)
    wsSummary["!cols"] = [25, 25, ...Array(tableData.applications.length).fill(15), 15].map(
      (w) => ({ wch: w })
    )

    // Colorear header - Azul
    const summaryRange = XLSX.utils.decode_range(wsSummary["!ref"] || "A1")
    for (let col = 0; col <= summaryRange.e.c; col++) {
      const cellRef = XLSX.utils.encode_col(col) + "1"
      wsSummary[cellRef] = wsSummary[cellRef] || { t: "s", v: "" }
      wsSummary[cellRef].s = {
        fill: { fgColor: { rgb: "4472C4" } },
        font: { bold: true, color: { rgb: "FFFFFF" } },
      }
    }

    // Colorear fila de totales
    const totalRowIndex = summaryData.length
    const totalRowNumber = totalRowIndex.toString()
    for (let col = 0; col <= summaryRange.e.c; col++) {
      const cellRef = XLSX.utils.encode_col(col) + totalRowNumber
      wsSummary[cellRef] = wsSummary[cellRef] || { t: "s", v: "" }
      wsSummary[cellRef].s = {
        fill: { fgColor: { rgb: "D9E1F2" } },
        font: { bold: true },
      }
    }

    // Colorear filas alternas
    for (let row = 2; row < totalRowIndex; row++) {
      const rowColor = row % 2 === 0 ? "FFFFFF" : "F2F2F2"
      for (let col = 0; col <= summaryRange.e.c; col++) {
        const cellRef = XLSX.utils.encode_col(col) + row.toString()
        wsSummary[cellRef] = wsSummary[cellRef] || { t: "s", v: "" }
        wsSummary[cellRef].s = {
          fill: { fgColor: { rgb: rowColor } },
        }
      }
    }

    // Agregar filtros automáticos
    wsSummary["!autofilter"] = { ref: XLSX.utils.encode_range(summaryRange) }

    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen General")

    // ===== HOJAS POR DEPARTAMENTO =====
    const departmentMap = new Map<string, string[]>()

    // Agrupar usuarios por departamento
    tableData.users.forEach((userFullName) => {
      const userObj = allUniqueUsers.find(
        (u) => getFullName(u) === userFullName
      )
      const dept = getDepartment(userObj)

      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, [])
      }
      departmentMap.get(dept)!.push(userFullName)
    })

    // Crear una hoja por cada departamento
    Array.from(departmentMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([deptName, usersInDept]) => {
        const deptData: Record<string, unknown>[] = []

        const deptHeaderRow: Record<string, unknown> = {
          Empleado: "Empleado",
        }
        tableData.applications.forEach((app) => {
          deptHeaderRow[app] = app
        })
        deptHeaderRow.Total = "Total"

        deptData.push(deptHeaderRow)

        let deptGrandTotal = 0

        usersInDept.forEach((userFullName) => {
          const row: Record<string, unknown> = {
            Empleado: userFullName,
          }

          let userTotal = 0
          tableData.applications.forEach((app) => {
            const cost = tableData.data[userFullName][app]
            row[app] = cost === 0 ? "-" : cost
            userTotal += cost
          })
          row.Total = userTotal
          deptGrandTotal += userTotal

          deptData.push(row)
        })

        // Fila de totales
        const deptTotalRow: Record<string, unknown> = {
          Empleado: "TOTAL",
        }
        tableData.applications.forEach((app) => {
          let appTotal = 0
          usersInDept.forEach((userFullName) => {
            appTotal += tableData.data[userFullName][app]
          })
          deptTotalRow[app] = appTotal
        })
        deptTotalRow.Total = deptGrandTotal
        deptData.push(deptTotalRow)

        const wsDept = XLSX.utils.json_to_sheet(deptData)
        wsDept["!cols"] = [25, ...Array(tableData.applications.length).fill(15), 15].map(
          (w) => ({ wch: w })
        )

        // Colorear header - Verde
        const deptRange = XLSX.utils.decode_range(wsDept["!ref"] || "A1")
        for (let col = 0; col <= deptRange.e.c; col++) {
          const cellRef = XLSX.utils.encode_col(col) + "1"
          wsDept[cellRef] = wsDept[cellRef] || { t: "s", v: "" }
          wsDept[cellRef].s = {
            fill: { fgColor: { rgb: "70AD47" } },
            font: { bold: true, color: { rgb: "FFFFFF" } },
          }
        }

        // Colorear fila de totales
        const deptTotalRowIndex = deptData.length
        const deptTotalRowNumber = deptTotalRowIndex.toString()
        for (let col = 0; col <= deptRange.e.c; col++) {
          const cellRef = XLSX.utils.encode_col(col) + deptTotalRowNumber
          wsDept[cellRef] = wsDept[cellRef] || { t: "s", v: "" }
          wsDept[cellRef].s = {
            fill: { fgColor: { rgb: "E2EFD9" } },
            font: { bold: true },
          }
        }

        // Colorear filas alternas
        for (let row = 2; row < deptTotalRowIndex; row++) {
          const rowColor = row % 2 === 0 ? "FFFFFF" : "F2F2F2"
          for (let col = 0; col <= deptRange.e.c; col++) {
            const cellRef = XLSX.utils.encode_col(col) + row.toString()
            wsDept[cellRef] = wsDept[cellRef] || { t: "s", v: "" }
            wsDept[cellRef].s = {
              fill: { fgColor: { rgb: rowColor } },
            }
          }
        }

        // Agregar filtros automáticos
        wsDept["!autofilter"] = { ref: XLSX.utils.encode_range(deptRange) }

        // Nombre de la hoja (máx 31 caracteres)
        const sheetName = deptName === "-" ? "Sin Departamento" : deptName.substring(0, 31)
        XLSX.utils.book_append_sheet(wb, wsDept, sheetName)
      })

    // ===== HOJA FINAL: RESUMEN POR APLICACIÓN =====
    const appData: Record<string, unknown>[] = []
    const appHeaderRow: Record<string, unknown> = {
      Aplicación: "Aplicación",
      "Usuarios Asignados": "Usuarios Asignados",
      "Costo Total": "Costo Total",
    }
    appData.push(appHeaderRow)

    let appGrandTotal = 0

    tableData.applications.forEach((app) => {
      let appTotal = 0
      let userCount = 0

      tableData.users.forEach((userFullName) => {
        const cost = tableData.data[userFullName][app]
        if (cost > 0) {
          appTotal += cost
          userCount += 1
        }
      })

      appGrandTotal += appTotal

      appData.push({
        Aplicación: app,
        "Usuarios Asignados": userCount,
        "Costo Total": appTotal,
      })
    })

    appData.push({
      Aplicación: "TOTAL",
      "Usuarios Asignados": "",
      "Costo Total": appGrandTotal,
    })

    const wsApp = XLSX.utils.json_to_sheet(appData)
    wsApp["!cols"] = [30, 20, 15].map((w) => ({ wch: w }))

    // Colorear header - Naranja
    const appRange = XLSX.utils.decode_range(wsApp["!ref"] || "A1")
    for (let col = 0; col <= appRange.e.c; col++) {
      const cellRef = XLSX.utils.encode_col(col) + "1"
      wsApp[cellRef] = wsApp[cellRef] || { t: "s", v: "" }
      wsApp[cellRef].s = {
        fill: { fgColor: { rgb: "ED7D31" } },
        font: { bold: true, color: { rgb: "FFFFFF" } },
      }
    }

    // Colorear fila de totales
    const appTotalRowIndex = appData.length
    const appTotalRowNumber = appTotalRowIndex.toString()
    for (let col = 0; col <= appRange.e.c; col++) {
      const cellRef = XLSX.utils.encode_col(col) + appTotalRowNumber
      wsApp[cellRef] = wsApp[cellRef] || { t: "s", v: "" }
      wsApp[cellRef].s = {
        fill: { fgColor: { rgb: "FCE4D6" } },
        font: { bold: true },
      }
    }

    // Colorear filas alternas
    for (let row = 2; row < appTotalRowIndex; row++) {
      const rowColor = row % 2 === 0 ? "FFFFFF" : "F2F2F2"
      for (let col = 0; col <= appRange.e.c; col++) {
        const cellRef = XLSX.utils.encode_col(col) + row.toString()
        wsApp[cellRef] = wsApp[cellRef] || { t: "s", v: "" }
        wsApp[cellRef].s = {
          fill: { fgColor: { rgb: rowColor } },
        }
      }
    }

    // Agregar filtros automáticos
    wsApp["!autofilter"] = { ref: XLSX.utils.encode_range(appRange) }

    XLSX.utils.book_append_sheet(wb, wsApp, "Resumen Aplicaciones")

    XLSX.writeFile(
      wb,
      `gastos_software_${new Date().toISOString().split("T")[0]}.xlsx`
    )
  }

  const openUserDetailModal = (userFullName: string) => {
    setSelectedUserFullName(userFullName)
    setIsModalOpen(true)
  }

  const closeUserDetailModal = () => {
    setIsModalOpen(false)
    setSelectedUserFullName(null)
  }

  const userExpensesDetail = useMemo(() => {
    if (!selectedUserFullName) return []

    const detail: { applicationName: string; cost: number }[] = []
    filteredExpenses.forEach((expense) => {
      const userInExpense = expense.assignedUsers?.find(
        (u) => getFullName(u) === selectedUserFullName
      )
      if (userInExpense) {
        detail.push({
          applicationName: expense.applicationName,
          cost: expense.costPerUser,
        })
      }
    })
    return detail
  }, [selectedUserFullName, filteredExpenses])

  const downloadUserExpensePDF = async () => {
    if (!selectedUserFullName) return

    const input = document.getElementById("expense-detail-modal-content")
    if (input) {
      const canvas = await html2canvas(input, { scale: 2 })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(
        `desglose_gastos_${selectedUserFullName.replace(/\s/g, "_")}.pdf`
      )
    }
  }

  const downloadUserExpenseExcel = () => {
    if (!selectedUserFullName || userExpensesDetail.length === 0) {
      alert("No hay datos para descargar")
      return
    }

    const userObj = allUniqueUsers.find(
      (u) => getFullName(u) === selectedUserFullName
    )
    const totalCost = userExpensesDetail.reduce((sum, item) => sum + item.cost, 0)

    const wsData: Record<string, unknown>[] = []

    wsData.push({ "Desglose de Gastos": selectedUserFullName })
    wsData.push({})

    wsData.push({ "Empleado": selectedUserFullName })
    wsData.push({ "Departamento": getDepartment(userObj) })
    wsData.push({ "Email": userObj?.email || "-" })
    wsData.push({})

    wsData.push({
      "Aplicación": "Aplicación",
      "Costo Mensual/Anual": "Costo",
    })

    userExpensesDetail.forEach((item) => {
      wsData.push({
        "Aplicación": item.applicationName,
        "Costo Mensual/Anual": item.cost,
      })
    })

    wsData.push({})
    wsData.push({
      "Aplicación": "TOTAL",
      "Costo Mensual/Anual": totalCost,
    })

    const ws = XLSX.utils.json_to_sheet(wsData)
    ws["!cols"] = [{ wch: 30 }, { wch: 20 }]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Desglose")

    XLSX.writeFile(
      wb,
      `desglose_gastos_${selectedUserFullName.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`
    )
  }

  if (loading) {
    return (
      <Loader/>
    )
  }

  console.log("📋 Tabla data:", tableData)
  console.log("👥 Usuarios a mostrar:", tableData.users)

  return (
    <div
      className={`min-h-screen space-y-4 transition-colors ${
        isDarkMode ? " text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <PagesHeader
        title={"Gastos Anuales de Software"}
        description={
          pageName ? `${pageName} in ${selectedCompany?.name}` : "Cargando compañía..."
        }
        showCreate
        onExport={handleExportExcel}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`rounded-xl p-6 transition-colors ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200 shadow"
          }`}
        >
          <p
            className={`text-sm font-semibold transition-colors ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Total de Usuarios
          </p>
          <p
            className={`text-3xl font-bold mt-2 transition-colors ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`}
          >
            {tableData.users.length}
          </p>
        </div>

        <div
          className={`rounded-xl p-6 transition-colors ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200 shadow"
          }`}
        >
          <p
            className={`text-sm font-semibold transition-colors ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Total Aplicaciones
          </p>
          <p
            className={`text-3xl font-bold mt-2 transition-colors ${
              isDarkMode ? "text-purple-400" : "text-purple-600"
            }`}
          >
            {tableData.applications.length}
          </p>
        </div>

        <div
          className={`rounded-xl p-6 transition-colors ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200 shadow"
          }`}
        >
          <p
            className={`text-sm font-semibold transition-colors ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Costo Total Anual
          </p>
          <p
            className={`text-3xl font-bold mt-2 transition-colors ${
              isDarkMode ? "text-green-400" : "text-green-600"
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
          </p>
        </div>
      </div>

      <div
        className={`rounded-xl overflow-hidden border transition-colors ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow"
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
                  const expense = filteredExpenses.find(
                    (e) => e.applicationName === app
                  )
                  return (
                    <th
                      key={app}
                      className={`text-center py-3 px-2 font-bold transition-colors ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2 w-full">
                        <div className="text-xs whitespace-nowrap">{app}</div>
                        {expense && (
                          <button
                            onClick={() =>
                              navigate(
                                `/${selectedCompany?.code}/expenses/edit/${expense.id}`
                              )
                            }
                            className={`text-xs px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
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
              {tableData.users.length > 0 ? (
                <>
                  {tableData.users.map((userFullName, userIdx) => {
                    const userTotal = tableData.applications.reduce(
                      (sum, app) => sum + tableData.data[userFullName][app],
                      0
                    )
                    const userObj = allUniqueUsers.find(
                      (u) => getFullName(u) === userFullName
                    )

                    return (
                      <tr
                        key={userFullName}
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
                          } cursor-pointer hover:underline`}
                          onClick={() => openUserDetailModal(userFullName)}
                        >
                          {userFullName}
                        </td>
                        <td
                          className={`py-3 px-4 transition-colors ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {getDepartment(userObj)}
                        </td>
                        {tableData.applications.map((app) => {
                          const cost = tableData.data[userFullName][app]
                          return (
                            <td
                              key={`${userFullName}-${app}`}
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
                        (sum, userFullName) =>
                          sum + tableData.data[userFullName][app],
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
                        .reduce((total, userFullName) => {
                          return (
                            total +
                            tableData.applications.reduce(
                              (sum, app) =>
                                sum + tableData.data[userFullName][app],
                              0
                            )
                          )
                        }, 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td
                    colSpan={tableData.applications.length + 3}
                    className="py-8 text-center text-gray-500"
                  >
                    No hay usuarios con datos asignados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`rounded-lg p-4 text-sm transition-colors ${
          isDarkMode
            ? "bg-gray-800 border border-gray-700 text-gray-400"
            : "bg-gray-100 border border-gray-300 text-gray-600"
        }`}
      >
        <p>
          💡 La tabla muestra el costo por usuario para cada aplicación. Haz clic en el nombre de un
          empleado para ver el desglose de sus gastos. Los valores "-" indican que el usuario no
          tiene asignada esa aplicación para los filtros actuales.
        </p>
      </div>

      {isModalOpen && selectedUserFullName && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={closeUserDetailModal}
        >
          <div
            className={`relative p-6 rounded-lg shadow-xl w-full md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto transition-colors ${
              isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              Desglose de Gastos para: {selectedUserFullName}
            </h2>

            <div id="expense-detail-modal-content" className="space-y-4">
              {userExpensesDetail.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead
                    className={`${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <tr>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Aplicación
                      </th>
                      <th
                        className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Costo
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isDarkMode ? "divide-gray-700" : "divide-gray-200"
                    }`}
                  >
                    {userExpensesDetail.map((item, index) => (
                      <tr
                        key={index}
                        className={`${isDarkMode ? "bg-gray-800" : "bg-white"}`}
                      >
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isDarkMode ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          {item.applicationName}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-right ${
                            isDarkMode ? "text-green-400" : "text-green-700"
                          }`}
                        >
                          ${item.cost.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr
                      className={`font-bold ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Total
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-right ${
                          isDarkMode ? "text-green-400" : "text-green-700"
                        }`}
                      >
                        $
                        {userExpensesDetail
                          .reduce((sum, item) => sum + item.cost, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p>No hay gastos asignados a este empleado que coincidan con los filtros actuales.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 flex-wrap">
              <button
                onClick={downloadUserExpenseExcel}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isDarkMode
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                📥 Descargar Excel
              </button>
              <button
                onClick={downloadUserExpensePDF}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                📄 Descargar PDF
              </button>
              <button
                onClick={closeUserDetailModal}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isDarkMode
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                }`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}