import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import LoginPage from "../pages/auth/loginPage";
import ProtectedLogin from "./protectedLogin";
import ProtectedRoute from "./protectedRoutes";
import useUser from "../hook/useUser";
import { CurrentPathname } from "../components/layouts/main";
import EnvolveLayout from "../components/layouts/childLayout";
import { authRoles } from "../diccionary/constants";
import routesConfig, { getUserRoles } from "./routesConfig";
import useUserProfile from "../hook/userUserProfile";
import NotFound from "../pages/public_pages/not_found";
import DevicesPage from "../pages/account/devices/devices";
import NextworkPage from "../pages/account/network/network";
import ProfilePage from "../pages/account/profile/page";
import { Company } from "../components/layouts/slideBar";
import { useCompany } from "../context/routerContext";
import CreateUserPage from "../pages/account/users/components/CreatePage";
import AllDevices from "../pages/account/devices/components/AllDevices";
import UpdateDevicesPage from "../pages/account/devices/components/updateDevicesPage";
import AllNetwork from "../pages/account/network/components/AllNetwork";
import UpdateNetworkPage from "../pages/account/network/components/updateNetwork";
import UpdateMaintenancePage from "../pages/account/maintenance/components/updateMaintenance";
import AllMaintenance from "../pages/account/maintenance/components/AllMaintenance";
import MaintenancePage from "../pages/account/maintenance/page";
import { CompanySelector } from "../pages/account/companies/companies";
import ProtectedCompanyRoute from "./protectedCompanyRoute";
import NetworkProvidersPage from "../pages/account/network/components/AllProvider";
import UpdateNetworkProviderPage from "../pages/account/network/components/updateNetworkProvider";
import TicketPage from "../pages/account/tickets/page";
import EditTicketPage from "../pages/account/tickets/[id]/page";
import ExpenseDetailPage from "../pages/account/expense/[id]/updateExpense";
import ExpensePage from "../pages/account/expense/page";
import AllExpensePage from "../pages/account/expense/components/allExpense";
import ReportsPage from "../pages/account/reports/page";
import AllReportsPage from "../pages/account/reports/components/allReportPage";
// import DashboardPage from "../pages/account/dashboard/page";
// import AllDashboard from "../pages/account/dashboard/components/allDashboard";
import InventoryPage from "../pages/account/inventory/page";
import AllInventory from "../pages/account/inventory/components/allInventory";
import UpdateExpensePage from "../pages/account/expense/components/updateExpense";
import { AllUsers } from "../pages/account/users/components/AllUsers";
import { AllTickets } from "../pages/account/tickets/components/AllTickets";
import UpdateCompany from "../pages/account/settings/components/updateCompany";
import SettingsPage from "../pages/account/settings/page";
import AllSettingsPage from "../pages/account/settings/components/allSettingsPage";
import { UpdateDepartment } from "../pages/account/settings/components/updateDepartment";
import AllCompaniesPage from "../pages/account/settings/components/AllCompaniesPage";
import AllDepartmentsPage from "../pages/account/settings/components/AllDepartmentsPage";
import PersonPage from "../pages/account/person/page";
import { AllPersons } from "../pages/account/person/components/AllPersons";
import CreatePersonPage from "../pages/account/person/components/UpdatePerson";
import AIDashboard from "../pages/account/dashboard/components/AIDashboard";
import LicensesPage from "../pages/account/licenses/page";
import AllLicenses from "../pages/account/licenses/components/AllLicenses";
import UpdateLicense from "../pages/account/licenses/components/UpdateLicense";
import DocumentsPage from "../pages/account/documents/page";
import AllDocuments from "../pages/account/documents/components/AllDocuments";
import UpdateDocument from "../pages/account/documents/components/UpdateDocument";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ProtectedAdminRoute from "./protectedAdminRoute";
import { AdminLicenses } from "../pages/admin/licenses/AdminLicenses";
import { AdminPlans } from "../pages/admin/plans/AdminPlans";
import { AdminLicenseForm } from "../pages/admin/licenses/AdminLicenseForm";
import { AdminUserForm } from "../pages/admin/users/AdminUserForm";
import { AdminUsers } from "../pages/admin/users/AdminUsers";
import { AdminCompanyForm } from "../pages/admin/companies/AdminCompanyForm";
import { AdminCompanies } from "../pages/admin/companies/AdminCompanies";
import { AdminOverview } from "../pages/admin/overview/AdminOverview";
import SetupCompany from "../pages/onboarding/SetupCompany";

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
  companies?: Company[];
};

