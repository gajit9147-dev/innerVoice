// ============================================================
// MeshBackground.jsx
// Subtle environmental lighting beneath the translucent dark glass.
// Never overpowers the dark background imagery.
// ============================================================

import React from "react";

function MeshBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        background: `
          radial-gradient(ellipse 70% 60% at 50% 15%, rgba(216, 178, 122, 0.035) 0%, transparent 65%),
          radial-gradient(ellipse 60% 50% at 85% 85%, rgba(20, 22, 27, 0.5) 0%, transparent 70%)
        `,
        opacity: 0.7,
      }}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}

export default MeshBackground;
