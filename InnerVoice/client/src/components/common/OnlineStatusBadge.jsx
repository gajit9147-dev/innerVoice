// ============================================================
// client/src/components/common/OnlineStatusBadge.jsx
// Discreet real-time connectivity status badge
// Displays: 🟢 Online | ⚡ Offline Mode | ☁ Syncing
// ============================================================

import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export default function OnlineStatusBadge({ isSyncing = false }) {
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isSyncing) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-medium tracking-wide animate-pulse"
        title="Syncing changes with InnerVoice cloud..."
      >
        <RefreshCw size={11} className="animate-spin text-cyan-400 shrink-0" />
        <span className="hidden sm:inline">Syncing</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[11px] font-medium tracking-wide shadow-[0_0_10px_rgba(245,158,11,0.2)]"
        title="Offline Mode — Reading and playing from local offline cache"
      >
        <WifiOff size={12} className="text-amber-400 shrink-0" />
        <span>Offline Mode</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium tracking-wide"
      title="Connected to InnerVoice Cloud"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
      <span className="hidden md:inline text-[10px] text-emerald-300/80">Online</span>
    </div>
  );
}
