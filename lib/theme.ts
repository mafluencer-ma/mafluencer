export type Theme = "dark" | "light";

const STORAGE_KEY = "mafluencer-theme";

/** Returns the theme that matches the current local time.
 *  Dark:  20:00 → 07:00
 *  Light: 07:00 → 20:00
 */
export function getThemeByTime(): Theme {
  const hour = new Date().getHours();
  return hour >= 20 || hour < 7 ? "dark" : "light";
}

export function getSavedTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "dark" || saved === "light" ? saved : null;
}

export function saveTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, theme);
}

export function clearSavedTheme() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.classList.remove("dark", "light");
  el.classList.add(theme);
}
