
import { TicketIcon } from "lucide-react";
import { DashboardIcon, DevicesIcon, InventoryIcon, MaintenanceIcon, NetworkIcon, ReportsIcon, SettingsIcon, UsersIcon } from "../components/icons/icons";
import { UserProfile } from "../context/userProfileContext";
import { authRoles } from "../diccionary/constants";
import { FaMoneyBill } from "react-icons/fa";

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
      { name: "View Certificates", href: "/inventory/view" },
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
      { name: "All Clients", href: "/network/all" },
    ]
  },
  {
    icon: UsersIcon,
    name: "Users",
    href: "/users/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "Create User", href: "/users/create" },
      { name: "Edit User", href: "/users/edit" },
    ]
  },
  {
    icon: ReportsIcon,
    name: "Reports",
    href: "/reports/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "Sales Reports", href: "/reports/all" },
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
    icon: SettingsIcon,
    name: "Settings",
    href: "/settings/all",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "My Settings", href: "/settings/all" },

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

const getMainRoutesForRole = (roleKey: keyof typeof authRoles) => {
  const role = authRoles[roleKey] || authRoles.user;
  if (!role) {
    return [];
  }

  const filteredRoutes = routesConfig.filter((route) => route.roles.includes(role));

  return filteredRoutes;
};

export { getMainRoutesForRole };


export const getUserRoles = (profile: UserProfile) => {
  if (!profile.roles) {
    return ["user"];
  }

  const validRoles = ["super_admin", "admin", "moderator", "user"];

  // profile.roles es un string, convertir a minúsculas y dividir si contiene múltiples roles
  const rolesArray = profile.roles
    .split(',') // Por si hay múltiples roles separados por comas
    .map((role) => role.trim().toLowerCase())
    .filter((role) => validRoles.includes(role));

  return rolesArray.length > 0 ? rolesArray : ["user"];
};