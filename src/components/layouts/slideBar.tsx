"use client";

import { UserProfile } from "../../context/userProfileContext";
import useUser from "../../hook/useUser";
import { getMainRoutesForRole, getUserRoles } from "../../routes/routesConfig";
import { LogOut } from "lucide-react";
import { InventoryIcon } from "../icons/icons";
import CompanySelectorComponent from "../selector/CompanySelectorComponent";
import { useCompany } from "../../context/routerContext";
import { Link } from "react-router-dom";

export interface Company {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  _count: {
    users: number;
    equipments: number;
    licenses: number;
    documents: number;
    maintenances: number;
  };
}

type Subroutes = {
  name: string;
  href: string;
};

interface CurrentPathname {
  name: string;
}

type DashboardProps = {
  subroutes: Subroutes[];
  currentPathname: CurrentPathname;
  isLogged: boolean;
  profile: UserProfile | null;
  companies?: Company[];
};

const SlideBar: React.FC<DashboardProps> = ({
  currentPathname,
  profile,
}) => {
  const { logout } = useUser();
  const { selectedCompany } = useCompany();
  const location = currentPathname.name || "";

  const baseRoute = location.split("/")[2] || "";

  const userRoles = profile?.roles ? getUserRoles(profile) : ["user"];
  const filteredNavLinks =
    userRoles.flatMap((role) =>
      getMainRoutesForRole(
        role as "user" | "super_admin" | "admin" | "moderator"
      ).map((route) => ({
        href: typeof route === "string" ? route : route.href,
        name: typeof route === "string" ? route : route.name,
        icon:
          typeof route === "string"
            ? undefined
            : route.icon
            ? <route.icon />
            : undefined,
      }))
    ) || [];


  return (
    <div className="min-h-screen bg-gray-900 text-white flex h-[90vh]">
      <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <rect x="7" y="7" width="3" height="9" />
                <rect x="14" y="7" width="3" height="5" />
              </svg>
            </div>
            <h2 className="text-lg font-bold">Sistema IT</h2>
          </div>
        </div>

        {/* Company Selector */}
        <CompanySelectorComponent/>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {filteredNavLinks?.length > 0 ? (
              filteredNavLinks?.map((link, index) => {
                const linkBase = link.href.split("/")[1] || "";
                const isActive = baseRoute === linkBase;

                return (
                  <li key={index}>
                    <Link
                      to={`/${selectedCompany?.code || 'code'}${link?.href}`}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-white hover:bg-gray-700"
                      }`}
                    >
                      {link?.icon || <InventoryIcon />}
                      <span className="text-sm">{link?.name}</span>
                    </Link>
                  </li>
                );
              })
            ) : (
              <span className="text-lg text-gray-500">
                No tienes acceso a ninguna ruta
              </span>
            )}
          </ul>
        </nav>

        {/* Footer / Help */}
        <div className="p-4 border-t border-gray-800 flex flex-col space-y-2">
          <a
            href={`/${selectedCompany?.code || 'code'}/profile/1`}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs font-bold">
              N
            </div>
            <span className="text-sm">{profile?.username || "user"}</span>
          </a>

          <button
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlideBar;
