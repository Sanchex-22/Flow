"use client"

import { useState, useMemo } from "react"
import useSWR, { mutate } from "swr"
import DeleteConfirmationModal from "./deleteModal"

const { VITE_API_URL } = import.meta.env
const fetcher = (url: string) => fetch(url).then((res) => res.json())

// ====================================
// Enums y Tipos
// ====================================
export enum NetworkDeviceType {
  FIBRA_OPTICA = "Fibra Óptica",
  CABLE = "Cable",
  VPN = "VPN",
  DSL = "DSL",
  ETHERNET = "ETHERNET",
  WIFI = "WIFI",
}

export enum NetworkDeviceStatus {
  ACTIVO = "Activo",
  STANDBY = "Standby",
  INACTIVO = "Inactivo",
  MANTENIMIENTO = "Mantenimiento",
}

export interface ApiNetworkDevice {
  id: string
  name: string
  ipAddress: string
  macAddress: string | null
  deviceType: NetworkDeviceType
  status: NetworkDeviceStatus
  location: string | null
  description: string | null
  serialNumber: string | null
  model: string | null
  brand: string | null
  purchaseDate: string | Date | null
  warrantyEndDate: string | Date | null
  notes: string | null
  companyId: string
  assignedToUserId: string | null
}

export interface FrontendNetworkConnection {
  id: string
  nombre: string
  ubicacion: string
  proveedor: string
  contacto: string
  tipo: NetworkDeviceType | string
  ipPublica: string
  ipPrivada: string
  velocidadBajada: string
  velocidadSubida: string
  estado: NetworkDeviceStatus | string
  costo: string
}

