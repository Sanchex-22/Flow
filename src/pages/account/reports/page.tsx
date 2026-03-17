"use client"

import { Outlet } from "react-router-dom"
import { useTheme } from "../../../context/themeContext"


interface SubRoutesProps {
  subroutes?: {
    name?: string
    href?: string
  }[]
}
const ReportsPage:React.FC<SubRoutesProps> = () => {
  const { isDarkMode, } = useTheme();
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Outlet />
    </div>
  )
}
export default ReportsPage;