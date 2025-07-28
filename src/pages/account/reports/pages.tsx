"use client"

export default function ReportsPage() {
  const reportes = [
    {
      id: 1,
      titulo: "Inventario por Categoría",
      descripcion: "Distribución de equipos por tipo y estado",
      icono: "cube",
      estado: "Actualizado",
      tipo: "Inventario",
      ultimaActualizacion: "2024-01-20",
    },
    {
      id: 2,
      titulo: "Costos de Mantenimiento",
      descripcion: "Análisis de gastos en mantenimiento mensual",
      icono: "dollar",
      estado: "Actualizado",
      tipo: "Financiero",
      ultimaActualizacion: "2024-01-19",
    },
    {
      id: 3,
      titulo: "Asignaciones por Usuario",
      descripcion: "Equipos asignados por departamento y usuario",
      icono: "users",
      estado: "Pendiente",
      tipo: "Usuarios",
      ultimaActualizacion: "2024-01-18",
    },
    {
      id: 4,
      titulo: "Historial de Mantenimientos",
      descripcion: "Registro completo de mantenimientos realizados",
      icono: "wrench",
      estado: "Actualizado",
      tipo: "Mantenimiento",
      ultimaActualizacion: "2024-01-17",
    },
    {
      id: 5,
      titulo: "Equipos por Vencer Garantía",
      descripcion: "Lista de equipos con garantía próxima a vencer",
      icono: "calendar",
      estado: "Actualizado",
      tipo: "Inventario",
      ultimaActualizacion: "2024-01-16",
    },
    {
      id: 6,
      titulo: "Rendimiento del Departamento IT",
      descripcion: "Métricas de eficiencia y productividad",
      icono: "chart",
      estado: "Pendiente",
      tipo: "Rendimiento",
      ultimaActualizacion: "2024-01-15",
    },
  ]

  const reportesRapidos = [
    { titulo: "Inventario Actual", icono: "cube" },
    { titulo: "Mantenimientos Mes", icono: "wrench" },
    { titulo: "Asignaciones Activas", icono: "users" },
    { titulo: "Costos Mensuales", icono: "dollar" },
  ]

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Actualizado":
        return "bg-green-600 text-green-100"
      case "Pendiente":
        return "bg-yellow-600 text-yellow-100"
      default:
        return "bg-gray-600 text-gray-100"
    }
  }

  const getTypeBadge = (tipo: string) => {
    switch (tipo) {
      case "Inventario":
        return "bg-blue-600 text-blue-100"
      case "Financiero":
        return "bg-green-600 text-green-100"
      case "Usuarios":
        return "bg-purple-600 text-purple-100"
      case "Mantenimiento":
        return "bg-orange-600 text-orange-100"
      case "Rendimiento":
        return "bg-cyan-600 text-cyan-100"
      default:
        return "bg-gray-600 text-gray-100"
    }
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "cube":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        )
      case "dollar":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        )
      case "users":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
          </svg>
        )
      case "wrench":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        )
      case "calendar":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )
      case "chart":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
          </svg>
        )
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <rect x="7" y="7" width="3" height="9" />
            <rect x="14" y="7" width="3" height="5" />
          </svg>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Reportes</h1>
          <p className="text-gray-400">Genera y descarga reportes detallados del sistema</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Programar Reporte</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <rect x="7" y="7" width="3" height="9" />
              <rect x="14" y="7" width="3" height="5" />
            </svg>
            <span>Nuevo Reporte</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Reportes</span>
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-gray-400"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <rect x="7" y="7" width="3" height="9" />
                <rect x="14" y="7" width="3" height="5" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">6</div>
          <div className="text-sm text-gray-400">Disponibles</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Actualizados</span>
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-gray-400"
              >
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">4</div>
          <div className="text-sm text-gray-400">Esta semana</div>
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
                className="w-full h-full text-gray-400"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">2</div>
          <div className="text-sm text-gray-400">Requieren actualización</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Descargas</span>
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-gray-400"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">47</div>
          <div className="text-sm text-gray-400">Este mes</div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {reportes.map((reporte) => (
          <div key={reporte.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 text-gray-400">{getIcon(reporte.icono)}</div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(reporte.estado)}`}
              >
                {reporte.estado}
              </span>
            </div>

            <h3 className="text-lg font-semibold mb-2">{reporte.titulo}</h3>
            <p className="text-gray-400 text-sm mb-4">{reporte.descripcion}</p>

            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-xs">Tipo:</span>
                <span
                  className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeBadge(reporte.tipo)}`}
                >
                  {reporte.tipo}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-xs">Última actualización:</span>
                <span className="ml-2 text-sm">{reporte.ultimaActualizacion}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button className="flex items-center space-x-2 bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex-1 mr-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <rect x="7" y="7" width="3" height="9" />
                  <rect x="14" y="7" width="3" height="5" />
                </svg>
                <span className="text-sm font-medium">Ver Reporte</span>
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Reports */}
      <div>
        <h2 className="text-xl font-bold mb-2">Reportes Rápidos</h2>
        <p className="text-gray-400 text-sm mb-6">Genera reportes instantáneos con datos actuales</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportesRapidos.map((reporte, index) => (
            <button
              key={index}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 text-center transition-colors border border-gray-700"
            >
              <div className="w-8 h-8 mx-auto mb-3 text-gray-400">{getIcon(reporte.icono)}</div>
              <span className="text-sm font-medium">{reporte.titulo}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
