"use client"

import useSWR from "swr"
import { useParams } from "react-router-dom"
import { formatValue } from "../../../utils/formatNull"
import { UsuarioFull } from "../../../utils/usuarioFull"
import Loader from "../../../components/loaders/loader.tsx"
import { useTranslation } from "react-i18next"
import { useTheme } from "../../../context/themeContext"
import {
  User, Mail, Phone, Briefcase, Building2, Shield,
  Calendar, Clock, Hash, CheckCircle, XCircle, Settings, Edit3
} from "lucide-react"

const { VITE_API_URL } = import.meta.env

interface ProfilePageProps {
  userId?: string
}

// ── API fetcher with auth ──────────────────────────────────
const fetcher = (url: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt") || ""}` },
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to load profile")
    return res.json()
  })

// ── helpers ───────────────────────────────────────────────
const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700 border border-red-200",
  ADMIN: "bg-orange-100 text-orange-700 border border-orange-200",
  MODERATOR: "bg-purple-100 text-purple-700 border border-purple-200",
  USER: "bg-blue-100 text-blue-700 border border-blue-200",
}

const roleColorsDark: Record<string, string> = {
  SUPER_ADMIN: "bg-red-900/30 text-red-400 border border-red-800",
  ADMIN: "bg-orange-900/30 text-orange-400 border border-orange-800",
  MODERATOR: "bg-purple-900/30 text-purple-400 border border-purple-800",
  USER: "bg-blue-900/30 text-blue-400 border border-blue-800",
}

const avatarColors = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-red-600",
]

