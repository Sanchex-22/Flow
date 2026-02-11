// src/pages/Dashboard.tsx
"use client";

import useSWR from "swr";
import React, { useState } from "react";
import { useTheme } from "../../../../context/themeContext";
import { useCompany } from "../../../../context/routerContext";
import Loader from "../../../../components/loaders/loader";
import ReportPreviewModal from "../../../../components/modals/ReportPreviewModal";
import PagesHeader from "../../../../components/headers/pagesHeader";
import { CurrentPathname } from "../../../../components/layouts/main";
import { usePageName } from "../../../../hook/usePageName";

const { VITE_API_URL } = import.meta.env;

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res.json();
  });

// ------------ Tipos (igual que antes) -------------
export type Kpi = {
  count: number;
  change: number;
};

export type InventoryCategory = {
  name: string;
  count: number;
};

export type RecentActivity = {
  type: string;
  description: string;
  date: string;
  icon: string;
};

export type DashboardData = {
  kpi: {
    totalEquipments: Kpi;
    pendingMaintenances: Kpi;
    activeEquipments: Kpi;
    activeUsers: Kpi;
  };
  inventoryByCategory: InventoryCategory[];
  recentActivity: RecentActivity[];
};

interface DashboardProps {
  currentPathname?: CurrentPathname
}

// ------------ Format date helper (igual que antes) ----------
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `Hace ${diffInSeconds} segundos`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Hace ${diffInHours} horas`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `Hace ${diffInDays} días`;
};

// ------------ Activity Icons (igual que antes) ----------
const ActivityIcon: React.FC<{ icon: string }> = ({ icon }) => {
  switch (icon) {
    case "plus":
      return (
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-3 h-3"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      );

    case "user":
      return (
        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-3 h-3"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
          </svg>
        </div>
      );

    default:
      return (
        <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center mt-0.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-3 h-3"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      );
  }
};

// ------------ COMPONENTE PRINCIPAL ACTUALIZADO ----------
const AllDashboard: React.FC<DashboardProps> = ({}) => {
  const { isDarkMode } = useTheme();
  const { selectedCompany } = useCompany();
  const [showReportModal, setShowReportModal] = useState(false);
  const { pageName } = usePageName();
  const {
    data: dashboardData,
    error,
    isLoading,
    isValidating,
  } = useSWR<DashboardData>(
    selectedCompany ? `${VITE_API_URL}/api/dashboard/${selectedCompany.id}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: true,
      errorRetryInterval: 0,
      errorRetryCount: 10,
    }
  );

  // ------------ Abrir Modal con Vista Previa ----------
  const handleGenerateReport = async () => {
    if (!selectedCompany) {
      alert("Seleccione una empresa primero.");
      return;
    }

    if (!dashboardData) {
      alert("Cargando datos del dashboard...");
      return;
    }

    setShowReportModal(true);
  };

  // ------------ Render ----------
  if (isLoading || isValidating) return <Loader />;

  if (error)
    return (
      <div className={`flex-1 p-6 text-center ${
        isDarkMode ? 'text-red-500' : 'text-red-600'
      }`}>
        Error al cargar el dashboard: {error.message}
      </div>
    );

  if (!dashboardData)
    return (
      <div className={`flex-1 p-6 text-center ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        No hay datos disponibles para esta empresa.
      </div>
    );

  const totalInventoryCount =
    dashboardData.inventoryByCategory.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <>
      <div className="flex-1">
        {/* Header */}
        <PagesHeader 
          title={pageName} 
          description={pageName ? `${pageName} in ${selectedCompany?.name}` : "Cargando compañía..."} 
          onExport={handleGenerateReport}
        />

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Equipos */}
          <div className={`rounded-lg p-6 border transition-colors ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Equipos
            </span>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {dashboardData?.kpi?.totalEquipments?.count}
            </div>
            <div
              className={`mt-2 text-sm ${
                dashboardData?.kpi?.totalEquipments?.change >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {dashboardData?.kpi?.totalEquipments?.change >= 0 ? "↗" : "↘"}{" "}
              {dashboardData?.kpi?.totalEquipments?.change}%
            </div>
          </div>

          {/* Mantenimientos Pendientes */}
          <div className={`rounded-lg p-6 border transition-colors ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Mantenimientos Pendientes
            </span>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {dashboardData.kpi.pendingMaintenances.count}
            </div>
            <div
              className={`mt-2 text-sm ${
                dashboardData.kpi.pendingMaintenances.change >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {dashboardData.kpi.pendingMaintenances.change >= 0 ? "↗" : "↘"}{" "}
              {dashboardData.kpi.pendingMaintenances.change}%
            </div>
          </div>

          {/* Equipos Activos */}
          <div className={`rounded-lg p-6 border transition-colors ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Equipos Activos
            </span>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {dashboardData.kpi.activeEquipments.count}
            </div>
            <div
              className={`mt-2 text-sm ${
                dashboardData.kpi.activeEquipments.change >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {dashboardData.kpi.activeEquipments.change >= 0 ? "↗" : "↘"}{" "}
              {dashboardData.kpi.activeEquipments.change}%
            </div>
          </div>

          {/* Usuarios Activos */}
          <div className={`rounded-lg p-6 border transition-colors ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Usuarios Activos
            </span>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {dashboardData.kpi.activeUsers.count}
            </div>
            <div
              className={`mt-2 text-sm ${
                dashboardData.kpi.activeUsers.change >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {dashboardData.kpi.activeUsers.change >= 0 ? "↗" : "↘"}{" "}
              {dashboardData.kpi.activeUsers.change}%
            </div>
          </div>
        </div>

        {/* INVENTARIO + ACTIVIDAD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* INVENTARIO POR CATEGORÍA */}
          <div className={`rounded-lg p-6 border transition-colors ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Inventario por Categoría
            </h2>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Distribución de equipos por tipo
            </p>

            <div className="space-y-4">
              {dashboardData.inventoryByCategory.map((category, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {category.name}
                      </span>
                    </div>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {category.count}
                    </span>
                  </div>

                  <div className={`w-full rounded-full h-2 mt-1 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(category.count / totalInventoryCount) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVIDAD RECIENTE */}
          <div className={`rounded-lg p-6 border transition-colors ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Actividad Reciente
            </h2>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Últimas acciones registradas
            </p>

            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <ActivityIcon icon={activity.icon} />
                  <div className="flex-1">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {activity.type}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {activity.description}
                    </p>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {formatDate(activity.date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Vista Previa */}
      {dashboardData && (
        <ReportPreviewModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          data={dashboardData}
          companyName={selectedCompany?.name || 'Empresa'}
        />
      )}
    </>
  );
};

export default AllDashboard;