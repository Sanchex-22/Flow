"use client"
import { Outlet, Link, useLocation } from "react-router-dom"
import { useCompany } from "../../../context/routerContext"
import { useTheme } from "../../../context/themeContext"
import {
  Settings2,
  Users,
  Building2,
  FolderOpen,
  ChevronRight,
} from "lucide-react"
import { useTranslation } from "react-i18next"

interface SubRoutesProps {
  subroutes?: { name?: string; href?: string }[]
}

const NAV_TABS = [
  { labelKey: "settings.tab.general",     icon: Settings2, segment: "all"         },
  { labelKey: "settings.tab.users",       icon: Users,      segment: "users"       },
  { labelKey: "settings.tab.companies",   icon: Building2,  segment: "companies"   },
  { labelKey: "settings.tab.departments", icon: FolderOpen, segment: "departments" },
]

const SettingsPage: React.FC<SubRoutesProps> = () => {
  const { selectedCompany } = useCompany()
  const { isDarkMode } = useTheme()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const code = selectedCompany?.code || "code"

  const afterSettings = pathname.split("/settings/")[1] || ""
  const rawSegment    = afterSettings.split("/")[0] || "all"
  const firstSegment  =
    rawSegment === "create" || rawSegment === "edit" ? "companies" : rawSegment

  const border  = isDarkMode ? "border-white/[0.07]"  : "border-gray-200"
  const navBg   = isDarkMode ? "bg-[#111113]"          : "bg-white"
  const pageBg  = isDarkMode ? "bg-[#111113]"          : "bg-[#f5f5f7]"
  const textSub = isDarkMode ? "text-[#8e8e93]"        : "text-gray-500"

  return (
    // Negative margins cancel the parent layout padding → nav bar goes edge-to-edge
    <div
      className={`flex flex-col min-w-0 -mx-3 -mt-3 sm:-mx-4 sm:-mt-4 md:-mx-5 md:-mt-5 ${pageBg}`}
      style={{ minHeight: "calc(100% + 2.5rem)" }}
    >
      {/* ── Top settings nav ──────────────────────────────────────────────── */}
      <div className={`flex-shrink-0 border-b ${border} ${navBg}`}>

        {/* Breadcrumb */}
        <div className={`flex items-center gap-1.5 px-4 pt-3 pb-1 text-xs ${textSub}`}>
          <span>{t("settings.system")}</span>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="font-medium">{t("settings.breadcrumb")}</span>
        </div>

        {/* Tabs */}
        <nav className="flex gap-1 px-3 overflow-x-auto scrollbar-none">
          {NAV_TABS.map(({ labelKey, icon: Icon, segment }) => {
            const isActive = firstSegment === segment
            const to = segment === "users"
              ? `/${code}/settings/users/all`
              : `/${code}/settings/${segment}`

            return (
              <Link
                key={segment}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? isDarkMode
                      ? "border-white text-white"
                      : "border-gray-900 text-gray-900"
                    : `border-transparent ${textSub} hover:text-gray-700`
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {t(labelKey)}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* ── Page content — padding restored here ──────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6">
        <Outlet />
      </div>
    </div>
  )
}

export default SettingsPage
