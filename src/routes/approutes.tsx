import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import LoginPage from "../pages/auth/loginPage";
// import Dashboard from "../pages/account/principal";
import ProtectedLogin from "./protectedLogin";
import ProtectedRoute from "./protectedRoutes";
import useUser from "../hook/useUser";
import { CurrentPathname } from "../components/layouts/main";
import EnvolveLayout from "../components/layouts/childLayout";
import CertificatesSection from "../pages/account/quotes/certificatesSection";
import ServicesSection from "../pages/account/quotes/servicesSection";
import { authRoles } from "../diccionary/constants";
import routesConfig, { getUserRoles } from "./routesConfig";
import useUserProfile from "../hook/userUserProfile";
import NotFound from "../pages/public_pages/not_found";
import Dashboard from "../pages/account/dashboard";
import Inventory from "../pages/account/inventory/inventory";
import ReportsPage from "../pages/account/reports/pages";
import DevicesPage from "../pages/account/devices/devices";
import NextworkPage from "../pages/account/network/network";
import MaintenancePage from "../pages/account/maintenance/page";
import UsersPage from "../pages/account/users/page";
import SettingsPage from "../pages/account/settings/page";
import ProfilePage from "../pages/account/profile/page";
import { Company } from "../components/layouts/slideBar";
import { useCompany } from "../context/routerContext";

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
  companies: Company[];
};

export const AppRoutes: React.FC<Props> = ({ pathnameLocation, companies }) => {
  const { pathname } = useLocation();
  const initialPathSet = useRef(false);
  const { isLogged } = useUser();
    const { selectedCompany } = useCompany();
  const code = `${selectedCompany?.code || "default-code"}`;
  const { profile } = useUserProfile();
  useEffect(() => {
    if (!isLogged) {
      if (!initialPathSet.current && pathname !== "/") {
        localStorage.setItem("externalUrl", pathname);
        initialPathSet.current = true;
      }
    }
  }, [isLogged, pathname]);

  const userRole = profile?.roles ? getUserRoles(profile) : ["user"];
  const user: User = {
    isSignedIn: isLogged,
    roles: userRole,
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
              companies={companies}
            >
              <LoginPage />
            </EnvolveLayout>
          </ProtectedLogin>
        }
      />
      <Route
        path={`/:${code}/dashboard/*`}
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
              title="Dashboard"
              description="Dashboard"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
              companies={companies}
            >
              <Dashboard
                subroutes={
                  routesConfig.find((route) => route.name === "Dashboard")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="certificates" element={<CertificatesSection />} />
        <Route path="services" element={<ServicesSection />} />
      </Route>

      <Route
        path={`/:${code}/inventory/*`}
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
              title="Inventory"
              description="Inventory"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
              companies={companies}
            >
              <Inventory
                // subroutes={
                //   routesConfig.find((route) => route.name === "Inventory")
                //     ?.subroutes || []
                // }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="certificates" element={<CertificatesSection />} />
        <Route path="services" element={<ServicesSection />} />
        <Route path="all" element={<></>} />
      </Route>

      <Route
        path={`/:${code}/devices/*`}
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
              title="devices"
              description="devices"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
              companies={companies}
            >
              <DevicesPage
                // subroutes={
                //   routesConfig.find((route) => route.name === "reports")
                //     ?.subroutes || []
                // }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<></>} />
      </Route>

      <Route
        path={`/:${code}/network/*`}
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
              title="network"
              description="network"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
              companies={companies}
            >
              <NextworkPage
                // subroutes={
                //   routesConfig.find((route) => route.name === "reports")
                //     ?.subroutes || []
                // }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<></>} />
      </Route>

      <Route
        path={`/:${code}/maintenance/*`}
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
              title="maintenance"
              description="maintenance"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
              companies={companies}
            >
              <MaintenancePage
                // subroutes={
                //   routesConfig.find((route) => route.name === "reports")
                //     ?.subroutes || []
                // }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<></>} />
      </Route>

      <Route
        path={`/:${code}/users/*`}
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
              <UsersPage
                // subroutes={
                //   routesConfig.find((route) => route.name === "reports")
                //     ?.subroutes || []
                // }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<></>} />
      </Route>

      <Route
        path={`/:${code}/reports/*`}
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
              companies={companies}
            >
              <ReportsPage
                // subroutes={
                //   routesConfig.find((route) => route.name === "reports")
                //     ?.subroutes || []
                // }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<></>} />
      </Route>

      <Route
        path={`/:${code}/settings/*`}
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
              title="settings"
              description="settings"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
              companies={companies}
            >
              <SettingsPage
                // subroutes={
                //   routesConfig.find((route) => route.name === "reports")
                //     ?.subroutes || []
                // }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<></>} />
      </Route>

      <Route
        path={`/:${code}/profile/:id/*`}
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
              companies={companies}
            >
              <ProfilePage
                userId ={profile?.id || "default-id"}
                // subroutes={
                //   routesConfig.find((route) => route.name === "users")
                //     ?.subroutes || []
                // }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
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
