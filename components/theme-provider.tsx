"use client";

import {
  createContext, useContext, useEffect, useState, useCallback,
} from "react";
import {
  type Theme, getThemeByTime, getSavedTheme, saveTheme, clearSavedTheme, applyTheme,
} from "@/lib/theme";

type ThemeContextValue = {
  theme:       Theme;
  isAuto:      boolean;
  toggleTheme: () => void;
  setAuto:     () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme:       "dark",
  isAuto:      true,
  toggleTheme: () => {},
  setAuto:     () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme,  setTheme]  = useState<Theme>("dark");
  const [isAuto, setIsAuto] = useState(true);

  // Initialise from localStorage / time on mount
  useEffect(() => {
    const saved = getSavedTheme();
    if (saved) {
      setTheme(saved);
      setIsAuto(false);
      applyTheme(saved);
    } else {
      const auto = getThemeByTime();
      setTheme(auto);
      setIsAuto(true);
      applyTheme(auto);
    }
  }, []);

  // Re-check every 30 minutes when in auto mode
  useEffect(() => {
    const interval = setInterval(() => {
      if (getSavedTheme() === null) {
        const auto = getThemeByTime();
        setTheme(auto);
        setIsAuto(true);
        applyTheme(auto);
      }
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setIsAuto(false);
    saveTheme(next);
    applyTheme(next);
  }, [theme]);

  const setAuto = useCallback(() => {
    clearSavedTheme();
    const auto = getThemeByTime();
    setTheme(auto);
    setIsAuto(true);
    applyTheme(auto);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isAuto, toggleTheme, setAuto }}>
      {children}
    </ThemeContext.Provider>
  );
}
