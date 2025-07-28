"use client"

export default function NextworkPage() {
  const conexiones = [
    {
      id: 1,
      nombre: "Conexión Principal",
      ubicacion: "Sala de Servidores Principal",
      proveedor: "Telmex Empresarial",
      contacto: "Juan Soporte - 555-0101",
      tipo: "Fibra Óptica",
      ipPublica: "201.123.45.67",
      ipPrivada: "192.168.1.0/24",
      velocidadBajada: "100 Mbps",
      velocidadSubida: "50 Mbps",
      estado: "Activo",
      costo: "$2,500",
    },
    {
      id: 2,
      nombre: "Conexión Respaldo",
      ubicacion: "Sala de Servidores Principal",
      proveedor: "Totalplay Business",
      contacto: "Ana Respaldo - 555-0202",
      tipo: "Cable",
      ipPublica: "189.234.56.78",
      ipPrivada: "192.168.2.0/24",
      velocidadBajada: "50 Mbps",
      velocidadSubida: "25 Mbps",
      estado: "Standby",
      costo: "$1,800",
    },
    {
      id: 3,
      nombre: "VPN Corporativa",
      ubicacion: "Servidor VPN",
      proveedor: "Cisco Systems",
      contacto: "Soporte Cisco - 555-0404",
      tipo: "VPN",
      ipPublica: "VPN Pool",
      ipPrivada: "172.16.0.0/16",
      velocidadBajada: "N/A",
      velocidadSubida: "N/A",
      estado: "Activo",
      costo: "$800",
    },
  ]

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Activo":
        return "bg-green-600 text-green-100"
      case "Standby":
        return "bg-yellow-600 text-yellow-100"
      case "Inactivo":
        return "bg-red-600 text-red-100"
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
              className="w-full h-full text-blue-600"
            >
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-blue-600">Configuración de Red</h3>
            <p className="text-sm text-gray-600">Gestiona la infraestructura de red por empresa</p>
          </div>
        </div>
        <div className="w-80">
          <input
            type="text"
            placeholder=""
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Registros de Red - Empresa Principal S.A.</h1>
            <p className="text-gray-400">Administra conexiones, proveedores y configuraciones de red</p>
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
              <span>Agregar Conexión</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Conexiones</span>
              <div className="w-6 h-6">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-full h-full text-gray-400"
                >
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">3</div>
            <div className="text-sm text-gray-400">En Empresa Principal S.A.</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Conexiones Activas</span>
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
            <div className="text-3xl font-bold mb-1">2</div>
            <div className="text-sm text-gray-400">En funcionamiento</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Proveedores</span>
              <div className="w-6 h-6">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-full h-full text-gray-400"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">3</div>
            <div className="text-sm text-gray-400">Diferentes proveedores</div>
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
            <div className="text-3xl font-bold mb-1">$7,300</div>
            <div className="text-sm text-gray-400">Costo mensual total</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
            <button className="px-4 py-2 text-sm font-medium bg-gray-700 text-white rounded-md">Conexiones</button>
            <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
              Proveedores
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
              Monitoreo
            </button>
          </div>
        </div>

        {/* Network Connections List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold mb-2">Lista de Conexiones de Red</h2>
            <p className="text-gray-400 text-sm mb-6">3 conexiones encontradas en Empresa Principal S.A.</p>

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
                  placeholder="Buscar por nombre, proveedor, IP o ubicación..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="ml-4">
                <div className="relative">
                  <select className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
                    <option>Todos los tipos</option>
                    <option>Fibra Óptica</option>
                    <option>Cable</option>
                    <option>VPN</option>
                    <option>DSL</option>
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
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Conexión</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Proveedor</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Tipo</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">IPs</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Velocidad</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Estado</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Costo</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {conexiones.map((conexion) => (
                  <tr key={conexion.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 mt-1">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-full h-full text-blue-400"
                          >
                            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                            <line x1="12" y1="20" x2="12.01" y2="20" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">{conexion.nombre}</div>
                          <div className="text-sm text-gray-400">{conexion.ubicacion}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-sm">{conexion.proveedor}</div>
                        <div className="text-xs text-gray-400">{conexion.contacto}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        {conexion.tipo}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="mb-1">
                          <span className="text-gray-400">Pública:</span> {conexion.ipPublica}
                        </div>
                        <div>
                          <span className="text-gray-400">Privada:</span> {conexion.ipPrivada}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="flex items-center space-x-1 mb-1">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-3 h-3 text-green-400"
                          >
                            <polyline points="7,13 12,18 17,13" />
                            <polyline points="7,6 12,11 17,6" />
                          </svg>
                          <span>{conexion.velocidadBajada}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-3 h-3 text-blue-400"
                          >
                            <polyline points="17,11 12,6 7,11" />
                            <polyline points="17,18 12,13 7,18" />
                          </svg>
                          <span>{conexion.velocidadSubida}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(conexion.estado)}`}
                      >
                        {conexion.estado}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium">{conexion.costo}</td>
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
