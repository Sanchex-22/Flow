import { useEffect, useRef, useState } from "react";
import { getMainRoutesForRole, getUserRoles } from "../../routes/routesConfig";
import { UserProfile } from "../../context/userProfileContext";
import Images from "../../assets";
import { Menu, X, Search, Bell, Sun, Moon, Globe, Ticket, Wrench, Monitor, CheckCheck, ExternalLink, LogOut } from "lucide-react";
import useUser from "../../hook/useUser";
import CompanySelectorComponent from "../selector/CompanySelectorComponent";
import { useCompany } from "../../context/routerContext";
import SearchInput from "../selector/SearchInput";
import { useSearch } from "../../context/searchContext";
import { useLocation, Link } from "react-router-dom";
import { useTheme } from "../../context/themeContext";
import { useTranslation } from "react-i18next";
import { useNotifications, AppNotification } from "../../context/notificationContext";
import appConfig from "../../utils/appConfig";

interface CurrentPathname { name: string }
interface AdminNavbarProps {
  currentPathname?: CurrentPathname;
  isLogged: boolean;
  profile: UserProfile | null;
}

const typeIcon = (type: AppNotification["type"]) => {
  if (type === "ticket") return <Ticket className="w-3.5 h-3.5" />
  if (type === "maintenance") return <Wrench className="w-3.5 h-3.5" />
  return <Monitor className="w-3.5 h-3.5" />
}

