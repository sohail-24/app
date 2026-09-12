import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light" | "system";

export interface UseThemeProps {
  theme?: string;
  setTheme: (theme: string) => void;
  forcedTheme?: string;
  resolvedTheme?: "dark" | "light";
  themes: string[];
  systemTheme?: "dark" | "light";
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  themes?: string[];
  forcedTheme?: string;
}

const ThemeContext = createContext<UseThemeProps>({
  theme: "system",
  setTheme: () => {},
  themes: ["light", "dark", "system"],
});

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "freshflow-theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = true,
  themes = ["light", "dark"],
  forcedTheme,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<string>(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      return localStorage.getItem(storageKey) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const getSystemTheme = useCallback((): "dark" | "light" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  const [systemTheme, setSystemTheme] = useState<"dark" | "light">(getSystemTheme);

  useEffect(() => {
    if (!enableSystem || typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [enableSystem]);

  const resolvedTheme: "dark" | "light" = useMemo(() => {
    const current = forcedTheme ?? theme;
    if (current === "system") {
      return systemTheme;
    }
    return current === "dark" ? "dark" : "light";
  }, [forcedTheme, theme, systemTheme]);

  const applyTheme = useCallback(
    (targetTheme: "dark" | "light") => {
      const root = document.documentElement;
      let cleanupTransition: (() => void) | null = null;

      if (disableTransitionOnChange) {
        const css = document.createElement("style");
        css.appendChild(
          document.createTextNode(
            "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}",
          ),
        );
        document.head.appendChild(css);
        cleanupTransition = () => {
          window.getComputedStyle(document.body);
          setTimeout(() => {
            if (document.head.contains(css)) {
              document.head.removeChild(css);
            }
          }, 1);
        };
      }

      if (attribute === "class") {
        root.classList.remove("light", "dark");
        root.classList.add(targetTheme);
      } else {
        root.setAttribute(attribute, targetTheme);
      }
      root.style.colorScheme = targetTheme;

      if (cleanupTransition) {
        cleanupTransition();
      }
    },
    [attribute, disableTransitionOnChange],
  );

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme, applyTheme]);

  const setTheme = useCallback(
    (newTheme: string) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {
        // Local storage unavailable
      }
    },
    [storageKey],
  );

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setThemeState(e.newValue || defaultTheme);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [storageKey, defaultTheme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      forcedTheme,
      resolvedTheme,
      themes: enableSystem ? [...themes, "system"] : themes,
      systemTheme: enableSystem ? systemTheme : undefined,
    }),
    [theme, setTheme, forcedTheme, resolvedTheme, themes, enableSystem, systemTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
