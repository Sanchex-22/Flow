"use client"

import type React from "react"
import useSWR from "swr"

const { VITE_API_URL } = import.meta.env;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// --- Tipos ---
interface Company {
    id: string
    name: string
}

interface User {
    id: string
    username: string
}

interface FormErrors {
    companyId?: string
}

type NotificationType = "success" | "error";

interface Notification {
    type: NotificationType;
    message: string;
    show: boolean;
}

interface Props {
    departments?: any[] | null
    selectedCompany?: Company | null
    maintenanceID?: string | null
}

const UpdateMaintenanceForm: React.FC<Props> = ({ selectedCompany, departments, maintenanceID }) => {
    const isEditMode = !!maintenanceID


    return (
        <form className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                    {/* Icono */}
                    <div>
                        {/* --- (UI ACTUALIZADA) Título y descripción dinámicos --- */}
                        <h2 className="text-xl font-bold">{isEditMode ? 'Actualizar Equipo' : 'Información del Nuevo Equipo'}</h2>
                        <p className="text-gray-400 text-sm">{isEditMode ? `Editando el dispositivo ID: ${deviceID}` : 'Datos básicos del equipo tecnológico'}</p>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default UpdateMaintenanceForm;