const typeBg = (type: AppNotification["type"], dark: boolean) => {
  const map: Record<string, string> = {
    ticket: dark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600",
    maintenance: dark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600",
    device: dark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600",
    license: dark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600",
    expense: dark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600",
  }
  return map[type] ?? (dark ? "bg-white/[0.06] text-white/50" : "bg-gray-100 text-gray-500")
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ profile }) => {
  const { logout } = useUser();
  const { selectedCompany } = useCompany();
  const { isDarkMode, toggleTheme } = useTheme();
  const ThemeIcon = isDarkMode ? Sun : Moon;
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { search, setSearch } = useSearch();
  const location = useLocation();
  const AppName = appConfig.name;
  const initials = profile?.username ? profile.username[0].toUpperCase() : "U";
  const notifRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();

  const toggleLanguage = () => {
    const next = i18n.language === "en" ? "es" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("i18nextLng", next);
  };

  const userRoles = profile?.roles ? getUserRoles(profile) : ["user"];
  const filteredNavLinks = userRoles.flatMap((role: string) =>
    getMainRoutesForRole(role as "user" | "super_admin" | "admin" | "moderator").map((route: any) => ({
      href: typeof route === "string" ? route : route.href,
      name: typeof route === "string" ? route : route.name,
      icon: typeof route !== "string" && route.icon ? <route.icon /> : undefined,
    }))
  );

  useEffect(() => { setSearch(""); setMobileSearchOpen(false); }, [location.pathname]);
  useEffect(() => { setNotifOpen(false) }, [location.pathname]);

  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") setIsMenuOpen(false); };
    document.addEventListener("keydown", handleEscape);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", handleEscape); };
  }, [isMenuOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  const iconBtn = `p-2 rounded-lg transition-colors ${
    isDarkMode
      ? "text-[#8e8e93] hover:text-white hover:bg-white/[0.06]"
      : "text-[#6e6e73] hover:text-gray-900 hover:bg-gray-100"
  }`;

  return (
    <nav
      id="navbar"
      className={`w-full z-20 top-0 transition-colors duration-300 ${
        isDarkMode
          ? "bg-[#1c1c1e]/90 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-white/90 backdrop-blur-xl border-b border-gray-200/80"
      }`}
    >
      <div className="w-full px-4 md:px-6">
        {/* ── Desktop ── */}
        <div className="hidden md:flex justify-between items-center h-14">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-white/[0.08]" : "bg-gray-100"}`}>
              <img src={Images?.logo || "#"} alt="logo" className="w-5 h-5 object-contain" />
            </div>
            <span className={`text-[15px] font-semibold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {AppName}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <div className="mr-2"><SearchInput /></div>
            <div className="w-52 mr-2"><CompanySelectorComponent isDarkMode={isDarkMode} /></div>

            {/* ── Notification Bell ── */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className={`relative ${iconBtn}`}
                aria-label="Notifications"
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className={`absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl border overflow-hidden z-50 ${
                  isDarkMode ? "bg-[#1c1c1e] border-white/[0.08]" : "bg-white border-gray-100"
                }`}>
                  {/* Header */}
                  <div className={`flex items-center justify-between px-4 py-3 border-b ${isDarkMode ? "border-white/[0.06]" : "border-gray-100"}`}>
                    <span className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      Notificaciones
                      {unreadCount > 0 && <span className="ml-1.5 text-xs text-blue-500 font-medium">({unreadCount} nuevas)</span>}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className={`flex items-center gap-1 text-xs font-medium transition-colors ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Leer todo
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className={`text-center py-10 text-xs ${isDarkMode ? "text-white/30" : "text-gray-400"}`}>
                        Sin notificaciones pendientes
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors cursor-pointer ${
                            isDarkMode ? "border-white/[0.04] hover:bg-white/[0.03]" : "border-gray-50 hover:bg-gray-50"
                          } ${!n.read ? (isDarkMode ? "bg-blue-500/[0.05]" : "bg-blue-50/60") : ""}`}
                          onClick={() => { markRead(n.id); if (n.href) window.location.href = n.href; }}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${typeBg(n.type, isDarkMode)}`}>
                            {typeIcon(n.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs truncate ${isDarkMode ? "text-white" : "text-gray-900"} ${!n.read ? "font-bold" : "font-medium"}`}>
                              {n.title}
                            </p>
                            <p className={`text-xs mt-0.5 truncate ${isDarkMode ? "text-white/50" : "text-gray-500"}`}>
                              {n.message}
                            </p>
                            <p className={`text-[10px] mt-1 ${isDarkMode ? "text-white/30" : "text-gray-400"}`}>
                              {n.time}
                            </p>
                          </div>
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className={`px-4 py-2.5 border-t ${isDarkMode ? "border-white/[0.06]" : "border-gray-100"}`}>
                      <Link
                        to={`/${selectedCompany?.code}/tickets/all`}
                        onClick={() => setNotifOpen(false)}
                        className={`flex items-center justify-center gap-1.5 text-xs font-medium transition-colors ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver todos los tickets
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Language */}
            <button
              onClick={toggleLanguage}
              className={`${iconBtn} flex items-center gap-1 text-xs font-semibold uppercase`}
              title={i18n.language === "en" ? t("lang.es") : t("lang.en")}
            >
              <Globe className="w-[18px] h-[18px]" />
              <span>{i18n.language}</span>
            </button>

            {/* Theme */}
            <button onClick={toggleTheme} className={iconBtn} aria-label="Toggle theme">
              <ThemeIcon className="w-[18px] h-[18px]" />
            </button>

            {/* User avatar */}
            <Link
              to={`/${selectedCompany?.code || "code"}/profile/${profile?.id || "1"}`}
              className="ml-1 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold transition-opacity hover:opacity-80"
              title={profile?.username || "Profile"}
            >
              {initials}
            </Link>
          </div>
        </div>

        {/* ── Mobile ── */}
        <div className="md:hidden flex justify-between items-center h-12">
          <div className="flex items-center gap-2">
            <img src={Images?.logo || "#"} alt="logo" className="w-7 h-7 object-contain" />
            <span className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{AppName}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { setMobileSearchOpen((v) => !v); setIsMenuOpen(false); }} className={`relative ${iconBtn}`}>
              {mobileSearchOpen ? <X className="w-[18px] h-[18px]" /> : <Search className="w-[18px] h-[18px]" />}
            </button>
            <button onClick={() => setNotifOpen((v) => !v)} className={`relative ${iconBtn}`}>
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button onClick={toggleTheme} className={iconBtn}>
              <ThemeIcon className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => { setIsMenuOpen(!isMenuOpen); setMobileSearchOpen(false); }}
              className={`${iconBtn} p-2 rounded-md`}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile search bar ── */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-2">
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${isDarkMode ? "bg-white/[0.06] border border-white/[0.08]" : "bg-gray-100 border border-gray-200"}`}>
              <Search className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? "text-[#8e8e93]" : "text-gray-400"}`} />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("common.search")}
                className={`bg-transparent outline-none text-sm flex-1 ${isDarkMode ? "text-white placeholder-[#636366]" : "text-gray-900 placeholder-gray-400"}`}
              />
              {search && (
                <button onClick={() => setSearch("")} className={isDarkMode ? "text-[#636366]" : "text-gray-400"}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile overlay ── */}
      <div
        className={`fixed inset-0 h-screen z-40 transition-opacity duration-200 ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"} ${isDarkMode ? "bg-black/60" : "bg-black/30"}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* ── Mobile drawer ── */}
      <div
        className={`fixed top-0 right-0 h-screen w-80 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"} ${isDarkMode ? "bg-[#1c1c1e]" : "bg-white"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className={`flex justify-between items-center px-5 h-14 border-b ${isDarkMode ? "border-white/[0.06]" : "border-gray-100"}`}>
          <span className={`font-semibold text-[15px] ${isDarkMode ? "text-white" : "text-gray-900"}`}>{AppName}</span>
          <button onClick={() => setIsMenuOpen(false)} className={iconBtn}><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className={`px-4 py-3 space-y-3 border-b ${isDarkMode ? "border-white/[0.06]" : "border-gray-100"}`}>
            <CompanySelectorComponent isDarkMode={isDarkMode} />
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${isDarkMode ? "bg-white/[0.06] border border-white/[0.08]" : "bg-gray-100 border border-gray-200"}`}>
              <Search className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? "text-[#8e8e93]" : "text-gray-400"}`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("common.search")}
                className={`bg-transparent outline-none text-sm flex-1 ${isDarkMode ? "text-white placeholder-[#636366]" : "text-gray-900 placeholder-gray-400"}`}
              />
              {search && (
                <button onClick={() => setSearch("")} className={isDarkMode ? "text-[#636366]" : "text-gray-400"}>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="px-3 py-3 flex-1 space-y-0.5">
            {filteredNavLinks.length > 0 ? (
              filteredNavLinks.map((link, i) => (
                <a
                  key={i}
                  href={`/${selectedCompany?.code || "code"}${link.href}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[13px] font-medium ${isDarkMode ? "text-[#8e8e93] hover:text-white hover:bg-white/[0.05]" : "text-[#6e6e73] hover:text-gray-900 hover:bg-gray-50"}`}
                >
                  {link.icon && <span className="w-4 h-4">{link.icon}</span>}
                  {link.name}
                </a>
              ))
            ) : (
              <p className={`text-xs px-3 py-2 ${isDarkMode ? "text-[#636366]" : "text-gray-400"}`}>{t("nav.noAccess")}</p>
            )}
          </div>

          <div className={`px-4 py-4 border-t space-y-1 ${isDarkMode ? "border-white/[0.06]" : "border-gray-100"}`}>
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div>
                <p className={`text-[13px] font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{profile?.username || "user"}</p>
                <p className={`text-xs ${isDarkMode ? "text-[#636366]" : "text-gray-400"}`}>{profile?.roles || "user"}</p>
              </div>
            </div>
            <button
              onClick={toggleLanguage}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${isDarkMode ? "text-[#8e8e93] hover:text-white hover:bg-white/[0.05]" : "text-[#6e6e73] hover:text-gray-900 hover:bg-gray-50"}`}
            >
              <Globe className="w-4 h-4" />
              {i18n.language === "en" ? t("lang.es") : t("lang.en")}
            </button>
            <button
              onClick={() => { logout(); setIsMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${isDarkMode ? "text-red-400 hover:bg-red-500/[0.08]" : "text-red-600 hover:bg-red-50"}`}
            >
              <LogOut className="w-4 h-4" />
              {t("nav.logout")}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
