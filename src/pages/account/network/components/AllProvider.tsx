// src/pages/NetworkProvidersPage.tsx
"use client";

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";

const { VITE_API_URL } = import.meta.env;

// ====================================
// fetcher modificado para manejar 404
// ====================================
const fetcher = async (url: string) => {
    const res = await fetch(url);

    if (res.status === 404) {
        // Si la respuesta es 404, no es un error de la API, sino que no hay recursos.
        // Devolvemos null para que useSWR no establezca 'error' y 'data' sea null.
        return null;
    }

    if (!res.ok) {
        // Para otros errores (ej. 500), sí lanzamos un error.
        let errorData: any = { message: res.statusText || 'Error desconocido' };
        try {
            errorData = await res.json(); // Intenta leer el JSON de error si lo hay
        } catch (e) {
            // Si no se puede leer JSON, usa el mensaje por defecto
        }
        throw new Error(errorData.message || 'Error al cargar datos del servidor.');
    }

    return res.json();
};

// ====================================
// Tipos de Proveedor de Red (copiado del frontend de AllNetwork.tsx)
// ====================================
export interface ApiNetworkProvider {
    id: string;
    name: string;
    providerIp: string | null;
    dnsGateway: string | null;
    speed: string | null;
    cost: number | null; // Prisma Decimal se mapea a number en TS
    notes: string | null;
    meshDevices: string | null;
    switchDevices: string | null;
    createdAt: string;
    updatedAt: string;
    // networks?: any[]; // Podríamos incluir esto si el API lo devuelve
}

// Interfaz para el frontend (más limpia)
export interface FrontendNetworkProvider {
    id: string;
    nombre: string;
    ipProveedor: string;
    dnsGateway: string;
    velocidad: string;
    costoMensual: string;
    notas: string;
    dispositivosMalla: string;
    dispositivosSwitch: string;
    numConexionesAsociadas: number; // Para mostrar cuántas redes gestiona
}

// ====================================
// Mapper API → Frontend
// ====================================
// ====================================
// Mapper API → Frontend
// ====================================
const mapApiProviderToFrontend = (item: ApiNetworkProvider): FrontendNetworkProvider => {
    if (!item) {
        return {
            id: "0",
            nombre: "N/A",
            ipProveedor: "N/A",
            dnsGateway: "N/A",
            velocidad: "N/A",
            costoMensual: "$0.00",
            notas: "N/A",
            dispositivosMalla: "N/A",
            dispositivosSwitch: "N/A",
            numConexionesAsociadas: 0,
        };
    }

    const costValue = Number.parseFloat(item.cost?.toString() || "0") || 0;

    let meshDevices: string = "Ninguno"; // Inicializar como string
    try {
        if (item.meshDevices) {
            // JSON.parse() puede devolver un array, lo unimos.
            // Si el string es "null", JSON.parse devuelve null, y lo manejamos.
            const parsed = JSON.parse(item.meshDevices);
            if (Array.isArray(parsed)) {
                meshDevices = parsed.join(", ");
            } else if (typeof parsed === 'string') {
                meshDevices = parsed; // Si por alguna razón es un string simple
            }
        }
    } catch (e) {
        console.warn("Error parsing meshDevices JSON:", e);
        meshDevices = item.meshDevices || "Error de formato"; // Usar el original o un mensaje de error
    }

    let switchDevices: string = "Ninguno"; // Inicializar como string
    try {
        if (item.switchDevices) {
            const parsed = JSON.parse(item.switchDevices);
            if (Array.isArray(parsed)) {
                switchDevices = parsed.join(", ");
            } else if (typeof parsed === 'string') {
                switchDevices = parsed; // Si por alguna razón es un string simple
            }
        }
    } catch (e) {
        console.warn("Error parsing switchDevices JSON:", e);
        switchDevices = item.switchDevices || "Error de formato"; // Usar el original o un mensaje de error
    }

    return {
        id: item.id,
        nombre: item.name || "N/A",
        ipProveedor: item.providerIp || "N/A",
        dnsGateway: item.dnsGateway || "N/A",
        velocidad: item.speed || "N/A",
        costoMensual: `$${costValue.toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`,
        notas: item.notes || "Sin notas",
        dispositivosMalla: meshDevices, // Ya es string
        dispositivosSwitch: switchDevices, // Ya es string
        numConexionesAsociadas: (item as any).networks?.length || 0,
    };
};

