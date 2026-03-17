"use client"

import { Outlet } from "react-router-dom"
import { useTheme } from "../../../context/themeContext"


interface SubRoutesProps {
  subroutes: {
    name: string
    href: string
  }[]
}
const InventoryPage:React.FC<SubRoutesProps> = () => {
  const { isDarkMode, } = useTheme();
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1c1c1e] text-white' : 'bg-gray-100 text-gray-900'} p-6 flex flex-col`}>
      <Outlet />
    </div>
  )
}
export default InventoryPage;