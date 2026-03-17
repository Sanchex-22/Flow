import ReactDOM from "react-dom/client";
import "./index.css";
import { UserContextProvider } from "./context/userContext.tsx";
import App from "./app.tsx";

// ── Interceptor global: cualquier 401 cierra la sesión ──────────────────────
;(function installFetchInterceptor() {
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    const response = await originalFetch(...args)
    if (response.status === 401) {
      const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url
      // Ignorar el endpoint de login para no crear bucle
      if (!url.includes("/auth/login")) {
        localStorage.removeItem("jwt")
        sessionStorage.removeItem("jwt")
        localStorage.removeItem("selectedCompany")
        sessionStorage.removeItem("selectedCompany")
        if (window.location.pathname !== "/login") {
          window.location.href = "/login"
        }
      }
    }
    return response
  }
})()
// ────────────────────────────────────────────────────────────────────────────
import { UserProfileProvider } from "./context/userProfileContext.tsx";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import 'flag-icon-css/css/flag-icons.min.css';
import en from "./diccionary/en";
import es from "./diccionary/es.tsx";

const savedLanguage = localStorage.getItem("i18nextLng") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: en,
    es: es
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <UserContextProvider>
    <UserProfileProvider>
        <App />
    </UserProfileProvider>
  </UserContextProvider>
);
