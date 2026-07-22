"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  Theme,
  getStoredTheme,
  setStoredTheme,
  getSystemTheme,
  resolveInitialTheme,
  applyThemeToDOM,
} from "@/lib/theme";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isTransitioning: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document !== "undefined") {
      const rootTheme = document.documentElement.getAttribute("data-theme") as Theme;
      if (rootTheme === "light" || rootTheme === "dark") {
        return rootTheme;
      }
    }
    return resolveInitialTheme();
  });

  const isTransitioningRef = useRef(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Synchronize state and DOM
  const updateTheme = useCallback((newTheme: Theme, isExplicitUserAction = false) => {
    if (isExplicitUserAction) {
      setStoredTheme(newTheme);
    }
    applyThemeToDOM(newTheme);
    setThemeState(newTheme);
  }, []);

  const changeThemeWithTransition = useCallback((nextTheme: Theme) => {
    if (isTransitioningRef.current) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const supportsViewTransition =
      typeof document !== "undefined" && "startViewTransition" in document;

    if (!supportsViewTransition || prefersReducedMotion) {
      updateTheme(nextTheme, true);
      return;
    }

    isTransitioningRef.current = true;
    setIsTransitioning(true);

    try {
      const transition = (document as any).startViewTransition(() => {
        updateTheme(nextTheme, true);
      });

      transition.finished.finally(() => {
        isTransitioningRef.current = false;
        setIsTransitioning(false);
      });
    } catch (e) {
      updateTheme(nextTheme, true);
      isTransitioningRef.current = false;
      setIsTransitioning(false);
    }
  }, [updateTheme]);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    changeThemeWithTransition(nextTheme);
  }, [theme, changeThemeWithTransition]);

  const setTheme = useCallback((newTheme: Theme) => {
    changeThemeWithTransition(newTheme);
  }, [changeThemeWithTransition]);

  // Sync with localStorage across tabs & listen for system theme changes when no saved preference exists
  useEffect(() => {
    // Ensure DOM attributes match resolved initial theme upon hydration
    applyThemeToDOM(theme);

    function handleStorageChange(e: StorageEvent) {
      if (e.key === "wcmd-theme") {
        const stored = getStoredTheme();
        const targetTheme = stored ?? getSystemTheme();
        applyThemeToDOM(targetTheme);
        setThemeState(targetTheme);
      }
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    function handleSystemThemeChange(e: MediaQueryListEvent) {
      // Only follow OS changes if the user has NOT set an explicit preference
      if (getStoredTheme() === null) {
        const systemTheme: Theme = e.matches ? "light" : "dark";
        applyThemeToDOM(systemTheme);
        setThemeState(systemTheme);
      }
    }

    window.addEventListener("storage", handleStorageChange);
    try {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } catch (e) {
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      try {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      } catch (e) {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
