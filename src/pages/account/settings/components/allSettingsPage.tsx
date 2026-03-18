"use client"

import { useState } from "react"
import { Sun, Moon, Monitor, Globe, Palette, Search } from "lucide-react"
import { useTheme, ThemeMode } from "../../../../context/themeContext"
import { useTranslation } from "react-i18next"

// ── Theme options ────────────────────────────────────────────────────────────
const THEME_OPTIONS: { mode: ThemeMode; icon: typeof Sun; labelKey: string }[] = [
  { mode: "dark",   icon: Moon,    labelKey: "settings.darkMode"  },
  { mode: "light",  icon: Sun,     labelKey: "settings.lightMode" },
  { mode: "system", icon: Monitor, labelKey: "settings.systemMode" },
]

export default function AllSettingsPage() {
  const { isDarkMode, theme, setTheme } = useTheme()
  const { i18n, t } = useTranslation()
  const [settingsSearch, setSettingsSearch] = useState("")

  const toggleLang = () => {
    const next = i18n.language === "en" ? "es" : "en"
    i18n.changeLanguage(next)
    localStorage.setItem("i18nextLng", next)
  }

  // ── Tokens ────────────────────────────────────────────────────────────────
  const textMain = isDarkMode ? "text-white"     : "text-gray-900"
  const textSub  = isDarkMode ? "text-[#8e8e93]" : "text-gray-500"
  const textDim  = isDarkMode ? "text-[#636366]" : "text-gray-400"
  const border   = isDarkMode ? "border-white/[0.08]" : "border-gray-200"
  const inputBg  = isDarkMode ? "bg-white/[0.04] border-white/[0.08]" : "bg-gray-50 border-gray-200"

  return (
    <div className="max-w-lg space-y-6">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div>
        <h2 className={`text-base font-semibold ${textMain}`}>{t("settings.title")}</h2>
        <p className={`text-xs mt-0.5 ${textSub}`}>
          {t("settings.language")} & {t("settings.theme")}
        </p>
      </div>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${inputBg}`}>
        <Search className={`w-4 h-4 flex-shrink-0 ${textDim}`} />
        <input
          type="text"
          placeholder={`${t("common.search")}...`}
          value={settingsSearch}
          onChange={(e) => setSettingsSearch(e.target.value)}
          className={`flex-1 bg-transparent outline-none text-sm ${textMain}`}
        />
      </div>

      {/* ── Apariencia card ──────────────────────────────────────────────── */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? "bg-[#2c2c2e] border-white/[0.08]" : "bg-white border-gray-200 shadow-sm"
      }`}>
        {/* Card header */}
        <div className={`flex items-center gap-3 px-4 py-3 border-b ${border}`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isDarkMode ? "bg-white/[0.06]" : "bg-pink-50"
          }`}>
            <Palette className="w-4 h-4 text-pink-500" />
          </div>
          <p className={`text-[11px] font-bold uppercase tracking-widest ${textSub}`}>
            {t("settings.appearance")}
          </p>
        </div>

        <div className="px-4 py-4 space-y-5">

          {/* ── Theme selector ──────────────────────────────────────────── */}
          <div>
            <p className={`text-xs font-semibold mb-2.5 ${textSub}`}>
              {t("settings.theme")}
            </p>
            <div className={`flex gap-1 p-1 rounded-xl ${isDarkMode ? "bg-white/[0.06]" : "bg-gray-100"}`}>
              {THEME_OPTIONS.map(({ mode, icon: ModeIcon, labelKey }) => {
                const active = theme === mode
                return (
                  <button
                    key={mode}
                    onClick={() => setTheme(mode)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-[12px] font-medium transition-all ${
                      active
                        ? isDarkMode
                          ? "bg-white/[0.14] text-white shadow-sm"
                          : "bg-white text-gray-900 shadow-sm"
                        : isDarkMode
                        ? "text-[#636366] hover:text-[#8e8e93]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <ModeIcon className="w-3.5 h-3.5" />
                    <span>{t(labelKey)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Language toggle ─────────────────────────────────────────── */}
          <div>
            <p className={`text-xs font-semibold mb-2.5 ${textSub}`}>
              {t("settings.language")}
            </p>
            <div className={`flex gap-1 p-1 rounded-xl ${isDarkMode ? "bg-white/[0.06]" : "bg-gray-100"}`}>
              {(["en", "es"] as const).map((lang) => {
                const active = i18n.language === lang
                return (
                  <button
                    key={lang}
                    onClick={() => { if (!active) toggleLang() }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                      active
                        ? isDarkMode
                          ? "bg-white/[0.14] text-white shadow-sm"
                          : "bg-white text-gray-900 shadow-sm"
                        : isDarkMode
                        ? "text-[#636366] hover:text-[#8e8e93]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {lang === "en" ? t("lang.en") : t("lang.es")}
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
