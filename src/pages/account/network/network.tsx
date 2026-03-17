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
    <div className="flex-1 flex flex-col min-w-0">
      {/* Barra de navegación/switch */}
      <nav className={`border-b mb-4 transition-colors ${
        isDarkMode ? 'border-white/[0.08]' : 'border-gray-200'
      }`}>
        <ul className="flex gap-1 pb-1 overflow-x-auto">
          <li>
            <NavLink
              to={`all`}
              className={({ isActive }) =>
                `text-sm font-medium py-1.5 px-3 rounded-lg transition-colors duration-200 whitespace-nowrap ${
                  isActive
                    ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    : isDarkMode ? 'text-[#8e8e93] hover:text-white hover:bg-white/[0.06]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                `text-sm font-medium py-1.5 px-3 rounded-lg transition-colors duration-200 whitespace-nowrap ${
                  isActive
                    ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    : isDarkMode ? 'text-[#8e8e93] hover:text-white hover:bg-white/[0.06]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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