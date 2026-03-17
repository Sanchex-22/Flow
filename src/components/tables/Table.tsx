"use client"

import React, { useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { useTheme } from '../../context/themeContext'
import { useTranslation } from 'react-i18next'

interface TablaProps<T extends { id: string }> {
    datos: T[]
    titulo: string
    columnasPersonalizadas?: { [key: string]: (item: T) => React.ReactNode }
    onEditar?: (item: T) => void
    onEliminar?: (item: T) => void
    mostrarAcciones?: boolean
    onSelectItemsForDelivery?: (selectedItems: T[]) => void
    showSelectForDelivery?: boolean
}

export default function Tabla<T extends { id: string }>({
    datos,
    columnasPersonalizadas,
    onEditar,
    onEliminar,
    mostrarAcciones = false,
    onSelectItemsForDelivery,
    showSelectForDelivery = false,
}: TablaProps<T>) {
    const { isDarkMode } = useTheme()
    const { t } = useTranslation()
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

    const handleRowSelect = (id: string) => {
        const newSelectedRows = new Set(selectedRows)
        if (newSelectedRows.has(id)) newSelectedRows.delete(id)
        else newSelectedRows.add(id)
        setSelectedRows(newSelectedRows)
        if (onSelectItemsForDelivery) {
            onSelectItemsForDelivery(datos.filter(item => newSelectedRows.has(item.id)))
        }
    }

    const handleSelectAll = () => {
        const newSelectedRows =
            selectedRows.size === datos.length && datos.length > 0
                ? new Set<string>()
                : new Set(datos.map(item => item.id))
        setSelectedRows(newSelectedRows)
        if (onSelectItemsForDelivery) {
            onSelectItemsForDelivery(datos.filter(item => newSelectedRows.has(item.id)))
        }
    }

    if (!datos || datos.length === 0) {
        return (
            <div className={`px-6 py-12 rounded-xl border text-center ${
                isDarkMode
                    ? 'bg-[#1c1c1e] border-white/[0.06] text-[#636366]'
                    : 'bg-white border-gray-100 text-gray-400'
            }`}>
                <p className="text-[13px]">{t("common.noData")}</p>
            </div>
        )
    }

    const nombresColumnas = columnasPersonalizadas
        ? Object.keys(columnasPersonalizadas)
        : Object.keys(datos[0]).filter(
            key => !['id', 'companyId', 'assignedToPersonId', 'company', '_count'].includes(key)
                && typeof datos[0][key as keyof T] !== 'object'
        )

    return (
        <div className={`overflow-hidden rounded-xl border transition-colors ${
            isDarkMode ? 'bg-[#1c1c1e] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'
        }`}>
            <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${
                    isDarkMode ? 'divide-white/[0.06]' : 'divide-gray-100'
                }`}>
                    <thead className={isDarkMode ? 'bg-[#111113]' : 'bg-[#f9f9f9]'}>
                        <tr>
                            {showSelectForDelivery && (
                                <th scope="col" className="px-4 py-3 text-center w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedRows.size === datos.length && datos.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}
                            {nombresColumnas.map(col => (
                                <th
                                    key={col}
                                    scope="col"
                                    className={`px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider ${
                                        isDarkMode ? 'text-[#636366]' : 'text-gray-400'
                                    }`}
                                >
                                    {col}
                                </th>
                            ))}
                            {mostrarAcciones && (
                                <th scope="col" className={`px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider ${
                                    isDarkMode ? 'text-[#636366]' : 'text-gray-400'
                                }`}>
                                    {t("common.actions")}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${
                        isDarkMode ? 'divide-white/[0.04]' : 'divide-gray-50'
                    }`}>
                        {datos.map(item => (
                            <tr
                                key={item.id}
                                className={`transition-colors ${
                                    selectedRows.has(item.id)
                                        ? isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                                        : isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50/50'
                                }`}
                            >
                                {showSelectForDelivery && (
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedRows.has(item.id)}
                                            onChange={() => handleRowSelect(item.id)}
                                        />
                                    </td>
                                )}
                                {nombresColumnas.map(col => (
                                    <td
                                        key={`${item.id}-${col}`}
                                        className={`px-5 py-3.5 text-[13px] whitespace-nowrap ${
                                            isDarkMode ? 'text-[#8e8e93]' : 'text-gray-700'
                                        }`}
                                    >
                                        {columnasPersonalizadas?.[col]
                                            ? columnasPersonalizadas[col](item)
                                            : typeof item[col as keyof T] === 'string' || typeof item[col as keyof T] === 'number'
                                            ? (item[col as keyof T] as React.ReactNode)
                                            : null}
                                    </td>
                                ))}
                                {mostrarAcciones && (
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <div className="flex justify-center gap-1">
                                            {onEditar && (
                                                <button
                                                    onClick={() => onEditar(item)}
                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                        isDarkMode
                                                            ? 'text-[#636366] hover:text-blue-400 hover:bg-blue-500/10'
                                                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                                    }`}
                                                    title="Edit"
                                                >
                                                    <Edit size={15} />
                                                </button>
                                            )}
                                            {onEliminar && (
                                                <button
                                                    onClick={() => onEliminar(item)}
                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                        isDarkMode
                                                            ? 'text-[#636366] hover:text-red-400 hover:bg-red-500/10'
                                                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                    }`}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showSelectForDelivery && (
                <div className={`px-5 py-3 border-t flex items-center gap-2 ${
                    isDarkMode ? 'border-white/[0.06]' : 'border-gray-100'
                }`}>
                    <span className={`text-[12px] font-medium ${
                        isDarkMode ? 'text-[#636366]' : 'text-gray-400'
                    }`}>
                        {selectedRows.size} {t("common.selected")}
                    </span>
                </div>
            )}
        </div>
    )
}
