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

interface AssignedPerson {
  id: string
  firstName?: string
  lastName?: string
  fullName?: string
  contactEmail?: string
  department?: {
    id: string
    name: string
  }
  user?: {
    id: string
    username: string
    email: string
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
  assignedPersons?: AssignedPerson[]
  createdAt: string
}

const getFullName = (person: AssignedPerson): string => {
  if (person.fullName) {
    return person.fullName
  }
  if (person.firstName && person.lastName) {
    return `${person.firstName} ${person.lastName}`
  }
  if (person.user?.username) {
    return person.user.username
  }
  return "Persona Desconocida"
}

// ✅ Helper para extraer department
const getDepartment = (person: AssignedPerson | undefined): string => {
  return person?.department?.name || "-"
}

export default function AllExpensePage() {
  const navigate = useNavigate()
  const { pageName } = usePageName()
  const { selectedCompany } = useCompany()
  const { search } = useSearch()
  const { isDarkMode } = useTheme()

  const [expenses, setExpenses] = useState<AnnualSoftwareExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [allUniquePersons, setAllUniquePersons] = useState<AssignedPerson[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPersonFullName, setSelectedPersonFullName] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/api/annual-software-expense/getAll`)
      .then((r) => r.json())
      .then((data: AnnualSoftwareExpense[]) => {
        setExpenses(data)
        console.log("📊 Gastos cargados:", data)

        const personsMap = new Map<string, AssignedPerson>()
        data.forEach((expense) => {
          if (expense.assignedPersons && Array.isArray(expense.assignedPersons)) {
            expense.assignedPersons.forEach((person) => {
              const fullName = getFullName(person)
              if (!personsMap.has(fullName)) {
                personsMap.set(fullName, person)
              }
            })
          }
        })

        const uniquePersons = Array.from(personsMap.values()).sort((a, b) => {
          const nameA = getFullName(a).toLowerCase()
          const nameB = getFullName(b).toLowerCase()
          if (nameA < nameB) return -1
          if (nameA > nameB) return 1
          return 0
        })

        console.log("👥 Personas únicas extraídas:", uniquePersons)
        setAllUniquePersons(uniquePersons)
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
      return expense.assignedPersons?.some((person) =>
        getFullName(person).toLowerCase().includes(lowerCaseSearch)
      )
    })
  }, [expenses, search])

  const tableData = useMemo(() => {
    const personsArray = allUniquePersons.map((person) => getFullName(person))
    const applicationsArray = Array.from(
      new Set(filteredExpenses.map((e) => e.applicationName))
    ).sort()

    const data: Record<string, Record<string, number>> = {}

    personsArray.forEach((personName) => {
      data[personName] = {}
      applicationsArray.forEach((app) => {
        data[personName][app] = 0
      })

      filteredExpenses.forEach((expense) => {
        if (expense.assignedPersons && Array.isArray(expense.assignedPersons)) {
          const personInExpense = expense.assignedPersons.find(
            (p) => getFullName(p) === personName
          )
          if (personInExpense) {
            data[personName][expense.applicationName] = expense.costPerUser
          }
        }
      })
    })

    return { persons: personsArray, applications: applicationsArray, data }
  }, [filteredExpenses, allUniquePersons])

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new()

    // ===== HOJA 1: RESUMEN GENERAL =====
    const summaryData: Record<string, unknown>[] = []

    const headerRow: Record<string, unknown> = {
      Colaborador: "Colaborador",
      Departamento: "Departamento",
    }
    tableData.applications.forEach((app) => {
      headerRow[app] = app
    })
    headerRow.Total = "Total"

    summaryData.push(headerRow)

    let grandTotal = 0

    tableData.persons.forEach((personFullName) => {
      const personObj = allUniquePersons.find(
        (p) => getFullName(p) === personFullName
      )
      const row: Record<string, unknown> = {
        Colaborador: personFullName,
        Departamento: getDepartment(personObj),
      }

      let total = 0
      tableData.applications.forEach((app) => {
        const cost = tableData.data[personFullName][app]
        row[app] = cost === 0 ? "-" : cost
        total += cost
      })
      row.Total = total
      grandTotal += total

      summaryData.push(row)
    })

    const totalsRow: Record<string, unknown> = {
      Colaborador: "TOTAL",
      Departamento: "",
    }

    tableData.applications.forEach((app) => {
      let appTotal = 0
      tableData.persons.forEach((personFullName) => {
        appTotal += tableData.data[personFullName][app]
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

    // Agrupar personas por departamento
    tableData.persons.forEach((personFullName) => {
      const personObj = allUniquePersons.find(
        (p) => getFullName(p) === personFullName
      )
      const dept = getDepartment(personObj)

      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, [])
      }
      departmentMap.get(dept)!.push(personFullName)
    })

    // Crear una hoja por cada departamento
    Array.from(departmentMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([deptName, personsInDept]) => {
        const deptData: Record<string, unknown>[] = []

        const deptHeaderRow: Record<string, unknown> = {
          Colaborador: "Colaborador",
        }
        tableData.applications.forEach((app) => {
          deptHeaderRow[app] = app
        })
        deptHeaderRow.Total = "Total"

        deptData.push(deptHeaderRow)

        let deptGrandTotal = 0

        personsInDept.forEach((personFullName) => {
          const row: Record<string, unknown> = {
            Colaborador: personFullName,
          }

          let personTotal = 0
          tableData.applications.forEach((app) => {
            const cost = tableData.data[personFullName][app]
            row[app] = cost === 0 ? "-" : cost
            personTotal += cost
          })
          row.Total = personTotal
          deptGrandTotal += personTotal

          deptData.push(row)
        })

        // Fila de totales
        const deptTotalRow: Record<string, unknown> = {
          Colaborador: "TOTAL",
        }
        tableData.applications.forEach((app) => {
          let appTotal = 0
          personsInDept.forEach((personFullName) => {
            appTotal += tableData.data[personFullName][app]
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
      let personCount = 0

      tableData.persons.forEach((personFullName) => {
        const cost = tableData.data[personFullName][app]
        if (cost > 0) {
          appTotal += cost
          personCount += 1
        }
      })

      appGrandTotal += appTotal

      appData.push({
        Aplicación: app,
        "Usuarios Asignados": personCount,
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

  const openPersonDetailModal = (personFullName: string) => {
    setSelectedPersonFullName(personFullName)
    setIsModalOpen(true)
  }

  const closePersonDetailModal = () => {
    setIsModalOpen(false)
    setSelectedPersonFullName(null)
  }

  const personExpensesDetail = useMemo(() => {
    if (!selectedPersonFullName) return []

    const detail: { applicationName: string; cost: number }[] = []
    filteredExpenses.forEach((expense) => {
      const personInExpense = expense.assignedPersons?.find(
        (p) => getFullName(p) === selectedPersonFullName
      )
      if (personInExpense) {
        detail.push({
          applicationName: expense.applicationName,
          cost: expense.costPerUser,
        })
      }
    })
    return detail
  }, [selectedPersonFullName, filteredExpenses])

  const downloadPersonExpensePDF = async () => {
    if (!selectedPersonFullName) return

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
        `desglose_gastos_${selectedPersonFullName.replace(/\s/g, "_")}.pdf`
      )
    }
  }

  const downloadPersonExpenseExcel = () => {
    if (!selectedPersonFullName || personExpensesDetail.length === 0) {
      alert("No hay datos para descargar")
      return
    }

    const personObj = allUniquePersons.find(
      (p) => getFullName(p) === selectedPersonFullName
    )
    const totalCost = personExpensesDetail.reduce((sum, item) => sum + item.cost, 0)

    const wsData: Record<string, unknown>[] = []

    wsData.push({ "Desglose de Gastos": selectedPersonFullName })
    wsData.push({})

    wsData.push({ "Colaborador": selectedPersonFullName })
    wsData.push({ "Departamento": getDepartment(personObj) })
    wsData.push({ "Email": personObj?.contactEmail || personObj?.user?.email || "-" })
    wsData.push({})

    wsData.push({
      "Aplicación": "Aplicación",
      "Costo Mensual/Anual": "Costo",
    })

    personExpensesDetail.forEach((item) => {
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
      `desglose_gastos_${selectedPersonFullName.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`
    )
  }

  if (loading) {
    return (
      <Loader/>
    )
  }

  console.log("📋 Tabla data:", tableData)
  console.log("👥 Personas a mostrar:", tableData.persons)

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
            Total de Personas
          </p>
          <p
            className={`text-3xl font-bold mt-2 transition-colors ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`}
          >
            {tableData.persons.length}
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
            {tableData.persons
              .reduce((total, person) => {
                return (
                  total +
                  tableData.applications.reduce(
                    (sum, app) => sum + tableData.data[person][app],
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
                  Colaborador
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
              {tableData.persons.length > 0 ? (
                <>
                  {tableData.persons.map((personFullName, personIdx) => {
                    const personTotal = tableData.applications.reduce(
                      (sum, app) => sum + tableData.data[personFullName][app],
                      0
                    )
                    const personObj = allUniquePersons.find(
                      (p) => getFullName(p) === personFullName
                    )

                    return (
                      <tr
                        key={personFullName}
                        className={`border-b transition-colors ${
                          isDarkMode
                            ? `border-gray-700 ${
                                personIdx % 2 === 0
                                  ? "bg-gray-800 hover:bg-gray-700"
                                  : "bg-gray-800/50 hover:bg-gray-700"
                              }`
                            : `border-gray-200 ${
                                personIdx % 2 === 0
                                  ? "bg-gray-50 hover:bg-gray-100"
                                  : "bg-white hover:bg-gray-50"
                              }`
                        }`}
                      >
                        <td
                          className={`py-3 px-4 font-semibold transition-colors ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          } cursor-pointer hover:underline`}
                          onClick={() => openPersonDetailModal(personFullName)}
                        >
                          {personFullName}
                        </td>
                        <td
                          className={`py-3 px-4 transition-colors ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {getDepartment(personObj)}
                        </td>
                        {tableData.applications.map((app) => {
                          const cost = tableData.data[personFullName][app]
                          return (
                            <td
                              key={`${personFullName}-${app}`}
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
                          ${personTotal.toFixed(2)}
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
                      const appTotal = tableData.persons.reduce(
                        (sum, personFullName) =>
                          sum + tableData.data[personFullName][app],
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
                      {tableData.persons
                        .reduce((total, personFullName) => {
                          return (
                            total +
                            tableData.applications.reduce(
                              (sum, app) =>
                                sum + tableData.data[personFullName][app],
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
                    No hay personas con datos asignados
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
          Colaborador para ver el desglose de sus gastos. Los valores "-" indican que la persona no
          tiene asignada esa aplicación para los filtros actuales.
        </p>
      </div>

      {isModalOpen && selectedPersonFullName && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={closePersonDetailModal}
        >
          <div
            className={`relative p-6 rounded-lg shadow-xl w-full md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto transition-colors ${
              isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              Desglose de Gastos para: {selectedPersonFullName}
            </h2>

            <div id="expense-detail-modal-content" className="space-y-4">
              {personExpensesDetail.length > 0 ? (
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
                    {personExpensesDetail.map((item, index) => (
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
                        {personExpensesDetail
                          .reduce((sum, item) => sum + item.cost, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p>No hay gastos asignados a esta persona que coincidan con los filtros actuales.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 flex-wrap">
              <button
                onClick={downloadPersonExpenseExcel}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isDarkMode
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                📥 Descargar Excel
              </button>
              <button
                onClick={downloadPersonExpensePDF}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                📄 Descargar PDF
              </button>
              <button
                onClick={closePersonDetailModal}
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