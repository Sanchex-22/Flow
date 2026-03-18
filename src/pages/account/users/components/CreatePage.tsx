"use client"

import useSWR from "swr";
import { useNavigate, useParams } from "react-router-dom";
import UpdateUser from "../../../../components/forms/UpdateUser";
import { Company, useCompany } from "../../../../context/routerContext";
import { useTheme } from "../../../../context/themeContext";
import Loader from "../../../../components/loaders/loader";

const { VITE_API_URL } = import.meta.env;

const fetcher = async (url: string) => {
    try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};

export interface Department {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

const CreateUserPage: React.FC = () => {
    const { id: userID } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const renderPage = userID ? "Editar Usuario" : "Crear Usuario";
    document.title = renderPage;

    const { selectedCompany }: { selectedCompany: Company | null } = useCompany();

    const departmentUrl = selectedCompany
        ? `${VITE_API_URL}/api/companies/departments/by-code/${selectedCompany.code}`
        : null;

    const { data: departments, error, isLoading } = useSWR<Department[]>(
        departmentUrl,
        fetcher,
        {
            revalidateOnFocus: true,
            shouldRetryOnError: true,
            errorRetryInterval: 5000,
            errorRetryCount: 10,
        }
    );

    if (isLoading) {
        return (
            <Loader/>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? "bg-[#1c1c1e]" : "bg-[#f5f5f7]"}`}>
                <div className={`max-w-md w-full rounded-xl p-5 border flex items-start gap-3 ${isDarkMode ? "bg-[#2c2c2e] border-red-500/30 text-red-400" : "bg-white border-red-200 text-red-600"}`}>
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <div>
                        <p className="font-semibold text-sm">Error al cargar departamentos</p>
                        <p className="text-xs mt-1 opacity-70">{error.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!departments) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? "bg-[#1c1c1e]" : "bg-[#f5f5f7]"}`}>
                <div className={`max-w-md w-full rounded-xl p-5 border flex items-start gap-3 ${isDarkMode ? "bg-[#2c2c2e] border-yellow-500/30 text-yellow-400" : "bg-white border-yellow-200 text-yellow-600"}`}>
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium">No hay departamentos disponibles</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? "bg-[#1c1c1e] text-white" : "bg-[#f5f5f7] text-gray-900"}`}>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Header */}
                <div className={`rounded-xl p-4 sm:p-6 mb-6 border transition-colors ${
                    isDarkMode ? "bg-[#2c2c2e] border-white/[0.08]" : "bg-white border-gray-200 shadow-sm"
                }`}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {renderPage}
                            </h1>
                            <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? "text-white/50" : "text-gray-500"}`}>
                                Complete la información para {userID ? "editar" : "registrar"} un usuario en el sistema
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate(`/${selectedCompany?.code}/users/all`)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isDarkMode
                                    ? "bg-white/[0.06] hover:bg-white/10 text-white border border-white/[0.08]"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                            </svg>
                            <span className="hidden sm:inline">Volver</span>
                        </button>
                    </div>
                </div>

                <UpdateUser
                    userID={userID}
                    departments={departments}
                    selectedCompany={selectedCompany}
                />
            </div>
        </div>
    );
};

export default CreateUserPage;