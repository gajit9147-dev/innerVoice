// ============================================================
// LiquidGlassProvider.jsx
// Context provider that:
//  1. Fetches the iridescent color palette from GET /api/glass-theme
//  2. Injects the palette into CSS custom properties on :root
//  3. Activates the useLiquidGlare hook for the mouse glare overlay
//  4. Renders the MeshBackground behind all children
// ============================================================

import { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "./ThemeContext";
import { useLiquidGlare } from "../hooks/useLiquidGlare";
import MeshBackground from "../components/glass/MeshBackground";

// Default theme configuration containing configurations for both modes
const DEFAULT_THEME = {
  dark: {
    primary:   "#c084fc",
    secondary: "#22d3ee",
    accent:    "#f472b6",
    glassBg:   "rgba(15, 23, 42, 0.45)",
    glassBorder: "rgba(255, 255, 255, 0.08)",
    glassInset: "inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)"
  },
  light: {
    primary:   "#d8b4fe",
    secondary: "#a5f3fc",
    accent:    "#fbcfe8",
    glassBg:   "rgba(255, 255, 255, 0.4)",
    glassBorder: "rgba(255, 255, 255, 0.4)",
    glassInset: "inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0, 0, 0, 0.03)"
  }
};

const LiquidGlassContext = createContext(DEFAULT_THEME.light);

// Hook for child components to read the active configuration properties
export function useLiquidGlass() {
  return useContext(LiquidGlassContext);
}

export function LiquidGlassProvider({ children }) {
  const { theme: activeMode } = useTheme(); // Read light/dark state
  const [themes, setThemes] = useState(DEFAULT_THEME);

  // ── Step 1: Fetch theme config containing both dark & light schemes ──
  useEffect(() => {
    const rawApi = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
    const apiBase = rawApi.endsWith("/api") ? rawApi.replace(/\/api$/, "") : rawApi;
    fetch(`${apiBase}/api/glass-theme`)
      .then((res) => res.json())
      .then((data) => {
        if (data.dark && data.light) {
          setThemes(data);
        }
      })
      .catch(() => {
        console.warn("[LiquidGlass] Could not fetch theme config — using local defaults.");
      });
  }, []);

  // Get configuration corresponding to the active mode
  const activeTheme = themes[activeMode] || themes.light;

  // ── Step 2: Inject active theme values into root variables ──
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--glass-primary",   activeTheme.primary);
    root.style.setProperty("--glass-secondary", activeTheme.secondary);
    root.style.setProperty("--glass-accent",    activeTheme.accent);
    root.style.setProperty("--glass-bg",        activeTheme.glassBg);
    root.style.setProperty("--glass-border",    activeTheme.glassBorder);
    root.style.setProperty("--glass-inset",     activeTheme.glassInset);
  }, [activeTheme]);

  // ── Step 3: Activate mouse glare overlay tracking ──
  useLiquidGlare();

  return (
    <LiquidGlassContext.Provider value={activeTheme}>
      {/* Animated background gradient blobs */}
      <MeshBackground />
      {children}
    </LiquidGlassContext.Provider>
  );
}
