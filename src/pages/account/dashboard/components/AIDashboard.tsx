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
import { Package, Users, Monitor, CheckCircle2, DollarSign, Award, BarChart3, AlertTriangle, Zap, UserX } from "lucide-react";

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
    fetcher,
    swrConfig
  );

  const { data: equipmentData } = useSWR(
    selectedCompany?.id ? `${VITE_API_URL}/api/inventory/${selectedCompany.id}/inventory/all` : null,
    fetcher,
    swrConfig
  );

  const { data: personsData } = useSWR(
    selectedCompany?.id ? `${VITE_API_URL}/api/persons/company/${selectedCompany?.id}` : null,
    fetcher,
    swrConfig
  );

  const enhancedStats = useMemo(() => {
    const equipmentList = Array.isArray(equipmentData) ? equipmentData : [];
    const personsList = Array.isArray(personsData) ? personsData : [];

    const equipmentByPerson = new Map<string, Equipment[]>();
    const equipmentByType = new Map<string, number>();

    if (equipmentList.length > 0) {
      equipmentList.forEach((eq: Equipment) => {
        if (eq.assignedToPersonId) {
          if (!equipmentByPerson.has(eq.assignedToPersonId)) {
            equipmentByPerson.set(eq.assignedToPersonId, []);
          }
          equipmentByPerson.get(eq.assignedToPersonId)!.push(eq);
        }
        equipmentByType.set(eq.type, (equipmentByType.get(eq.type) || 0) + 1);
      });
    }

    const totalPersons = personsList.length;
    const personsWithEquipment = equipmentByPerson.size;
    const personsWithoutEquipment = totalPersons - personsWithEquipment;

    // Personas sin equipos
    const personsWithoutDevices = personsList.filter((p: Person) => !equipmentByPerson.has(p.id));

    // Personas sin monitor
    const personsWithoutMonitor = personsList.filter((p: Person) => {
      const equips = equipmentByPerson.get(p.id) || [];
      return equips.length > 0 && !equips.some(e => e.type?.toLowerCase().includes('monitor'));
    });

    const topPersons = Array.from(equipmentByPerson.entries())
      .map(([personId, equips]) => {
        const person = personsList.find((p: Person) => p.id === personId);
        return {
          personId,
          name: person?.fullName || "Desconocido",
          count: equips.length,
          cost: equips.reduce((s, e) => s + (Number(e.cost) || 0), 0),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topTypes = Array.from(equipmentByType.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const hasLaptop = (equips: Equipment[]) =>
      equips.some(e => e.type?.toLowerCase().includes('laptop'));
    const hasMonitor = (equips: Equipment[]) =>
      equips.some(e => e.type?.toLowerCase().includes('monitor'));

    const personsWithComplete = Array.from(equipmentByPerson.values()).filter(
      equips => hasLaptop(equips) && hasMonitor(equips)
    ).length;

    const totalCost = equipmentList.reduce((sum: number, eq: Equipment) => sum + (Number(eq.cost) || 0), 0);

    const alerts = [];
    if (personsWithoutEquipment > 0) {
      alerts.push({
        level: "high",
        title: `${personsWithoutEquipment} personas sin equipos`,
        description: "Requieren asignación inmediata",
      });
    }
    if (personsWithoutMonitor.length > 0) {
      alerts.push({
        level: "medium",
        title: `${personsWithoutMonitor.length} personas sin monitor`,
        description: "Necesitan monitor asignado",
      });
    }
    if (personsWithComplete < personsWithEquipment) {
      alerts.push({
        level: "medium",
        title: `${personsWithEquipment - personsWithComplete} setups incompletos`,
        description: "Sin Monitor o Sin Laptop",
      });
    }

    return {
      totalEquipment: equipmentList.length,
      totalPersons,
      personsWithEquipment,
      personsWithoutEquipment,
      personsWithComplete,
      totalCost,
      avgCostPerPerson: personsWithEquipment > 0 ? totalCost / personsWithEquipment : 0,
      laptopCount: equipmentByType.get("Laptop") || 0,
      monitorCount: equipmentByType.get("Monitor") || 0,
      mouseCount: equipmentByType.get("Mouse") || 0,
      keyboardCount: equipmentByType.get("Keyboard") || 0,
      topPersons,
      topTypes,
      alerts,
      personsWithoutDevices,
      personsWithoutMonitor,
    };
  }, [equipmentData, personsData]);

  const cardBg = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textMain = isDarkMode ? "text-white" : "text-gray-900";
  const textSub = isDarkMode ? "text-gray-400" : "text-gray-600";
  const barBg = isDarkMode ? "bg-gray-700" : "bg-gray-200";

  if (isLoading) return <Loader />;
  if (error) return <div className={`flex-1 p-6 text-center ${isDarkMode ? "text-red-500" : "text-red-600"}`}>Error: {error.message}</div>;
  if (!dashboardData) return <div className={`flex-1 p-6 text-center ${textSub}`}>No hay datos disponibles.</div>;

  const totalInventoryCount = dashboardData.inventoryByCategory.reduce((s, i) => s + i.count, 0) || 1;

  const kpiCards = [
    { label: "Total Equipos", kpi: dashboardData.kpi.totalEquipments },
    { label: "Mantenimientos Pendientes", kpi: dashboardData.kpi.pendingMaintenances },
    { label: "Equipos Activos", kpi: dashboardData.kpi.activeEquipments },
    { label: "Usuarios Activos", kpi: dashboardData.kpi.activeUsers },
  ];

  return (
    <>
      <div className="flex-1 p-4">
        <PagesHeader
          title={pageName}
          description={pageName ? `${pageName} in ${selectedCompany?.name}` : "Cargando..."}
          onExport={() => setShowReportModal(true)}
        />

        {enhancedStats.alerts.length > 0 && (
          <div className="mb-6 space-y-3">
            {enhancedStats.alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-4 p-4 rounded-xl border ${
                  alert.level === "high"
                    ? isDarkMode
                      ? "bg-red-900/20 border-red-700/50 text-red-300"
                      : "bg-red-50 border-red-300 text-red-700"
                    : isDarkMode
                    ? "bg-yellow-900/20 border-yellow-700/50 text-yellow-300"
                    : "bg-yellow-50 border-yellow-300 text-yellow-700"
                }`}
              >
                <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{alert.title}</p>
                  <p className="text-sm">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map(({ label, kpi }, idx) => (
            <div key={idx} className={`rounded-lg p-6 border transition-colors ${cardBg}`}>
              <span className={`text-sm ${textSub}`}>{label}</span>
              <div className={`text-3xl font-bold mt-1 ${textMain}`}>{kpi.count}</div>
              <div className={`mt-2 text-sm ${kpi.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                {kpi.change >= 0 ? "↗" : "↘"} {kpi.change}%
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-lg p-6 border transition-colors ${cardBg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Package size={18} className="text-blue-500" />
              <span className={`text-sm font-semibold ${textSub}`}>Total Equipos</span>
            </div>
            <p className={`text-3xl font-bold ${textMain}`}>{enhancedStats.totalEquipment}</p>
          </div>

          <div className={`rounded-lg p-6 border transition-colors ${cardBg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-purple-500" />
              <span className={`text-sm font-semibold ${textSub}`}>Total Personas</span>
            </div>
            <p className={`text-3xl font-bold ${textMain}`}>{enhancedStats.totalPersons}</p>
          </div>

          <div className={`rounded-lg p-6 border transition-colors ${cardBg}`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span className={`text-sm font-semibold ${textSub}`}>Setup Completo</span>
            </div>
            <p className={`text-3xl font-bold ${textMain}`}>{enhancedStats.personsWithComplete}</p>
          </div>

          <div className={`rounded-lg p-6 border transition-colors ${cardBg}`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-yellow-500" />
              <span className={`text-sm font-semibold ${textSub}`}>Inversión</span>
            </div>
            <p className={`text-3xl font-bold ${textMain}`}>${(enhancedStats.totalCost / 1000).toFixed(1)}K</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className={`rounded-xl p-6 border transition-colors ${cardBg}`}>
            <h2 className={`text-lg font-bold mb-4 ${textMain} flex items-center gap-2`}>
              <Zap size={20} className="text-yellow-500" />
              Equipos Críticos
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className={textSub}>Laptops</span>
                <span className="text-2xl font-bold text-blue-500">{enhancedStats.laptopCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className={textSub}>Monitores</span>
                <span className="text-2xl font-bold text-cyan-500">{enhancedStats.monitorCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className={textSub}>Mouses</span>
                <span className="text-2xl font-bold text-purple-500">{enhancedStats.mouseCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className={textSub}>Teclados</span>
                <span className="text-2xl font-bold text-green-500">{enhancedStats.keyboardCount}</span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-6 border transition-colors ${cardBg}`}>
            <h2 className={`text-lg font-bold mb-4 ${textMain} flex items-center gap-2`}>
              <Users size={20} className="text-purple-500" />
              Distribución
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className={`text-sm ${textSub}`}>Con Equipos</span>
                  <span className="text-green-500 font-bold">{enhancedStats.personsWithEquipment}</span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${barBg}`}>
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all"
                    style={{
                      width: `${enhancedStats.totalPersons > 0 ? (enhancedStats.personsWithEquipment / enhancedStats.totalPersons) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className={`text-sm ${textSub}`}>Sin Equipos</span>
                  <span className="text-red-500 font-bold">{enhancedStats.personsWithoutEquipment}</span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${barBg}`}>
                  <div
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-full transition-all"
                    style={{
                      width: `${enhancedStats.totalPersons > 0 ? (enhancedStats.personsWithoutEquipment / enhancedStats.totalPersons) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100/50'}`}>
                <p className={`text-sm ${textSub}`}>Cobertura</p>
                <p className={`text-3xl font-bold ${textMain}`}>
                  {enhancedStats.totalPersons > 0 ? Math.round((enhancedStats.personsWithEquipment / enhancedStats.totalPersons) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-6 border transition-colors ${cardBg}`}>
            <h2 className={`text-lg font-bold mb-4 ${textMain} flex items-center gap-2`}>
              <DollarSign size={20} className="text-yellow-500" />
              Finanzas
            </h2>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                <p className={`text-sm ${textSub}`}>Inversión Total</p>
                <p className={`text-3xl font-bold text-yellow-500`}>
                  ${(enhancedStats.totalCost / 1000).toFixed(1)}K
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                <p className={`text-sm ${textSub}`}>Promedio por Persona</p>
                <p className={`text-3xl font-bold text-blue-500`}>
                  ${enhancedStats.avgCostPerPerson.toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className={`rounded-xl p-6 border transition-colors ${cardBg}`}>
            <h2 className={`text-lg font-bold mb-4 ${textMain} flex items-center gap-2`}>
              <Award size={20} className="text-amber-500" />
              Top Personas por Equipos
            </h2>
            <div className="space-y-3">
              {enhancedStats.topPersons.length > 0 ? (
                enhancedStats.topPersons.map((person, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100/50'}`}>
                    <div className="flex justify-between mb-2">
                      <p className={`font-bold ${textMain}`}>#{idx + 1} {person.name}</p>
                      <span className="text-blue-500 font-bold">{person.count}</span>
                    </div>
                    <p className={`text-xs ${textSub}`}>${person.cost.toFixed(0)}</p>
                    <div className={`h-2 rounded-full overflow-hidden mt-2 ${barBg}`}>
                      <div
                        className="bg-blue-500 h-full"
                        style={{
                          width: `${(person.count / (enhancedStats.topPersons[0]?.count || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className={textSub}>No hay datos</p>
              )}
            </div>
          </div>

          <div className={`rounded-xl p-6 border transition-colors ${cardBg}`}>
            <h2 className={`text-lg font-bold mb-4 ${textMain} flex items-center gap-2`}>
              <BarChart3 size={20} className="text-cyan-500" />
              Tipos de Equipos
            </h2>
            <div className="space-y-3">
              {enhancedStats.topTypes.length > 0 ? (
                enhancedStats.topTypes.map((type, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100/50'}`}>
                    <div className="flex justify-between mb-2">
                      <p className={`font-bold ${textMain}`}>{type.type}</p>
                      <span className="text-cyan-500 font-bold">{type.count}</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${barBg}`}>
                      <div
                        className="bg-cyan-500 h-full"
                        style={{
                          width: `${(type.count / (enhancedStats.topTypes[0]?.count || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className={textSub}>No hay datos</p>
              )}
            </div>
          </div>
        </div>

        {enhancedStats.personsWithoutDevices.length > 0 && (
          <div className={`rounded-xl p-6 border mb-8 transition-colors ${isDarkMode ? 'bg-red-900/20 border-red-700/50' : 'bg-red-50 border-red-300'}`}>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
              <UserX size={20} />
              ⚠️ Personas Sin Equipos ({enhancedStats.personsWithoutDevices.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {enhancedStats.personsWithoutDevices.map((person) => (
                <div
                  key={person.id}
                  className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800/50 border-red-700/30' : 'bg-white border-red-200'}`}
                >
                  <p className={`font-bold ${textMain}`}>{person.fullName}</p>
                  {person.position && <p className={`text-sm ${textSub}`}>{person.position}</p>}
                  {person.email && <p className={`text-xs ${textSub}`}>{person.email}</p>}
                  <div className={`mt-2 px-3 py-1 rounded text-xs font-semibold ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'}`}>
                    Requiere asignación
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {enhancedStats.personsWithoutMonitor.length > 0 && (
          <div className={`rounded-xl p-6 border mb-8 transition-colors ${isDarkMode ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-yellow-50 border-yellow-300'}`}>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
              <Monitor size={20} />
              📊 Personas Sin Monitor ({enhancedStats.personsWithoutMonitor.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {enhancedStats.personsWithoutMonitor.map((person) => (
                <div
                  key={person.id}
                  className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800/50 border-yellow-700/30' : 'bg-white border-yellow-200'}`}
                >
                  <p className={`font-bold ${textMain}`}>{person.fullName}</p>
                  {person.position && <p className={`text-sm ${textSub}`}>{person.position}</p>}
                  {person.email && <p className={`text-xs ${textSub}`}>{person.email}</p>}
                  <div className={`mt-2 px-3 py-1 rounded text-xs font-semibold ${isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                    Necesita monitor
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className={`rounded-xl border p-6 transition-colors ${cardBg}`}>
            <h2 className={`text-lg font-bold mb-1 ${textMain}`}>Inventario por Tipo</h2>
            <p className={`text-sm mb-5 ${textSub}`}>Distribución de equipos</p>
            <div className="space-y-3">
              {dashboardData.inventoryByCategory.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className={`text-sm ${textSub}`}>{cat.name}</span>
                    </div>
                    <span className={`text-sm font-medium ${textMain}`}>{cat.count}</span>
                  </div>
                  <div className={`w-full rounded-full h-1.5 ${barBg}`}>
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(cat.count / totalInventoryCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {dashboardData.persons && (
            <PersonsPanel data={dashboardData.persons} isDarkMode={isDarkMode} />
          )}

          <div className={`rounded-xl border p-6 transition-colors ${cardBg}`}>
            <h2 className={`text-lg font-bold mb-1 ${textMain}`}>Actividad Reciente</h2>
            <p className={`text-sm mb-5 ${textSub}`}>Últimas acciones registradas</p>
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <ActivityIcon icon={activity.icon} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {activity.type}
                    </p>
                    <p className={`text-xs truncate ${textSub}`}>{activity.description}</p>
                    <p className={`text-xs mt-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedCompany && (
          <AIInsightsPanel companyId={selectedCompany.id} isDarkMode={isDarkMode} />
        )}

        {dashboardData.softwareExpenses && (
          <SoftwareExpensesPanel
            data={dashboardData.softwareExpenses}
            isDarkMode={isDarkMode}
          />
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