"use client"

import type React from "react"
import { useState, useMemo, useRef } from "react"
import useSWR, { mutate } from "swr"
import { useCompany } from "../../../../context/routerContext"
import DeleteNetworkModal from "./deleteModal"
import Loader from "../../../../components/loaders/loader"
import { CurrentPathname } from "../../../../components/layouts/main"
import { useSearch } from "../../../../context/searchContext"

const { VITE_API_URL } = import.meta.env
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export enum NetworkDeviceStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  MAINTENANCE = "MAINTENANCE",
  DECOMMISSIONED = "DECOMMISSIONED",
  UNKNOWN = "UNKNOWN",
}

export interface ApiNetworkDevice {
  id: string
  name: string
  status: NetworkDeviceStatus
  location: string | null
  description: string | null
  notes: string | null
  ssid: string | null
  password: string | null
  ip: string | null
  dns: string | null
  gw: string | null
  uploadSpeed: string | null
  downloadSpeed: string | null
  createdAt: string
  updatedAt: string
  companyId: string
  assignedToUserId: string | null
  createdByUserId: string | null
  providerId: string | null
  company?: {
    id: string
    name: string
  }
  assignedToUser?: {
    id: string
    username: string
    email: string
  }
  createdBy?: {
    id: string
    username: string
    email: string
  }
  provider?: {
    id: string
    name: string
    speed?: string
    cost?: number
  }
}

