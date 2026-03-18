/**
 * useAppLogo — returns the resolved logo URL.
 * Uses VITE_APP_LOGO_URL if set, otherwise falls back to the bundled asset.
 * Named export so callers can destructure it clearly.
 */
import Images from "../assets"
import appConfig from "./appConfig"

export function useAppLogo(): string {
  return appConfig.logoUrl || Images.logo
}

export default useAppLogo
