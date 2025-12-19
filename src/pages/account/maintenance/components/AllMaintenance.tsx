"use client"

import { useState, useEffect } from "react"
import { mutate } from "swr"
import * as XLSX from 'xlsx'
import DeleteConfirmationModal from "./deleteModal"
import Loader from "../../../../components/loaders/loader"
import { useCompany } from "../../../../context/routerContext"
import PagesHeader from "../../../../components/headers/pagesHeader"
import { usePageName } from "../../../../hook/usePageName"
const { VITE_API_URL } = import.meta.env

interface CurrentPathname {
  name: string;
}

interface SubRoutesProps {
  currentPathname?: CurrentPathname
  subroutes?: {
    name?: string
    href?: string
  }[]
}

// Interfaz para el formato de datos del frontend
export interface MaintenanceFrontend {
  id: string
  equipo: string
  equipoId: string
  tipo: string
  estado: string
  prioridad: string // Se asume una lógica para determinar la prioridad si no viene del backend
  tecnico: string
  fecha: string
  costo: string
}

// Interfaz para el formato de datos del backend (basado en tu controlador)
interface MaintenanceBackend {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  scheduledDate: string
  completionDate: string | null
  cost: number | null
  equipment: {
    serialNumber: string
    type: string
  }
  assignedToUser: {
    username: string
  } | null
  company: {
    name: string
  }
}

