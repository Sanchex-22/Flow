"use client";

import useSWR from "swr";
import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../../../../context/themeContext";
import { useCompany } from "../../../../context/routerContext";
import Loader from "../../../../components/loaders/loader";
import ReportPreviewModal from "../../../../components/modals/ReportPreviewModal";
import PagesHeader from "../../../../components/headers/pagesHeader";
import { CurrentPathname } from "../../../../components/layouts/main";
import { usePageName } from "../../../../hook/usePageName";
import { Sparkles, Send, X, Bot, RefreshCw, BarChart2, AlertTriangle, Lightbulb, DollarSign } from "lucide-react";

const { VITE_API_URL } = import.meta.env;

const fetcher = (url: string) =>
    fetch(url).then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
    });

export type Kpi = { count: number; change: number };
export type InventoryCategory = { name: string; count: number };
export type RecentActivity = { type: string; description: string; date: string; icon: string };
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

interface Insight {
    type: 'summary' | 'alert' | 'recommendation' | 'optimization';
    title: string;
    content: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
}

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

interface DashboardProps {
    currentPathname?: CurrentPathname;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `Hace ${diffInSeconds} segundos`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    return `Hace ${Math.floor(diffInHours / 24)} días`;
};

const ActivityIcon: React.FC<{ icon: string }> = ({ icon }) => {
    const base = "w-6 h-6 rounded-full flex items-center justify-center mt-0.5";
    switch (icon) {
        case "plus":
            return <div className={`${base} bg-blue-500`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg></div>;
        case "user":
            return <div className={`${base} bg-purple-500`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg></div>;
        default:
            return <div className={`${base} bg-gray-500`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><circle cx="12" cy="12" r="10" /></svg></div>;
    }
};

// --- Colores por tipo de insight ---
const insightConfig = {
    summary:        { border: "border-blue-500",  bg: "bg-blue-500/10",  text: "text-blue-400",   Icon: BarChart2 },
    alert:          { border: "border-red-500",   bg: "bg-red-500/10",   text: "text-red-400",    Icon: AlertTriangle },
    recommendation: { border: "border-yellow-500",bg: "bg-yellow-500/10",text: "text-yellow-400", Icon: Lightbulb },
    optimization:   { border: "border-green-500", bg: "bg-green-500/10", text: "text-green-400",  Icon: DollarSign },
};

// --- Panel de Insights AI ---
const AIInsightsPanel: React.FC<{
    companyId: string;
    isDarkMode: boolean;
}> = ({ companyId, isDarkMode }) => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(false);
    const [generatedAt, setGeneratedAt] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const cardBg = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const subText = isDarkMode ? "text-gray-400" : "text-gray-500";
    const textMain = isDarkMode ? "text-white" : "text-gray-900";

    const generateInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${VITE_API_URL}/api/ai/generate-insights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId }),
            });
            if (!res.ok) throw new Error('Error al generar insights');
            const data = await res.json();
            setInsights(data.insights);
            setGeneratedAt(data.generatedAt);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`rounded-xl border p-6 mb-8 transition-colors ${cardBg}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <div>
                        <h2 className={`font-bold text-lg ${textMain}`}>Análisis con AI</h2>
                        {generatedAt && (
                            <p className={`text-xs ${subText}`}>
                                Generado {formatDate(generatedAt)}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={generateInsights}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading
                        ? <><RefreshCw size={14} className="animate-spin" /> Analizando...</>
                        : <><Sparkles size={14} /> {insights.length > 0 ? 'Regenerar' : 'Analizar Datos'}</>
                    }
                </button>
            </div>

            {/* Estado vacío */}
            {!loading && insights.length === 0 && !error && (
                <div className={`text-center py-8 ${subText}`}>
                    <Bot size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Haz clic en <strong>"Analizar Datos"</strong> para obtener insights inteligentes de tu inventario.</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-400 text-sm">
                    ❌ {error}
                </div>
            )}

            {/* Skeleton loader */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`rounded-xl p-4 border animate-pulse ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-200"}`}>
                            <div className={`h-4 w-24 rounded mb-2 ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`} />
                            <div className={`h-3 w-full rounded mb-1 ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`} />
                            <div className={`h-3 w-3/4 rounded ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`} />
                        </div>
                    ))}
                </div>
            )}

            {/* Insights */}
            {!loading && insights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.map((insight, idx) => {
                        const config = insightConfig[insight.type] || insightConfig.summary;

                        return (
                            <div key={idx} className={`rounded-xl p-4 border-l-4 ${config.border} ${config.bg} ${isDarkMode ? "bg-opacity-10" : ""}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{insight.icon}</span>
                                    <span className={`text-sm font-semibold ${config.text}`}>{insight.title}</span>
                                    {insight.priority === 'high' && (
                                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                                            Urgente
                                        </span>
                                    )}
                                </div>
                                <p className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    {insight.content}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// --- Chat AI flotante estilo Gemini ---
const AiChatAssistant: React.FC<{
    dashboardData: DashboardData;
    companyName: string;
    isDarkMode: boolean;
}> = ({ dashboardData, companyName, isDarkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const systemPrompt = `Eres un asistente experto en TI para ${companyName}. Datos actuales del dashboard:
📊 KPIs:
- Total Equipos: ${dashboardData.kpi.totalEquipments.count} (${dashboardData.kpi.totalEquipments.change}%)
- Mantenimientos Pendientes: ${dashboardData.kpi.pendingMaintenances.count} (${dashboardData.kpi.pendingMaintenances.change}%)
- Equipos Activos: ${dashboardData.kpi.activeEquipments.count} (${dashboardData.kpi.activeEquipments.change}%)
- Usuarios Activos: ${dashboardData.kpi.activeUsers.count} (${dashboardData.kpi.activeUsers.change}%)
📦 Inventario: ${dashboardData.inventoryByCategory.map(c => `${c.name}: ${c.count}`).join(', ')}
🕐 Actividad: ${dashboardData.recentActivity.slice(0, 3).map(a => a.type).join(', ')}
Responde en español, de forma concisa. Usa emojis cuando ayude.`;

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg: ChatMessage = { role: "user", content: input.trim() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");
        setIsLoading(true);

        try {
            // ✅ Llama al backend proxy, no a OpenRouter directamente
            const response = await fetch(`${VITE_API_URL}/api/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: updatedMessages, systemPrompt }),
            });

            if (!response.ok) throw new Error(`Error ${response.status}`);
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || "No pude generar respuesta.";
            setMessages(prev => [...prev, { role: "assistant", content }]);
        } catch (error: any) {
            setMessages(prev => [...prev, { role: "assistant", content: `❌ Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const quickPrompts = [
        "¿Qué equipos requieren atención urgente?",
        "Resume el estado del inventario",
        "¿Cómo mejorar el rendimiento?",
    ];

    const aiBubble = isDarkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-800";
    const subText = isDarkMode ? "text-gray-400" : "text-gray-500";

    return (
        <>
            {/* Botón flotante */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-xl transition-all hover:scale-105"
            >
                <Sparkles size={16} />
                <span className="text-sm font-medium">Chat AI</span>
            </button>

            {/* Panel */}
            {isOpen && (
                <div
                    className={`fixed bottom-6 right-6 z-50 w-[420px] flex flex-col rounded-2xl shadow-2xl border overflow-hidden`}
                    style={{ maxHeight: '600px', boxShadow: isDarkMode ? "0 25px 50px rgba(0,0,0,0.6)" : "0 25px 50px rgba(0,0,0,0.15)" }}
                >
                    {/* Header */}
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Sparkles size={13} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Asistente AI</p>
                                <p className={`text-xs ${subText}`}>Gemini Flash · Respuesta rápida</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {messages.length > 0 && (
                                <button onClick={() => setMessages([])} className={`text-xs px-2 py-1 rounded transition-colors ${isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>
                                    Limpiar
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className={`p-1 rounded transition-colors ${isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Mensajes */}
                    <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`} style={{ minHeight: 280, maxHeight: 380 }}>
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full gap-4 py-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Bot size={22} className="text-white" />
                                </div>
                                <p className={`text-sm text-center ${subText}`}>Consulta cualquier cosa sobre los datos de tu dashboard</p>
                                <div className="flex flex-col gap-2 w-full">
                                    {quickPrompts.map((p, idx) => (
                                        <button key={idx} onClick={() => { setInput(p); inputRef.current?.focus(); }}
                                            className={`text-left text-xs px-3 py-2 rounded-xl border transition-colors ${isDarkMode ? "border-gray-700 hover:bg-gray-700 text-gray-300" : "border-gray-200 hover:bg-gray-100 text-gray-600"}`}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.role === "assistant" && (
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                        <Sparkles size={10} className="text-white" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : `${aiBubble} rounded-bl-sm`}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                    <Sparkles size={10} className="text-white" />
                                </div>
                                <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${aiBubble}`}>
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className={`p-3 border-t ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className={`flex items-end gap-2 rounded-xl border px-3 py-2 ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}>
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Pregunta sobre tus datos..."
                                rows={1}
                                className={`flex-1 resize-none bg-transparent text-sm outline-none max-h-20 ${isDarkMode ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-400"}`}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="p-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-40 transition-all flex-shrink-0"
                            >
                                <Send size={13} />
                            </button>
                        </div>
                        <p className={`text-center text-xs mt-1.5 ${subText}`}>Enter para enviar · Shift+Enter nueva línea</p>
                    </div>
                </div>
            )}
        </>
    );
};

// ------------ COMPONENTE PRINCIPAL ------------
const AIDashboard: React.FC<DashboardProps> = () => {
    const { isDarkMode } = useTheme();
    const { selectedCompany } = useCompany();
    const [showReportModal, setShowReportModal] = useState(false);
    const { pageName } = usePageName();

    const { data: dashboardData, error, isLoading, isValidating } = useSWR<DashboardData>(
        selectedCompany ? `${VITE_API_URL}/api/dashboard/${selectedCompany.id}` : null,
        fetcher,
        { revalidateOnFocus: true, shouldRetryOnError: true, errorRetryInterval: 0, errorRetryCount: 10 }
    );

    const cardBg = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const textMain = isDarkMode ? "text-white" : "text-gray-900";
    const textSub = isDarkMode ? "text-gray-400" : "text-gray-600";
    const barBg = isDarkMode ? "bg-gray-700" : "bg-gray-200";

    if (isLoading || isValidating) return <Loader />;
    if (error) return <div className={`flex-1 p-6 text-center ${isDarkMode ? "text-red-500" : "text-red-600"}`}>Error: {error.message}</div>;
    if (!dashboardData) return <div className={`flex-1 p-6 text-center ${textSub}`}>No hay datos disponibles.</div>;

    const totalInventoryCount = dashboardData.inventoryByCategory.reduce((s, i) => s + i.count, 0) || 1;

    const kpiCards = [
        { label: "Total Equipos",              kpi: dashboardData.kpi.totalEquipments },
        { label: "Mantenimientos Pendientes",  kpi: dashboardData.kpi.pendingMaintenances },
        { label: "Equipos Activos",            kpi: dashboardData.kpi.activeEquipments },
        { label: "Usuarios Activos",           kpi: dashboardData.kpi.activeUsers },
    ];

    return (
        <>
            <div className="flex-1 p-4">
                <PagesHeader
                    title={pageName}
                    description={pageName ? `${pageName} in ${selectedCompany?.name}` : "Cargando compañía..."}
                    onExport={() => { if (dashboardData) setShowReportModal(true); }}
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

                {/* Panel Insights AI */}
                {selectedCompany && (
                    <AIInsightsPanel companyId={selectedCompany.id} isDarkMode={isDarkMode} />
                )}

                {/* Inventario + Actividad */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className={`rounded-lg p-6 border transition-colors ${cardBg}`}>
                        <h2 className={`text-xl font-bold mb-1 ${textMain}`}>Inventario por Categoría</h2>
                        <p className={`text-sm mb-6 ${textSub}`}>Distribución de equipos por tipo</p>
                        <div className="space-y-4">
                            {dashboardData.inventoryByCategory.map((cat, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                            <span className={textSub}>{cat.name}</span>
                                        </div>
                                        <span className={textSub}>{cat.count}</span>
                                    </div>
                                    <div className={`w-full rounded-full h-2 mt-1 ${barBg}`}>
                                        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${(cat.count / totalInventoryCount) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`rounded-lg p-6 border transition-colors ${cardBg}`}>
                        <h2 className={`text-xl font-bold mb-1 ${textMain}`}>Actividad Reciente</h2>
                        <p className={`text-sm mb-6 ${textSub}`}>Últimas acciones registradas</p>
                        <div className="space-y-4">
                            {dashboardData.recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex items-start space-x-3">
                                    <ActivityIcon icon={activity.icon} />
                                    <div className="flex-1">
                                        <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{activity.type}</p>
                                        <p className={`text-sm ${textSub}`}>{activity.description}</p>
                                        <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{formatDate(activity.date)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat flotante */}
            <AiChatAssistant
                dashboardData={dashboardData}
                companyName={selectedCompany?.name || "la empresa"}
                isDarkMode={isDarkMode}
            />

            {/* Modal Reporte */}
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