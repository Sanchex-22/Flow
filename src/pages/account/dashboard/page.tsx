"use client"

import { Outlet } from "react-router-dom"
import { CurrentPathname } from "../../../components/layouts/main"
import { useTheme } from "../../../context/themeContext"


interface SubRoutesProps {
    currentPathname?: CurrentPathname
  subroutes?: {
    name?: string
    href?: string
  }[]
}
const DashboardPage:React.FC<SubRoutesProps> = () => {
  const { isDarkMode, } = useTheme();
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1c1c1e] text-white' : 'bg-gray-50 text-gray-900'} px-3 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 flex flex-col`}>
      <Outlet />
    </div>
  )
}
export default DashboardPage;