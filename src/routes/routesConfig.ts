
import { Building2, LayoutDashboard, LucideBookUser, ShieldCheck, TicketIcon, Users } from "lucide-react";
import { DashboardIcon, DevicesIcon, DocumentIcon, InventoryIcon, MaintenanceIcon, NetworkIcon, ReportsIcon, SettingsIcon, UsersIcon } from "../components/icons/icons";
import { UserProfile } from "../context/userProfileContext";
import { authRoles } from "../diccionary/constants";
import { FaMoneyBill, FaKey } from "react-icons/fa";

export type RouteGroup = 'PRINCIPAL' | 'REPORTES' | 'CONFIGURACIÓN' | 'ADMINISTRACIÓN';

const routesConfig = [
  {
    icon: DashboardIcon,
    name: "Dashboard",
    href: "/dashboard/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator, authRoles.user],
    subroutes: [
      { name: "Dashboard", href: "/dashboard/all" },
    ]
  },
  {
    icon: InventoryIcon,
    name: "Inventory",
    href: "/inventory/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "All Inventory", href: "/inventory/all" },
    ]
  },

  {
    icon: DevicesIcon,
    name: "Devices",
    href: "/devices/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "All devices", href: "/devices/all" },
    ]
  },
  {
    icon: MaintenanceIcon,
    name: "Maintenance",
    href: "/maintenance/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "All maintenance", href: "/maintenance/all" },
      { name: "Create maintenance", href: "/maintenance/create" },
      { name: "Edit maintenance", href: "/maintenance/edit" },
    ]
  },
  {
    icon: NetworkIcon,
    name: "Network",
    href: "/network/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "All Network", href: "/network/all" },
    ]
  },
  {
    icon: UsersIcon,
    name: "Users",
    href: "/settings/users/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "Create User", href: "/settings/users/create" },
      { name: "Edit User", href: "/settings/users/edit" },
    ]
  },
  {
    disable:false,
    icon: LucideBookUser,
    name: "Persons",
    href: "/persons/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "Create Person", href: "/persons/create" },
      { name: "Edit Person", href: "/persons/edit" },
    ]
  },
  {
    icon: ReportsIcon,
    name: "Reports",
    href: "/reports/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "IT Reports", href: "/reports/all" },
    ]
  },
  {
    icon: TicketIcon,
    name: "Tickets",
    href: "/tickets/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "Tickets", href: "/tickets/all" },
    ]
  },
  {
    icon: FaMoneyBill,
    name: "Expenses",
    href: "/expenses/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "Expenses", href: "/expenses/all" },
      { name: "Expense Detail", href: "/expenses/edit" },
    ]
  },
  {
    icon: FaKey,
    name: "Licenses",
    href: "/licenses/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "All Licenses", href: "/licenses/all" },
      { name: "Create License", href: "/licenses/create" },
    ]
  },
  {
    icon: DocumentIcon,
    name: "Documents",
    href: "/documents/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "All Documents", href: "/documents/all" },
      { name: "Upload Document", href: "/documents/create" },
    ]
  },
  {
    icon: SettingsIcon,
    name: "Settings",
    href: "/settings/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "My Settings", href: "/settings/all" },

    ]
  },
    // --- Panel exclusivo GLOBAL_ADMIN ---
  {
    disable: false,
    icon: LayoutDashboard,
    name: "AdminOverview",
    href: "/admin/overview",
    group: 'ADMINISTRACIÓN' as RouteGroup,
    roles: [authRoles.global_admin],
    subroutes: [
      { name: "Resumen", href: "/admin/overview" },
    ]
  },
  {
    disable: false,
    icon: Building2,
    name: "AdminCompanies",
    href: "/admin/companies",
    group: 'ADMINISTRACIÓN' as RouteGroup,
    roles: [authRoles.global_admin],
    subroutes: [
      { name: "Empresas", href: "/admin/companies" },
    ]
  },
  {
    disable: false,
    icon: Users,
    name: "AdminUsers",
    href: "/admin/users",
    group: 'ADMINISTRACIÓN' as RouteGroup,
    roles: [authRoles.global_admin],
    subroutes: [
      { name: "Usuarios", href: "/admin/users" },
    ]
  },
  {
    disable: false,
    icon: ShieldCheck,
    name: "AdminLicenses",
    href: "/admin/licenses",
    group: 'ADMINISTRACIÓN' as RouteGroup,
    roles: [authRoles.global_admin],
    subroutes: [
      { name: "Licencias", href: "/admin/licenses" },
    ]
  },
];

export default routesConfig;


const getRoutesForRole = (roleKey: keyof typeof authRoles) => {
  const role = authRoles[roleKey];

  if (!role) {
    return [];
  }

  const filteredRoutes = routesConfig.reduce((acc: string[], route) => {
    if (route.roles.includes(role)) {
      acc.push(route.href);

      route.subroutes.forEach(subroute => {
        acc.push(subroute.href);
      });
    }
    return acc;
  }, []);

  return filteredRoutes;
};
export { getRoutesForRole };

const getMainRoutesForRole = (roleKey: keyof typeof authRoles | string) => {
  const role = (authRoles as Record<string, string>)[roleKey] || authRoles.user;
  if (!role) {
    return [];
  }

  const filteredRoutes = routesConfig.filter((route) => route.roles.includes(role) && !route.disable);

  return filteredRoutes;
};

export { getMainRoutesForRole };


export const getUserRoles = (profile: UserProfile) => {
  if (!profile.roles) {
    return ["user"];
  }

  const validRoles = ["global_admin", "super_admin", "admin", "moderator", "user"];

  const rolesArray = profile.roles
    .split(',')
    .map((role) => role.trim().toLowerCase())
    .filter((role) => validRoles.includes(role));

  return rolesArray.length > 0 ? rolesArray : ["user"];
};