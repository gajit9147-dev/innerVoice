// ============================================================
// GlassButton.jsx
// Reusable frosted-glass button.
// - Morphing border radius on hover
// - Iridescent gradient border shimmer on hover
// - Elastic bounce on click
// - Supports: variant="primary" | "ghost" | "danger"
// - Supports: size="sm" | "md" | "lg"
// ============================================================

import { useState } from "react";

const VARIANTS = {
  primary: {
    base:  "text-white",
    bg:    "rgba(192, 132, 252, 0.25)",  // glass-primary tint
    bgHov: "rgba(192, 132, 252, 0.4)",
  },
  ghost: {
    base:  "text-white/80",
    bg:    "rgba(255,255,255,0.08)",
    bgHov: "rgba(255,255,255,0.18)",
  },
  danger: {
    base:  "text-red-300",
    bg:    "rgba(239, 68, 68, 0.15)",
    bgHov: "rgba(239, 68, 68, 0.3)",
  },
};

const SIZES = {
  sm: "px-4  py-1.5 text-sm  gap-1.5",
  md: "px-6  py-2.5 text-sm  gap-2",
  lg: "px-8  py-3   text-base gap-2.5",
};

function GlassButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  className = "",
  icon,
}) {
  const [hovered,  setHovered]  = useState(false);
  const [pressed,  setPressed]  = useState(false);

  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className={`
        glass-sheen
        inline-flex items-center justify-center
        font-semibold tracking-wide
        border border-white/20
        ${v.base}
        ${s}
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      style={{
        // Frosted glass background
        background: hovered ? v.bgHov : v.bg,
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        // Border radius morphs: resting → hover → pressed
        borderRadius: pressed
          ? "0.75rem"
          : hovered
          ? "2rem"
          : "1.25rem",
        // Iridescent glow border on hover
        boxShadow: hovered
          ? `0 0 20px var(--glass-primary), inset 0 1px 0 rgba(255,255,255,0.25)`
          : `inset 0 1px 0 rgba(255,255,255,0.15)`,
        // Elastic bounce scale
        transform: pressed
          ? "scale(0.95)"
          : hovered
          ? "scale(1.04)"
          : "scale(1)",
        transition: `
          border-radius 0.45s var(--liquid-ease),
          transform     0.35s var(--liquid-ease),
          box-shadow    0.35s ease,
          background    0.25s ease
        `,
      }}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export default GlassButton;
