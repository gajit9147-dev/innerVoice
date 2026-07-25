// ============================================================
// MeshBackground.jsx
// Full-screen animated background with 3 layered radial gradients
// drifting slowly like liquid beneath the UI.
// ============================================================

import { useEffect, useRef } from "react";

function MeshBackground() {
  const ref = useRef(null);

  // On mount, read the CSS custom property colors set by LiquidGlassProvider
  // and kick off the animation (pure CSS handles it via animate-liquid-float)
  useEffect(() => {
    // nothing to do — CSS animation handles the drift
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        // Three radial gradient "blobs" that drift independently
        background: `
          radial-gradient(ellipse 80% 60% at 20% 30%, var(--glass-primary) 0%, transparent 60%),
          radial-gradient(ellipse 60% 80% at 80% 70%, var(--glass-secondary) 0%, transparent 60%),
          radial-gradient(ellipse 70% 50% at 50% 10%, var(--glass-accent) 0%, transparent 50%)
        `,
        backgroundSize: "200% 200%, 200% 200%, 200% 200%",
        opacity: 0.18,
      }}
      className="
        fixed inset-0 -z-10
        pointer-events-none
        animate-liquid-float
      "
    />
  );
}

export default MeshBackground;
