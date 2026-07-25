// ============================================================
// GlassNav.jsx
// Pill-shaped frosted-glass navigation bar.
// - Stays fixed at the top of the viewport
// - Border radius continuously morphs via animate-morph-pill
// - Iridescent glare on hover
// - Accepts an array of nav items: [{ label, href, icon? }]
// ============================================================

import { useState } from "react";

function GlassNav({ items = [], logo = "InnerVoice", rightSlot }) {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <nav
      className="
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        glass-surface glass-sheen
        px-6 py-3
        flex items-center gap-6
        animate-morph-pill
        animate-iridescent
      "
      style={{
        minWidth: "min(90vw, 640px)",
        maxWidth: "90vw",
      }}
    >
      {/* Logo / Brand */}
      <span className="font-extrabold text-lg text-white/90 tracking-tight mr-2 shrink-0">
        {logo}
      </span>

      {/* Nav Items */}
      <div className="flex items-center gap-1 flex-1">
        {items.map((item, i) => (
          <a
            key={item.label}
            href={item.href || "#"}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            className="
              relative px-4 py-1.5 text-sm font-medium text-white/80
              rounded-full
              transition-all duration-300
              hover:text-white hover:bg-white/15
            "
            style={{
              // Individual pill pops on hover with elastic bounce
              transform: activeIndex === i ? "scale(1.08)" : "scale(1)",
              transition: `transform 0.4s var(--liquid-ease), background 0.3s ease`,
            }}
          >
            {item.icon && <span className="mr-1.5">{item.icon}</span>}
            {item.label}
          </a>
        ))}
      </div>

      {/* Right slot — e.g. profile avatar or CTA button */}
      {rightSlot && (
        <div className="shrink-0">{rightSlot}</div>
      )}
    </nav>
  );
}

export default GlassNav;