export interface FrontendNetworkConnection {
  id: string
  nombre: string
  ubicacion: string
  descripcion: string
  ssid: string
  password: string
  ip: string
  dns: string
  gw: string
  velocidadSubida: string
  velocidadBajada: string
  estado: NetworkDeviceStatus | string
  notas: string
  companyName: string
  asignadoA: string
  creadoPor: string
  proveedor: string
  proveedorVelocidad: string
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
      descripcion: "N/A",
      ssid: "N/A",
      password: "N/A",
      ip: "N/A",
      dns: "N/A",
      gw: "N/A",
      velocidadSubida: "N/A",
      velocidadBajada: "N/A",
      estado: "UNKNOWN",
      notas: "N/A",
      companyName: "N/A",
      asignadoA: "N/A",
      creadoPor: "N/A",
      proveedor: "N/A",
      proveedorVelocidad: "N/A",
      costo: "$0.00",
    }
  }

  return {
    id: item.id,
    nombre: item.name || "N/A",
    ubicacion: item.location || "No especificada",
    descripcion: item.description || "Sin descripción",
    ssid: item.ssid || "N/A",
    password: item.password || "N/A",
    ip: item.ip || "N/A",
    dns: item.dns || "N/A",
    gw: item.gw || "N/A",
    velocidadSubida: item.uploadSpeed || "N/A",
    velocidadBajada: item.downloadSpeed || "N/A",
    estado: item.status || NetworkDeviceStatus.UNKNOWN,
    notas: item.notes || "Sin notas",
    companyName: item.company?.name || "N/A",
    asignadoA: item.assignedToUser?.username || "No asignado",
    creadoPor: item.createdBy?.username || "Sistema",
    proveedor: item.provider?.name || "Sin proveedor",
    proveedorVelocidad: item.provider?.speed || "N/A",
    costo: item.provider?.cost ? `$${item.provider.cost.toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "$0.00",
  }
}

interface Props {
    currentPathname?: CurrentPathname
}

const PasswordField: React.FC<{ password: string }> = ({ password }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <span className="text-white text-sm font-mono">
        {showPassword ? password : "•".repeat(Math.min(password.length, 8))}
      </span>
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
        title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {showPassword ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m4.753-4.753L3.596 3.039m10.318 10.318L21 21"
            />
          </svg>
        )}
      </button>
    </div>
  )
}

// ====================================
// Componente principal
// ====================================
const AllNetwork:React.FC<Props> = ({ }) => {
  const { search } = useSearch()
  const [filterStatus, setFilterStatus] = useState("TODOS")
  const [activeView, setActiveView] = useState<"lista" | "topologia">("lista")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<FrontendNetworkConnection | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [selectedDevice, setSelectedDevice] = useState<FrontendNetworkConnection | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredDevice, setHoveredDevice] = useState<any>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)
  const { selectedCompany } = useCompany()
  const { data, isLoading } = useSWR<ApiNetworkDevice[]>(`${VITE_API_URL}/api/network/${selectedCompany?.id}/all`, fetcher)

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
      const res = await fetch(`${VITE_API_URL}/api/network/${selectedCompany?.id}/${selectedConnection.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Error al eliminar conexión")

      mutate(`${VITE_API_URL}/api/network/${selectedCompany?.id}/all`)
      setIsDeleting(false)
      closeDeleteModal()
    } catch (err) {
      console.error("Error eliminando conexión", err)
      setIsDeleting(false)
    }
  }

  const handleDeviceClick = (device: FrontendNetworkConnection) => {
    setSelectedDevice(selectedDevice?.id === device.id ? null : device)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.5, Math.min(3, zoomLevel * delta))
    setZoomLevel(newZoom)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDeviceHover = (device: any, e: React.MouseEvent) => {
    setHoveredDevice(device)
    const rect = svgRef.current?.getBoundingClientRect()
    if (rect) {
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleDeviceLeave = () => {
    setHoveredDevice(null)
  }

  const resetView = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
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
    if (filterStatus !== "TODOS") {
      current = current.filter((c) => c.estado === filterStatus)
    }
    if (search) {
      const s = search.toLowerCase()
      current = current.filter(
        (c) =>
          c.nombre.toLowerCase().includes(s) ||
          c.proveedor.toLowerCase().includes(s) ||
          c.ip.toLowerCase().includes(s) ||
          c.ssid.toLowerCase().includes(s) ||
          c.ubicacion.toLowerCase().includes(s) ||
          c.descripcion.toLowerCase().includes(s),
      )
    }
    return current
  }, [conexiones, filterStatus, search])

  const getStatusColor = (status: string) => {
    switch (status) {
      case NetworkDeviceStatus.ONLINE:
        return "bg-green-900 text-green-300 border-green-700"
      case NetworkDeviceStatus.OFFLINE:
        return "bg-red-900 text-red-300 border-red-700"
      case NetworkDeviceStatus.MAINTENANCE:
        return "bg-yellow-900 text-yellow-300 border-yellow-700"
      case NetworkDeviceStatus.DECOMMISSIONED:
        return "bg-gray-700 text-gray-300 border-gray-600"
      default:
        return "bg-slate-700 text-slate-300 border-slate-600"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ONLINE: "En línea",
      OFFLINE: "Desconectado",
      MAINTENANCE: "Mantenimiento",
      DECOMMISSIONED: "Desactivado",
      UNKNOWN: "Desconocido",
    }
    return labels[status] || status
  }

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <div className="bg-slate-900 text-gray-100">
      <div className="">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Redes - {selectedCompany?.name || "Cargando..."}</h1>
            <p className="text-gray-400">Gestiona las conexiones WiFi y su configuración</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-1">
              <button
                onClick={() => setActiveView("lista")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "lista"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setActiveView("topologia")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "topologia"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                Topología
              </button>
            </div>
            <a
              href="create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <span>+</span>
              Agregar Red
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Redes</p>
                <p className="text-2xl font-semibold text-white">{conexiones.length}</p>
              </div>
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.332a9 9 0 11-3.11-2.111M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">En Línea</p>
                <p className="text-2xl font-semibold text-green-400">
                  {conexiones.filter((c) => c.estado === NetworkDeviceStatus.ONLINE).length}
                </p>
              </div>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Proveedores</p>
                <p className="text-2xl font-semibold text-white">
                  {new Set(conexiones.map((c) => c.proveedor)).size}
                </p>
              </div>
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Desconectadas</p>
                <p className="text-2xl font-semibold text-red-400">
                  {conexiones.filter((c) => c.estado === NetworkDeviceStatus.OFFLINE).length}
                </p>
              </div>
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M7.08 6.47a9 9 0 1 1 9.84 0" />
              </svg>
            </div>
          </div>
        </div>

        {activeView === "lista" ? (
          /* Lista de Conexiones */
          <div className="bg-slate-800 border border-slate-700 rounded-xl">
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Lista de Redes WiFi</h2>
                  <p className="text-gray-400 text-sm">
                    {filteredConexiones.length} de {conexiones.length} redes encontradas
                  </p>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="TODOS">Todos los estados</option>
                  {Object.values(NetworkDeviceStatus).map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              {filteredConexiones.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-400">No hay redes registradas</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Nombre / SSID</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Contraseña</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">IP / DNS</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Gateway</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Velocidad</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Proveedor</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Estado</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Ubicación</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConexiones.map((conexion) => (
                      <tr key={conexion.id} className="border-b border-slate-700 hover:bg-slate-750">
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-white font-medium">{conexion.nombre}</p>
                            <p className="text-gray-400 text-sm">{conexion.ssid}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <PasswordField password={conexion.password} />
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-white text-sm">{conexion.ip}</p>
                            <p className="text-gray-400 text-xs">{conexion.dns}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-white text-sm">{conexion.gw}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <p className="text-white">↓ {conexion.velocidadBajada} Mbps</p>
                            <p className="text-gray-400 text-xs">↑ {conexion.velocidadSubida} Mbps</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-white text-sm">{conexion.proveedor}</p>
                            <p className="text-gray-400 text-xs">{conexion.proveedorVelocidad}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              conexion.estado,
                            )}`}
                          >
                            {getStatusLabel(conexion.estado)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-gray-400 text-sm">{conexion.ubicacion}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <a
                              href={`edit/${conexion.id}`}
                              className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </a>
                            <button
                              onClick={() => openDeleteModal(conexion)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
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
        ) : (
          /* Vista de Topología */
          <div className="bg-slate-800 border border-slate-700 rounded-xl">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-2">Topología de Red</h2>
              <p className="text-gray-400 text-sm mb-4">
                Visualización de las redes WiFi conectadas • Rueda del mouse para zoom • Arrastra para mover
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel * 0.8))}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm hover:bg-slate-600"
                >
                  -
                </button>
                <span className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm min-w-[5rem] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(Math.min(3, zoomLevel * 1.2))}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm hover:bg-slate-600"
                >
                  +
                </button>
                <button
                  onClick={resetView}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm hover:bg-slate-600"
                >
                  🎯 Reset
                </button>
              </div>
            </div>

            <div className="p-6">
              <svg
                ref={svgRef}
                viewBox="0 0 1200 800"
                className="w-full h-[600px] bg-slate-900 border border-slate-600 rounded-lg cursor-grab active:cursor-grabbing"
                style={{ background: "radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)" }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="1" opacity="0.3" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Proveedor/Internet */}
                  <g transform="translate(600, 80)">
                    <circle cx="0" cy="0" r="40" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
                    <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                      ISP
                    </text>
                    <text x="0" y="60" textAnchor="middle" fill="#94a3b8" fontSize="10">
                      Proveedor de Internet
                    </text>
                  </g>

                  {/* Router Principal */}
                  <g transform="translate(600, 200)">
                    <rect x="-30" y="-20" width="60" height="40" rx="8" fill="#3b82f6" stroke="#2563eb" strokeWidth="2" />
                    <text x="0" y="5" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                      Gateway
                    </text>
                    <text x="0" y="50" textAnchor="middle" fill="#94a3b8" fontSize="9">
                      Centro de Conexiones
                    </text>
                  </g>

                  {/* Línea ISP a Gateway */}
                  <line x1="600" y1="120" x2="600" y2="180" stroke="#64748b" strokeWidth="2" strokeDasharray="5,5" />

                  {conexiones.map((conexion, index) => {
                    const angle = (index * 2 * Math.PI) / Math.max(conexiones.length, 1)
                    const radius = 200
                    const x = 600 + Math.cos(angle) * radius
                    const y = 400 + Math.sin(angle) * radius

                    const isSelected = selectedDevice?.id === conexion.id
                    const isOnline = conexion.estado === NetworkDeviceStatus.ONLINE

                    return (
                      <g key={conexion.id} transform={`translate(${x}, ${y})`}>
                        {/* Línea al gateway */}
                        <line
                          x1={600 - x}
                          y1={200 - y}
                          x2="0"
                          y2="0"
                          stroke={isOnline ? "#10b981" : "#ef4444"}
                          strokeWidth={isSelected ? "3" : "2"}
                          opacity="0.8"
                        />

                        <g
                          style={{ cursor: "pointer" }}
                          onClick={() => handleDeviceClick(conexion)}
                          onMouseEnter={(e) => handleDeviceHover(conexion, e)}
                          onMouseLeave={handleDeviceLeave}
                        >
                          {isSelected && (
                            <circle cx="0" cy="0" r="35" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" opacity="0.8" />
                          )}

                          <rect
                            x="-25"
                            y="-15"
                            width="50"
                            height="30"
                            rx="6"
                            fill={isOnline ? "#059669" : "#dc2626"}
                            stroke={isOnline ? "#047857" : "#b91c1c"}
                            strokeWidth={isSelected ? "3" : "2"}
                          />

                          <text x="0" y="5" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
                            📶 WiFi
                          </text>

                          <text x="0" y="35" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="medium">
                            {conexion.nombre.length > 12 ? conexion.nombre.substring(0, 12) + "..." : conexion.nombre}
                          </text>
                          <text x="0" y="48" textAnchor="middle" fill="#64748b" fontSize="8">
                            {conexion.ssid}
                          </text>

                          <circle cx="25" cy="-25" r="4" fill={isOnline ? "#10b981" : "#ef4444"}>
                            {isOnline && <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />}
                          </circle>
                        </g>
                      </g>
                    )
                  })}

                  {/* Leyenda */}
                  <g transform="translate(50, 650)">
                    <rect
                      x="0"
                      y="0"
                      width="280"
                      height="100"
                      rx="8"
                      fill="#1e293b"
                      stroke="#334155"
                      strokeWidth="1"
                      opacity="0.9"
                    />
                    <text x="15" y="20" fill="#f1f5f9" fontSize="12" fontWeight="bold">
                      Leyenda
                    </text>

                    <circle cx="25" cy="40" r="6" fill="#ef4444" />
                    <text x="40" y="45" fill="#94a3b8" fontSize="10">
                      ISP/Proveedor
                    </text>

                    <rect x="19" y="55" width="12" height="8" rx="2" fill="#3b82f6" />
                    <text x="40" y="62" fill="#94a3b8" fontSize="10">
                      Gateway
                    </text>

                    <rect x="19" y="75" width="12" height="8" rx="2" fill="#059669" />
                    <text x="40" y="82" fill="#94a3b8" fontSize="10">
                      Red WiFi Online
                    </text>

                    <circle cx="180" cy="40" r="3" fill="#10b981" />
                    <text x="195" y="45" fill="#94a3b8" fontSize="10">
                      Online
                    </text>

                    <circle cx="180" cy="60" r="3" fill="#ef4444" />
                    <text x="195" y="65" fill="#94a3b8" fontSize="10">
                      Offline
                    </text>

                    <line x1="180" y1="80" x2="200" y2="80" stroke="#10b981" strokeWidth="2" />
                    <text x="210" y="85" fill="#94a3b8" fontSize="10">
                      Conectada
                    </text>
                  </g>

                  {/* Info en tiempo real */}
                  <g transform="translate(950, 650)">
                    <rect x="0" y="0" width="200" height="100" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" opacity="0.9" />
                    <text x="15" y="20" fill="#f1f5f9" fontSize="12" fontWeight="bold">
                      Estado
                    </text>
                    <text x="15" y="40" fill="#94a3b8" fontSize="10">
                      Redes Online:
                    </text>
                    <text x="150" y="40" fill="#10b981" fontSize="10" fontWeight="bold">
                      {conexiones.filter((c) => c.estado === NetworkDeviceStatus.ONLINE).length}
                    </text>
                    <text x="15" y="55" fill="#94a3b8" fontSize="10">
                      Total Redes:
                    </text>
                    <text x="150" y="55" fill="#94a3b8" fontSize="10" fontWeight="bold">
                      {conexiones.length}
                    </text>
                    <text x="15" y="70" fill="#94a3b8" fontSize="10">
                      Proveedores:
                    </text>
                    <text x="150" y="70" fill="#94a3b8" fontSize="10" fontWeight="bold">
                      {new Set(conexiones.map((c) => c.proveedor)).size}
                    </text>
                  </g>
                </g>

                {hoveredDevice && (
                  <g transform={`translate(${tooltipPosition.x + 10}, ${tooltipPosition.y - 10})`}>
                    <rect x="0" y="0" width="200" height="100" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                    <text x="10" y="20" fill="white" fontSize="11" fontWeight="bold">
                      {hoveredDevice.nombre}
                    </text>
                    <text x="10" y="40" fill="#94a3b8" fontSize="9">
                      SSID: {hoveredDevice.ssid}
                    </text>
                    <text x="10" y="55" fill="#94a3b8" fontSize="9">
                      IP: {hoveredDevice.ip}
                    </text>
                    <text x="10" y="70" fill="#94a3b8" fontSize="9">
                      Estado:{" "}
                      <tspan fill={hoveredDevice.estado === NetworkDeviceStatus.ONLINE ? "#10b981" : "#ef4444"}>
                        {getStatusLabel(hoveredDevice.estado)}
                      </tspan>
                    </text>
                    <text x="10" y="85" fill="#94a3b8" fontSize="9">
                      Proveedor: {hoveredDevice.proveedor}
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        )}
      </div>
      <DeleteNetworkModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        itemName={selectedConnection?.nombre || ""}
      />
    </div>
  )
}
export default AllNetwork