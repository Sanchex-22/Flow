"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "../../context/userProfileContext";
import useUser from "../../hook/useUser";
import { getMainRoutesForRole, getUserRoles } from "../../routes/routesConfig";
import { LogOut, ChevronDown } from "lucide-react";
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
  ];
  const location = useLocation();

  const currentSegments = location.pathname.split("/").filter(Boolean);
  const baseRoute = currentSegments.length > 1 ? currentSegments[1] : "";

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

  // ── Group open/close state ───────────────────────────────────────────────
  const activeGroupLabel =
    NAV_GROUPS.find((g) =>
      g.names.some((n) => {
        const route = uniqueRoutes.find((r) => r.name === n);
        if (!route) return false;
        return baseRoute === (route.href.split("/").filter(Boolean)[0] ?? "");
      })
    )?.label ?? "";

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const init = new Set<string>(["General"]);
    if (activeGroupLabel) init.add(activeGroupLabel);
    return init;
  });

  useEffect(() => {
    if (activeGroupLabel) {
      setOpenGroups((prev) => {
        if (prev.has(activeGroupLabel)) return prev;
        const next = new Set(prev);
        next.add(activeGroupLabel);
        return next;
      });
    }
  }, [activeGroupLabel]);

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });

  const initials = profile?.username ? profile.username[0].toUpperCase() : "U";

  // ── Tokens ───────────────────────────────────────────────────────────────
  const border    = isDarkMode ? "border-white/[0.06]" : "border-gray-100";
  const textMid   = isDarkMode ? "text-[#8e8e93]" : "text-[#6e6e73]";
  const textDim   = isDarkMode ? "text-[#636366]" : "text-gray-400";
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

          const isOpen = openGroups.has(group.label);
          const hasActive = groupRoutes.some((r) => {
            const routeBase = r.href.split("/").filter(Boolean)[0] ?? "";
            return baseRoute === routeBase;
          });

          return (
            <div key={group.label} className="mb-1">
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.label)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors select-none ${
                  isDarkMode
                    ? "text-[#636366] hover:text-[#8e8e93] hover:bg-white/[0.03]"
                    : "text-gray-400 hover:text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    hasActive ? (isDarkMode ? "text-[#8e8e93]" : "text-gray-500") : ""
                  }`}
                >
                  {group.label}
                </span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}
                />
              </button>

              {/* Routes */}
              {isOpen && (
                <div className="mt-0.5 space-y-0.5">
                  {groupRoutes.map((link, idx) => {
                    const linkBase = link.href.split("/").filter(Boolean)[0] ?? "";
                    const isActive = baseRoute === linkBase;
                    const Icon = link.icon;

                    return (
                      <Link
                        key={idx}
                        to={`/${selectedCompany?.code || "code"}${link.href}`}
                        className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 ${
                          isActive ? activeItem : `${textMid} ${hoverItem}`
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
              )}
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
            baseRoute === "profile" ? activeItem : `${textMid} ${hoverItem}`
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate leading-tight">
              {profile?.username || "user"}
            </p>
            <p className={`text-[11px] truncate ${textDim}`}>
              {t("nav.profile")}
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
          <span className="text-[13px] font-medium">{t("nav.logout")}</span>
        </button>
      </div>
    </div>
  );
};

export default SlideBar;
