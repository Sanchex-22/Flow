"use client"
import { Outlet } from "react-router-dom"
import { useTheme } from "../../../context/themeContext"

// layout for the users page
// this will render the Outlet for nested routes like /users/all, /users/create, etc.

interface SubRoutesProps {
  subroutes?: {
    name?: string
    href?: string
  }[]
}

const PersonPage:React.FC<SubRoutesProps> = () => {
  const { isDarkMode, } = useTheme();
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Outlet />
    </div>
  )
}
export default PersonPage;