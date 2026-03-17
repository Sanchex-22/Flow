"use client"
import { Building2, LogOut, Mail, ChevronRight } from "lucide-react"
import React from "react"
import useUser from "../../../hook/useUser"
import { useCompany } from "../../../context/routerContext"
import { UserProfile } from "../../../context/userProfileContext"
import { useTheme } from "../../../context/themeContext"
import Images from "../../../assets"

type Props = {
  profile: UserProfile | null;
};

const CompanySelector: React.FC<Props> = ({ profile }) => {
    const { selectedCompany, handleCompanyChange, companies } = useCompany();
    const { logout } = useUser();
    const { isDarkMode } = useTheme();

    const handleSelectCompany = (companyCode: string) => {
        handleCompanyChange({ target: { value: companyCode } } as any);
        window.location.href = `/${companyCode}/dashboard/all`;
    };

    const bg = isDarkMode
        ? "bg-gradient-to-br from-[#0a0a0f] to-[#12101f]"
        : "bg-[#1c1c1e]";

    const card = isDarkMode
        ? "bg-[#1c1c1e] border border-white/[0.08]"
        : "bg-white";

    const title = isDarkMode ? "text-white" : "text-gray-900";
    const sub = isDarkMode ? "text-white/50" : "text-gray-500";
    const divider = isDarkMode ? "border-white/[0.06]" : "border-gray-100";

    const companyBtn = (selected: boolean) =>
        `w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-left font-medium border ${
            selected
                ? isDarkMode
                    ? "bg-blue-600/20 border-blue-500/40"
                    : "bg-purple-50 border-purple-200"
                : isDarkMode
                    ? "bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08]"
                    : "bg-gray-50 border-gray-100 hover:bg-gray-100"
        }`;

    const companyName = isDarkMode ? "text-white" : "text-gray-900";
    const companyCode = isDarkMode ? "text-white/40" : "text-gray-500";
    const chevron = isDarkMode ? "text-white/30" : "text-gray-400";
    const iconColor = isDarkMode ? "text-blue-400" : "text-purple-600";

    const logoutBtn = isDarkMode
        ? "border border-white/[0.08] text-white/70 hover:bg-white/[0.06]"
        : "border border-gray-200 text-gray-700 hover:bg-gray-50";

    const linkColor = isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-purple-600 hover:text-purple-700";

    if (companies.length === 0) {
        return (
            <div className={`min-h-screen ${bg} flex items-center justify-center p-4`}>
                <div className="w-full max-w-md">
                    <div className={`${card} rounded-2xl p-8 shadow-2xl space-y-6`}>
                        <div className="text-center space-y-3">
                            <div className="flex justify-center">
                                <div className={`w-16 h-16 rounded-2xl shadow-sm border ${divider} flex items-center justify-center ${isDarkMode ? "bg-white/[0.04]" : "bg-white"}`}>
                                    <img src={Images.logo || "/placeholder.svg"} alt="logo" width={100} height={100} className="rounded-lg" />
                                </div>
                            </div>
                            <h1 className={`text-2xl font-bold ${title}`}>Sin Acceso a Empresas</h1>
                            <p className={`${sub} text-sm`}>
                                Hola <span className="font-semibold">{profile?.username}</span>, actualmente no tienes acceso a ninguna empresa.
                            </p>
                        </div>

                        <div className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? "bg-white/[0.04]" : "bg-gray-50"}`}>
                            <Mail className={`h-5 w-5 ${iconColor}`} />
                            <div>
                                <p className={`font-medium text-sm ${title}`}>Email de Soporte</p>
                                <p className={`text-xs ${sub}`}>soporte@empresa.com</p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium ${logoutBtn}`}
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${bg} flex items-center justify-center p-4`}>
            <div className="w-full max-w-md">
                <div className={`${card} rounded-2xl p-8 shadow-2xl space-y-6`}>
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="flex justify-center">
                            <div className={`w-16 h-16 rounded-2xl shadow-sm border ${divider} flex items-center justify-center ${isDarkMode ? "bg-white/[0.04]" : "bg-white"}`}>
                                <img src={Images.logo || "/placeholder.svg"} alt="logo" width={100} height={100} className="rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <h1 className={`text-2xl font-bold ${title}`}>Seleccionar Empresa</h1>
                            <p className={`${sub} text-sm mt-1`}>
                                Hola <span className="font-semibold">{profile?.username}</span>, elige tu empresa
                            </p>
                        </div>
                    </div>

                    {/* Companies List */}
                    <div className="space-y-2">
                        {companies.map((company) => (
                            <button
                                key={company.id}
                                onClick={() => handleSelectCompany(company.code)}
                                className={companyBtn(selectedCompany?.code === company.code)}
                            >
                                <div className="flex items-center gap-3">
                                    <Building2 className={`h-5 w-5 ${iconColor}`} />
                                    <div>
                                        <p className={`text-sm ${companyName}`}>{company.name}</p>
                                        <p className={`text-xs ${companyCode}`}>{company.code}</p>
                                    </div>
                                </div>
                                <ChevronRight className={`h-4 w-4 ${chevron}`} />
                            </button>
                        ))}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => logout()}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium ${logoutBtn}`}
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                    </button>

                    {/* Footer */}
                    <div className={`text-center text-sm pt-2 border-t ${divider} ${sub}`}>
                        ¿No ves tu empresa?{" "}
                        <a href="#" className={`font-medium ${linkColor}`}>
                            Contactar soporte
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { CompanySelector };
