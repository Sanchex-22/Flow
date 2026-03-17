"use client";

import { UserProfile } from "../../context/userProfileContext";
import useUser from "../../hook/useUser";
import { getMainRoutesForRole, getUserRoles } from "../../routes/routesConfig";
import { LogOut, ChevronRight } from "lucide-react";
import { InventoryIcon } from "../icons/icons";
import { useCompany } from "../../context/routerContext";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/themeContext";
import { useTranslation } from "react-i18next";

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

type DashboardProps = {
  isLogged: boolean;
  profile: UserProfile | null;
  companies?: Company[];
};

const SlideBar: React.FC<DashboardProps> = ({ profile }) => {
  const { logout } = useUser();
  const { selectedCompany } = useCompany();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();

  const currentSegments = location.pathname.split("/").filter(Boolean);
  const baseRoute = currentSegments.length > 1 ? currentSegments[1] : "";

  const userRoles = profile?.roles ? getUserRoles(profile) : ["user"];
  const filteredNavLinks = userRoles.flatMap((role) =>
    getMainRoutesForRole(role as "user" | "super_admin" | "admin" | "moderator").map((route) => ({
      href: typeof route === "string" ? route : route.href,
      name: typeof route === "string" ? route : route.name,
      icon: typeof route !== "string" && route.icon ? <route.icon /> : undefined,
    }))
  );

  const initials = profile?.username ? profile.username[0].toUpperCase() : "U";

  return (
    <div
      className={`h-full w-56 flex flex-col transition-colors duration-300 border-r ${
        isDarkMode ? "bg-[#111113] border-white/[0.06]" : "bg-white border-gray-100"
      }`}
    >
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {filteredNavLinks.length > 0 ? (
          filteredNavLinks.map((link, index) => {
            const linkBase = link.href.split("/").filter(Boolean)[0] || "";
            const isActive = baseRoute === linkBase;

            return (
              <Link
                key={index}
                to={`/${selectedCompany?.code || "code"}${link.href}`}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 ${
                  isActive
                    ? isDarkMode
                      ? "bg-white/[0.08] text-white"
                      : "bg-blue-50 text-blue-700"
                    : isDarkMode
                    ? "text-[#8e8e93] hover:text-white hover:bg-white/[0.05]"
                    : "text-[#6e6e73] hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`flex-shrink-0 w-4 h-4 transition-colors ${
                    isActive
                      ? isDarkMode ? "text-white" : "text-blue-600"
                      : isDarkMode
                      ? "text-[#636366] group-hover:text-[#8e8e93]"
                      : "text-[#8e8e93] group-hover:text-[#6e6e73]"
                  }`}
                >
                  {link.icon || <InventoryIcon />}
                </span>
                <span className="flex-1 text-[13px] font-medium leading-none">{link.name}</span>
                {isActive && (
                  <ChevronRight
                    className={`w-3 h-3 flex-shrink-0 ${isDarkMode ? "text-[#48484a]" : "text-blue-400"}`}
                  />
                )}
              </Link>
            );
          })
        ) : (
          <p className={`text-xs px-3 py-2 ${isDarkMode ? "text-[#636366]" : "text-gray-400"}`}>
            {t("nav.noAccess")}
          </p>
        )}
      </nav>

      {/* Footer */}
      <div className={`p-3 border-t ${isDarkMode ? "border-white/[0.06]" : "border-gray-100"} space-y-0.5`}>
        {/* Profile */}
        <Link
          to={`/${selectedCompany?.code || "code"}/profile/${profile?.id || "1"}`}
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
            baseRoute === "profile"
              ? isDarkMode ? "bg-white/[0.08] text-white" : "bg-blue-50 text-blue-700"
              : isDarkMode ? "text-[#8e8e93] hover:text-white hover:bg-white/[0.05]" : "text-[#6e6e73] hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate leading-tight">{profile?.username || "user"}</p>
            <p className={`text-[11px] truncate ${isDarkMode ? "text-[#636366]" : "text-gray-400"}`}>
              {t("nav.profile")}
            </p>
          </div>
        </Link>

        {/* Logout */}
        <button
          className={`w-full group flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
            isDarkMode
              ? "text-[#8e8e93] hover:text-red-400 hover:bg-red-500/[0.08]"
              : "text-[#6e6e73] hover:text-red-600 hover:bg-red-50"
          }`}
          onClick={logout}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span className="text-[13px] font-medium">{t("nav.logout")}</span>
        </button>
      </div>
    </div>
  );
};

export default SlideBar;
