"use client"

export default function Inventory() {
    const equipos = [
        {
            id: 1,
            marca: "Dell",
            modelo: "Latitude 5520",
            tipo: "Laptop",
            placa: "PLC-2024-001",
            serie: "DL5520001",
            ubicacion: "Oficina Principal - Piso 2",
            persona: "Juan Pérez",
            estado: "En Uso",
            costo: "$1,200",
        },
        {
            id: 2,
            marca: "HP",
            modelo: "EliteDesk 800",
            tipo: "Desktop",
            placa: "PLC-2024-002",
            serie: "HP800002",
            ubicacion: "Oficina Principal - Piso 1",
            persona: "María García",
            estado: "En Uso",
            costo: "$800",
        },
        {
            id: 3,
            marca: "HP",
            modelo: "LaserJet Pro M404n",
            tipo: "Impresora",
            placa: "PLC-2024-004",
            serie: "HPL3004",
            ubicacion: "Oficina Principal - Sala de Impresión",
            persona: "Ana Martínez",
            estado: "Mantenimiento",
            costo: "$300",
        },
        {
            id: 4,
            marca: "Cisco",
            modelo: "Catalyst 2960",
            tipo: "Switch",
            placa: "PLC-2024-005",
            serie: "CS2960005",
            ubicacion: "Sala de Servidores",
            persona: "Roberto Silva",
            estado: "Activo",
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

        <div className="flex-1 flex flex-col">
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
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <rect x="7" y="7" width="3" height="9" />
                            <rect x="14" y="7" width="3" height="5" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-blue-600">Empresa Activa</h3>
                        <p className="text-sm text-gray-600">Selecciona la empresa para gestionar su inventario</p>
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

            {/* Main Content Area */}
            <div className="flex-1 p-6">
                {/* Page Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Inventario - Empresa Principal S.A.</h1>
                        <p className="text-gray-400">Gestiona todos los equipos y activos del departamento IT</p>
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
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
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
                            <span className="text-gray-400 text-sm">Mantenimiento</span>
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
                        <div className="text-3xl font-bold mb-1">1</div>
                        <div className="text-sm text-gray-400">Requieren atención</div>
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
                                    placeholder="Buscar por marca, modelo, serie, placa, persona o ubicación..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="ml-4">
                                <div className="relative">
                                    <select className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
                                        <option>Todos los tipos</option>
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
                                    <th className="text-left p-4 text-sm font-medium text-gray-300">Marca/Modelo</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-300">Tipo</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-300">Placa/Serie</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-300">Ubicación</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-300">Persona Encargada</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-300">Estado</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-300">Costo</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-300">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {equipos.map((equipo) => (
                                    <tr key={equipo.id} className="border-b border-gray-700 hover:bg-gray-750">
                                        <td className="p-4">
                                            <div>
                                                <div className="font-medium">{equipo.marca}</div>
                                                <div className="text-sm text-gray-400">{equipo.modelo}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                                                {equipo.tipo}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <div className="text-sm">{equipo.placa}</div>
                                                <div className="text-xs text-gray-400">{equipo.serie}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">{equipo.ubicacion}</td>
                                        <td className="p-4 text-sm">{equipo.persona}</td>
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(equipo.estado)}`}
                                            >
                                                {equipo.estado}
                                            </span>
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
