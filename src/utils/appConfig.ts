/**
 * appConfig.ts
 * ─────────────────────────────────────────────────────────────────────
 * Single source of truth for every white-label / deployment setting.
 * All values come from Vite env vars (VITE_*) so they can be set in
 * Vercel → Settings → Environment Variables without touching source code.
 *
 * Usage:
 *   import { appConfig } from "@/utils/appConfig"
 *   console.log(appConfig.name)   // "Flow IT"
 * ─────────────────────────────────────────────────────────────────────
 */

const env = import.meta.env

export const appConfig = {
  /** Display name shown in the navbar, login page, <title>, emails, etc. */
  name: env.VITE_APP_NAME || "Flow IT",

  /** Short tagline / subtitle used in login page hero and meta description */
  description: env.VITE_APP_DESCRIPTION || "IT Asset Management Platform",

  /**
   * Logo URL.
   * If VITE_APP_LOGO_URL is set (e.g. "https://cdn.example.com/logo.png"),
   * it is used everywhere instead of the local logo asset.
   * Leave empty to use the bundled local logo.
   */
  logoUrl: env.VITE_APP_LOGO_URL || "",

  /**
   * Favicon URL.
   * Set VITE_APP_FAVICON_URL to an absolute URL to override the default favicon.
   * Leave empty to keep the static /public/logo.png favicon.
   */
  faviconUrl: env.VITE_APP_FAVICON_URL || "",

  /** Primary accent colour (Tailwind arbitrary value ready, e.g. "#0071e3") */
  primaryColor: env.VITE_APP_PRIMARY_COLOR || "#0071e3",

  /** Public base URL of this frontend (used for OG tags / email links) */
  appUrl: env.VITE_APP_URL || "http://localhost:5173",

  /** Backend REST API base URL */
  apiUrl: env.VITE_API_URL || "http://localhost:3000",

  /** Support email shown in error pages / footer */
  supportEmail: env.VITE_APP_SUPPORT_EMAIL || "",

  /** Company / vendor name that owns this deployment (footer copyright) */
  companyName: env.VITE_APP_COMPANY_NAME || "",

  /** Version tag shown in Settings → About */
  version: env.VITE_APP_VERSION || "1.0.0",
} as const

export type AppConfig = typeof appConfig
export default appConfig
