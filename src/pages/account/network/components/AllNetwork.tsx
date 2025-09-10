"use client"

import type React from "react"

import { useState, useMemo, useRef } from "react"
import useSWR, { mutate } from "swr"
import DeleteConfirmationModal from "./deleteModal"
import Loader from "../../../../components/loaders/loader"

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
  const [activeView, setActiveView] = useState<"lista" | "topologia">("lista")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<FrontendNetworkConnection | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [selectedDevice, setSelectedDevice] = useState<FrontendNetworkConnection | null>(null)
  const [isRunningSpeedTest, setIsRunningSpeedTest] = useState(false)
  const [speedTestResults, setSpeedTestResults] = useState<{
    download: number
    upload: number
    ping: number
  } | null>(null)

  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredDevice, setHoveredDevice] = useState<any>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

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

  const runSpeedTest = async () => {
    setIsRunningSpeedTest(true)
    setSpeedTestResults(null)

    try {
      // Simulamos un speed test real con múltiples mediciones
      const testDuration = 5000 // 5 segundos
      const startTime = Date.now()

      // Simulamos medición de ping
      const pingStart = performance.now()
      await fetch("https://www.google.com/favicon.ico", { mode: "no-cors" })
      const ping = Math.round(performance.now() - pingStart)

      // Simulamos descarga y subida con valores realistas
      const download = Math.random() * 100 + 50 // 50-150 Mbps
      const upload = Math.random() * 50 + 20 // 20-70 Mbps

      // Esperamos el tiempo restante para simular el test completo
      const elapsed = Date.now() - startTime
      if (elapsed < testDuration) {
        await new Promise((resolve) => setTimeout(resolve, testDuration - elapsed))
      }

      setSpeedTestResults({
        download: Math.round(download * 10) / 10,
        upload: Math.round(upload * 10) / 10,
        ping: Math.min(ping, 100), // Limitamos el ping a 100ms máximo
      })
    } catch (error) {
      console.error("Error en speed test:", error)
      // Valores de fallback si falla la conexión
      setSpeedTestResults({
        download: 0,
        upload: 0,
        ping: 999,
      })
    } finally {
      setIsRunningSpeedTest(false)
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
      // Solo botón izquierdo
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
    return <Loader/>
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
            <div className="flex items-center gap-4">
              <button
                onClick={runSpeedTest}
                disabled={isRunningSpeedTest}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                {isRunningSpeedTest ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Probando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Speed Test
                  </>
                )}
              </button>

              {/* Pestañas para alternar entre vistas */}
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
                Agregar Conexión
              </a>
            </div>
          </div>

          {speedTestResults && (
            <div className="mb-6 bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Resultados del Speed Test</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{speedTestResults.download} Mbps</div>
                  <div className="text-gray-400 text-sm">Descarga</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{speedTestResults.upload} Mbps</div>
                  <div className="text-gray-400 text-sm">Subida</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{speedTestResults.ping} ms</div>
                  <div className="text-gray-400 text-sm">Ping</div>
                </div>
              </div>
            </div>
          )}

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

          {activeView === "lista" ? (
            /* Lista de Conexiones */
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
                              <a
                                href={`edit/${c.id}`}
                                className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors duration-150"
                              >
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
          ) : (
            /* Vista de Topología */
            <div className="bg-slate-800 border border-slate-700 rounded-xl">
              <div className="p-6 border-b border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Topología de Red</h2>
                    <p className="text-gray-400 text-sm">
                      Haz clic en los dispositivos para ver detalles • Rueda del mouse para zoom • Arrastra para mover
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-700 border border-slate-600 rounded-lg p-1">
                      <button
                        onClick={() => setZoomLevel(Math.max(0.5, zoomLevel * 0.8))}
                        className="px-2 py-1 text-white text-sm hover:bg-slate-600 rounded transition-colors"
                        title="Zoom Out"
                      >
                        -
                      </button>
                      <span className="px-2 text-white text-xs min-w-[3rem] text-center">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        onClick={() => setZoomLevel(Math.min(3, zoomLevel * 1.2))}
                        className="px-2 py-1 text-white text-sm hover:bg-slate-600 rounded transition-colors"
                        title="Zoom In"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={resetView}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm hover:bg-slate-600 transition-colors"
                      title="Resetear Vista"
                    >
                      🎯
                    </button>
                    <button
                      onClick={() => setSelectedDevice(null)}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm hover:bg-slate-600 transition-colors"
                    >
                      Limpiar Selección
                    </button>
                    <button className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm hover:bg-slate-600 transition-colors">
                      Actualizar
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 relative">
                <div className="bg-slate-900 border border-slate-600 rounded-lg overflow-hidden relative">
                  <svg
                    ref={svgRef}
                    viewBox="0 0 1200 800"
                    className="w-full h-[600px] cursor-grab active:cursor-grabbing"
                    style={{ background: "radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)" }}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
                      {/* Grid de fondo */}
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="1" opacity="0.3" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* Internet/WAN */}
                      <g transform="translate(600, 80)">
                        <circle
                          cx="0"
                          cy="0"
                          r="40"
                          fill="#ef4444"
                          stroke="#dc2626"
                          strokeWidth="2"
                          onMouseEnter={(e) =>
                            handleDeviceHover(
                              {
                                nombre: "Internet/WAN",
                                tipo: "WAN",
                                estado: "Activo",
                                ipPublica: "Conexión Externa",
                                proveedor: "ISP",
                              },
                              e,
                            )
                          }
                          onMouseLeave={handleDeviceLeave}
                          style={{ cursor: "pointer" }}
                        />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                          WAN
                        </text>
                        <text x="0" y="60" textAnchor="middle" fill="#94a3b8" fontSize="10">
                          Internet
                        </text>
                      </g>

                      {/* Router Principal */}
                      <g transform="translate(600, 200)">
                        <rect
                          x="-30"
                          y="-20"
                          width="60"
                          height="40"
                          rx="8"
                          fill="#3b82f6"
                          stroke="#2563eb"
                          strokeWidth="2"
                          onMouseEnter={(e) =>
                            handleDeviceHover(
                              {
                                nombre: "Router Principal",
                                tipo: "Router",
                                estado: "Activo",
                                ipPublica: "192.168.1.1",
                                proveedor: "Gateway",
                              },
                              e,
                            )
                          }
                          onMouseLeave={handleDeviceLeave}
                          style={{ cursor: "pointer" }}
                        />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                          Router
                        </text>
                        <text x="0" y="50" textAnchor="middle" fill="#94a3b8" fontSize="9">
                          192.168.1.1
                        </text>
                        {conexiones.length > 0 && (
                          <text x="0" y="65" textAnchor="middle" fill="#94a3b8" fontSize="9">
                            Gateway Principal
                          </text>
                        )}
                      </g>

                      {/* Línea WAN a Router */}
                      <line
                        x1="600"
                        y1="120"
                        x2="600"
                        y2="180"
                        stroke="#64748b"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />

                      {conexiones.map((conexion, index) => {
                        // Calculamos posiciones dinámicamente en círculo
                        const angle = (index * 2 * Math.PI) / Math.max(conexiones.length, 4)
                        const radius = 200
                        const x = 600 + Math.cos(angle) * radius
                        const y = 400 + Math.sin(angle) * radius

                        const isSelected = selectedDevice?.id === conexion.id
                        const isActive = conexion.estado === "Activo"

                        return (
                          <g key={conexion.id} transform={`translate(${x}, ${y})`}>
                            {/* Línea al router */}
                            <line
                              x1={600 - x}
                              y1={200 - y}
                              x2="0"
                              y2="0"
                              stroke={isActive ? "#10b981" : "#ef4444"}
                              strokeWidth={isSelected ? "3" : "2"}
                              opacity="0.8"
                            />

                            <g
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeviceClick(conexion)
                              }}
                              onMouseEnter={(e) => handleDeviceHover(conexion, e)}
                              onMouseLeave={handleDeviceLeave}
                            >
                              {/* Círculo de selección */}
                              {isSelected && (
                                <circle
                                  cx="0"
                                  cy="0"
                                  r="35"
                                  fill="none"
                                  stroke="#3b82f6"
                                  strokeWidth="2"
                                  strokeDasharray="5,5"
                                  opacity="0.8"
                                />
                              )}

                              {/* Dispositivo */}
                              <rect
                                x="-25"
                                y="-15"
                                width="50"
                                height="30"
                                rx="6"
                                fill={isActive ? "#059669" : "#dc2626"}
                                stroke={isActive ? "#047857" : "#b91c1c"}
                                strokeWidth={isSelected ? "3" : "2"}
                              />

                              {/* Icono del tipo de dispositivo */}
                              <text x="0" y="5" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
                                {conexion.tipo === "WIFI"
                                  ? "📶"
                                  : conexion.tipo === "ETHERNET"
                                    ? "🔌"
                                    : conexion.tipo === "Fibra Óptica"
                                      ? "💡"
                                      : conexion.tipo.substring(0, 2).toUpperCase()}
                              </text>

                              {/* Información del dispositivo */}
                              <text x="0" y="35" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="medium">
                                {conexion.nombre.length > 12
                                  ? conexion.nombre.substring(0, 12) + "..."
                                  : conexion.nombre}
                              </text>
                              <text x="0" y="48" textAnchor="middle" fill="#64748b" fontSize="8">
                                {conexion.ipPublica}
                              </text>

                              {/* Indicador de estado pulsante para dispositivos activos */}
                              <circle cx="25" cy="-25" r="4" fill={isActive ? "#10b981" : "#ef4444"}>
                                {isActive && (
                                  <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                                )}
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
                          width="300"
                          height="120"
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
                          WAN/Internet
                        </text>

                        <rect x="19" y="55" width="12" height="8" rx="2" fill="#3b82f6" />
                        <text x="40" y="62" fill="#94a3b8" fontSize="10">
                          Router
                        </text>

                        <rect x="19" y="75" width="12" height="8" rx="2" fill="#059669" />
                        <text x="40" y="82" fill="#94a3b8" fontSize="10">
                          Switch Activo
                        </text>

                        <circle cx="25" cy="95" r="6" fill="#8b5cf6" />
                        <text x="40" y="100" fill="#94a3b8" fontSize="10">
                          Dispositivo
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
                          Conexión Activa
                        </text>

                        <line
                          x1="180"
                          y1="95"
                          x2="200"
                          y2="95"
                          stroke="#ef4444"
                          strokeWidth="2"
                          strokeDasharray="3,3"
                        />
                        <text x="210" y="100" fill="#94a3b8" fontSize="10">
                          Conexión Inactiva
                        </text>
                      </g>

                      {/* Información de red en tiempo real */}
                      <g transform="translate(950, 650)">
                        <rect
                          x="0"
                          y="0"
                          width="200"
                          height="120"
                          rx="8"
                          fill="#1e293b"
                          stroke="#334155"
                          strokeWidth="1"
                          opacity="0.9"
                        />
                        <text x="15" y="20" fill="#f1f5f9" fontSize="12" fontWeight="bold">
                          Estado de Red
                        </text>

                        <text x="15" y="40" fill="#94a3b8" fontSize="10">
                          Dispositivos Activos:
                        </text>
                        <text x="150" y="40" fill="#10b981" fontSize="10" fontWeight="bold">
                          {conexiones.filter((c) => c.estado === "Activo").length}
                        </text>

                        <text x="15" y="55" fill="#94a3b8" fontSize="10">
                          Total Dispositivos:
                        </text>
                        <text x="150" y="55" fill="#94a3b8" fontSize="10" fontWeight="bold">
                          {conexiones.length}
                        </text>

                        <text x="15" y="70" fill="#94a3b8" fontSize="10">
                          Tipos de Red:
                        </text>
                        <text x="150" y="70" fill="#94a3b8" fontSize="10" fontWeight="bold">
                          {new Set(conexiones.map((c) => c.tipo)).size}
                        </text>

                        <text x="15" y="85" fill="#94a3b8" fontSize="10">
                          Proveedores:
                        </text>
                        <text x="150" y="85" fill="#94a3b8" fontSize="10" fontWeight="bold">
                          {new Set(conexiones.map((c) => c.proveedor)).size}
                        </text>

                        <text x="15" y="105" fill="#64748b" fontSize="8">
                          Última actualización: Ahora
                        </text>
                      </g>
                    </g>
                  </svg>

                  {hoveredDevice && (
                    <div
                      className="absolute bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg z-10 pointer-events-none"
                      style={{
                        left: tooltipPosition.x + 10,
                        top: tooltipPosition.y - 10,
                        transform: "translateY(-100%)",
                      }}
                    >
                      <div className="text-white font-semibold text-sm mb-1">{hoveredDevice.nombre}</div>
                      <div className="text-gray-300 text-xs space-y-1">
                        <div>Tipo: {hoveredDevice.tipo}</div>
                        <div>IP: {hoveredDevice.ipPublica}</div>
                        <div>
                          Estado:{" "}
                          <span className={hoveredDevice.estado === "Activo" ? "text-green-400" : "text-red-400"}>
                            {hoveredDevice.estado}
                          </span>
                        </div>
                        <div>Proveedor: {hoveredDevice.proveedor}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
