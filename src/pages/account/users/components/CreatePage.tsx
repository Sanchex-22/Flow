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
            <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
                <div className="bg-red-900/30 border border-red-600 rounded-lg p-6 text-red-300">
                    <p className="font-semibold mb-2">Error al cargar departamentos</p>
                    <p>{error.message}</p>
                </div>
            </div>
        );
    }

    if (!departments) {
        return (
            <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
                <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-6 text-yellow-300">
                    <p>No hay departamentos disponibles</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
            <div className="">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {renderPage}
                        </h1>
                        <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                            Complete la información para {userID ? "editar" : "registrar"} un usuario en el sistema
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/${selectedCompany?.code}/users/all`)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                isDarkMode
                                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                                    : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                            }`}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="w-4 h-4"
                            >
                                <path d="M19 12H5" />
                                <path d="M12 19l-7-7 7-7" />
                            </svg>
                            <span>Cancelar</span>
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