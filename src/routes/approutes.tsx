import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import LoginPage from "../pages/auth/loginPage";
import Dashboard from "../pages/account/principal";
import ProtectedLogin from "./protectedLogin";
import ProtectedRoute from "./protectedRoutes";
import useUser from "../hook/useUser";
import { CurrentPathname } from "../components/layouts/main";
import EnvolveLayout from "../components/layouts/childLayout";
import { QuotesSection } from "../pages/account/quotes/quotesSection";
import CertificatesSection from "../pages/account/quotes/certificatesSection";
import ServicesSection from "../pages/account/quotes/servicesSection";
import { authRoles } from "../diccionary/constants";
import routesConfig from "./routesConfig";
import useUserProfile from "../hook/userUserProfile";
import QuoteDetailPage from "../pages/account/quotes/id/quoteDetail";
import NotFound from "../pages/public_pages/not_found";

// Tipado de usuario
export interface User {
  isSignedIn: boolean;
  roles: string[];
  redirectPath: string | null;
}

export interface UserContextValue {
  jwt: string | null;
  setJWT: React.Dispatch<React.SetStateAction<string | null>>;
}

type Props = {
  pathnameLocation: CurrentPathname;
};

export const AppRoutes: React.FC<Props> = ({ pathnameLocation }) => {
  const { pathname } = useLocation();
  const initialPathSet = useRef(false);
  const { isLogged } = useUser();
  const { profile } = useUserProfile();
  useEffect(() => {
    if (!isLogged) {
      if (!initialPathSet.current && pathname !== "/") {
        localStorage.setItem("externalUrl", pathname);
        initialPathSet.current = true;
      }
    }
  }, [isLogged, pathname]);

  const userRole = profile?.roles || "user";
  const user: User = {
    isSignedIn: isLogged,
    roles: [userRole],
    redirectPath: localStorage.getItem("externalUrl"),
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <EnvolveLayout
            title="FlowRH | Home"
            description="FlowRH | Home"
            isLogged={isLogged}
            profile={profile}
            currentPathname={pathnameLocation}
            publicRoute={true}
          >
            <LoginPage />
          </EnvolveLayout>
        }
      />
      <Route path="/home" element={<Navigate to="/" replace />} />

      <Route
        path="/login"
        element={
          <ProtectedLogin auth={user}>
            <EnvolveLayout
              title="Login"
              description="Login"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={true}
            >
              <LoginPage />
            </EnvolveLayout>
          </ProtectedLogin>
        }
      />
      <Route
        path="/account/*"
        element={
          <ProtectedRoute
            isLogged={isLogged}
            auth={user}
            allowedRoles={[
              authRoles.user,
              authRoles.admin,
              authRoles.moderator,
              authRoles.super_admin,
            ]}
          >
            <EnvolveLayout
              title="account"
              description="account"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
            >
              <Dashboard
                subroutes={
                  routesConfig.find((route) => route.name === "account")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="quotes" 
        element={
          <QuotesSection />
        } 
        />
        <Route path="quotes/:id" 
        element={
          <QuoteDetailPage />
        } 
        />
        <Route path="certificates" element={<CertificatesSection />} />
        <Route path="services" element={<ServicesSection />} />
      </Route>

      <Route
        path="/users/*"
        element={
          <ProtectedRoute
            isLogged={isLogged}
            auth={user}
            allowedRoles={[
              authRoles.user,
              authRoles.admin,
              authRoles.moderator,
              authRoles.super_admin,
            ]}
          >
            <EnvolveLayout
              title="users"
              description="users"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
            >
              <Dashboard
                subroutes={
                  routesConfig.find((route) => route.name === "users")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<></>} />
      </Route>

      <Route
        path="/certs/*"
        element={
          <ProtectedRoute
            isLogged={isLogged}
            auth={user}
            allowedRoles={[
              authRoles.user,
              authRoles.admin,
              authRoles.moderator,
              authRoles.super_admin,
            ]}
          >
            p
            <EnvolveLayout
              title="certs"
              description="certs"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
            >
              <Dashboard
                subroutes={
                  routesConfig.find((route) => route.name === "certificates")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<></>} />
      </Route>

      <Route
        path="/clients/*"
        element={
          <ProtectedRoute
            isLogged={isLogged}
            auth={user}
            allowedRoles={[
              authRoles.user,
              authRoles.admin,
              authRoles.moderator,
              authRoles.super_admin,
            ]}
          >
            <EnvolveLayout
              title="clients"
              description="clients"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
            >
              <Dashboard
                subroutes={
                  routesConfig.find((route) => route.name === "clients")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<></>} />
      </Route>

      <Route
        path="/task/*"
        element={
          <ProtectedRoute
            isLogged={isLogged}
            auth={user}
            allowedRoles={[
              authRoles.user,
              authRoles.admin,
              authRoles.moderator,
              authRoles.super_admin,
            ]}
          >
            <EnvolveLayout
              title="task"
              description="task"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
            >
              <Dashboard
                subroutes={
                  routesConfig.find((route) => route.name === "task")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<></>} />
      </Route>

      <Route
        path="/reports/*"
        element={
          <ProtectedRoute
            isLogged={isLogged}
            auth={user}
            allowedRoles={[
              authRoles.user,
              authRoles.admin,
              authRoles.moderator,
              authRoles.super_admin,
            ]}
          >
            <EnvolveLayout
              title="reports"
              description="reports"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
            >
              <Dashboard
                subroutes={
                  routesConfig.find((route) => route.name === "reports")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<></>} />
      </Route>

      <Route
        path="*"
        element={
          <EnvolveLayout
            title="No Found"
            description="No Found"
            isLogged={isLogged}
            profile={profile}
            currentPathname={pathnameLocation}
            publicRoute={true}
          >
            <NotFound />
          </EnvolveLayout>
        }
      />
    </Routes>
  );
};
