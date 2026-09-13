import React from "react";

/**
 * Reusable GlassSurface Component
 * Hierarchy:
 * - level 1: Primary Glass (Sidebar, note cards, writing composer, large panels)
 * - level 2: Inner Glass (Music players, voice players, secondary controls)
 * - level 3: Floating Glass (Dialogs, dropdowns, context menus, bottom sheets)
 */
export default function GlassSurface({
  level = 1,
  className = "",
  children,
  onClick,
  hoverEffect = false,
  as: Component = "div",
  ...props
}) {
  const levelClass =
    level === 1
      ? "glass-primary"
      : level === 2
      ? "glass-inner"
      : "glass-floating";

  const hoverClass = hoverEffect ? "glass-primary-hover transition-all duration-300" : "";

  return (
    <Component
      onClick={onClick}
      className={`${levelClass} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