// ====================================
// Componente principal
// ====================================
const NetworkProvidersPage = () => {
    // data ahora podría ser null si el fetcher devuelve null (ej. 404)
    const { data, error, isLoading } = useSWR<ApiNetworkProvider[] | null>(`${VITE_API_URL}/api/network-providers`, fetcher);

    const [searchTerm, setSearchTerm] = useState("");

    const proveedores: FrontendNetworkProvider[] = useMemo(() => {
        // Si data es null (por 404 o simplemente no hay datos), inicializar como array vacío
        if (!Array.isArray(data) || data.length === 0) return [];
        return data.map(mapApiProviderToFrontend);
    }, [data]);

    const filteredProveedores = useMemo(() => {
        if (!searchTerm) return proveedores;
        const s = searchTerm.toLowerCase();
        return proveedores.filter(
            (p) =>
                p.nombre.toLowerCase().includes(s) ||
                p.ipProveedor.toLowerCase().includes(s) ||
                p.dnsGateway.toLowerCase().includes(s) ||
                p.velocidad.toLowerCase().includes(s) ||
                p.notas.toLowerCase().includes(s)
        );
    }, [proveedores, searchTerm]);

    // Se mueve el manejo de carga y error para que solo afecte la tabla
    const renderTableContent = () => {
        if (isLoading) {
            return (
                <div className="p-8 text-center text-gray-400">Cargando proveedores...</div>
            );
        }

        if (error) {
            // Este error es para fallas del servidor (ej. 500) o problemas de red.
            console.error("Error al cargar proveedores de red:", error);
            return (
                <div className="p-8 text-center text-red-500">Error al cargar proveedores de red: {error.message}. Por favor, inténtelo de nuevo más tarde.</div>
            );
        }

        // Si no está cargando, no hay error, y la lista de proveedores está vacía
        // (esto incluye el caso de 404 donde `data` es `null` y `proveedores` se convierte en `[]`)
        if (filteredProveedores.length === 0) {
            return (
                <div className="p-8 text-center text-gray-400">
                    <div className="text-gray-400 mb-2">
                        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
                            />
                        </svg>
                    </div>
                    <p className="text-white font-medium">No se encontraron proveedores registrados.</p>
                    <p className="text-gray-500 text-sm mt-1">Agrega tu primer proveedor para comenzar.</p>
                </div>
            );
        }

        return (
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-700">
                        <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Proveedor</th>
                        <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">IP/DNS</th>
                        <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Velocidad</th>
                        <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Costo Mensual</th>
                        <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Notas</th>
                        <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Dispositivos</th>
                        <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProveedores.map((p) => (
                        <tr key={p.id} className="border-b border-slate-700 hover:bg-slate-750 transition-colors duration-150">
                            <td className="py-4 px-6">
                                <p className="text-white font-medium">{p.nombre}</p>
                            </td>
                            <td className="py-4 px-6">
                                <p className="text-white">{p.ipProveedor}</p>
                                <p className="text-gray-400 text-sm">{p.dnsGateway}</p>
                            </td>
                            <td className="py-4 px-6">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-gray-300 border border-slate-600">
                                    {p.velocidad}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <p className="text-white">{p.costoMensual}</p>
                            </td>
                            <td className="py-4 px-6">
                                <p className="text-gray-400 text-sm max-w-[200px] truncate">{p.notas}</p>
                            </td>
                            <td className="py-4 px-6">
                                <p className="text-gray-400 text-sm">Malla: {p.dispositivosMalla}</p>
                                <p className="text-gray-400 text-sm">Switch: {p.dispositivosSwitch}</p>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                    <Link to={`edit-provider/${p.id}`} className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors duration-150">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                            />
                                        </svg>
                                    </Link>
                                    <button
                                        onClick={() => alert(`Eliminar proveedor ${p.nombre}`)}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors duration-150"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 text-gray-100">
            <div className="p-6">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-white mb-2">Proveedores de Red</h1>
                        <p className="text-gray-400">Gestiona la información de tus proveedores de servicios de red</p>
                    </div>
                    {/* El botón "Agregar Proveedor" siempre visible */}
                    <Link to="create-provider" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                        <span>+</span>
                        Agregar Proveedor
                    </Link>
                </div>

                {/* Stats Cards (Opcional, puedes adaptar las de AllNetwork) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Total Proveedores</p>
                                {isLoading ? (
                                    <p className="text-2xl font-semibold text-white">...</p>
                                ) : error ? (
                                    <p className="text-2xl font-semibold text-red-500">Error</p>
                                ) : (
                                    <p className="text-2xl font-semibold text-white">{proveedores.length}</p>
                                )}
                                <p className="text-gray-500 text-sm">Registrados en el sistema</p>
                            </div>
                        </div>
                    </div>
                    {/* Añade más tarjetas de estadísticas si lo deseas */}
                </div>

                {/* Lista de Proveedores */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl">
                    <div className="p-6 border-b border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Lista de Proveedores</h2>
                                {isLoading ? (
                                    <p className="text-gray-400 text-sm">Cargando...</p>
                                ) : error ? (
                                    <p className="text-red-500 text-sm">Error al cargar.</p>
                                ) : (
                                    <p className="text-gray-400 text-sm">
                                        {filteredProveedores.length} de {proveedores.length} proveedores encontrados
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Filtro */}
                        <div className="relative">
                            <svg
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar proveedores..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto">
                        {/* Llama a la función que renderiza el contenido de la tabla */}
                        {renderTableContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default NetworkProvidersPage;