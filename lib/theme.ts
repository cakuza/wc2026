export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "wcmd-theme";

export const DARK_THEME_COLOR = "#0a1628";
export const LIGHT_THEME_COLOR = "#f5f4f0";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch (e) {
    return null;
  }
}

export function setStoredTheme(theme: Theme | null): void {
  if (typeof window === "undefined") return;
  try {
    if (theme) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } else {
      localStorage.removeItem(THEME_STORAGE_KEY);
    }
  } catch (e) {}
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch (e) {
    return "dark";
  }
}

export function resolveInitialTheme(): Theme {
  const stored = getStoredTheme();
  if (stored) return stored;
  return getSystemTheme();
}

export function applyThemeToDOM(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;

  const metaColor = theme === "light" ? LIGHT_THEME_COLOR : DARK_THEME_COLOR;
  let metaTag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!metaTag) {
    metaTag = document.createElement("meta");
    metaTag.name = "theme-color";
    document.head.appendChild(metaTag);
  }
  metaTag.content = metaColor;
}
