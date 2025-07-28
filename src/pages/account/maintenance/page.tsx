"use client"

import { useState } from "react"

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState("Todos")

  const mantenimientos = [
    {
      id: "MNT001",
      equipo: "Dell Latitude 5520",
      equipoId: "EQ001",
      tipo: "Preventivo",
      estado: "Completado",
      prioridad: "Media",
      tecnico: "Carlos López",
      fecha: "2024-01-15",
      costo: "$50",
    },
    {
      id: "MNT002",
      equipo: "HP LaserJet Pro",
      equipoId: "EQ004",
      tipo: "Correctivo",
      estado: "En Progreso",
      prioridad: "Alta",
      tecnico: "Ana Martínez",
      fecha: "2024-01-20",
      costo: "$120",
    },
    {
      id: "MNT003",
      equipo: "Cisco Switch 24p",
      equipoId: "EQ005",
      tipo: "Preventivo",
      estado: "Programado",
      prioridad: "Baja",
      tecnico: "Roberto Silva",
      fecha: "2024-01-25",
      costo: "$30",
    },
    {
      id: "MNT004",
      equipo: "HP EliteDesk 800",
      equipoId: "EQ002",
      tipo: "Correctivo",
      estado: "Pendiente",
      prioridad: "Media",
      tecnico: "Carlos López",
      fecha: "2024-01-22",
      costo: "$200",
    },
  ]

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Completado":
        return "bg-green-600 text-green-100"
      case "En Progreso":
        return "bg-blue-600 text-blue-100"
      case "Programado":
        return "bg-yellow-600 text-yellow-100"
      case "Pendiente":
        return "bg-red-600 text-red-100"
      default:
        return "bg-gray-600 text-gray-100"
    }
  }

  const getPriorityBadge = (prioridad: string) => {
    switch (prioridad) {
      case "Alta":
        return "bg-red-600 text-red-100"
      case "Media":
        return "bg-yellow-600 text-yellow-100"
      case "Baja":
        return "bg-green-600 text-green-100"
      default:
        return "bg-gray-600 text-gray-100"
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "Completado":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-green-400">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        )
      case "En Progreso":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-400">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        )
      case "Programado":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 text-yellow-400"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        )
      case "Pendiente":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-red-400">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="m12 17 .01 0" />
          </svg>
        )
      default:
        return null
    }
  }

  const filteredMantenimientos = mantenimientos.filter((mantenimiento) => {
    if (activeTab === "Todos") return true
    if (activeTab === "Pendientes")
      return (
        mantenimiento.estado === "Pendiente" ||
        mantenimiento.estado === "En Progreso" ||
        mantenimiento.estado === "Programado"
      )
    if (activeTab === "Completados") return mantenimiento.estado === "Completado"
    return true
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Mantenimiento</h1>
          <p className="text-gray-400">Gestiona el mantenimiento preventivo y correctivo de equipos</p>
        </div>
        <div>
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Programar Mantenimiento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Mantenimientos</span>
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-gray-400"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">4</div>
          <div className="text-sm text-gray-400">Este mes</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Pendientes</span>
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-yellow-400"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="m12 17 .01 0" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">3</div>
          <div className="text-sm text-gray-400">Requieren atención</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Completados</span>
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-green-400"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">1</div>
          <div className="text-sm text-gray-400">Este mes</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Costo Total</span>
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-gray-400"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">$400</div>
          <div className="text-sm text-gray-400">Este mes</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
          {["Todos", "Pendientes", "Completados"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Maintenance List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold mb-2">Todos los Mantenimientos</h2>
          <p className="text-gray-400 text-sm">Lista completa de mantenimientos programados y realizados</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-sm font-medium text-gray-300">ID</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Equipo</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Tipo</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Estado</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Prioridad</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Técnico</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Fecha</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Costo</th>
              </tr>
            </thead>
            <tbody>
              {filteredMantenimientos.map((mantenimiento) => (
                <tr key={mantenimiento.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-4 text-sm font-medium">{mantenimiento.id}</td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-sm">{mantenimiento.equipo}</div>
                      <div className="text-xs text-gray-400">{mantenimiento.equipoId}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{mantenimiento.tipo}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(mantenimiento.estado)}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(mantenimiento.estado)}`}
                      >
                        {mantenimiento.estado}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(mantenimiento.prioridad)}`}
                    >
                      {mantenimiento.prioridad}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{mantenimiento.tecnico}</td>
                  <td className="p-4 text-sm">{mantenimiento.fecha}</td>
                  <td className="p-4 text-sm font-medium">{mantenimiento.costo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
