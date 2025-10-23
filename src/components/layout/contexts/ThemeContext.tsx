"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system" | "high-contrast";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "umuo-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
  const [isClient, setIsClient] = useState(false);

  // 初始化主题
  useEffect(() => {
    setIsClient(true);

    try {
      const stored = localStorage.getItem(storageKey) as Theme;
      if (stored && ["dark", "light", "system", "high-contrast"].includes(stored)) {
        setTheme(stored);
      }
    } catch (error) {
      console.warn("Failed to read theme from localStorage:", error);
    }
  }, [storageKey]);

  // 应用主题到 DOM
  useEffect(() => {
    if (!isClient) return;

    const root = window.document.documentElement;

    // 移除所有主题类和属性
    root.classList.remove("light", "dark");
    root.removeAttribute("data-theme");

    let resolved: "dark" | "light";
    let dataThemeValue: string;

    if (theme === "system") {
      // 检测系统主题偏好
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      dataThemeValue = resolved;
      root.classList.add(resolved);
    } else if (theme === "high-contrast") {
      // 高对比度主题
      resolved = "dark";
      dataThemeValue = "high-contrast";
    } else {
      // 手动选择的深色或浅色主题
      resolved = theme;
      dataThemeValue = theme;
      root.classList.add(resolved);
    }

    // 应用主题到 data-theme 属性
    root.setAttribute("data-theme", dataThemeValue);
    setResolvedTheme(resolved);

    // 调试信息
    if (process.env.NODE_ENV === "development") {
      console.log("🎨 Theme applied:", {
        theme,
        dataTheme: dataThemeValue,
        resolved,
        classes: root.className,
        systemPreference: window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      });
    }
  }, [theme, isClient]);

  // 监听系统主题变化
  useEffect(() => {
    if (theme !== "system" || !isClient) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const resolved = mediaQuery.matches ? "dark" : "light";
      const root = window.document.documentElement;

      // 清除现有设置
      root.classList.remove("light", "dark");

      // 应用新的系统主题
      root.setAttribute("data-theme", resolved);
      root.classList.add(resolved);
      setResolvedTheme(resolved);

      // 调试信息
      if (process.env.NODE_ENV === "development") {
        console.log("🔄 System theme changed:", {
          systemPreference: resolved,
          currentTheme: theme,
          dataTheme: root.getAttribute("data-theme"),
          classes: root.className,
        });
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    // 初始检查
    if (process.env.NODE_ENV === "development") {
      console.log("📱 System theme listener active:", {
        initialPreference: mediaQuery.matches ? "dark" : "light",
        currentTheme: theme,
      });
    }

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, isClient]);

  // 保存主题到 localStorage
  const handleSetTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme);

      // 调试信息
      if (process.env.NODE_ENV === "development") {
        console.log("💾 Theme saved to localStorage:", {
          theme: newTheme,
          storageKey,
          existingValue: localStorage.getItem(storageKey),
        });
      }

      setTheme(newTheme);
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
      setTheme(newTheme);
    }
  };

  // 切换主题的快捷方法
  const toggleTheme = () => {
    const nextTheme = () => {
      switch (theme) {
        case "dark":
          return "light";
        case "light":
          return "system";
        case "system":
          return "high-contrast";
        default:
          return "dark";
      }
    };

    const newTheme = nextTheme();

    // 调试信息
    if (process.env.NODE_ENV === "development") {
      console.log("🔄 Theme toggled:", {
        from: theme,
        to: newTheme,
        togglePath: `${theme} → ${newTheme}`,
      });
    }

    handleSetTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme: handleSetTheme,
    resolvedTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