export const AppRoutes: React.FC<Props> = ({ pathnameLocation, companies }) => {
  const { pathname } = useLocation();
  const initialPathSet = useRef(false);
  const { isLogged } = useUser();
  const { companies: userCompanies, isLoadingCompanies } = useCompany();
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
            title="IT | Home"
            description="IT | Home"
            isLogged={isLogged}
            profile={profile}
            currentPathname={pathnameLocation}
            publicRoute={true}
            companies={companies}
          >
            <LoginPage />
          </EnvolveLayout>
        }
      />
      <Route path="/home" element={<Navigate to="/" replace />} />

      {/* Password recovery — public */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Ruta fija — usada tras el login para evitar dependencia del code */}
      <Route
        path="/select-company"
        element={
          <ProtectedCompanyRoute isLogged={isLogged}>
            <CompanySelector profile={profile} />
          </ProtectedCompanyRoute>
        }
      />
      {/* Onboarding — crear primera empresa (solo si no tiene empresa aún) */}
      <Route
        path="/setup"
        element={
          !isLogged
            ? <Navigate to="/" replace />
            : isLoadingCompanies
              ? null
              : (userCompanies && userCompanies.length > 0)
                ? <Navigate to="/select-company" replace />
                : <SetupCompany />
        }
      />
      {/* Settings sin empresa — accesible mientras el usuario no haya creado su empresa */}
      <Route
        path="/setup/settings/*"
        element={
          !isLogged
            ? <Navigate to="/" replace />
            : (userCompanies && userCompanies.length > 0)
              ? <Navigate to="/select-company" replace />
              : (
                <EnvolveLayout
                  title="Configuración"
                  description="Configuración de cuenta"
                  isLogged={isLogged}
                  profile={profile}
                  currentPathname={pathnameLocation}
                  publicRoute={false}
                  companies={companies}
                >
                  <SettingsPage />
                </EnvolveLayout>
              )
        }
      >
        <Route path="all" element={<AllSettingsPage />} />
        <Route path="create" element={<UpdateCompany />} />
        <Route path="edit/:id" element={<UpdateCompany />} />
        <Route path="departments/edit" element={<UpdateDepartment />} />
        <Route path="departments/create" element={<UpdateDepartment />} />
      </Route>

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
        path="/:companyCode/select-company"
        element={
          <ProtectedCompanyRoute isLogged={isLogged}>
            <CompanySelector profile={profile} />
          </ProtectedCompanyRoute>
        }
      />

      <Route
        path="/:companyCode/dashboard/*"
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
              <AIDashboard
                currentPathname={pathnameLocation}
                // subroutes={
                //   routesConfig.find((route) => route.name === "Dashboard")
                //     ?.subroutes || []
                // }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<AIDashboard/>} />
      </Route>

      <Route
        path={`/:companyCode/inventory/*`}
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
              <InventoryPage
                subroutes={
                  routesConfig.find((route) => route.name === "Inventory")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<AllInventory/>} />
        <Route path="create" element={<UpdateDevicesPage/>} />
        <Route path="edit/:id" element={<UpdateDevicesPage/>} />
      </Route>

      <Route
        path={`/:companyCode/devices/*`}
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
                subroutes={
                  routesConfig.find((route) => route.name === "Devices")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<AllDevices/>} />
        <Route path="create" element={<UpdateDevicesPage/>} />
        <Route path="edit/:id" element={<UpdateDevicesPage/>} />
      </Route>

      <Route
        path="/:companyCode/network/*"
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
        <Route path="all" element={<AllNetwork/>} />
        <Route path="providers" element={<NetworkProvidersPage/>} />
        <Route path="create" element={<UpdateNetworkPage/>} />
        <Route path="edit/:id" element={<UpdateNetworkPage/>} />
        <Route path="create-provider" element={<UpdateNetworkProviderPage/>} />
        <Route path="edit-provider/:id" element={<UpdateNetworkProviderPage/>} />
      </Route>

      <Route
        path={`/:companyCode/maintenance/*`}
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
                currentPathname={pathnameLocation}
                subroutes={
                  routesConfig.find((route) => route.name === "Maintenance")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<AllMaintenance currentPathname={pathnameLocation}/>} />
        <Route path="create" element={<UpdateMaintenancePage currentPathname={pathnameLocation}/>} />
        <Route path="edit/:id" element={<UpdateMaintenancePage currentPathname={pathnameLocation}/>} />
      </Route>

      <Route
        path={`/:companyCode/persons/*`}
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
              title="persons"
              description="persons"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
            >
              <PersonPage
                subroutes={
                  routesConfig.find((route) => route.name === "Persons")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<AllPersons />} />
        <Route path="create" element={<CreatePersonPage />} />
        <Route path="edit/:id" element={<CreatePersonPage />} />
      </Route>

      <Route
        path={`/:companyCode/reports/*`}
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
                subroutes={
                  routesConfig.find((route) => route.name === "Reports")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<AllReportsPage/>} />
      </Route>

      <Route
        path={`/:companyCode/tickets/*`}
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
              title="tickets"
              description="tickets"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
              companies={companies}
            >
              <TicketPage
                // subroutes={
                //   routesConfig.find((route) => route.name === "reports")
                //     ?.subroutes || []
                // }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<AllTickets/>} />
        <Route path="create" element={<EditTicketPage/>}/>
        <Route path="edit/:id" element={<EditTicketPage/>}/>
      </Route>

      <Route
        path={`/:companyCode/expenses/*`}
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
              title="Expenses"
              description="Expense Page"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
              companies={companies}
            >
              <ExpensePage
                subroutes={
                  routesConfig.find((route) => route.name === "Expenses")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<AllExpensePage/>} />
        <Route path="create" element={<UpdateExpensePage/>} />
        <Route path="edit/:id" element={<ExpenseDetailPage/>} />
      </Route>

      <Route
        path={`/:companyCode/settings/*`}
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
        <Route path="all" element={<AllSettingsPage />} />
        {/* Companies */}
        <Route path="companies" element={<AllCompaniesPage />} />
        <Route path="create" element={<UpdateCompany />} />
        <Route path="edit/:id" element={<UpdateCompany />} />
        {/* Departments */}
        <Route path="departments" element={<AllDepartmentsPage />} />
        <Route path="departments/edit" element={<UpdateDepartment />} />
        <Route path="departments/create" element={<UpdateDepartment />} />
        {/* Users */}
        <Route path="users/all" element={<AllUsers />} />
        <Route path="users/create" element={<CreateUserPage />} />
        <Route path="users/edit/:id" element={<CreateUserPage />} />
      </Route>

      <Route
        path={`/:companyCode/profile/:id/*`}
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
        path={`/:companyCode/licenses/*`}
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
              title="Licenses"
              description="Software Licenses"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
              companies={companies}
            >
              <LicensesPage
                subroutes={
                  routesConfig.find((route) => route.name === "Licenses")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<AllLicenses />} />
        <Route path="create" element={<UpdateLicense />} />
        <Route path="edit/:id" element={<UpdateLicense />} />
      </Route>

      <Route
        path={`/:companyCode/documents/*`}
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
              title="Documents"
              description="Documents"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
              companies={companies}
            >
              <DocumentsPage
                subroutes={
                  routesConfig.find((route) => route.name === "Documents")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="all" element={<AllDocuments />} />
        <Route path="create" element={<UpdateDocument />} />
        <Route path="edit/:id" element={<UpdateDocument />} />
      </Route>

      {/* ── Panel Global Admin ───────────────────────────────────────── */}
      <Route
        path="/admin/overview"
        element={
          <ProtectedAdminRoute>
            <EnvolveLayout
              title="Admin — Resumen"
              description="Panel de administración global"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
              companies={companies}
            >
              <AdminOverview />
            </EnvolveLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <ProtectedAdminRoute>
            <EnvolveLayout
              title="Admin — Empresas"
              description="Gestión de empresas"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
              companies={companies}
            >
              <AdminCompanies />
            </EnvolveLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/companies/create"
        element={
          <ProtectedAdminRoute>
            <EnvolveLayout title="Admin — Nueva Empresa" description="Crear empresa" isLogged={isLogged} profile={profile} currentPathname={pathnameLocation} publicRoute={false} companies={companies}>
              <AdminCompanyForm />
            </EnvolveLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/companies/edit/:id"
        element={
          <ProtectedAdminRoute>
            <EnvolveLayout title="Admin — Editar Empresa" description="Editar empresa" isLogged={isLogged} profile={profile} currentPathname={pathnameLocation} publicRoute={false} companies={companies}>
              <AdminCompanyForm />
            </EnvolveLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedAdminRoute>
            <EnvolveLayout
              title="Admin — Usuarios"
              description="Gestión de usuarios"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
              companies={companies}
            >
              <AdminUsers />
            </EnvolveLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/users/create"
        element={
          <ProtectedAdminRoute>
            <EnvolveLayout title="Admin — Nuevo Usuario" description="Crear usuario admin" isLogged={isLogged} profile={profile} currentPathname={pathnameLocation} publicRoute={false} companies={companies}>
              <AdminUserForm />
            </EnvolveLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/users/edit/:id"
        element={
          <ProtectedAdminRoute>
            <EnvolveLayout title="Admin — Editar Usuario" description="Editar usuario admin" isLogged={isLogged} profile={profile} currentPathname={pathnameLocation} publicRoute={false} companies={companies}>
              <AdminUserForm />
            </EnvolveLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/licenses/edit/:userId"
        element={
          <ProtectedAdminRoute>
            <EnvolveLayout title="Admin — Licencia" description="Editar licencia" isLogged={isLogged} profile={profile} currentPathname={pathnameLocation} publicRoute={false} companies={companies}>
              <AdminLicenseForm />
            </EnvolveLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/plans"
        element={
          <ProtectedAdminRoute>
            <EnvolveLayout
              title="Admin — Planes"
              description="Planes disponibles"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
              companies={companies}
            >
              <AdminPlans />
            </EnvolveLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/licenses"
        element={
          <ProtectedAdminRoute>
            <EnvolveLayout
              title="Admin — Licencias"
              description="Gestión de licencias"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
              companies={companies}
            >
              <AdminLicenses />
            </EnvolveLayout>
          </ProtectedAdminRoute>
        }
      />


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
