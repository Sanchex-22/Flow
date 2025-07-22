
import { UserProfile } from "../context/userProfileContext";
import { authRoles } from "../diccionary/constants";
import { FaMoneyBill } from "react-icons/fa";

const routesConfig = [
  { 
    icon: FaMoneyBill,
    name: "account", 
    href: "/account/quotes", 
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator, authRoles.user],
    subroutes: [
      { name: "Quotes", href: "/account/quotes" },
      // { name: "Certs", href: "/account/certificates" },
      // { name: "Settings", href: "/account/settings" },
      // { name: "Security", href: "/account/security" },
    ]
  },
  { 
    name: "users", 
    href: "/users/all", 
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "All Users", href: "/users/list" },
      { name: "Create User", href: "/users/create" },
      { name: "Roles", href: "/users/roles" },
      { name: "Permissions", href: "/users/permissions" },
    ]
  },
  { 
    name: "certificates", 
    href: "/certs/all", 
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "View Certificates", href: "/certs/view" },
      { name: "Upload", href: "/certs/upload" },
      { name: "Manage", href: "/certs/manage" },
      { name: "History", href: "/certs/history" },
    ]
  },
  { 
    name: "clients", 
    href: "/clients/all", 
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "All Clients", href: "/clients/list" },
      { name: "Add Client", href: "/clients/add" },
      { name: "Contracts", href: "/clients/contracts" },
      { name: "Invoices", href: "/clients/invoices" },
    ]
  },
  { 
    name: "task", 
    href: "/task/all", 
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "My Tasks", href: "/task/my-tasks" },
      { name: "Team Tasks", href: "/task/team" },
      { name: "Create Task", href: "/task/create" },
      { name: "Task Reports", href: "/task/reports" },
    ]
  },
  { 
    name: "reports", 
    href: "/reports/all", 
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "Sales Reports", href: "/reports/sales" },
      { name: "User Reports", href: "/reports/users" },
      { name: "Performance", href: "/reports/performance" },
      { name: "Audit Logs", href: "/reports/audit" },
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

  if (Array.isArray(profile.roles)) {
    const validRoles = profile!.roles.filter(
      (role) => ["super_admin", "admin", "moderator", "user"].includes(role)
    );
    return validRoles.length > 0 ? validRoles : ["user"];
  }

  if (["super_admin", "admin", "moderator", "user"].includes(profile!.roles)) {
    return [profile!.roles];
  }

  return ["user"];
};
