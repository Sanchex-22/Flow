"use client";

import useSWR from "swr";
import React, { useState, useMemo } from "react";
import { useTheme } from "../../../../context/themeContext";
import { useCompany } from "../../../../context/routerContext";
import Loader from "../../../../components/loaders/loader";
import ReportPreviewModal from "../../../../components/modals/ReportPreviewModal";
import PagesHeader from "../../../../components/headers/pagesHeader";
import { CurrentPathname } from "../../../../components/layouts/main";
import { usePageName } from "../../../../hook/usePageName";
import { DashboardData } from "./types";
import ActivityIcon from "./ActivityIcon";
import AIInsightsPanel from "./AIInsightsPanel";
import AiChatAssistant from "./AiChatAssistant";
import SoftwareExpensesPanel from "./SoftwareExpensesPanel";
import PersonsPanel from "./PersonsPanel";
import { formatDate } from "./utils";
import {
  Package, Users, Monitor, CheckCircle2, DollarSign, Award, BarChart3,
  AlertTriangle, Zap, UserX, TrendingUp, TrendingDown, Layers, Clock,
} from "lucide-react";

const { VITE_API_URL } = import.meta.env;

const fetcher = (url: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt") || ""}` },
  }).then((res) => {
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res.json();
  });

interface DashboardProps {
  currentPathname?: CurrentPathname;
}

interface Equipment {
  id: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  cost?: number;
  assignedToPersonId?: string;
  status: string;
}

interface Person {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  departmentId?: string;
  status: string;
  email?: string;
}

const CATEGORY_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];

// Reusable card wrapper
const Card: React.FC<{ children: React.ReactNode; className?: string; isDarkMode: boolean }> = ({
  children, className = "", isDarkMode,
}) => (
  <div className={`rounded-2xl border transition-colors ${isDarkMode
    ? "bg-[#1e1e20] border-white/[0.07]"
    : "bg-white border-gray-100 shadow-sm"
  } ${className}`}>
    {children}
  </div>
);

