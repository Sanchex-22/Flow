"use client"

export default function UsersPage() {
  const usuarios = [
    {
      id: "USR001",
      nombre: "Juan Pérez",
      avatar: "JP",
      email: "juan.perez@empresa.com",
      telefono: "+1 234-567-8901",
      departamento: "Desarrollo",
      descripcionDepartamento: "Desarrollador Senior",
      cargo: "Desarrollador Senior",
      estado: "Activo",
      equipos: 2,
    },
    {
      id: "USR002",
      nombre: "María García",
      avatar: "MG",
      email: "maria.garcia@empresa.com",
      telefono: "+1 234-567-8902",
      departamento: "Ventas",
      descripcionDepartamento: "Gerente de Ventas",
      cargo: "Gerente de Ventas",
      estado: "Activo",
      equipos: 1,
    },
    {
      id: "USR003",
      nombre: "Carlos López",
      avatar: "CL",
      email: "carlos.lopez@empresa.com",
      telefono: "+1 234-567-8903",
      departamento: "IT",
      descripcionDepartamento: "Técnico IT",
      cargo: "Técnico IT",
      estado: "Activo",
      equipos: 1,
    },
    {
      id: "USR004",
      nombre: "Ana Martínez",
      avatar: "AM",
      email: "ana.martinez@empresa.com",
      telefono: "+1 234-567-8904",
      departamento: "IT",
      descripcionDepartamento: "Especialista en Redes",
      cargo: "Especialista en Redes",
      estado: "Activo",
      equipos: 0,
    },
    {
      id: "USR005",
      nombre: "Roberto Silva",
      avatar: "RS",
      email: "roberto.silva@empresa.com",
      telefono: "+1 234-567-8905",
      departamento: "Recursos Humanos",
      descripcionDepartamento: "Coordinador RRHH",
      cargo: "Coordinador RRHH",
      estado: "Inactivo",
      equipos: 0,
    },
  ]

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Activo":
        return "bg-green-600 text-green-100"
      case "Inactivo":
        return "bg-red-600 text-red-100"
      default:
        return "bg-gray-600 text-gray-100"
    }
  }

  const getAvatarColor = (nombre: string) => {
    const colors = [
      "bg-blue-600",
      "bg-green-600",
      "bg-purple-600",
      "bg-orange-600",
      "bg-pink-600",
      "bg-indigo-600",
      "bg-teal-600",
      "bg-red-600",
    ]
    const index = nombre.length % colors.length
    return colors[index]
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Usuarios</h1>
          <p className="text-gray-400">Gestiona los usuarios y sus asignaciones de equipos</p>
        </div>
        <div>
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Agregar Usuario</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Usuarios</span>
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
          <div className="text-3xl font-bold mb-1">5</div>
          <div className="text-sm text-gray-400">Registrados en el sistema</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Usuarios Activos</span>
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
          <div className="text-3xl font-bold mb-1">4</div>
          <div className="text-sm text-gray-400">Con acceso al sistema</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Con Equipos</span>
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
          <div className="text-3xl font-bold mb-1">3</div>
          <div className="text-sm text-gray-400">Tienen equipos asignados</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Departamentos</span>
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
          <div className="text-3xl font-bold mb-1">4</div>
          <div className="text-sm text-gray-400">Diferentes áreas</div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold mb-2">Lista de Usuarios</h2>
          <p className="text-gray-400 text-sm mb-6">5 usuarios encontrados</p>

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
                placeholder="Buscar usuarios..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="ml-4">
              <div className="relative">
                <select className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
                  <option>Todos los...</option>
                  <option>Activos</option>
                  <option>Inactivos</option>
                  <option>Con Equipos</option>
                  <option>Sin Equipos</option>
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
                <th className="text-left p-4 text-sm font-medium text-gray-300">Usuario</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Contacto</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Departamento</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Cargo</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Estado</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Equipos</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(usuario.nombre)}`}
                      >
                        {usuario.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{usuario.nombre}</div>
                        <div className="text-xs text-gray-400">{usuario.id}</div>
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
                          className="w-3 h-3 text-gray-400"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <span>{usuario.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="w-3 h-3 text-gray-400"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>{usuario.telefono}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-sm">{usuario.departamento}</div>
                      <div className="text-xs text-gray-400">{usuario.descripcionDepartamento}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{usuario.cargo}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(usuario.estado)}`}
                    >
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-4 h-4 text-gray-400"
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                      <span className="text-sm font-medium">{usuario.equipos}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-white transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
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
  )
}
