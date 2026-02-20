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
import { DashboardData } from "./types";
import ActivityIcon from "./ActivityIcon";
import AIInsightsPanel from "./AIInsightsPanel";
import AiChatAssistant from "./AiChatAssistant";
import SoftwareExpensesPanel from "./SoftwareExpensesPanel";
import PersonsPanel from "./PersonsPanel";
import { formatDate } from "./utils";

const { VITE_API_URL } = import.meta.env;

const fetcher = (url: string) =>
    fetch(url).then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
    });

interface DashboardProps {
    currentPathname?: CurrentPathname;
}

const AIDashboard: React.FC<DashboardProps> = () => {
    const { isDarkMode } = useTheme();
    const { selectedCompany } = useCompany();
    const [showReportModal, setShowReportModal] = useState(false);
    const { pageName } = usePageName();

    const { data: dashboardData, error, isLoading } = useSWR<DashboardData>(
        selectedCompany ? `${VITE_API_URL}/api/dashboard/${selectedCompany.id}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 5 * 60 * 1000,
            shouldRetryOnError: false,
        }
    );

    const cardBg   = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const textMain = isDarkMode ? "text-white" : "text-gray-900";
    const textSub  = isDarkMode ? "text-gray-400" : "text-gray-600";
    const barBg    = isDarkMode ? "bg-gray-700" : "bg-gray-200";

    if (isLoading) return <Loader />;
    if (error) return <div className={`flex-1 p-6 text-center ${isDarkMode ? "text-red-500" : "text-red-600"}`}>Error: {error.message}</div>;
    if (!dashboardData) return <div className={`flex-1 p-6 text-center ${textSub}`}>No hay datos disponibles.</div>;

    const totalInventoryCount = dashboardData.inventoryByCategory.reduce((s, i) => s + i.count, 0) || 1;

    const kpiCards = [
        { label: "Total Equipos",             kpi: dashboardData.kpi.totalEquipments },
        { label: "Mantenimientos Pendientes", kpi: dashboardData.kpi.pendingMaintenances },
        { label: "Equipos Activos",           kpi: dashboardData.kpi.activeEquipments },
        { label: "Usuarios Activos",          kpi: dashboardData.kpi.activeUsers },
    ];

    return (
        <>
            <div className="flex-1 p-4">
                <PagesHeader
                    title={pageName}
                    description={pageName ? `${pageName} in ${selectedCompany?.name}` : "Cargando..."}
                    onExport={() => setShowReportModal(true)}
                />

                {/* KPIs */}
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

                {/* AI Insights */}
                {selectedCompany && (
                    <AIInsightsPanel companyId={selectedCompany.id} isDarkMode={isDarkMode} />
                )}

                {/* Gastos de Software */}
                {dashboardData.softwareExpenses && (
                    <SoftwareExpensesPanel
                        data={dashboardData.softwareExpenses}
                        isDarkMode={isDarkMode}
                    />
                )}

                {/* Inventario + Personas + Actividad */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Inventario por Categoría */}
                    <div className={`rounded-xl p-6 border transition-colors ${cardBg}`}>
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

                    {/* Personas */}
                    {dashboardData.persons && (
                        <PersonsPanel data={dashboardData.persons} isDarkMode={isDarkMode} />
                    )}

                    {/* Actividad Reciente */}
                    <div className={`rounded-xl p-6 border transition-colors ${cardBg}`}>
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