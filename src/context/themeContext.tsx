import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "dark" | "light" | "system";

interface ThemeContextType {
  /** Resolved effective dark/light value (accounts for "system") */
  isDarkMode: boolean;
  /** The stored preference: "dark" | "light" | "system" */
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  /** Legacy toggle — kept so existing callers still work */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const prefersDark = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const resolveIsDark = (mode: ThemeMode) =>
  mode === "dark" ? true : mode === "light" ? false : prefersDark();

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme") as ThemeMode | null;
    return saved === "dark" || saved === "light" || saved === "system"
      ? saved
      : "dark";
  });

  const [isDarkMode, setIsDarkMode] = useState(() =>
    resolveIsDark(
      (localStorage.getItem("theme") as ThemeMode | null) ?? "dark"
    )
  );

  // Apply class to <html> and persist
  useEffect(() => {
    const effective = resolveIsDark(theme);
    setIsDarkMode(effective);

    const root = document.documentElement;
    if (effective) {
      root.classList.add("dark");
      document.body.classList.replace("bg-white", "bg-gray-900") ||
        document.body.classList.add("bg-gray-900");
      document.body.classList.replace("text-gray-900", "text-white") ||
        document.body.classList.add("text-white");
    } else {
      root.classList.remove("dark");
      document.body.classList.replace("bg-gray-900", "bg-white") ||
        document.body.classList.add("bg-white");
      document.body.classList.replace("text-white", "text-gray-900") ||
        document.body.classList.add("text-gray-900");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Re-resolve when OS preference changes (only matters in "system" mode)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") setIsDarkMode(mq.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (t: ThemeMode) => setThemeState(t);

  const toggleTheme = () =>
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return context;
};
