import React from "react";
import UpdateDevices from "../../../../components/forms/UpdateDevices";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import { Company, useCompany } from "../../../../context/routerContext";
import { useTheme } from "../../../../context/themeContext";

const { VITE_API_URL } = import.meta.env;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Person {
    id: string;
    fullName: string | null;
    firstName: string | null;
    lastName: string | null;
    position: string | null;
    contactEmail: string | null;
}

interface Department {
    id: string;
    name: string;
}

const UpdateDevicesPage: React.FC = () => {
    const { id: deviceID } = useParams<{ id: string }>();
    const { selectedCompany }: { selectedCompany: Company | null } = useCompany();
    const { isDarkMode } = useTheme();

    const renderPage = deviceID ? "Editar Equipo" : "Crear Equipo";
    document.title = renderPage;

    const { data: departments, error: errorDepartments, isLoading: isLoadingDepartments } = useSWR<Department[]>(
        selectedCompany ? `${VITE_API_URL}/api/companies/departments/by-code/${selectedCompany.code}` : null,
        fetcher,
        {
            revalidateOnFocus: true,
            shouldRetryOnError: true,
            errorRetryInterval: 5000,
            errorRetryCount: 10,
        }
    );

    const { data: persons, error: errorPersons, isLoading: isLoadingPersons } = useSWR<Person[]>(
        selectedCompany ? `${VITE_API_URL}/api/persons/company/${selectedCompany.id}` : null,
        fetcher
    );

    if (errorPersons) return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900 text-red-400" : "bg-gray-50 text-red-600"}`}>
            Error al cargar personas: {errorPersons.message}
        </div>
    );
    if (isLoadingPersons || !persons) return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900 text-gray-400" : "bg-gray-50 text-gray-600"}`}>
            Cargando colaboradores...
        </div>
    );

    if (errorDepartments) return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900 text-red-400" : "bg-gray-50 text-red-600"}`}>
            Error al cargar departamentos: {errorDepartments.message}
        </div>
    );
    if (isLoadingDepartments || !departments) return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900 text-gray-400" : "bg-gray-50 text-gray-600"}`}>
            Cargando departamentos...
        </div>
    );

    return (
        <div className={`relative min-h-screen font-inter transition-colors ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-lg md:text-3xl font-bold text-center mb-2">{renderPage}</h1>
                <UpdateDevices
                    persons={persons}
                    deviceID={deviceID}
                    departments={departments}
                    selectedCompany={selectedCompany}
                />
            </div>
        </div>
    );
};

export default UpdateDevicesPage;