const AllMaintenance: React.FC<SubRoutesProps> = ({}) => {
  const [activeTab, setActiveTab] = useState("Todos")
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceFrontend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceFrontend | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { selectedCompany } = useCompany();
  const { pageName } = usePageName();
  // ====================================
  // Función para exportar a Excel
  // ====================================
  const exportToExcel = () => {
    const excelData = filteredMantenimientos.map((mantenimiento) => ({
      'ID': mantenimiento.id,
      'Equipo': mantenimiento.equipo,
      'Serial del Equipo': mantenimiento.equipoId,
      'Tipo': mantenimiento.tipo,
      'Estado': mantenimiento.estado,
      'Prioridad': mantenimiento.prioridad,
      'Técnico Asignado': mantenimiento.tecnico,
      'Fecha Programada': mantenimiento.fecha,
      'Costo': mantenimiento.costo
    }));

    // Crear un libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mantenimientos');

    // Ajustar el ancho de las columnas automáticamente
    const maxWidth = 50;
    const columnWidths = Object.keys(excelData[0] || {}).map(key => {
      const maxLength = Math.max(
        key.length,
        ...excelData.map(row => String(row[key as keyof typeof row]).length)
      );
      return { wch: Math.min(maxLength + 2, maxWidth) };
    });
    worksheet['!cols'] = columnWidths;

    // Generar el archivo Excel
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `mantenimientos_${timestamp}.xlsx`);
  };

  // ====================================
  // Manejo de modal
  // ====================================
  const openDeleteModal = (connection: MaintenanceFrontend) => {
    setSelectedMaintenance(connection)
    setIsModalOpen(true)
  }

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setIsModalOpen(false)
      setSelectedMaintenance(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedMaintenance) return
    setIsDeleting(true)

    try {
      const res = await fetch(`${VITE_API_URL}/api/maintenances/${selectedCompany?.id}/${selectedMaintenance.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Error al eliminar conexión")

      mutate(`${VITE_API_URL}/api/maintenances/${selectedCompany?.id}/all`)
      setIsDeleting(false)
      closeDeleteModal()
    } catch (err) {
      console.error("Error eliminando conexión", err)
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    if (!selectedCompany?.id) return;

    const fetchMaintenances = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${VITE_API_URL}/api/maintenances/${selectedCompany.id}/all`);
        if (!response.ok) {
          throw new Error("Error al obtener los datos de mantenimiento");
        }

        const data: MaintenanceBackend[] = await response.json();
        const mappedData = data.map(mapApiToFrontend);
        setMaintenanceData(mappedData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenances();
  }, [selectedCompany?.id]);  


  // Función para mapear los datos del backend al formato del frontend
  const mapApiToFrontend = (
    item: MaintenanceBackend
  ): MaintenanceFrontend => {
    // Lógica para determinar la prioridad (puedes ajustarla según tus necesidades)
    const getPriority = (status: string): string => {
      switch (status) {
        case 'COMPLETED':
          return 'Baja';
        case 'IN_PROGRESS':
          return 'Media';
        case 'SCHEDULED':
          return 'Alta';
        default:
          return 'Baja';
      }
    };

    return {
      id: item.id,
      equipo: item.title,
      equipoId: item.equipment.serialNumber,
      tipo: item.type,
      estado: item.status, // Ajusta los estados si es necesario
      prioridad: getPriority(item.status), // Lógica de ejemplo para la prioridad
      tecnico: item.assignedToUser?.username || "No asignado",
      fecha: new Date(item.scheduledDate).toLocaleDateString(),
      costo: item.cost ? `$${item.cost}` : "$0",
    }
  }

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "COMPLETED":
        return "bg-green-600 text-green-100"
      case "IN_PROGRESS":
        return "bg-blue-600 text-blue-100"
      case "SCHEDULED":
        return "bg-yellow-600 text-yellow-100"
      case "PENDING":
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
      case "COMPLETED":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 text-green-400"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        )
      case "IN_PROGRESS":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 text-blue-400"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        )
      case "SCHEDULED":
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
      case "PENDING":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 text-red-400"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="m12 17 .01 0" />
          </svg>
        )
      default:
        return null
    }
  }

  const filteredMantenimientos = maintenanceData.filter((mantenimiento) => {
    if (activeTab === "Todos") return true
    if (activeTab === "Pendientes")
      return (
        mantenimiento.estado === "PENDING" ||
        mantenimiento.estado === "IN_PROGRESS" ||
        mantenimiento.estado === "SCHEDULED"
      )
    if (activeTab === "Completados") return mantenimiento.estado === "COMPLETED"
    return true
  })

  // Cálculos para las tarjetas de KPI
  const totalMantenimientos = maintenanceData.length
  const pendientes = maintenanceData.filter(
    (m) =>
      m.estado === "PENDING" ||
      m.estado === "IN_PROGRESS" ||
      m.estado === "SCHEDULED"
  ).length
  const completados = maintenanceData.filter(
    (m) => m.estado === "COMPLETED"
  ).length
  const costoTotal = maintenanceData.reduce((acc, m) => {
    const cost = parseFloat(m.costo.replace("$", ""))
    return acc + (isNaN(cost) ? 0 : cost)
  }, 0)

  if (loading) {
    return <Loader/>
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="bg-gray-900 text-white">

      <PagesHeader 
        pageName={pageName} 
        title={pageName || "N/a"} 
        description={pageName ? `${pageName} in ${selectedCompany?.name}` : "Cargando compañía..."}
        showCreate   
        showExport
        onExport={exportToExcel}
      />

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
          <div className="text-3xl font-bold mb-1">{totalMantenimientos}</div>
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
          <div className="text-3xl font-bold mb-1">{pendientes}</div>
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
          <div className="text-3xl font-bold mb-1">{completados}</div>
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
          <div className="text-3xl font-bold mb-1">${costoTotal.toFixed(2)}</div>
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
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
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
          <p className="text-gray-400 text-sm">
            Lista completa de mantenimientos programados y realizados
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-sm font-medium text-gray-300">
                  ID
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">
                  Equipo
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">
                  Tipo
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">
                  Estado
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">
                  Prioridad
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">
                  Técnico
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">
                  Fecha
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">
                  Costo
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMantenimientos.map((mantenimiento) => (
                <tr
                  key={mantenimiento.id}
                  className="border-b border-gray-700 hover:bg-gray-750"
                >
                  <td className="p-4 text-sm font-medium">
                    {mantenimiento.id.substring(0, 8)}...
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-sm">
                        {mantenimiento.equipo}
                      </div>
                      <div className="text-xs text-gray-400">
                        {mantenimiento.equipoId}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{mantenimiento.tipo}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(mantenimiento.estado)}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                          mantenimiento.estado
                        )}`}
                      >
                        {mantenimiento.estado}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(
                        mantenimiento.prioridad
                      )}`}
                    >
                      {mantenimiento.prioridad}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{mantenimiento.tecnico}</td>
                  <td className="p-4 text-sm">{mantenimiento.fecha}</td>
                  <td className="p-4 text-sm font-medium">
                    {mantenimiento.costo}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <a href={`edit/${mantenimiento.id}`} className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors duration-150">
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
                        onClick={() => openDeleteModal(mantenimiento)}
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
        </div>
      </div>
      {/* Modal de confirmación */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        maintenance={selectedMaintenance}
        isDeleting={isDeleting}
      />
    </div>
  )
}
export default AllMaintenance