// ── sub-components ────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, mono = false }: {
  icon: React.ElementType; label: string; value: string; mono?: boolean
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-white/[0.08] last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-400 dark:text-slate-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">{label}</p>
        <p className={`text-sm font-medium text-gray-900 dark:text-slate-100 truncate ${mono ? "font-mono text-xs" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

function ProfileCard({ title, icon: Icon, iconBg, children }: {
  title: string; icon: React.ElementType; iconBg: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-white/[0.08] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-50 dark:border-white/[0.08]/60">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{title}</h3>
      </div>
      <div className="px-6 py-2">{children}</div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────
export default function ProfilePage({ userId: userIdProp }: ProfilePageProps) {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const params = useParams<{ id: string }>()
  const userId = params.id || userIdProp

  const { data, error, isLoading } = useSWR(
    userId ? `${VITE_API_URL}/api/users/profile/${userId}` : null,
    fetcher
  )

  if (isLoading) return <Loader />

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <XCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-gray-500 dark:text-slate-400">{t("profile.loadError")}</p>
        </div>
      </div>
    )
  }

  const user: UsuarioFull = data
  const fullName = formatValue(user?.person?.fullName)
  const initials = fullName && fullName !== "—" ? getInitials(fullName) : "U"
  const avatarGrad = avatarColors[fullName.charCodeAt(0) % avatarColors.length]
  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—"
  const roleLabel = user?.role?.replace(/_/g, " ") ?? "—"
  const roleClass = isDarkMode
    ? (roleColorsDark[user?.role] ?? roleColorsDark.USER)
    : (roleColors[user?.role] ?? roleColors.USER)

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? "bg-[#1c1c1e]" : "bg-[#f5f5f7]"}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* ── Hero card ── */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-white/[0.08] shadow-sm overflow-hidden">
          {/* cover stripe */}
          <div className={`h-28 bg-gradient-to-r ${avatarGrad}`} />
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-14 mb-5">
              {/* Avatar */}
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ${isDarkMode ? "ring-[#1c1c1e]" : "ring-white"}`}>
                {initials}
              </div>
              {/* Buttons */}
              <div className="flex gap-2 sm:pb-2">
                <button className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDarkMode ? "bg-white/[0.06] hover:bg-white/[0.1] text-white/70" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
                  <Edit3 className="w-4 h-4" />
                  {t("profile.edit")}
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                  <Settings className="w-4 h-4" />
                  {t("profile.settings")}
                </button>
              </div>
            </div>
            {/* name / meta */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{fullName}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {formatValue(user?.person?.position)}
              {user?.person?.department?.name ? ` · ${user.person.department.name}` : ""}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${roleClass}`}>
                <Shield className="w-3 h-3" /> {roleLabel}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                user?.isActive
                  ? isDarkMode
                    ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : isDarkMode
                    ? "bg-red-900/30 text-red-400 border border-red-800"
                    : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {user?.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {user?.isActive ? t("profile.active") : t("profile.inactive")}
              </span>
            </div>
          </div>
        </div>

        {/* ── 2×2 grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Personal */}
          <ProfileCard title={t("profile.personal")} icon={User} iconBg="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <InfoRow icon={User} label={t("profile.firstName")} value={formatValue(user?.person?.firstName)} />
            <InfoRow icon={User} label={t("profile.lastName")} value={formatValue(user?.person?.lastName)} />
            <InfoRow icon={Hash} label={t("profile.userCode")} value={formatValue(user?.person?.userCode)} mono />
            <InfoRow icon={Hash} label={t("profile.userId")} value={formatValue(user?.id)} mono />
          </ProfileCard>

          {/* Contact */}
          <ProfileCard title={t("profile.contact")} icon={Mail} iconBg="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <InfoRow icon={Mail} label={t("profile.primaryEmail")} value={formatValue(user?.email)} />
            <InfoRow icon={Mail} label={t("profile.contactEmail")} value={formatValue(user?.person?.contactEmail)} />
            <InfoRow icon={Phone} label={t("profile.phone")} value={formatValue(user?.person?.phoneNumber)} />
            <InfoRow icon={User} label={t("profile.username")} value={formatValue(user?.username)} mono />
          </ProfileCard>

          {/* Professional */}
          <ProfileCard title={t("profile.professional")} icon={Briefcase} iconBg="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            <InfoRow icon={Building2} label={t("profile.department")} value={formatValue(user?.person?.department?.name)} />
            <InfoRow icon={Briefcase} label={t("profile.position")} value={formatValue(user?.person?.position)} />
            <div className="py-3 border-b border-gray-100 dark:border-white/[0.08] last:border-0 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">{t("profile.role")}</p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleClass}`}>
                  {roleLabel}
                </span>
              </div>
            </div>
          </ProfileCard>

          {/* System */}
          <ProfileCard title={t("profile.system")} icon={Settings} iconBg="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
            <InfoRow icon={Calendar} label={t("profile.createdAt")} value={formatDate(user?.createdAt)} />
            <InfoRow icon={Clock} label={t("profile.updatedAt")} value={formatDate(user?.updatedAt)} />
            <InfoRow icon={Hash} label={t("profile.personId")} value={formatValue(user?.person?.id)} mono />
            <div className="py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                {user?.isActive ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">{t("profile.accountActive")}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {user?.isActive ? t("profile.yes") : t("profile.no")}
                </p>
              </div>
            </div>
          </ProfileCard>
        </div>

        {/* ── Companies ── */}
        {user?.companies && user.companies.length > 0 && (
          <ProfileCard title={t("profile.companies")} icon={Building2} iconBg="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user.companies.map((uc: any, i: number) => (
                <div key={i} className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${isDarkMode ? "bg-white/[0.06] hover:bg-white/[0.1]" : "bg-gray-50 hover:bg-gray-100"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-gradient-to-br ${avatarColors[i % avatarColors.length]}`}>
                    {uc.company.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">{uc.company.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-500 font-mono">{uc.company.code}</p>
                    {uc.company.email && <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{uc.company.email}</p>}
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                    uc.company.isActive
                      ? isDarkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                      : isDarkMode ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-700"
                  }`}>
                    {uc.company.isActive ? t("profile.active") : t("profile.inactive")}
                  </span>
                </div>
              ))}
            </div>
          </ProfileCard>
        )}
      </div>
    </div>
  )
}
