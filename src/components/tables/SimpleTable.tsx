"use client"

import React from "react"
import { useTranslation } from "react-i18next"

interface Column {
  key: string
  label: string
}

interface SimpleTableProps {
  columns: Column[]
  data: Record<string, React.ReactNode>[]
  isDarkMode?: boolean
}

export default function SimpleTable({ columns, data, isDarkMode = false }: SimpleTableProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return (
      <div
        className={`p-8 rounded-lg border text-center ${
          isDarkMode ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-white border-gray-200 text-gray-500"
        }`}
      >
        {t("common.noData")}
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-lg shadow-sm border overflow-x-auto ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <table
        className={`min-w-full divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}
      >
        <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className={`divide-y ${isDarkMode ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}
        >
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`transition-colors ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-900"
                  }`}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
