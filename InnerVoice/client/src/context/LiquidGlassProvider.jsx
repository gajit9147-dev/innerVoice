// ============================================================
// LiquidGlassProvider.jsx
// Context provider that:
//  1. Fetches the iridescent color palette from GET /api/glass-theme
//  2. Injects the palette into CSS custom properties on :root
//  3. Activates the useLiquidGlare hook for the mouse glare overlay
//  4. Renders the MeshBackground behind all children
// ============================================================

import { createContext, useContext, useEffect, useState } from "react";
import { useLiquidGlare } from "../hooks/useLiquidGlare";
import MeshBackground from "../components/glass/MeshBackground";

// Default theme — used before the API responds
const DEFAULT_THEME = {
  primary:   "#c084fc",
  secondary: "#22d3ee",
  accent:    "#f472b6",
};

const LiquidGlassContext = createContext(DEFAULT_THEME);

// Hook for child components to read the current palette
export function useLiquidGlass() {
  return useContext(LiquidGlassContext);
}

export function LiquidGlassProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  // ── Step 1: Fetch palette from backend on load ──
  useEffect(() => {
    fetch("/api/glass-theme")
      .then((res) => res.json())
      .then((data) => {
        if (data.primary) {
          setTheme(data);
        }
      })
      .catch(() => {
        // Fall back silently to DEFAULT_THEME if server is unreachable
        console.warn("[LiquidGlass] Could not fetch theme — using defaults.");
      });
  }, []);

  // ── Step 2: Inject palette into CSS custom properties ──
  // This makes --glass-primary / --glass-secondary / --glass-accent
  // available to every CSS rule and glass component globally
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--glass-primary",   theme.primary);
    root.style.setProperty("--glass-secondary", theme.secondary);
    root.style.setProperty("--glass-accent",    theme.accent);
  }, [theme]);

  // ── Step 3: Activate the mouse glare overlay ──
  useLiquidGlare();

  return (
    <LiquidGlassContext.Provider value={theme}>
      {/* Animated mesh gradient background (sits behind everything) */}
      <MeshBackground />

      {children}
    </LiquidGlassContext.Provider>
  );
}
