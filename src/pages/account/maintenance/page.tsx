"use client"

import { Outlet } from "react-router-dom"


interface SubRoutesProps {
  subroutes?: {
    name?: string
    href?: string
  }[]
}
const MaintenancePage:React.FC<SubRoutesProps> = () => {

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <Outlet />
    </div>
  )
}
export default MaintenancePage;