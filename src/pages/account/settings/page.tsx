"use client"

import { useState } from "react"
import { Company, useCompany } from "../../../context/routerContext"
import useSWR from "swr";
import Loader from "../../../components/loaders/loader";

const { VITE_API_URL } = import.meta.env;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General")
  const [modoMantenimiento, setModoMantenimiento] = useState(false)
  const [autoAsignacionIds, setAutoAsignacionIds] = useState(true)
  const { selectedCompany }: { selectedCompany: Company | null } = useCompany();
  const { data: departments, error: errorDepartments, isLoading: isLoadingDepartments } = useSWR( // Añadido isLoading
    selectedCompany ? `${VITE_API_URL}/api/companies/${selectedCompany.code}/departments` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: true,
      errorRetryInterval: 5000,
      errorRetryCount: 10,
    }
  );

  if (errorDepartments) return <div>Error al cargar departamentos: {errorDepartments.message}</div>;
  if (isLoadingDepartments || !departments) return <Loader/>; 


  const tabs = ["General", "Notificaciones", "Seguridad", "Integraciones", "Respaldo"]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Configuración</h1>
        <p className="text-gray-400">Administra la configuración del sistema y preferencias</p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* General Tab Content */}
      {activeTab === "General" && (
        <div className="space-y-8">
          {/* Company Information Section */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-6 h-6">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-full h-full text-blue-400"
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Información de la Empresa</h2>
                <p className="text-gray-400 text-sm">Configura los datos básicos de tu organización</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre de la Empresa</label>
                <input
                  type="text"
                  value={selectedCompany?.name || "Cargando..."}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Código de Empresa</label>
                <input
                  type="text"
                  value={selectedCompany?.code || "Cargando..."}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
                <textarea
                  rows={3}
                  value={selectedCompany?.address || "Cargando..."}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={selectedCompany?.phone || "Cargando..."}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={selectedCompany?.email || "Cargando..."}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* System Configuration Section */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-6 h-6">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-full h-full text-gray-400"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Configuración del Sistema</h2>
                <p className="text-gray-400 text-sm">Ajustes generales del sistema de gestión IT</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Zona Horaria</label>
                <div className="relative">
                  <select className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white appearance-none cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
                    <option value="america/mexico">América/México</option>
                    <option value="america/new_york">América/New York</option>
                    <option value="america/los_angeles">América/Los Angeles</option>
                    <option value="europe/madrid">Europa/Madrid</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Moneda</label>
                <div className="relative">
                  <select className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white appearance-none cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
                    <option value="usd">USD - Dólar</option>
                    <option value="eur">EUR - Euro</option>
                    <option value="mxn">MXN - Peso Mexicano</option>
                    <option value="cop">COP - Peso Colombiano</option>
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

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Modo Mantenimiento</label>
                  <p className="text-xs text-gray-400">Activa el modo mantenimiento para el sistema</p>
                </div>
                <button
                  onClick={() => setModoMantenimiento(!modoMantenimiento)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${modoMantenimiento ? "bg-blue-600" : "bg-gray-600"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${modoMantenimiento ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Auto-asignación de IDs</label>
                  <p className="text-xs text-gray-400">Genera automáticamente IDs para nuevos equipos</p>
                </div>
                <button
                  onClick={() => setAutoAsignacionIds(!autoAsignacionIds)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoAsignacionIds ? "bg-blue-600" : "bg-gray-600"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoAsignacionIds ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Tab Placeholders */}
      {activeTab !== "General" && (
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
          <h3 className="text-lg font-medium text-gray-300 mb-2">Sección {activeTab}</h3>
          <p className="text-gray-400">Esta sección estará disponible próximamente.</p>
        </div>
      )}

      {/* Save Button */}
      <div className="fixed bottom-6 right-6">
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17,21 17,13 7,13 7,21" />
            <polyline points="7,3 7,8 15,8" />
          </svg>
          <span>Guardar Configuración</span>
        </button>
      </div>
    </div>
  )
}
