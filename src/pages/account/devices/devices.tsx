"use client"

export default function DevicesPage() {
  const equipos = [
    {
      id: 1,
      nombre: "Laptop Dell Desarrollo",
      marca: "Dell Latitude 5520",
      placa: "PLC-2024-001",
      serie: "DL5520001",
      usuario: "Juan Pérez",
      ubicacion: "Oficina Principal - Piso 2",
      departamento: "Desarrollo",
      especificaciones: "Intel i7, 16GB RAM, 512GB SSD",
      estado: "En Uso",
      garantia: "2025-01-15",
      costo: "$1,200",
    },
    {
      id: 2,
      nombre: "Desktop HP Ventas",
      marca: "HP EliteDesk 800",
      placa: "PLC-2024-002",
      serie: "HP800002",
      usuario: "María García",
      ubicacion: "Oficina Principal - Piso 1",
      departamento: "Ventas",
      especificaciones: "Intel i5, 8GB RAM, 256GB SSD",
      estado: "En Uso",
      garantia: "2024-11-20",
      costo: "$800",
    },
    {
      id: 3,
      nombre: "Impresora Oficina",
      marca: "HP LaserJet Pro M404n",
      placa: "PLC-2024-004",
      serie: "HPL3004",
      usuario: "Uso Compartido",
      ubicacion: "Oficina Principal - Sala de Impresión",
      departamento: "General",
      especificaciones: "Láser, Monocromático, Red",
      estado: "Mantenimiento",
      garantia: "2024-08-05",
      costo: "$300",
    },
    {
      id: 4,
      nombre: "Switch Principal",
      marca: "Cisco Catalyst 2960",
      placa: "PLC-2024-005",
      serie: "CS2960005",
      usuario: "Roberto Silva",
      ubicacion: "Sala de Servidores",
      departamento: "IT",
      especificaciones: "24 puertos, Gigabit",
      estado: "Activo",
      garantia: "2024-12-01",
      costo: "$500",
    },
  ]

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "En Uso":
        return "bg-blue-600 text-blue-100"
      case "Mantenimiento":
        return "bg-yellow-600 text-yellow-100"
      case "Activo":
        return "bg-green-600 text-green-100"
      default:
        return "bg-gray-600 text-gray-100"
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Header */}
      <div className="bg-gray-100 text-gray-900 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-full h-full text-green-600"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-green-600">Gestión de Equipos</h3>
            <p className="text-sm text-gray-600">Administra el ciclo de vida completo de los equipos</p>
          </div>
        </div>
        <div className="w-80">
          <input
            type="text"
            placeholder=""
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestión de Equipos - Empresa Principal S.A.</h1>
            <p className="text-gray-400">Administra el ciclo de vida completo de los equipos tecnológicos</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Exportar</span>
            </button>
            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Agregar Equipo</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Equipos</span>
              <div className="w-6 h-6">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-full h-full text-gray-400"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">4</div>
            <div className="text-sm text-gray-400">En Empresa Principal S.A.</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">En Uso</span>
              <div className="w-6 h-6">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-full h-full text-gray-400"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">2</div>
            <div className="text-sm text-gray-400">Equipos asignados</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Disponibles</span>
              <div className="w-6 h-6">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-full h-full text-gray-400"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">0</div>
            <div className="text-sm text-gray-400">Sin asignar</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Garantías por Vencer</span>
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
            <div className="text-3xl font-bold mb-1">0</div>
            <div className="text-sm text-gray-400">Próximos 30 días</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
            <button className="px-4 py-2 text-sm font-medium bg-gray-700 text-white rounded-md">
              Todos los Equipos
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
              Asignaciones
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
              Garantías
            </button>
          </div>
        </div>

        {/* Equipment List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold mb-2">Lista de Equipos</h2>
            <p className="text-gray-400 text-sm mb-6">4 equipos encontrados en Empresa Principal S.A.</p>

            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nombre, marca, modelo, serie o usuario..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="ml-4">
                <div className="relative">
                  <select className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
                    <option>Todos los...</option>
                    <option>Laptop</option>
                    <option>Desktop</option>
                    <option>Impresora</option>
                    <option>Switch</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-4 h-4 text-gray-400"
                    >
                      <polyline points="6,9 12,15 18,9" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-750">
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Equipo</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Usuario/Ubicación</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Especificaciones</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Estado</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Garantía</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Costo</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {equipos.map((equipo) => (
                  <tr key={equipo.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{equipo.nombre}</div>
                        <div className="text-sm text-gray-400">{equipo.marca}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {equipo.placa} | {equipo.serie}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start space-x-2">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="w-4 h-4 mt-0.5 text-gray-400"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
                        </svg>
                        <div>
                          <div className="text-sm font-medium">{equipo.usuario}</div>
                          <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="w-3 h-3"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{equipo.ubicacion}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{equipo.departamento}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{equipo.especificaciones}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(equipo.estado)}`}
                      >
                        {equipo.estado}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1 text-sm">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="w-4 h-4 text-gray-400"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{equipo.garantia}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium">{equipo.costo}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button className="p-1 text-gray-400 hover:text-white transition-colors">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-4 h-4"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-4 h-4"
                          >
                            <polyline points="3,6 5,6 21,6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
