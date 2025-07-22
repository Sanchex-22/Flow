import { Navigate, useLocation} from "react-router-dom";
import { User } from "./approutes";
interface ProtectedRouteProps {
  auth: User;
  allowedRoles: string[];
  children: React.ReactNode;
  isLogged: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ auth, allowedRoles, children, isLogged }) => {
  const location = useLocation();
  if (!isLogged) {
    return <Navigate to="/" replace={false} state={{ from: location }} />
  }

  if (!auth.roles.some(role => allowedRoles.includes(role))) {
    return <Navigate to={"/account"} replace={false} state={{ from: location }} />
  }

  return children
}
export default ProtectedRoute
