"use client"

import { useState } from "react";
import { UserProfile } from "../../context/userProfileContext";
import useUser from "../../hook/useUser";
import { getUserRoles } from "../../routes/routesConfig";
import { LogOut } from "lucide-react";

type Subroutes = {
    name: string;
    href: string;
}

interface CurrentPathname {
    name: string;
}

type DashboardProps = {
    subroutes: Subroutes[];
    currentPathname: CurrentPathname;
    isLogged: boolean;
    profile: UserProfile | null;
}

const SlideBar: React.FC<DashboardProps> = ({ subroutes, currentPathname, profile }) => {
    const { logout } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const userRoles = profile?.roles ? getUserRoles(profile) : ["user"];

    return (
        <div className="min-h-screen bg-gray-900 text-white flex h-[90vh]">
            {/* Sidebar */}
            <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-6 h-6">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <rect x="7" y="7" width="3" height="9" />
                                <rect x="14" y="7" width="3" height="5" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold">Sistema IT</h2>
                    </div>
                </div>

                {/* Company Selector */}
                <div className="p-4 border-b border-gray-800">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">EMPRESA ACTIVA</div>
                    <div className="relative">
                        <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm appearance-none cursor-pointer hover:bg-gray-750 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Empresa Principal S.A.</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="w-4 h-4 text-gray-400"
                            >
                                <polyline points="6,9 12,15 18,9" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        <li>
                            <a
                                href="/dashboard"
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                    <rect x="3" y="3" width="7" height="7" />
                                    <rect x="14" y="3" width="7" height="7" />
                                    <rect x="14" y="14" width="7" height="7" />
                                    <rect x="3" y="14" width="7" height="7" />
                                </svg>
                                <span className="text-sm">Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="/inventory/all"
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                </svg>
                                <span className="text-sm">Inventario</span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="/devices/all"
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                                <span className="text-sm">Equipos</span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="/network/all"
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                                    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                                    <line x1="12" y1="20" x2="12.01" y2="20" />
                                </svg>
                                <span className="text-sm">Red</span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="/maintenance/all"
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                </svg>
                                <span className="text-sm">Mantenimiento</span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="/users/all"
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
                                </svg>
                                <span className="text-sm">Usuarios</span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="/reports/all"
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                    <line x1="18" y1="20" x2="18" y2="10" />
                                    <line x1="12" y1="20" x2="12" y2="4" />
                                    <line x1="6" y1="20" x2="6" y2="14" />
                                </svg>
                                <span className="text-sm">Reportes</span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="/settings/all"
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                                <span className="text-sm">Configuración</span>
                            </a>
                        </li>
                    </ul>
                </nav>

                {/* Help Section */}
                <div className="p-4 border-t border-gray-800 flex flex-col space-y-2">
                    <a
                        href="/profile/1"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs font-bold">N</div>
                        <span className="font-sm text-sm">{profile?.username || 'user'}</span>
                    </a>

                    <button 
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => { logout()}}>
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar sesión</span>
                    </button>
                </div>

            </div>

        </div>
    )
}
export default SlideBar
