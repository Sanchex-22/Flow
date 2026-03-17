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
import {
  Monitor,
  Wrench,
  CheckCircle,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Clock,
  Plus,
  UserCheck,
} from "lucide-react";

const { VITE_API_URL } = import.meta.env;

const fetcher = (url: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt") || ""}` },
  }).then((res) => {
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res.json();
  });

export type Kpi = { count: number; change: number };
export type InventoryCategory = { name: string; count: number };
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
  currentPathname?: CurrentPathname;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return `Hace ${diffInSeconds}s`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Hace ${diffInHours}h`;
  return `Hace ${Math.floor(diffInHours / 24)}d`;
};

const CATEGORY_COLORS = [
  { bar: "bg-blue-500", dot: "bg-blue-500", text: "text-blue-500" },
  { bar: "bg-violet-500", dot: "bg-violet-500", text: "text-violet-500" },
  { bar: "bg-emerald-500", dot: "bg-emerald-500", text: "text-emerald-500" },
  { bar: "bg-amber-500", dot: "bg-amber-500", text: "text-amber-500" },
  { bar: "bg-rose-500", dot: "bg-rose-500", text: "text-rose-500" },
  { bar: "bg-cyan-500", dot: "bg-cyan-500", text: "text-cyan-500" },
];

const ActivityIcon: React.FC<{ icon: string }> = ({ icon }) => {
  const base =
    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0";
  if (icon === "plus")
    return (
      <div className={`${base} bg-blue-500/15`}>
        <Plus className="w-4 h-4 text-blue-500" />
      </div>
    );
  if (icon === "user")
    return (
      <div className={`${base} bg-purple-500/15`}>
        <UserCheck className="w-4 h-4 text-purple-500" />
      </div>
    );
  return (
    <div className={`${base} bg-gray-500/15`}>
      <Activity className="w-4 h-4 text-gray-500" />
    </div>
  );
};

interface KpiCardProps {
  label: string;
  value: number | undefined;
  change: number | undefined;
  icon: React.ReactNode;
  gradient: string;
  isDarkMode: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  change,
  icon,
  gradient,
  isDarkMode,
}) => {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-3 sm:p-4 lg:p-5 border transition-all hover:shadow-lg ${
        isDarkMode
          ? "bg-[#1e1e20] border-white/[0.07] hover:border-white/[0.12]"
          : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"
      }`}
    >
      {/* Gradient accent top-right */}
      <div
        className={`absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 ${gradient}`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-medium truncate mb-2 ${
              isDarkMode ? "text-[#8e8e93]" : "text-gray-500"
            }`}
          >
            {label}
          </p>
          <p
            className={`text-2xl sm:text-3xl font-bold tracking-tight leading-none ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {value ?? "—"}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            )}
            <span
              className={`text-xs font-semibold ${
                isPositive ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {isPositive ? "+" : ""}
              {change ?? 0}%
            </span>
            <span
              className={`text-xs ${
                isDarkMode ? "text-[#636366]" : "text-gray-400"
              }`}
            >
              este mes
            </span>
          </div>
        </div>
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${gradient} bg-opacity-15`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const AllDashboard: React.FC<DashboardProps> = () => {
  const { isDarkMode } = useTheme();
  const { selectedCompany } = useCompany();
  const [showReportModal, setShowReportModal] = useState(false);
  const { pageName } = usePageName();

  const { data: dashboardData, error, isLoading, isValidating } = useSWR<DashboardData>(
    selectedCompany ? `${VITE_API_URL}/api/dashboard/${selectedCompany.id}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: true,
      errorRetryInterval: 0,
      errorRetryCount: 10,
    }
  );

  const handleGenerateReport = async () => {
    if (!selectedCompany) { alert("Seleccione una empresa primero."); return; }
    if (!dashboardData) { alert("Cargando datos del dashboard..."); return; }
    setShowReportModal(true);
  };

  if (isLoading || isValidating) return <Loader />;

  if (error)
    return (
      <div className={`flex-1 p-6 text-center ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
        Error al cargar el dashboard: {error.message}
      </div>
    );

  if (!dashboardData)
    return (
      <div className={`flex-1 p-6 text-center ${isDarkMode ? "text-[#8e8e93]" : "text-gray-500"}`}>
        No hay datos disponibles para esta empresa.
      </div>
    );

  const totalInventoryCount =
    dashboardData.inventoryByCategory.reduce((sum, item) => sum + item.count, 0) || 1;

  const kpis = [
    {
      label: "Total Equipos",
      value: dashboardData.kpi.totalEquipments.count,
      change: dashboardData.kpi.totalEquipments.change,
      icon: <Monitor className="w-5 h-5 text-blue-500" />,
      gradient: "bg-blue-500",
    },
    {
      label: "Mantenimientos Pendientes",
      value: dashboardData.kpi.pendingMaintenances.count,
      change: dashboardData.kpi.pendingMaintenances.change,
      icon: <Wrench className="w-5 h-5 text-amber-500" />,
      gradient: "bg-amber-500",
    },
    {
      label: "Equipos Activos",
      value: dashboardData.kpi.activeEquipments.count,
      change: dashboardData.kpi.activeEquipments.change,
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      gradient: "bg-emerald-500",
    },
    {
      label: "Usuarios Activos",
      value: dashboardData.kpi.activeUsers.count,
      change: dashboardData.kpi.activeUsers.change,
      icon: <Users className="w-5 h-5 text-violet-500" />,
      gradient: "bg-violet-500",
    },
  ];

  return (
    <>
      <div className="flex-1 space-y-6">
        {/* Header */}
        <PagesHeader
          title={pageName}
          description={
            pageName
              ? `${pageName} · ${selectedCompany?.name}`
              : "Cargando compañía..."
          }
          onExport={handleGenerateReport}
        />

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 overflow-hidden">
          {kpis.map((kpi, i) => (
            <KpiCard key={i} {...kpi} isDarkMode={isDarkMode} />
          ))}
        </div>

        {/* INVENTORY + ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* INVENTARIO POR CATEGORÍA */}
          <div
            className={`rounded-2xl p-5 border ${
              isDarkMode
                ? "bg-[#1e1e20] border-white/[0.07]"
                : "bg-white border-gray-100 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isDarkMode ? "bg-white/[0.06]" : "bg-gray-100"
                }`}
              >
                <Layers className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h2
                  className={`text-sm font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Inventario por Categoría
                </h2>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-[#636366]" : "text-gray-400"
                  }`}
                >
                  Distribución de equipos por tipo
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3.5">
              {dashboardData.inventoryByCategory.length === 0 && (
                <p className={`text-xs text-center py-4 ${isDarkMode ? "text-[#636366]" : "text-gray-400"}`}>
                  Sin datos de inventario
                </p>
              )}
              {dashboardData.inventoryByCategory.map((category, idx) => {
                const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                const pct = Math.round((category.count / totalInventoryCount) * 100);
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${color.dot}`}
                        />
                        <span
                          className={`text-xs font-medium truncate ${
                            isDarkMode ? "text-[#ebebf5]/80" : "text-gray-700"
                          }`}
                        >
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span
                          className={`text-xs font-bold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {category.count}
                        </span>
                        <span
                          className={`text-[10px] w-7 text-right ${
                            isDarkMode ? "text-[#636366]" : "text-gray-400"
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-full h-1.5 rounded-full ${
                        isDarkMode ? "bg-white/[0.06]" : "bg-gray-100"
                      }`}
                    >
                      <div
                        className={`h-1.5 rounded-full transition-all duration-700 ${color.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVIDAD RECIENTE */}
          <div
            className={`rounded-2xl p-5 border ${
              isDarkMode
                ? "bg-[#1e1e20] border-white/[0.07]"
                : "bg-white border-gray-100 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isDarkMode ? "bg-white/[0.06]" : "bg-gray-100"
                }`}
              >
                <Clock className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <h2
                  className={`text-sm font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Actividad Reciente
                </h2>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-[#636366]" : "text-gray-400"
                  }`}
                >
                  Últimas acciones registradas
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-1">
              {dashboardData.recentActivity.length === 0 && (
                <p className={`text-xs text-center py-4 ${isDarkMode ? "text-[#636366]" : "text-gray-400"}`}>
                  Sin actividad reciente
                </p>
              )}
              {dashboardData.recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isDarkMode ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"
                  }`}
                >
                  <ActivityIcon icon={activity.icon} />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isDarkMode ? "text-[#ebebf5]/90" : "text-gray-800"
                      }`}
                    >
                      {activity.type}
                    </p>
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        isDarkMode ? "text-[#8e8e93]" : "text-gray-500"
                      }`}
                    >
                      {activity.description}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] flex-shrink-0 mt-0.5 ${
                      isDarkMode ? "text-[#48484a]" : "text-gray-400"
                    }`}
                  >
                    {formatDate(activity.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {dashboardData && (
        <ReportPreviewModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          data={dashboardData}
          companyName={selectedCompany?.name || "Empresa"}
        />
      )}
    </>
  );
};

export default AllDashboard;
