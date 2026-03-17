"use client"

import { Outlet } from "react-router-dom"


interface SubRoutesProps {
  subroutes?: {
    name?: string
    href?: string
  }[]
}
const ReportsPage:React.FC<SubRoutesProps> = () => {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Outlet />
    </div>
  )
}
export default ReportsPage;