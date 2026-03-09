import React, { useState } from "react";
import { Users, Monitor, UserX, ChevronDown, AlertCircle, CheckCircle2, Laptop, Mouse, Keyboard, HardDrive, Zap } from "lucide-react";
import { PersonsData, PersonDetail } from "./types";

interface Props {
    data: PersonsData;
    isDarkMode: boolean;
    equipmentData?: any[]; // Array de equipos con assignedToPersonId
    personsDetails?: PersonDetail[]; // Array con detalles de personas
}

const PersonsPanelEnhanced: React.FC<Props> = ({ data, isDarkMode, equipmentData = [], personsDetails = [] }) => {
    const cardBg = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const textMain = isDarkMode ? "text-white" : "text-gray-900";
    const textSub = isDarkMode ? "text-gray-400" : "text-gray-500";
    const barBg = isDarkMode ? "bg-gray-700" : "bg-gray-200";
    const expandedBg = isDarkMode ? "bg-gray-700/50" : "bg-gray-50";

    const [expandedPersonId, setExpandedPersonId] = useState<string | null>(null);

    const withPct = data.total > 0 ? Math.round((data.withEquipment / data.total) * 100) : 0;
    const withoutPct = 100 - withPct;

    // Agrupar equipos por persona
    const equipmentByPerson = new Map<string, any[]>();
    equipmentData.forEach((eq: any) => {
        if (eq.assignedToPersonId) {
            if (!equipmentByPerson.has(eq.assignedToPersonId)) {
                equipmentByPerson.set(eq.assignedToPersonId, []);
            }
            equipmentByPerson.get(eq.assignedToPersonId)!.push(eq);
        }
    });

    // Detectar equipos específicos por persona
    const getEquipmentStats = (personId: string) => {
        const equipment = equipmentByPerson.get(personId) || [];
        return {
            total: equipment.length,
            hasLaptop: equipment.some((e: any) => e.type?.toLowerCase().includes('laptop') || e.type?.toLowerCase().includes('notebook')),
            hasMonitor: equipment.some((e: any) => e.type?.toLowerCase().includes('monitor') || e.type?.toLowerCase().includes('pantalla')),
            hasMouse: equipment.some((e: any) => e.type?.toLowerCase().includes('mouse') || e.type?.toLowerCase().includes('ratón')),
            hasKeyboard: equipment.some((e: any) => e.type?.toLowerCase().includes('keyboard') || e.type?.toLowerCase().includes('teclado')),
            hasStorage: equipment.some((e: any) => e.type?.toLowerCase().includes('storage') || e.type?.toLowerCase().includes('disco')),
            hasPrinter: equipment.some((e: any) => e.type?.toLowerCase().includes('printer') || e.type?.toLowerCase().includes('impresora')),
            totalCost: equipment.reduce((sum: number, e: any) => sum + (Number(e.cost) || 0), 0),
            equipment,
        };
    };

    // Detectar personas sin equipos críticos
    const usersWithoutMonitor = personsDetails.filter(p => {
        const stats = getEquipmentStats(p.id);
        return stats.total > 0 && !stats.hasMonitor;
    });

    // const usersWithCompleteSetup = personsDetails.filter(p => {
    //     const stats = getEquipmentStats(p.id);
    //     return stats.hasLaptop && stats.hasMonitor && stats.hasMouse && stats.hasKeyboard;
    // });

    const getEquipmentIcon = (type: string, size: number = 16) => {
        const typeNorm = type?.toLowerCase() || '';
        if (typeNorm.includes('laptop') || typeNorm.includes('notebook')) return <Laptop size={size} />;
        if (typeNorm.includes('monitor') || typeNorm.includes('pantalla')) return <Monitor size={size} />;
        if (typeNorm.includes('mouse') || typeNorm.includes('ratón')) return <Mouse size={size} />;
        if (typeNorm.includes('keyboard') || typeNorm.includes('teclado')) return <Keyboard size={size} />;
        if (typeNorm.includes('storage') || typeNorm.includes('disco')) return <HardDrive size={size} />;
        return <Zap size={size} />;
    };

    return (
        <>
            {/* PANEL PRINCIPAL - Resumen */}
            <div className={`rounded-xl border p-6 transition-colors ${cardBg}`}>
                <h2 className={`text-lg font-bold mb-1 ${textMain}`}>Personas y Equipos</h2>
                <p className={`text-sm mb-5 ${textSub}`}>Asignación de equipos por colaborador</p>

                <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="text-center">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <Users size={18} className="text-purple-400" />
                        </div>
                        <p className={`text-2xl font-bold ${textMain}`}>{data.total}</p>
                        <p className={`text-xs ${textSub}`}>Total</p>
                    </div>
                    <div className="text-center">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <Monitor size={18} className="text-green-400" />
                        </div>
                        <p className={`text-2xl font-bold text-green-400`}>{data.withEquipment}</p>
                        <p className={`text-xs ${textSub}`}>Con equipo</p>
                    </div>
                    <div className="text-center">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <UserX size={18} className="text-orange-400" />
                        </div>
                        <p className={`text-2xl font-bold text-orange-400`}>{data.withoutEquipment}</p>
                        <p className={`text-xs ${textSub}`}>Sin equipo</p>
                    </div>
                </div>

                {/* Barra de progreso */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-green-400">Con equipo {withPct}%</span>
                        <span className="text-orange-400">Sin equipo {withoutPct}%</span>
                    </div>
                    <div className={`w-full h-3 rounded-full overflow-hidden ${barBg}`}>
                        <div className="h-full flex">
                            <div className="bg-green-500 h-full transition-all" style={{ width: `${withPct}%` }} />
                            <div className="bg-orange-500 h-full transition-all" style={{ width: `${withoutPct}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* PANEL DETALLADO - Equipos por Persona */}
            {personsDetails && personsDetails.length > 0 && (
                <div className={`rounded-xl border p-6 transition-colors mt-6 ${cardBg}`}>
                    <h2 className={`text-lg font-bold mb-1 ${textMain}`}>Equipos Asignados por Persona</h2>
                    <p className={`text-sm mb-5 ${textSub}`}>Detalle de equipos y verificación de setup</p>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {personsDetails.map((person) => {
                            const stats = getEquipmentStats(person.id);
                            const isExpanded = expandedPersonId === person.id;
                            const hasCompleteSetup = stats.hasLaptop && stats.hasMonitor && stats.hasMouse && stats.hasKeyboard;

                            return (
                                <div
                                    key={person.id}
                                    className={`border rounded-lg transition-all ${
                                        isExpanded
                                            ? `${expandedBg} border-blue-500/50`
                                            : isDarkMode
                                            ? "border-gray-700 hover:border-gray-600"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    {/* Header */}
                                    <button
                                        onClick={() => setExpandedPersonId(isExpanded ? null : person.id)}
                                        className="w-full p-3 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                isDarkMode ? "bg-blue-900/30" : "bg-blue-50"
                                            }`}>
                                                <Users size={16} className={isDarkMode ? "text-blue-400" : "text-blue-600"} />
                                            </div>
                                            <div className="text-left min-w-0 flex-1">
                                                <p className={`font-medium truncate ${textMain}`}>{person.fullName}</p>
                                                <p className={`text-xs truncate ${textSub}`}>{person.department || "Sin departamento"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-3">
                                            {/* Badge de estado */}
                                            {hasCompleteSetup ? (
                                                <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                                                    isDarkMode
                                                        ? "bg-green-900/30 text-green-400 border border-green-700"
                                                        : "bg-green-50 text-green-700 border border-green-200"
                                                }`}>
                                                    <CheckCircle2 size={12} />
                                                    Setup OK
                                                </div>
                                            ) : stats.total > 0 ? (
                                                <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                                                    isDarkMode
                                                        ? "bg-yellow-900/30 text-yellow-400 border border-yellow-700"
                                                        : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                                }`}>
                                                    <AlertCircle size={12} />
                                                    Incompleto
                                                </div>
                                            ) : (
                                                <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                                                    isDarkMode
                                                        ? "bg-red-900/30 text-red-400 border border-red-700"
                                                        : "bg-red-50 text-red-700 border border-red-200"
                                                }`}>
                                                    <UserX size={12} />
                                                    Sin equipo
                                                </div>
                                            )}

                                            {/* Chevron */}
                                            <ChevronDown
                                                size={18}
                                                className={`transition-transform flex-shrink-0 ${
                                                    isExpanded ? "rotate-180" : ""
                                                } ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                                            />
                                        </div>
                                    </button>

                                    {/* Contenido expandido */}
                                    {isExpanded && (
                                        <div className={`px-3 pb-3 border-t ${
                                            isDarkMode ? "border-gray-700" : "border-gray-200"
                                        }`}>
                                            {/* Checklist de equipos críticos */}
                                            <div className="mt-3 grid grid-cols-2 gap-2 mb-3">
                                                {[
                                                    { name: "Laptop", has: stats.hasLaptop, icon: Laptop },
                                                    { name: "Monitor", has: stats.hasMonitor, icon: Monitor },
                                                    { name: "Mouse", has: stats.hasMouse, icon: Mouse },
                                                    { name: "Teclado", has: stats.hasKeyboard, icon: Keyboard },
                                                ].map(({ name, has, icon: Icon }) => (
                                                    <div
                                                        key={name}
                                                        className={`p-2 rounded text-xs font-medium flex items-center gap-2 ${
                                                            has
                                                                ? isDarkMode
                                                                    ? "bg-green-900/20 text-green-400"
                                                                    : "bg-green-50 text-green-700"
                                                                : isDarkMode
                                                                ? "bg-gray-700/50 text-gray-400"
                                                                : "bg-gray-100 text-gray-500"
                                                        }`}
                                                    >
                                                        <Icon size={14} />
                                                        {has ? "✓" : "✗"} {name}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Lista de equipos */}
                                            {stats.equipment.length > 0 ? (
                                                <div className="space-y-2">
                                                    <p className={`text-xs font-semibold ${textSub} mb-2`}>
                                                        Equipos asignados ({stats.equipment.length})
                                                    </p>
                                                    {stats.equipment.map((eq: any, idx: number) => (
                                                        <div
                                                            key={idx}
                                                            className={`p-2 rounded text-xs ${
                                                                isDarkMode
                                                                    ? "bg-gray-700/30 text-gray-300"
                                                                    : "bg-gray-100 text-gray-700"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={isDarkMode ? "text-blue-400" : "text-blue-600"}>
                                                                    {getEquipmentIcon(eq.type)}
                                                                </span>
                                                                <span className="font-medium">{eq.type}</span>
                                                                {eq.cost && (
                                                                    <span className={`ml-auto font-semibold ${
                                                                        isDarkMode ? "text-yellow-400" : "text-yellow-600"
                                                                    }`}>
                                                                        ${eq.cost}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className={`text-xs ${textSub}`}>
                                                                {eq.brand} {eq.model}
                                                            </p>
                                                            {eq.serialNumber && (
                                                                <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                                                                    SN: {eq.serialNumber}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className={`text-xs italic ${textSub}`}>Sin equipos asignados</p>
                                            )}

                                            {/* Costo total */}
                                            {stats.totalCost > 0 && (
                                                <div className={`mt-2 pt-2 border-t ${
                                                    isDarkMode ? "border-gray-700" : "border-gray-200"
                                                }`}>
                                                    <p className={`text-xs font-semibold ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                                                        💰 Costo Total: ${stats.totalCost.toFixed(2)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ALERTA - Usuarios sin Monitor */}
            {usersWithoutMonitor.length > 0 && (
                <div className={`rounded-xl border p-6 transition-colors mt-6 ${
                    isDarkMode
                        ? "bg-yellow-900/20 border-yellow-700"
                        : "bg-yellow-50 border-yellow-200"
                }`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                        isDarkMode ? "text-yellow-400" : "text-yellow-700"
                    }`}>
                        <AlertCircle size={20} />
                        Usuarios sin Monitor ({usersWithoutMonitor.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {usersWithoutMonitor.map((person) => {
                            const stats = getEquipmentStats(person.id);
                            return (
                                <div
                                    key={person.id}
                                    className={`p-3 rounded-lg border ${
                                        isDarkMode
                                            ? "bg-gray-800/50 border-yellow-700/50"
                                            : "bg-white border-yellow-200"
                                    }`}
                                >
                                    <p className={`font-medium ${textMain}`}>{person.fullName}</p>
                                    <p className={`text-xs ${textSub}`}>{person.department}</p>
                                    <p className={`text-xs mt-1 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                                        {stats.total} equipo(s) asignado(s)
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
};

export default PersonsPanelEnhanced;