import React, { useState } from "react";
import { Sparkles, RefreshCw, Bot } from "lucide-react";
import { Insight } from "./types";
import { formatDate, insightConfig } from "./utils";

const { VITE_API_URL } = import.meta.env;

interface Props {
    companyId: string;
    isDarkMode: boolean;
}

const AIInsightsPanel: React.FC<Props> = ({ companyId, isDarkMode }) => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(false);
    const [generatedAt, setGeneratedAt] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const cardBg  = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const subText = isDarkMode ? "text-gray-400" : "text-gray-500";
    const textMain = isDarkMode ? "text-white" : "text-gray-900";

    const generateInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${VITE_API_URL}/api/ai/generate-insights`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyId }),
            });
            if (!res.ok) throw new Error("Error al generar insights");
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
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <div>
                        <h2 className={`font-bold text-lg ${textMain}`}>Análisis con AI</h2>
                        {generatedAt && (
                            <p className={`text-xs ${subText}`}>Generado {formatDate(generatedAt)}</p>
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
                        : <><Sparkles size={14} /> {insights.length > 0 ? "Regenerar" : "Analizar Datos"}</>
                    }
                </button>
            </div>

            {/* Estado vacío */}
            {!loading && insights.length === 0 && !error && (
                <div className={`text-center py-8 ${subText}`}>
                    <Bot size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                        Haz clic en <strong>"Analizar Datos"</strong> para obtener insights inteligentes.
                    </p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-400 text-sm">
                    ❌ {error}
                </div>
            )}

            {/* Skeleton */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
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
                        const config = insightConfig[insight.type] ?? insightConfig.summary;
                        return (
                            <div key={idx} className={`rounded-xl p-4 border-l-4 ${config.border} ${config.bg}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{insight.icon}</span>
                                    <span className={`text-sm font-semibold ${config.text}`}>{insight.title}</span>
                                    {insight.priority === "high" && (
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

export default AIInsightsPanel;