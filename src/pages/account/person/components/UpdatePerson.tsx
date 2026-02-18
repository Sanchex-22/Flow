// CreatePersonPage.tsx
"use client"

import useSWR from "swr";
import { useNavigate, useParams } from "react-router-dom";
import { Company, useCompany } from "../../../../context/routerContext";
import UpdatePersonForm from "../../../../components/forms/UpdatePersonForm";
import { useTheme } from "../../../../context/themeContext";

const { VITE_API_URL } = import.meta.env;

const fetcher = async (url: string) => {
    try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(url, {
            method: 'GET',
            headers,
            credentials: 'include',
        });

        if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
        }

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

const CreatePersonPage: React.FC = () => {
    const { id: personID } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const renderPage = personID ? "Editar Persona" : "Crear Persona";
    document.title = renderPage;

    const { selectedCompany }: { selectedCompany: Company | null } = useCompany();

    // ✅ URL para obtener departamentos de la compañía
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
            <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-6">
                <div className="bg-red-900/30 border border-red-600 rounded-lg p-6 text-red-300">
                    <p className="font-semibold mb-2">Error al cargar departamentos</p>
                    <p>{error.message}</p>
                </div>
            </div>
        );
    }

    if (!departments) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-6">
                <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-6 text-yellow-300">
                    <p>No hay departamentos disponibles</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative min-h-screen font-inter transition-colors ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
            <UpdatePersonForm
                userID={personID}
                departments={departments}
                selectedCompany={selectedCompany}
            />
        </div>
    );
};

export default CreatePersonPage;