"use client";

import { UserProfile } from "../../context/userProfileContext";
import useUser from "../../hook/useUser";
import { getMainRoutesForRole, getUserRoles } from "../../routes/routesConfig";
import { LogOut } from "lucide-react";
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

// ─────────────────────────────────────────────────────────────────────────────

const SlideBar: React.FC<DashboardProps> = ({ profile }) => {
  const { logout } = useUser();
  const { selectedCompany } = useCompany();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  // ── Main nav groups (inside component so t() reacts to language changes) ──
  const NAV_GROUPS: { label: string; names: string[] }[] = [
    { label: t("nav.group.general"),        names: ["Dashboard"] },
    { label: t("nav.group.infrastructure"), names: ["Devices", "Inventory", "Maintenance", "Network"] },
    { label: t("nav.group.resources"),      names: ["Persons"] },
    { label: t("nav.group.finance"),        names: ["Expenses", "Licenses"] },
    { label: t("nav.group.documentation"),  names: ["Documents", "Reports"] },
    { label: t("nav.group.support"),        names: ["Tickets"] },
    { label: t("nav.group.system"),         names: ["Settings"] },
    { label: "Administración",              names: ["AdminOverview", "AdminCompanies", "AdminUsers", "AdminLicenses"] },
  ];
  
  const location = useLocation();
  const currentSegments = location.pathname.split("/").filter(Boolean);
  const baseRoute = currentSegments.length > 1 ? currentSegments[1] : "";
  const currentPath = location.pathname;

  // ── Build accessible routes ──────────────────────────────────────────────
  const userRoles = profile?.roles ? getUserRoles(profile) : ["user"];
  const allRoutes = userRoles.flatMap((role) =>
    getMainRoutesForRole(role as "user" | "super_admin" | "admin" | "moderator").map(
      (route) => ({
        href: typeof route === "string" ? route : route.href,
        name: typeof route === "string" ? route : route.name,
        icon: typeof route !== "string" && route.icon ? route.icon : null,
      })
    )
  );

  const seen = new Set<string>();
  const uniqueRoutes = allRoutes.filter((r) => {
    if (seen.has(r.name)) return false;
    seen.add(r.name);
    return true;
  });

  const initials = profile?.username ? profile.username[0].toUpperCase() : "U";

  // ── Tokens ───────────────────────────────────────────────────────────────
  const border = isDarkMode ? "border-white/[0.06]" : "border-gray-100";
  const textLabel = isDarkMode ? "text-[#636366]" : "text-gray-400";
  const textItem = isDarkMode ? "text-[#8e8e93]" : "text-[#6e6e73]";
  const hoverItem = isDarkMode
    ? "hover:text-white hover:bg-white/[0.05]"
    : "hover:text-gray-900 hover:bg-gray-50";
  const activeItem = isDarkMode
    ? "bg-white/[0.08] text-white"
    : "bg-blue-50 text-blue-700";

  return (
    <div
      className={`h-full w-56 flex flex-col transition-colors duration-300 border-r ${
        isDarkMode ? "bg-[#111113] border-white/[0.06]" : "bg-white border-gray-100"
      }`}
    >
      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group) => {
          const groupRoutes = group.names
            .map((name) => uniqueRoutes.find((r) => r.name === name))
            .filter(Boolean) as typeof uniqueRoutes;

          if (groupRoutes.length === 0) return null;

          return (
            <div key={group.label} className="mb-4">
              {/* Group label */}
              <div className="px-2 mb-1">
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${textLabel}`}>
                  {group.label}
                </span>
              </div>

              {/* Routes */}
              <div className="space-y-0.5">
                {groupRoutes.map((link, idx) => {
                  const isActive = link.href.startsWith('/admin/')
                    ? currentPath.startsWith(link.href)
                    : baseRoute === (link.href.split("/").filter(Boolean)[0] ?? "");
                  const Icon = link.icon;

                  // Admin routes are absolute paths (/admin/...); company routes need the prefix
                  const linkTo = link.href.startsWith('/admin/')
                    ? link.href
                    : `/${selectedCompany?.code || "code"}${link.href}`;

                  return (
                    <Link
                      key={idx}
                      to={linkTo}
                      className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 ${
                        isActive ? activeItem : `${textItem} ${hoverItem}`
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-4 h-4 transition-colors ${
                          isActive
                            ? isDarkMode ? "text-white" : "text-blue-600"
                            : ""
                        }`}
                      >
                        {Icon ? <Icon /> : <InventoryIcon />}
                      </span>
                      <span className="flex-1 text-[13px] font-medium leading-none">
                        {t(`nav.${link.name.toLowerCase()}`, link.name)}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className={`p-2 border-t ${border} space-y-0.5`}>
        {/* Profile */}
        <Link
          to={`/${selectedCompany?.code || "code"}/profile/${profile?.id || "1"}`}
          className={`group flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg transition-all ${
            baseRoute === "profile" 
              ? activeItem 
              : `${textItem} ${hoverItem}`
          }`}
        >
          <div 
            className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate leading-tight">
              {profile?.username || "user"}
            </p>
            <p className={`text-[11px] truncate ${textLabel}`}>
              {t("nav.profile", "View profile")}
            </p>
          </div>
        </Link>

        {/* Logout */}
        <button
          className={`w-full group flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all ${
            isDarkMode
              ? "text-[#8e8e93] hover:text-red-400 hover:bg-red-500/[0.08]"
              : "text-[#6e6e73] hover:text-red-600 hover:bg-red-50"
          }`}
          onClick={logout}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span className="text-[13px] font-medium">{t("nav.logout", "Logout")}</span>
        </button>
      </div>
    </div>
  );
};

export default SlideBar;