import { Navigate, useLocation } from "react-router-dom";
import { User } from "./approutes";
import { getUserRoles } from "./routesConfig";
import useUserProfile from "../hook/userUserProfile";

interface ProtectedLoginProps {
  auth: User;
  children: React.ReactNode;
}

const ProtectedLogin: React.FC<ProtectedLoginProps> = ({ auth, children }) => {
  const location = useLocation();
  const { profile } = useUserProfile();

  if (auth.isSignedIn === true) {
    // Prefer a saved external URL (e.g. deep link before login)
    const redirectPath = localStorage.getItem("externalUrl");
    if (redirectPath) {
      localStorage.removeItem("externalUrl");
      return <Navigate to={redirectPath} replace state={{ from: location }} />;
    }

    // Role-based fallback redirect
    if (profile) {
      const roles = getUserRoles(profile);
      if (roles.includes("global_admin")) {
        return <Navigate to="/admin/overview" replace state={{ from: location }} />;
      }
    }

    return <Navigate to="/select-company" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedLogin;
