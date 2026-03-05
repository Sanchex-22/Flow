"use client"

import { useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import { useTheme } from "../../../../context/themeContext"
import { CreateEquipmentData } from './AllDevices'


interface CambioSelectorModalProps {
    equipos: CreateEquipmentData[]
    onConfirm: (equiposRetirados: CreateEquipmentData[], equiposEntregados: CreateEquipmentData[]) => void
    onCancel: () => void
}

export default function CambioSelectorModal({
    equipos,
    onConfirm,
    onCancel,
}: CambioSelectorModalProps) {
    const { isDarkMode } = useTheme()
    const [equiposRetirados, setEquiposRetirados] = useState<Set<string>>(new Set())
    const [equiposEntregados, setEquiposEntregados] = useState<Set<string>>(new Set())

    const handleToggleRetiro = (id: string) => {
        const newRetirados = new Set(equiposRetirados)
        const newEntregados = new Set(equiposEntregados)
        
        if (newRetirados.has(id)) {
            newRetirados.delete(id)
        } else {
            newRetirados.add(id)
            newEntregados.delete(id) // Quitar de entrega si estaba
        }
        
        setEquiposRetirados(newRetirados)
        setEquiposEntregados(newEntregados)
    }

    const handleToggleEntrega = (id: string) => {
        const newRetirados = new Set(equiposRetirados)
        const newEntregados = new Set(equiposEntregados)
        
        if (newEntregados.has(id)) {
            newEntregados.delete(id)
        } else {
            newEntregados.add(id)
            newRetirados.delete(id) // Quitar de retiro si estaba
        }
        
        setEquiposRetirados(newRetirados)
        setEquiposEntregados(newEntregados)
    }

    const handleConfirm = () => {
        if (equiposRetirados.size === 0 || equiposEntregados.size === 0) {
            alert("Debes seleccionar al menos un equipo para retirar y uno para entregar")
            return
        }

        const retirados = equipos.filter(e => equiposRetirados.has(e.id))
        const entregados = equipos.filter(e => equiposEntregados.has(e.id))

        onConfirm(retirados, entregados)
    }

    const equiposSinAsignar = equipos.filter(
        e => !equiposRetirados.has(e.id) && !equiposEntregados.has(e.id)
    )

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div
                className={`rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-colors ${
                    isDarkMode
                        ? "bg-gray-800 border border-gray-700"
                        : "bg-white border border-gray-200"
                }`}
            >
                {/* Header */}
                <div
                    className={`flex items-center justify-between p-4 border-b ${
                        isDarkMode
                            ? "border-gray-700 bg-gray-800"
                            : "border-gray-200 bg-white"
                    }`}
                >
                    <div>
                        <h2
                            className={`text-lg font-bold ${
                                isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                        >
                            Selector de Cambio - Retiro y Entrega
                        </h2>
                        <p
                            className={`text-sm mt-1 ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                        >
                            Selecciona qué equipos se retiran y cuáles se entregan
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className={`transition-colors ${
                            isDarkMode
                                ? "text-gray-400 hover:text-white"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 grid grid-cols-3 gap-6">
                    {/* Equipos sin asignar */}
                    <div
                        className={`rounded-lg p-4 border-2 border-dashed ${
                            isDarkMode
                                ? "bg-gray-700 border-gray-600"
                                : "bg-gray-50 border-gray-300"
                        }`}
                    >
                        <h3
                            className={`text-sm font-bold mb-4 ${
                                isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                        >
                            📦 Sin Asignar ({equiposSinAsignar.length})
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {equiposSinAsignar.map((equipo) => (
                                <div
                                    key={equipo.id}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                        isDarkMode
                                            ? "bg-gray-600 border-gray-500 hover:border-gray-400"
                                            : "bg-white border-gray-300 hover:border-gray-400"
                                    }`}
                                >
                                    <p className={`text-xs font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                        {equipo.brand} {equipo.model}
                                    </p>
                                    <p className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                        {equipo.serialNumber}
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleToggleRetiro(equipo.id)}
                                            className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                        >
                                            ← Retirar
                                        </button>
                                        <button
                                            onClick={() => handleToggleEntrega(equipo.id)}
                                            className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                                        >
                                            Entregar →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Equipos a RETIRAR */}
                    <div
                        className={`rounded-lg p-4 border-2 ${
                            isDarkMode
                                ? "bg-red-900 bg-opacity-20 border-red-700"
                                : "bg-red-50 border-red-300"
                        }`}
                    >
                        <h3
                            className={`text-sm font-bold mb-4 ${
                                isDarkMode ? "text-red-300" : "text-red-700"
                            }`}
                        >
                            📥 A Retirar ({equiposRetirados.size})
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {equipos
                                .filter((e) => equiposRetirados.has(e.id))
                                .map((equipo) => (
                                    <div
                                        key={equipo.id}
                                        onClick={() => handleToggleRetiro(equipo.id)}
                                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                            isDarkMode
                                                ? "bg-red-800 border-red-600 hover:border-red-500"
                                                : "bg-red-100 border-red-400 hover:border-red-500"
                                        }`}
                                    >
                                        <p className={`text-xs font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                            {equipo.brand} {equipo.model}
                                        </p>
                                        <p className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                            {equipo.serialNumber}
                                        </p>
                                        <button
                                            onClick={() => handleToggleRetiro(equipo.id)}
                                            className="w-full mt-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                        >
                                            ✓ Seleccionado
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Equipos a ENTREGAR */}
                    <div
                        className={`rounded-lg p-4 border-2 ${
                            isDarkMode
                                ? "bg-green-900 bg-opacity-20 border-green-700"
                                : "bg-green-50 border-green-300"
                        }`}
                    >
                        <h3
                            className={`text-sm font-bold mb-4 ${
                                isDarkMode ? "text-green-300" : "text-green-700"
                            }`}
                        >
                            📤 A Entregar ({equiposEntregados.size})
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {equipos
                                .filter((e) => equiposEntregados.has(e.id))
                                .map((equipo) => (
                                    <div
                                        key={equipo.id}
                                        onClick={() => handleToggleEntrega(equipo.id)}
                                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                            isDarkMode
                                                ? "bg-green-800 border-green-600 hover:border-green-500"
                                                : "bg-green-100 border-green-400 hover:border-green-500"
                                        }`}
                                    >
                                        <p className={`text-xs font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                            {equipo.brand} {equipo.model}
                                        </p>
                                        <p className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                            {equipo.serialNumber}
                                        </p>
                                        <button
                                            onClick={() => handleToggleEntrega(equipo.id)}
                                            className="w-full mt-2 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                                        >
                                            ✓ Seleccionado
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className={`flex items-center justify-end gap-3 p-4 border-t ${
                        isDarkMode
                            ? "border-gray-700 bg-gray-800"
                            : "border-gray-200 bg-white"
                    }`}
                >
                    <button
                        onClick={onCancel}
                        className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                            isDarkMode
                                ? "bg-gray-600 hover:bg-gray-700 text-white"
                                : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                        }`}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={equiposRetirados.size === 0 || equiposEntregados.size === 0}
                        className={`px-4 py-2 rounded-lg text-white transition-colors font-medium flex items-center gap-2 ${
                            equiposRetirados.size > 0 && equiposEntregados.size > 0
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <ArrowRight size={18} />
                        Generar Acta de Cambio
                    </button>
                </div>
            </div>
        </div>
    )
}