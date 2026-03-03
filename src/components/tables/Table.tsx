"use client"

import React, { useState } from 'react'
import { Edit, Trash2, FileText } from 'lucide-react'
import { useTheme } from '../../context/themeContext'

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
    // titulo,
    columnasPersonalizadas,
    onEditar,
    onEliminar,
    mostrarAcciones = false,
    onSelectItemsForDelivery,
    showSelectForDelivery = false,
}: TablaProps<T>) {
    const { isDarkMode } = useTheme()
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

    const handleRowSelect = (id: string) => {
        const newSelectedRows = new Set(selectedRows)
        if (newSelectedRows.has(id)) {
            newSelectedRows.delete(id)
        } else {
            newSelectedRows.add(id)
        }
        setSelectedRows(newSelectedRows)
    }

    const handleSelectAll = () => {
        if (selectedRows.size === datos.length && datos.length > 0) {
            setSelectedRows(new Set())
        } else {
            setSelectedRows(new Set(datos.map(item => item.id)))
        }
    }

    const handleGenerateDelivery = () => {
        if (onSelectItemsForDelivery && selectedRows.size > 0) {
            const selectedItems = datos.filter(item => selectedRows.has(item.id))
            onSelectItemsForDelivery(selectedItems)
            setSelectedRows(new Set())
        } else {
            alert("Por favor, selecciona al menos un equipo para la entrega.")
        }
    }

    if (!datos || datos.length === 0) {
        return (
            <div
                className={`p-4 rounded-lg border ${
                    isDarkMode
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                } text-center`}
            >
                <p
                    className={`${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                >
                    No hay datos disponibles.
                </p>
            </div>
        )
    }

    let nombresColumnas: string[]
    if (columnasPersonalizadas) {
        nombresColumnas = Object.keys(columnasPersonalizadas)
    } else {
        const primeraFila = datos[0]
        nombresColumnas = Object.keys(primeraFila).filter(
            (key) =>
                ![
                    'id',
                    'companyId',
                    'assignedToPersonId',
                    'company',
                    '_count',
                ].includes(key) && typeof primeraFila[key as keyof T] !== 'object'
        )
    }

    return (
        <div
            className={`overflow-hidden rounded-lg shadow-md transition-colors ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
        >
            <table
                className={`min-w-full divide-y ${
                    isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}
            >
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                        {showSelectForDelivery && (
                            <th scope="col" className="p-4 text-center">
                                <input
                                    type="checkbox"
                                    className={`rounded ${
                                        isDarkMode
                                            ? 'bg-gray-600 border-gray-500 text-blue-600 focus:ring-blue-500'
                                            : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                                    }`}
                                    checked={
                                        selectedRows.size === datos.length &&
                                        datos.length > 0
                                    }
                                    onChange={handleSelectAll}
                                />
                            </th>
                        )}
                        {nombresColumnas.map((columna) => (
                            <th
                                key={columna}
                                scope="col"
                                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode
                                        ? 'text-gray-300'
                                        : 'text-gray-500'
                                }`}
                            >
                                {columna}
                            </th>
                        ))}
                        {mostrarAcciones && (
                            <th
                                scope="col"
                                className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode
                                        ? 'text-gray-300'
                                        : 'text-gray-500'
                                }`}
                            >
                                Acciones
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody
                    className={`divide-y ${
                        isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                    } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                    {datos.map((item) => (
                        <tr
                            key={item.id}
                            className={`${
                                selectedRows.has(item.id)
                                    ? isDarkMode
                                        ? 'bg-blue-900 bg-opacity-30'
                                        : 'bg-blue-50'
                                    : isDarkMode
                                    ? 'hover:bg-gray-700'
                                    : 'hover:bg-gray-50'
                            } transition-colors`}
                        >
                            {showSelectForDelivery && (
                                <td className="p-4 text-center">
                                    <input
                                        type="checkbox"
                                        className={`rounded ${
                                            isDarkMode
                                                ? 'bg-gray-600 border-gray-500 text-blue-600 focus:ring-blue-500'
                                                : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                                        }`}
                                        checked={selectedRows.has(item.id)}
                                        onChange={() =>
                                            handleRowSelect(item.id)
                                        }
                                    />
                                </td>
                            )}
                            {nombresColumnas.map((columna) => (
                                <td
                                    key={`${item.id}-${columna}`}
                                    className={`px-6 py-4 whitespace-nowrap ${
                                        isDarkMode
                                            ? 'text-gray-300'
                                            : 'text-gray-900'
                                    }`}
                                >
                                    {columnasPersonalizadas &&
                                    columnasPersonalizadas[columna]
                                        ? columnasPersonalizadas[columna](
                                              item
                                          )
                                        : typeof item[columna as keyof T] ===
                                          'string' ||
                                          typeof item[columna as keyof T] ===
                                              'number'
                                        ? (item[
                                              columna as keyof T
                                          ] as React.ReactNode)
                                        : null}
                                </td>
                            ))}
                            {mostrarAcciones && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-center space-x-2">
                                        {onEditar && (
                                            <button
                                                onClick={() => onEditar(item)}
                                                className={`p-2 rounded-full transition-colors ${
                                                    isDarkMode
                                                        ? 'text-blue-400 hover:bg-gray-700'
                                                        : 'text-blue-600 hover:bg-gray-100'
                                                }`}
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        )}
                                        {onEliminar && (
                                            <button
                                                onClick={() =>
                                                    onEliminar(item)
                                                }
                                                className={`p-2 rounded-full transition-colors ${
                                                    isDarkMode
                                                        ? 'text-red-400 hover:bg-gray-700'
                                                        : 'text-red-600 hover:bg-gray-100'
                                                }`}
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {showSelectForDelivery && (
                <div
                    className={`p-4 border-t flex justify-between items-center ${
                        isDarkMode
                            ? 'border-gray-700 bg-gray-800'
                            : 'border-gray-200 bg-white'
                    }`}
                >
                    <span
                        className={`text-sm font-medium ${
                            isDarkMode
                                ? 'text-gray-300'
                                : 'text-gray-700'
                        }`}
                    >
                        {selectedRows.size} equipo{selectedRows.size !== 1 ? 's' : ''} seleccionado
                        {selectedRows.size !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={handleGenerateDelivery}
                        disabled={selectedRows.size === 0}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                            selectedRows.size > 0
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                        }`}
                    >
                        <FileText size={18} />
                        Generar Acta de Entrega
                    </button>
                </div>
            )}
        </div>
    )
}