// ====================================
// Mapper API → Frontend
// ====================================
const mapApiDataToFrontend = (item: ApiNetworkDevice): FrontendNetworkConnection => {
  if (!item) {
    return {
      id: "0",
      nombre: "N/A",
      ubicacion: "N/A",
      proveedor: "N/A",
      contacto: "N/A",
      tipo: "Desconocido",
      ipPublica: "N/A",
      ipPrivada: "N/A",
      velocidadBajada: "N/A",
      velocidadSubida: "N/A",
      estado: "Desconocido",
      costo: "$0.00",
    }
  }

  const costString = (item as any).cost || "$0.00"
  const costValue = Number.parseFloat(costString.replace("$", "").replace(",", "")) || 0

  return {
    id: item.id,
    nombre: item.name || "N/A",
    ubicacion: item.location || "Desconocida",
    proveedor: item.brand || "Desconocido",
    contacto: item.notes || "N/A",
    tipo: item.deviceType || "Desconocido",
    ipPublica: item.ipAddress || "N/A",
    ipPrivada: item.ipAddress || "N/A",
    velocidadBajada: (item as any).downloadSpeed || "N/A",
    velocidadSubida: (item as any).uploadSpeed || "N/A",
    estado: item.status || "Desconocido",
    costo: `$${costValue.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
  }
}

// ====================================
// Componente principal
// ====================================
export default function AllNetwork() {
  const { data, error, isLoading } = useSWR<ApiNetworkDevice[]>(`${VITE_API_URL}/api/network/all`, fetcher)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("Todos los tipos")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<FrontendNetworkConnection | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ====================================
  // Manejo de modal
  // ====================================
  const openDeleteModal = (connection: FrontendNetworkConnection) => {
    setSelectedConnection(connection)
    setIsModalOpen(true)
  }

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setIsModalOpen(false)
      setSelectedConnection(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedConnection) return
    setIsDeleting(true)

    try {
      const res = await fetch(`${VITE_API_URL}/api/network/${selectedConnection.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Error al eliminar conexión")

      mutate(`${VITE_API_URL}/api/network/all`)
      setIsDeleting(false)
      closeDeleteModal()
    } catch (err) {
      console.error("Error eliminando conexión", err)
      setIsDeleting(false)
    }
  }

  // ====================================
  // Lógica de datos
  // ====================================
  const conexiones: FrontendNetworkConnection[] = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return []
    return data.map(mapApiDataToFrontend)
  }, [data])

  const filteredConexiones = useMemo(() => {
    let current = [...conexiones]
    if (filterType !== "Todos los tipos") {
      current = current.filter((c) => c.tipo === filterType)
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      current = current.filter(
        (c) =>
          c.nombre.toLowerCase().includes(s) ||
          c.proveedor.toLowerCase().includes(s) ||
          c.ipPublica.toLowerCase().includes(s) ||
          c.ipPrivada.toLowerCase().includes(s) ||
          c.ubicacion.toLowerCase().includes(s) ||
          c.contacto.toLowerCase().includes(s) ||
          c.tipo.toLowerCase().includes(s) ||
          c.estado.toLowerCase().includes(s),
      )
    }
    return current
  }, [conexiones, filterType, searchTerm])

  // ====================================
  // Renderizado condicional
  // ====================================
  if (isLoading) {
    return <div className="text-white">Cargando conexiones...</div>
  }

  if (error) {
    return <div className="text-red-500">Error al cargar conexiones</div>
  }

  // ====================================
  // Render principal
  // ====================================
  return (
    <>
      <div className="min-h-screen bg-slate-900 text-gray-100">
        <div className="p-6">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">Conexiones de Red</h1>
              <p className="text-gray-400">Gestiona las conexiones y dispositivos de red</p>
            </div>
            <a href="create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
              <span>+</span>
              Agregar Conexión
            </a>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Conexiones</p>
                  <p className="text-2xl font-semibold text-white">{conexiones.length}</p>
                  <p className="text-gray-500 text-sm">Registradas en el sistema</p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Conexiones Activas</p>
                  <p className="text-2xl font-semibold text-white">
                    {conexiones.filter((c) => c.estado === "Activo").length}
                  </p>
                  <p className="text-gray-500 text-sm">Con acceso al sistema</p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Tipos de Red</p>
                  <p className="text-2xl font-semibold text-white">{new Set(conexiones.map((c) => c.tipo)).size}</p>
                  <p className="text-gray-500 text-sm">Diferentes tecnologías</p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Proveedores</p>
                  <p className="text-2xl font-semibold text-white">
                    {new Set(conexiones.map((c) => c.proveedor)).size}
                  </p>
                  <p className="text-gray-500 text-sm">Diferentes empresas</p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Conexiones */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl">
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Lista de Conexiones</h2>
                  <p className="text-gray-400 text-sm">
                    {filteredConexiones.length} de {conexiones.length} conexiones encontradas
                  </p>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar conexiones..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[200px]"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="Todos los tipos">Todos los tipos</option>
                  {Object.values(NetworkDeviceType).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              {filteredConexiones.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400">No hay conexiones registradas</p>
                  <p className="text-gray-500 text-sm mt-1">Agrega tu primera conexión para comenzar</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Conexión</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Contacto</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Tipo</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Estado</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Equipos</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConexiones.map((c, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-700 hover:bg-slate-750 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                              {c.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">{c.nombre}</p>
                              <p className="text-gray-400 text-sm">{c.ipPublica}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-white">{c.proveedor}</p>
                            <p className="text-gray-400 text-sm">{c.contacto}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-gray-300 border border-slate-600">
                            {c.tipo}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              c.estado === "Activo"
                                ? "bg-green-900 text-green-300 border border-green-700"
                                : c.estado === "Inactivo"
                                  ? "bg-red-900 text-red-300 border border-red-700"
                                  : "bg-yellow-900 text-yellow-300 border border-yellow-700"
                            }`}
                          >
                            {c.estado}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                              />
                            </svg>
                            <span className="text-gray-400 text-sm">0</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <a href={`edit/${c.id}`} className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors duration-150">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2v6a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                              </svg>
                            </a>
                            <button
                              onClick={() => openDeleteModal(c)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors duration-150"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        connection={selectedConnection}
        isDeleting={isDeleting}
      />
    </>
  )
}
