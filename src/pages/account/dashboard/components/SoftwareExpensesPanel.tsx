import React from "react";
import { DollarSign, AlertTriangle, Package, TrendingUp } from "lucide-react";
import { SoftwareExpensesData } from "./types";

interface Props {
    data: SoftwareExpensesData;
    isDarkMode: boolean;
}

const categoryColors: Record<string, string> = {
    Accounting:      "bg-blue-500",
    CRM:             "bg-purple-500",
    Antivirus:       "bg-red-500",
    Productivity:    "bg-green-500",
    Design:          "bg-pink-500",
    Development:     "bg-yellow-500",
    HRManagement:    "bg-orange-500",
    Marketing:       "bg-cyan-500",
    Communication:   "bg-indigo-500",
    CloudStorage:    "bg-teal-500",
    OperatingSystem: "bg-gray-500",
    Other:           "bg-slate-500",
};

const SoftwareExpensesPanel: React.FC<Props> = ({ data, isDarkMode }) => {
    const cardBg  = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const textMain = isDarkMode ? "text-white" : "text-gray-900";
    const textSub  = isDarkMode ? "text-gray-400" : "text-gray-500";
    const rowHover = isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";
    const divider  = isDarkMode ? "border-gray-700" : "border-gray-200";
    const maxCost  = Math.max(...data.byCategory.map(c => c.cost), 1);

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("es-PA", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* KPIs de gastos */}
            <div className={`rounded-xl border p-6 transition-colors ${cardBg}`}>
                <h2 className={`text-lg font-bold mb-4 ${textMain}`}>Gastos de Software</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <DollarSign size={15} className="text-blue-400" />
                            </div>
                            <span className={`text-sm ${textSub}`}>Costo Mensual</span>
                        </div>
                        <span className={`font-bold ${textMain}`}>{formatCurrency(data.totalMonthlyCost)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <TrendingUp size={15} className="text-purple-400" />
                            </div>
                            <span className={`text-sm ${textSub}`}>Costo Anual</span>
                        </div>
                        <span className={`font-bold ${textMain}`}>{formatCurrency(data.totalAnnualCost)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <Package size={15} className="text-green-400" />
                            </div>
                            <span className={`text-sm ${textSub}`}>Software Activo</span>
                        </div>
                        <span className={`font-bold ${textMain}`}>{data.activeSoftware} / {data.totalSoftware}</span>
                    </div>

                    {data.expiringSoon > 0 && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={15} className="text-yellow-400" />
                                <span className="text-sm text-yellow-400">Vencen en 30 días</span>
                            </div>
                            <span className="font-bold text-yellow-400">{data.expiringSoon}</span>
                        </div>
                    )}
                </div>

                {/* Gasto por categoría */}
                <div className={`mt-5 pt-4 border-t ${divider}`}>
                    <p className={`text-xs font-medium mb-3 ${textSub}`}>Por categoría</p>
                    <div className="space-y-2">
                        {data.byCategory.slice(0, 5).map((cat, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className={textSub}>{cat.name}</span>
                                    <span className={textMain}>{formatCurrency(cat.cost)}</span>
                                </div>
                                <div className={`w-full h-1.5 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                                    <div
                                        className={`h-1.5 rounded-full ${categoryColors[cat.name] || "bg-blue-500"}`}
                                        style={{ width: `${(cat.cost / maxCost) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top 5 más costosos */}
            <div className={`lg:col-span-2 rounded-xl border p-6 transition-colors ${cardBg}`}>
                <h2 className={`text-lg font-bold mb-1 ${textMain}`}>Top Software por Costo</h2>
                <p className={`text-sm mb-4 ${textSub}`}>Aplicaciones con mayor inversión</p>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`border-b ${divider}`}>
                                <th className={`text-left py-2 font-medium ${textSub}`}>Aplicación</th>
                                <th className={`text-left py-2 font-medium ${textSub}`}>Categoría</th>
                                <th className={`text-right py-2 font-medium ${textSub}`}>Mensual</th>
                                <th className={`text-right py-2 font-medium ${textSub}`}>Usuarios</th>
                                <th className={`text-right py-2 font-medium ${textSub}`}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topExpenses.map((exp, idx) => (
                                <tr key={idx} className={`border-b ${divider} ${rowHover} transition-colors`}>
                                    <td className={`py-3 font-medium ${textMain}`}>{exp.name}</td>
                                    <td className="py-3">
                                        <span className={`flex items-center gap-1.5`}>
                                            <span className={`w-2 h-2 rounded-full ${categoryColors[exp.category] || "bg-gray-400"}`} />
                                            <span className={`text-xs ${textSub}`}>{exp.category}</span>
                                        </span>
                                    </td>
                                    <td className={`py-3 text-right font-medium ${textMain}`}>
                                        {formatCurrency(exp.monthlyCost)}
                                    </td>
                                    <td className={`py-3 text-right ${textSub}`}>{exp.numberOfUsers}</td>
                                    <td className="py-3 text-right">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            exp.status === "Active"
                                                ? "bg-green-500/20 text-green-400"
                                                : exp.status === "Expired"
                                                    ? "bg-red-500/20 text-red-400"
                                                    : "bg-yellow-500/20 text-yellow-400"
                                        }`}>
                                            {exp.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SoftwareExpensesPanel;