const AIDashboard: React.FC<DashboardProps> = () => {
  const { isDarkMode } = useTheme();
  const { selectedCompany } = useCompany();
  const [showReportModal, setShowReportModal] = useState(false);
  const { pageName } = usePageName();

  const swrConfig = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    shouldRetryOnError: false,
    errorRetryCount: 1,
  };

  const { data: dashboardData, error, isLoading } = useSWR<DashboardData>(
    selectedCompany ? `${VITE_API_URL}/api/dashboard/${selectedCompany.id}` : null,
    fetcher, swrConfig
  );

  const { data: equipmentData } = useSWR(
    selectedCompany?.id ? `${VITE_API_URL}/api/inventory/${selectedCompany.id}/inventory/all` : null,
    fetcher, swrConfig
  );

  const { data: personsData } = useSWR(
    selectedCompany?.id ? `${VITE_API_URL}/api/persons/company/${selectedCompany?.id}` : null,
    fetcher, swrConfig
  );

  const enhancedStats = useMemo(() => {
    const equipmentList = Array.isArray(equipmentData) ? equipmentData : [];
    const personsList = Array.isArray(personsData) ? personsData : [];

    const equipmentByPerson = new Map<string, Equipment[]>();
    const equipmentByType = new Map<string, number>();

    equipmentList.forEach((eq: Equipment) => {
      if (eq.assignedToPersonId) {
        if (!equipmentByPerson.has(eq.assignedToPersonId)) {
          equipmentByPerson.set(eq.assignedToPersonId, []);
        }
        equipmentByPerson.get(eq.assignedToPersonId)!.push(eq);
      }
      equipmentByType.set(eq.type, (equipmentByType.get(eq.type) || 0) + 1);
    });

    const totalPersons = personsList.length;
    const personsWithEquipment = equipmentByPerson.size;
    const personsWithoutEquipment = totalPersons - personsWithEquipment;
    const personsWithoutDevices = personsList.filter((p: Person) => !equipmentByPerson.has(p.id));
    const personsWithoutMonitor = personsList.filter((p: Person) => {
      const equips = equipmentByPerson.get(p.id) || [];
      return equips.length > 0 && !equips.some((e) => e.type?.toLowerCase().includes("monitor"));
    });

    const topPersons = Array.from(equipmentByPerson.entries())
      .map(([personId, equips]) => {
        const person = personsList.find((p: Person) => p.id === personId);
        return {
          personId, name: person?.fullName || "Desconocido",
          count: equips.length,
          cost: equips.reduce((s, e) => s + (Number(e.cost) || 0), 0),
        };
      })
      .sort((a, b) => b.count - a.count).slice(0, 5);

    const topTypes = Array.from(equipmentByType.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count).slice(0, 5);

    const personsWithComplete = Array.from(equipmentByPerson.values()).filter(
      (equips) =>
        equips.some((e) => e.type?.toLowerCase().includes("laptop")) &&
        equips.some((e) => e.type?.toLowerCase().includes("monitor"))
    ).length;

    const totalCost = equipmentList.reduce((sum: number, eq: Equipment) => sum + (Number(eq.cost) || 0), 0);

    const alerts = [];
    if (personsWithoutEquipment > 0)
      alerts.push({ level: "high", title: `${personsWithoutEquipment} personas sin equipos`, description: "Requieren asignación inmediata" });
    if (personsWithoutMonitor.length > 0)
      alerts.push({ level: "medium", title: `${personsWithoutMonitor.length} personas sin monitor`, description: "Necesitan monitor asignado" });
    if (personsWithComplete < personsWithEquipment)
      alerts.push({ level: "medium", title: `${personsWithEquipment - personsWithComplete} setups incompletos`, description: "Sin Monitor o Sin Laptop" });

    return {
      totalEquipment: equipmentList.length,
      totalPersons, personsWithEquipment, personsWithoutEquipment, personsWithComplete,
      totalCost,
      avgCostPerPerson: personsWithEquipment > 0 ? totalCost / personsWithEquipment : 0,
      laptopCount: equipmentByType.get("Laptop") || 0,
      monitorCount: equipmentByType.get("Monitor") || 0,
      mouseCount: equipmentByType.get("Mouse") || 0,
      keyboardCount: equipmentByType.get("Keyboard") || 0,
      topPersons, topTypes, alerts,
      personsWithoutDevices, personsWithoutMonitor,
    };
  }, [equipmentData, personsData]);

  const textMain = isDarkMode ? "text-white" : "text-gray-900";
  const textSub = isDarkMode ? "text-[#8e8e93]" : "text-gray-500";
  const barBg = isDarkMode ? "bg-white/[0.06]" : "bg-gray-100";
  const rowBg = isDarkMode ? "bg-white/[0.04] hover:bg-white/[0.06]" : "bg-gray-50 hover:bg-gray-100";

  if (isLoading) return <Loader />;
  if (error) return <div className={`flex-1 p-6 text-center text-red-500`}>Error: {error.message}</div>;
  if (!dashboardData) return <div className={`flex-1 p-6 text-center ${textSub}`}>No hay datos disponibles.</div>;

  const totalInventoryCount = dashboardData.inventoryByCategory.reduce((s, i) => s + i.count, 0) || 1;

  const kpiCards = [
    { label: "Total Equipos", kpi: dashboardData.kpi.totalEquipments, icon: <Monitor className="w-5 h-5 text-blue-500" />, accent: "bg-blue-500" },
    { label: "Mantenimientos", kpi: dashboardData.kpi.pendingMaintenances, icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, accent: "bg-amber-500" },
    { label: "Equipos Activos", kpi: dashboardData.kpi.activeEquipments, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, accent: "bg-emerald-500" },
    { label: "Usuarios Activos", kpi: dashboardData.kpi.activeUsers, icon: <Users className="w-5 h-5 text-violet-500" />, accent: "bg-violet-500" },
  ];

  const statsCards = [
    { label: "Total Equipos", value: enhancedStats.totalEquipment, icon: <Package className="w-5 h-5 text-blue-500" />, accent: "bg-blue-500/10" },
    { label: "Total Personas", value: enhancedStats.totalPersons, icon: <Users className="w-5 h-5 text-violet-500" />, accent: "bg-violet-500/10" },
    { label: "Setup Completo", value: enhancedStats.personsWithComplete, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, accent: "bg-emerald-500/10" },
    { label: "Inversión", value: `$${(enhancedStats.totalCost / 1000).toFixed(1)}K`, icon: <DollarSign className="w-5 h-5 text-amber-500" />, accent: "bg-amber-500/10" },
  ];

  const criticalItems = [
    { label: "Laptops", value: enhancedStats.laptopCount, color: "text-blue-500" },
    { label: "Monitores", value: enhancedStats.monitorCount, color: "text-cyan-500" },
    { label: "Mouses", value: enhancedStats.mouseCount, color: "text-violet-500" },
    { label: "Teclados", value: enhancedStats.keyboardCount, color: "text-emerald-500" },
  ];

  return (
    <>
      <div className="flex-1 space-y-5">
        <PagesHeader
          title={pageName}
          description={pageName ? `${pageName} · ${selectedCompany?.name}` : "Cargando..."}
          onExport={() => setShowReportModal(true)}
        />

        {/* Alerts */}
        {enhancedStats.alerts.length > 0 && (
          <div className="space-y-2">
            {enhancedStats.alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 sm:p-4 rounded-2xl border text-sm ${
                  alert.level === "high"
                    ? isDarkMode ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-red-50 border-red-200 text-red-700"
                    : isDarkMode ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700"
                }`}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold leading-tight">{alert.title}</p>
                  <p className="text-xs mt-0.5 leading-tight">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KPI Row 1 — Dashboard KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpiCards.map(({ label, kpi, icon, accent }, idx) => (
            <Card key={idx} isDarkMode={isDarkMode} className="p-4 sm:p-5 overflow-hidden transition-shadow hover:shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] sm:text-xs font-medium mb-1.5 truncate ${textSub}`}>{label}</p>
                  <p className={`text-2xl sm:text-3xl font-bold tracking-tight leading-none ${textMain}`}>{kpi.count}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {kpi.change >= 0
                      ? <TrendingUp className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      : <TrendingDown className="w-3 h-3 text-red-500 flex-shrink-0" />
                    }
                    <span className={`text-[11px] font-semibold ${kpi.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {kpi.change >= 0 ? "+" : ""}{kpi.change}%
                    </span>
                  </div>
                </div>
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent} bg-opacity-10 ${isDarkMode ? "bg-white/[0.06]" : "bg-gray-100"}`}>
                  {icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* KPI Row 2 — Enhanced stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statsCards.map(({ label, value, icon, accent }, idx) => (
            <Card key={idx} isDarkMode={isDarkMode} className="p-4 sm:p-5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${accent}`}>{icon}</div>
              <p className={`text-[11px] sm:text-xs font-medium mb-1 ${textSub}`}>{label}</p>
              <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${textMain}`}>{value}</p>
            </Card>
          ))}
        </div>

        {/* Equipos Críticos + Distribución Personas + Finanzas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Equipos críticos */}
          <Card isDarkMode={isDarkMode} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-white/[0.06]" : "bg-amber-50"}`}>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className={`text-sm font-semibold ${textMain}`}>Equipos Críticos</h2>
            </div>
            <div className="space-y-2">
              {criticalItems.map(({ label, value, color }) => (
                <div key={label} className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${rowBg} transition-colors`}>
                  <span className={`text-sm ${textSub}`}>{label}</span>
                  <span className={`text-xl font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Distribución personas */}
          <Card isDarkMode={isDarkMode} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-white/[0.06]" : "bg-violet-50"}`}>
                <Users className="w-4 h-4 text-violet-500" />
              </div>
              <h2 className={`text-sm font-semibold ${textMain}`}>Distribución</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Con Equipos", value: enhancedStats.personsWithEquipment, gradient: "from-emerald-500 to-green-500", color: "text-emerald-500" },
                { label: "Sin Equipos", value: enhancedStats.personsWithoutEquipment, gradient: "from-red-500 to-orange-500", color: "text-red-500" },
              ].map(({ label, value, gradient, color }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1.5">
                    <span className={`text-xs ${textSub}`}>{label}</span>
                    <span className={`text-xs font-bold ${color}`}>{value}</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${barBg}`}>
                    <div
                      className={`bg-gradient-to-r ${gradient} h-full transition-all duration-700`}
                      style={{ width: `${enhancedStats.totalPersons > 0 ? (value / enhancedStats.totalPersons) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className={`p-3 rounded-xl text-center ${isDarkMode ? "bg-white/[0.04]" : "bg-gray-50"}`}>
                <p className={`text-xs ${textSub}`}>Cobertura</p>
                <p className={`text-3xl font-bold ${textMain}`}>
                  {enhancedStats.totalPersons > 0
                    ? Math.round((enhancedStats.personsWithEquipment / enhancedStats.totalPersons) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </Card>

          {/* Finanzas */}
          <Card isDarkMode={isDarkMode} className="p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-white/[0.06]" : "bg-amber-50"}`}>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className={`text-sm font-semibold ${textMain}`}>Finanzas</h2>
            </div>
            <div className="space-y-3">
              <div className={`p-4 rounded-xl ${isDarkMode ? "bg-amber-500/10" : "bg-amber-50"}`}>
                <p className={`text-xs mb-1 ${textSub}`}>Inversión Total</p>
                <p className="text-3xl font-bold text-amber-500">${(enhancedStats.totalCost / 1000).toFixed(1)}K</p>
              </div>
              <div className={`p-4 rounded-xl ${isDarkMode ? "bg-blue-500/10" : "bg-blue-50"}`}>
                <p className={`text-xs mb-1 ${textSub}`}>Promedio por Persona</p>
                <p className="text-3xl font-bold text-blue-500">${enhancedStats.avgCostPerPerson.toFixed(0)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Personas + Tipos de Equipos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card isDarkMode={isDarkMode} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-white/[0.06]" : "bg-amber-50"}`}>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className={`text-sm font-semibold ${textMain}`}>Top Personas por Equipos</h2>
            </div>
            {enhancedStats.topPersons.length > 0 ? (
              <div className="space-y-2">
                {enhancedStats.topPersons.map((person, idx) => (
                  <div key={idx} className={`p-3 rounded-xl ${rowBg} transition-colors`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className={`text-xs font-semibold truncate ${textMain}`}>#{idx + 1} {person.name}</p>
                      <span className="text-blue-500 font-bold text-sm ml-2 flex-shrink-0">{person.count}</span>
                    </div>
                    <p className={`text-[10px] mb-1.5 ${textSub}`}>${person.cost.toFixed(0)}</p>
                    <div className={`h-1.5 rounded-full overflow-hidden ${barBg}`}>
                      <div className="bg-blue-500 h-full transition-all" style={{ width: `${(person.count / (enhancedStats.topPersons[0]?.count || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className={`text-xs text-center py-4 ${textSub}`}>No hay datos</p>}
          </Card>

          <Card isDarkMode={isDarkMode} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-white/[0.06]" : "bg-cyan-50"}`}>
                <BarChart3 className="w-4 h-4 text-cyan-500" />
              </div>
              <h2 className={`text-sm font-semibold ${textMain}`}>Tipos de Equipos</h2>
            </div>
            {enhancedStats.topTypes.length > 0 ? (
              <div className="space-y-2">
                {enhancedStats.topTypes.map((type, idx) => (
                  <div key={idx} className={`p-3 rounded-xl ${rowBg} transition-colors`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className={`text-xs font-semibold ${textMain}`}>{type.type}</p>
                      <span className="text-cyan-500 font-bold text-sm ml-2 flex-shrink-0">{type.count}</span>
                    </div>
                    <div className={`h-1.5 rounded-full overflow-hidden ${barBg}`}>
                      <div className="bg-cyan-500 h-full transition-all" style={{ width: `${(type.count / (enhancedStats.topTypes[0]?.count || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className={`text-xs text-center py-4 ${textSub}`}>No hay datos</p>}
          </Card>
        </div>

        {/* Personas sin equipos */}
        {enhancedStats.personsWithoutDevices.length > 0 && (
          <div className={`rounded-2xl border p-5 ${isDarkMode ? "bg-red-500/[0.07] border-red-500/30" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center gap-2 mb-4">
              <UserX className={`w-4 h-4 ${isDarkMode ? "text-red-400" : "text-red-600"}`} />
              <h2 className={`text-sm font-semibold ${isDarkMode ? "text-red-400" : "text-red-700"}`}>
                Personas Sin Equipos ({enhancedStats.personsWithoutDevices.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {enhancedStats.personsWithoutDevices.map((person) => (
                <div key={person.id} className={`p-3 rounded-xl border ${isDarkMode ? "bg-[#1e1e20] border-red-500/20" : "bg-white border-red-100"}`}>
                  <p className={`text-xs font-semibold truncate ${textMain}`}>{person.fullName}</p>
                  {person.position && <p className={`text-[11px] truncate mt-0.5 ${textSub}`}>{person.position}</p>}
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${isDarkMode ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700"}`}>
                    Requiere asignación
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personas sin monitor */}
        {enhancedStats.personsWithoutMonitor.length > 0 && (
          <div className={`rounded-2xl border p-5 ${isDarkMode ? "bg-amber-500/[0.07] border-amber-500/30" : "bg-amber-50 border-amber-200"}`}>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className={`w-4 h-4 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`} />
              <h2 className={`text-sm font-semibold ${isDarkMode ? "text-amber-400" : "text-amber-700"}`}>
                Personas Sin Monitor ({enhancedStats.personsWithoutMonitor.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {enhancedStats.personsWithoutMonitor.map((person) => (
                <div key={person.id} className={`p-3 rounded-xl border ${isDarkMode ? "bg-[#1e1e20] border-amber-500/20" : "bg-white border-amber-100"}`}>
                  <p className={`text-xs font-semibold truncate ${textMain}`}>{person.fullName}</p>
                  {person.position && <p className={`text-[11px] truncate mt-0.5 ${textSub}`}>{person.position}</p>}
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${isDarkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"}`}>
                    Necesita monitor
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventario + Personas Panel + Actividad */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card isDarkMode={isDarkMode} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-white/[0.06]" : "bg-blue-50"}`}>
                <Layers className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h2 className={`text-sm font-semibold ${textMain}`}>Inventario por Tipo</h2>
                <p className={`text-[10px] ${textSub}`}>Distribución de equipos</p>
              </div>
            </div>
            <div className="space-y-3">
              {dashboardData.inventoryByCategory.map((cat, idx) => {
                const pct = Math.round((cat.count / totalInventoryCount) * 100);
                const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                        <span className={`text-xs truncate ${textSub}`}>{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className={`text-xs font-bold ${textMain}`}>{cat.count}</span>
                        <span className={`text-[10px] w-7 text-right ${textSub}`}>{pct}%</span>
                      </div>
                    </div>
                    <div className={`w-full h-1.5 rounded-full ${barBg}`}>
                      <div className={`h-1.5 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {dashboardData.persons && (
            <PersonsPanel data={dashboardData.persons} isDarkMode={isDarkMode} />
          )}

          <Card isDarkMode={isDarkMode} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-white/[0.06]" : "bg-violet-50"}`}>
                <Clock className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <h2 className={`text-sm font-semibold ${textMain}`}>Actividad Reciente</h2>
                <p className={`text-[10px] ${textSub}`}>Últimas acciones registradas</p>
              </div>
            </div>
            <div className="space-y-1">
              {dashboardData.recentActivity.map((activity, idx) => (
                <div key={idx} className={`flex items-start gap-3 px-2 py-2 rounded-xl transition-colors ${isDarkMode ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"}`}>
                  <ActivityIcon icon={activity.icon} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${textMain}`}>{activity.type}</p>
                    <p className={`text-[11px] truncate mt-0.5 ${textSub}`}>{activity.description}</p>
                  </div>
                  <span className={`text-[10px] flex-shrink-0 mt-0.5 ${isDarkMode ? "text-[#48484a]" : "text-gray-400"}`}>
                    {formatDate(activity.date)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {selectedCompany && (
          <AIInsightsPanel companyId={selectedCompany.id} isDarkMode={isDarkMode} />
        )}

        {dashboardData.softwareExpenses && (
          <SoftwareExpensesPanel data={dashboardData.softwareExpenses} isDarkMode={isDarkMode} />
        )}
      </div>

      <AiChatAssistant
        dashboardData={dashboardData}
        companyName={selectedCompany?.name || "la empresa"}
        isDarkMode={isDarkMode}
      />

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

export default AIDashboard;
