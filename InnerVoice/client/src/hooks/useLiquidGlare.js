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

    // Setup overlay styles once
    overlay.style.pointerEvents = "none";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "1";
    overlay.style.opacity = "0.05";

    // Track mouse — store as percentage of viewport
    const handleMouseMove = (e) => {
      targetPos.current = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);

    // rAF loop — lerp current toward target at ~10% per frame
    const lerp = (a, b, t) => a + (b - a) * t;
    const LERP_FACTOR = 0.06;

    const animate = () => {
      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, LERP_FACTOR);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, LERP_FACTOR);

      // Delicate frosted glass specular highlight
      overlay.style.background = `
        radial-gradient(
          500px circle at ${currentPos.current.x}% ${currentPos.current.y}%,
          rgba(255, 255, 255, 0.2),
          transparent 60%
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
