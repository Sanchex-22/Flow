import React from "react";
import { Users, Monitor, UserX } from "lucide-react";
import { PersonsData } from "./types";


interface Props {
    data: PersonsData;
    isDarkMode: boolean;
}

const PersonsPanel: React.FC<Props> = ({ data, isDarkMode }) => {
    const cardBg  = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const textMain = isDarkMode ? "text-white" : "text-gray-900";
    const textSub  = isDarkMode ? "text-gray-400" : "text-gray-500";
    const barBg    = isDarkMode ? "bg-gray-700" : "bg-gray-200";

    const withPct    = data.total > 0 ? Math.round((data.withEquipment / data.total) * 100) : 0;
    const withoutPct = 100 - withPct;

    return (
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
    );
};

export default PersonsPanel;