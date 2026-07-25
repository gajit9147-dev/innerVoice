// ============================================================
// useLiquidGlare.js
// Custom hook — tracks mouse position and moves a radial-gradient
// glare overlay over the entire page with a 100ms lag, simulating
// the surface tension of thick liquid glass.
// ============================================================

import { useEffect, useRef } from "react";

export function useLiquidGlare() {
  // Stores the "target" mouse position the overlay is chasing
  const targetPos = useRef({ x: 0, y: 0 });
  // Stores the "current" smoothed position (100ms lag)
  const currentPos = useRef({ x: 0, y: 0 });
  // rAF handle so we can cancel on unmount
  const rafHandle = useRef(null);

  useEffect(() => {
    // Create the glare overlay div (or reuse if already exists)
    let overlay = document.getElementById("liquid-glare-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "liquid-glare-overlay";
      document.body.appendChild(overlay);
    }

    // Track mouse — store as percentage of viewport
    const handleMouseMove = (e) => {
      targetPos.current = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);

    // rAF loop — lerp current toward target at ~10% per frame
    // This creates the viscous 100ms lag feel
    const lerp = (a, b, t) => a + (b - a) * t;
    const LERP_FACTOR = 0.06; // lower = more lag (thicker liquid)

    const animate = () => {
      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, LERP_FACTOR);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, LERP_FACTOR);

      // Apply a radial gradient using CSS custom property color palette
      overlay.style.background = `
        radial-gradient(
          600px circle at ${currentPos.current.x}% ${currentPos.current.y}%,
          var(--glass-primary),
          var(--glass-secondary) 40%,
          transparent 70%
        )
      `;

      rafHandle.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafHandle.current);
    };
  }, []);
}
