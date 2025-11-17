"use client"

import { Company, useCompany } from "../../../context/routerContext"
import useSWR from "swr";
import Loader from "../../../components/loaders/loader";

const { VITE_API_URL } = import.meta.env;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  const { selectedCompany }: { selectedCompany: Company | null } = useCompany();
  const { data: departments, error: errorDepartments, isLoading: isLoadingDepartments } = useSWR(
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
  if (isLoadingDepartments || !departments) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Configuración</h1>
        <p className="text-gray-400">Administra la configuración del sistema y preferencias</p>
      </div>
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
                readOnly // <--- Añadido para hacer el campo de solo lectura
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Código de Empresa</label>
              <input
                type="text"
                value={selectedCompany?.code || "Cargando..."}
                readOnly // <--- Añadido
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
              <textarea
                rows={3}
                value={selectedCompany?.address || "Cargando..."}
                readOnly // <--- Añadido
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
              <input
                type="tel"
                value={selectedCompany?.phone || "Cargando..."}
                readOnly // <--- Añadido
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={selectedCompany?.email || "Cargando..."}
                readOnly // <--- Añadido
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button (Consider if this button should even exist if fields are readOnly) */}
      <div className="fixed bottom-6 right-6">
        <button type="submit" className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition-colors">
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