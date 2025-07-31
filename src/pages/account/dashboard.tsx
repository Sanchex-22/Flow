"use client"
import useSWR from "swr";
import React, { useState, useEffect } from 'react';
import { Company, useCompany } from "../../context/routerContext";
const { VITE_API_URL } = import.meta.env;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Tipos para los datos de la API
type Kpi = {
  count: number;
  change: number;
};

type InventoryCategory = {
  name: string;
  count: number;
};

type RecentActivity = {
  type: string;
  description: string;
  date: string;
  icon: string;
};

type DashboardData = {
  kpi: {
    totalEquipments: Kpi;
    pendingMaintenances: Kpi;
    activeEquipments: Kpi;
    activeUsers: Kpi;
  };
  inventoryByCategory: InventoryCategory[];
  recentActivity: RecentActivity[];
};

type Subroutes = {
  name: string;
  href: string;
}

type DashboardProps = {
  subroutes: Subroutes[];
}

// Helper para formatear la fecha
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

// Componente para renderizar iconos de actividad reciente dinámicamente
const ActivityIcon: React.FC<{ icon: string }> = ({ icon }) => {
  switch (icon) {
    case 'plus':
      return (
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      );
    case 'user':
      return (
        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
          </svg>
        </div>
      );
    // Agrega más casos para otros iconos si es necesario
    default:
      return (
        <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center mt-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      );
  }
};


const Dashboard: React.FC<DashboardProps> = ({ subroutes }) => {
  const { selectedCompany }: { selectedCompany: Company | null } = useCompany();

  const { data: dashboardData, error, isLoading } = useSWR<DashboardData>( // <-- Tipado opcional para `data`
    selectedCompany ? `${VITE_API_URL}/api/dashboard/${selectedCompany.id}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: true,
      errorRetryInterval: 5000,
      errorRetryCount: 10,
    }
  );

  if (isLoading) {
    return <div className="flex-1 p-6 text-center">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="flex-1 p-6 text-center text-red-500">Error: {error}</div>;
  }

  if (!dashboardData) {
    return null;
  }
  
  const totalInventoryCount = dashboardData.inventoryByCategory.reduce((sum, category) => sum + category.count, 0) || 1;


  return (
    <>
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard IT - Empresa Principal S.A.</h1>
          <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Generar Reporte
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Equipos */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Equipos</span>
              {/* Icono... */}
            </div>
            <div className="text-3xl font-bold mb-1">{dashboardData.kpi.totalEquipments.count}</div>
            <div className="text-sm text-gray-400">Equipos registrados</div>
            <div className={`text-sm mt-2 ${dashboardData.kpi.totalEquipments.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dashboardData.kpi.totalEquipments.change >= 0 ? '↗' : '↘'} {dashboardData.kpi.totalEquipments.change}%
            </div>
          </div>

          {/* Mantenimientos Pendientes */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Mantenimientos Pendientes</span>
               {/* Icono... */}
            </div>
            <div className="text-3xl font-bold mb-1">{dashboardData.kpi.pendingMaintenances.count}</div>
            <div className="text-sm text-gray-400">Requieren atención</div>
             <div className={`text-sm mt-2 ${dashboardData.kpi.pendingMaintenances.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dashboardData.kpi.pendingMaintenances.change >= 0 ? '↗' : '↘'} {dashboardData.kpi.pendingMaintenances.change}%
            </div>
          </div>

          {/* Equipos Activos */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Equipos Activos</span>
               {/* Icono... */}
            </div>
            <div className="text-3xl font-bold mb-1">{dashboardData.kpi.activeEquipments.count}</div>
            <div className="text-sm text-gray-400">En funcionamiento</div>
             <div className={`text-sm mt-2 ${dashboardData.kpi.activeEquipments.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dashboardData.kpi.activeEquipments.change >= 0 ? '↗' : '↘'} {dashboardData.kpi.activeEquipments.change}%
            </div>
          </div>

          {/* Usuarios Activos */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Usuarios Activos</span>
               {/* Icono... */}
            </div>
            <div className="text-3xl font-bold mb-1">{dashboardData.kpi.activeUsers.count}</div>
            <div className="text-sm text-gray-400">Empleados registrados</div>
            <div className={`text-sm mt-2 ${dashboardData.kpi.activeUsers.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dashboardData.kpi.activeUsers.change >= 0 ? '↗' : '↘'} {dashboardData.kpi.activeUsers.change}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Inventario por Categoría */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-2">Inventario por Categoría</h2>
            <p className="text-gray-400 text-sm mb-6">Distribución de equipos por tipo</p>

            <div className="space-y-4">
              {dashboardData.inventoryByCategory.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 bg-blue-500 rounded-full`}></div> {/* Color dinámico podría ser añadido */}
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">{category.count}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(category.count / totalInventoryCount) * 100}%` }}>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-2">Actividad Reciente</h2>
            <p className="text-gray-400 text-sm mb-6">Últimas acciones en el sistema</p>

            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <ActivityIcon icon={activity.icon} />
                  <div className="flex-1">
                    <p className="text-sm">{activity.type}</p>
                    <p className="text-sm text-gray-400">{activity.description}</p>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 mr-1">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                      {formatDate(activity.date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Acciones Rápidas (Estático por ahora) */}
         <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
             {/* ... */}
        </div>
      </div>
    </>
  )
}
export default Dashboard;
