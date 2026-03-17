"use client"

import { Outlet } from "react-router-dom"
interface CurrentPathname {
  name: string;
}

interface SubRoutesProps {
  currentPathname?: CurrentPathname
  subroutes?: {
    name?: string
    href?: string
  }[]
}
const MaintenancePage:React.FC<SubRoutesProps> = () => {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Outlet />
    </div>
  )
}
export default MaintenancePage;