"use client"

import type React from "react"
import { Eye, EyeOff, AlertCircle, WifiOff } from "lucide-react"
import { Link } from "react-router-dom"
import useUser from "../../hook/useUser"
import { decodeToken } from "../../utils/decode"
import { t } from "i18next"
interface LoginFormProps {
  pending: boolean
  setPending: (value: boolean) => void
  showPassword: boolean
  setShowPassword: (value: boolean) => void
  error: Error | null
  setError: (error: Error | null) => void
  dark?: boolean
}

export default function LoginForm({
  pending,
  setPending,
  showPassword,
  setShowPassword,
  error,
  setError,
  dark = false,
}: LoginFormProps) {
  const { login } = useUser()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    const formData = new FormData(event.currentTarget)
    const email    = formData.get("email")?.toString()
    const password = formData.get("password")?.toString()

    if (!email || !password) {
      setError(new Error("Todos los campos son obligatorios."))
      setPending(false)
      return
    }

    try {
      await login({ email, password })
      const decoded = decodeToken()
      const role = decoded?.roles?.toLowerCase() ?? ""
      if (role === "global_admin") {
        window.location.href = "/admin/overview"
        return
      }
      // Limpiar empresa seleccionada para que el selector siempre aparezca tras login
      localStorage.removeItem("selectedCompany")
      window.location.href = "/select-company"
    } catch (err) {
      setError(new Error(err instanceof Error ? err.message : "Error al iniciar sesión."))
    } finally {
      setPending(false)
    }
  }

  // Adaptive styles: dark = panel on black bg, light = card on white bg
  const inputBase = dark
    ? "w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white placeholder-[#6e6e73] focus:outline-none focus:border-blue-500 focus:bg-white/[0.08] transition text-sm"
    : "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition text-sm"

  const labelBase = dark ? "block text-xs font-medium text-[#86868b] mb-1.5 uppercase tracking-wider" : "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider"

  const eyeBtn = dark ? "absolute right-4 top-1/2 -translate-y-1/2 text-[#6e6e73] hover:text-white transition" : "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"

  const submitBtn = dark
    ? "w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-900 disabled:text-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm tracking-wide"
    : "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition text-sm"

  const forgotLink = dark ? "text-xs text-[#86868b] hover:text-white transition" : "text-xs text-blue-600 hover:text-blue-700 transition"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelBase}>{t("login.email")}</label>
        <input
          type="email"
          required
          placeholder="you@company.com"
          id="email"
          name="email"
          autoComplete="email"
          className={inputBase}
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className={labelBase}>{t("login.password")}</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            id="password"
            name="password"
            autoComplete="current-password"
            className={`${inputBase} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={eyeBtn}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Forgot password */}
      <div className="flex justify-end -mt-2">
        <Link to="/forgot-password" className={forgotLink}>
          {t("login.forgotPassword")}
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className={`flex items-start gap-2.5 p-3.5 rounded-xl text-sm ${dark ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-red-50 border border-red-200 text-red-600"}`}>
          {error.message === t("login.errorServer")
            ? <WifiOff size={16} className="mt-0.5 shrink-0" />
            : <AlertCircle size={16} className="mt-0.5 shrink-0" />
          }
          <span>{error.message}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className={submitBtn}
      >
        {pending ? t("login.loading") : t("login.submit")}
      </button>

    </form>
  )
}
