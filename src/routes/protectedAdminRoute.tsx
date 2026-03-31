import { Navigate } from "react-router-dom"
import useUserProfile from "../hook/userUserProfile"
import useUser from "../hook/useUser"
import { getUserRoles } from "./routesConfig"

interface Props {
  children: React.ReactNode
}

/**
 * Ruta exclusiva para GLOBAL_ADMIN.
 * - Si no está logueado → /login
 * - Si está logueado pero el perfil aún no cargó → esperar (null)
 * - Si el perfil cargó y no es global_admin → /login
 */
const ProtectedAdminRoute = ({ children }: Props) => {
  const { isLogged } = useUser()
  const { profile } = useUserProfile()

  // No logueado → login
  if (!isLogged) {
    return <Navigate to="/" replace />
  }

  // Logueado pero perfil aún inicializando → esperar sin redirigir
  if (!profile) {
    return null
  }

  const roles = getUserRoles(profile)
  if (!roles.includes("global_admin")) {
    return <Navigate to="/select-company" replace />
  }

  return <>{children}</>
}

export default ProtectedAdminRoute
