// src/components/NetworkPage.tsx
"use client";

import { Outlet, NavLink } from "react-router-dom";
import React from "react";
import { useTheme } from "../../../context/themeContext";

interface SubRoutesProps {
  subroutes?: {
    name?: string;
    href?: string;
  }[];
}

const NetworkPage: React.FC<SubRoutesProps> = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`px-6 py-4 transition-colors ${
      isDarkMode
        ? 'bg-slate-900 text-gray-100'
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Barra de navegación/switch */}
      <nav className={`border-b mb-4 py-2 transition-colors ${
        isDarkMode
          ? 'border-slate-700'
          : 'border-gray-300'
      }`}>
        <ul className="flex gap-4 py-2">
          <li>
            <NavLink
              to={`all`}
              className={({ isActive }) =>
                `text-lg font-medium py-2 px-4 rounded-md transition-colors duration-200 ${
                  isActive
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`
              }
            >
              Conexiones de Red Local
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`providers`}
              className={({ isActive }) =>
                `text-lg font-medium py-2 px-4 rounded-md transition-colors duration-200 ${
                  isActive
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`
              }
            >
              Proveedores de Red
            </NavLink>
          </li>
        </ul>
      </nav>

      <Outlet />
    </div>
  );
};

export default NetworkPage;