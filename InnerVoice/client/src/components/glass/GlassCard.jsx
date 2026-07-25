// ============================================================
// GlassCard.jsx
// Reusable frosted-glass card component.
// - bg-white/8 + backdrop-blur + border-white/20
// - Border radius morphs on hover via CSS transition
// - Iridescent sheen pseudo-element (::before in CSS)
// - Liquid entrance animation on mount
// ============================================================

import { useState } from "react";

function GlassCard({
  children,
  className = "",
  animate = true,   // plays liquid-enter animation on mount
  onClick,
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        glass-surface glass-sheen
        ${animate ? "animate-liquid-enter" : ""}
        ${onClick ? "cursor-pointer select-none" : ""}
        ${className}
      `}
      style={{
        // Border radius morphs smoothly on hover (liquid bounce)
        borderRadius: hovered ? "2.5rem" : "1.5rem",
        transition: `border-radius 0.5s var(--liquid-ease),
                     transform     0.4s var(--liquid-ease),
                     box-shadow    0.4s var(--liquid-ease),
                     background    0.4s ease`,
      }}
    >
      {/* z-index 2 so content sits above the ::before sheen */}
      <div className="relative z-[2]">
        {children}
      </div>
    </div>
  );
}

export default GlassCard;
