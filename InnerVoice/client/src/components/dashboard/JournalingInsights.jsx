import { useState, useEffect, useMemo } from "react";

export default function JournalingInsights({ stats, notes = [] }) {
  // Compute dynamic stats if available, or fallback to exact reference numbers
  const totalNotesCount = stats?.total ?? (notes.length > 0 ? notes.length : 145);
  const streakDays = 28;

  // Approximate words count
  const wordsThisWeek = useMemo(() => {
    if (notes.length > 0) {
      const totalWords = notes.reduce((acc, note) => {
        return acc + (note.content ? note.content.split(/\s+/).filter(Boolean).length : 0);
      }, 0);
      return totalWords > 0 ? totalWords.toLocaleString() : "3,200";
    }
    return "3,200";
  }, [notes]);

  // Horseshoe upward dome arc length (from lower-left over the top to lower-right):
  const TOTAL_ARC = 258;
  const targetOffset = TOTAL_ARC * (1 - 0.76); // 76% filled matching reference

  const [arcOffset, setArcOffset] = useState(TOTAL_ARC);
  const [sparklineOffset, setSparklineOffset] = useState(250);

  useEffect(() => {
    // Smooth entrance animation for gauge arc
    const timer = setTimeout(() => {
      setArcOffset(targetOffset);
      setSparklineOffset(0);
    }, 150);
    return () => clearTimeout(timer);
  }, [targetOffset]);

  return (
    <div className="w-72 flex flex-col gap-5 py-6 px-4 shrink-0 select-none overflow-y-auto">
      {/* Header */}
      <div className="px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
          Analytics
        </span>
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">
          Journaling Insights
        </h2>
      </div>

      {/* Card 1: Note Streak (Upward Dome Arch over the top matching reference) */}
      <div className="liquid-glass-card rounded-3xl p-5 relative overflow-hidden text-white transition-all shadow-[0_12px_35px_rgba(0,0,0,0.5)] group">
        {/* Ambient cyan glow behind arc */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <span className="text-sm font-medium text-slate-300 block mb-1 relative z-10">
          Note Streak
        </span>

        {/* Circular Gauge Meter */}
        <div className="relative flex items-center justify-center my-1">
          <svg
            viewBox="0 0 200 130"
            className="w-full h-32 overflow-visible relative z-10"
          >
            <defs>
              <linearGradient id="streakGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <filter id="streakNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background track (Arch curving UP over top from lower-left to lower-right) */}
            <path
              d="M 46 112 A 62 62 0 1 1 154 112"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="9"
              strokeLinecap="round"
            />

            {/* Glowing cyan progress arc */}
            <path
              d="M 46 112 A 62 62 0 1 1 154 112"
              fill="none"
              stroke="url(#streakGrad)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={TOTAL_ARC}
              strokeDashoffset={arcOffset}
              filter="url(#streakNeonGlow)"
              style={{
                transition: "stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />

            {/* Exact Center Text under the dome */}
            <text
              x="100"
              y="86"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="23"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
              letterSpacing="-0.02em"
              className="select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            >
              {streakDays} Days
            </text>
          </svg>
        </div>
      </div>

      {/* Card 2: Total Notes */}
      <div className="liquid-glass-card rounded-3xl p-5 relative overflow-hidden text-white transition-all shadow-[0_12px_35px_rgba(0,0,0,0.5)]">
        <span className="text-sm font-medium text-slate-300 block mb-1">
          Total Notes
        </span>
        <div className="text-3xl font-extrabold text-white tracking-tight mt-1">
          {totalNotesCount}
        </div>
      </div>

      {/* Card 3: Words This Week */}
      <div className="liquid-glass-card rounded-3xl p-5 relative overflow-hidden text-white transition-all shadow-[0_12px_35px_rgba(0,0,0,0.5)]">
        <span className="text-sm font-medium text-slate-300 block mb-1">
          Words This Week
        </span>
        <div className="text-3xl font-extrabold text-white tracking-tight mt-1">
          {wordsThisWeek}
        </div>
      </div>

      {/* Card 4: Mood Trend */}
      <div className="liquid-glass-card rounded-3xl p-5 relative overflow-hidden text-white transition-all shadow-[0_12px_35px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-300">
            Mood Trend
          </span>
          <div className="flex items-center gap-1.5 text-base">
            <span title="Happy" className="hover:scale-110 transition cursor-pointer">😀</span>
            <span title="Excited" className="hover:scale-110 transition cursor-pointer">😄</span>
            <span title="Calm" className="hover:scale-110 transition cursor-pointer">😐</span>
          </div>
        </div>

        {/* Sparkline Wave Chart */}
        <div className="relative h-20 w-full flex items-center justify-center pt-2">
          <svg viewBox="0 0 200 65" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="moodLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <linearGradient id="moodAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Shaded area under curve */}
            <path
              d="M 10 52 C 40 48, 60 20, 90 22 C 120 25, 140 48, 160 42 C 175 36, 185 18, 192 15 L 192 65 L 10 65 Z"
              fill="url(#moodAreaGrad)"
            />

            {/* Main Sparkline Curve with draw-in transition */}
            <path
              d="M 10 52 C 40 48, 60 20, 90 22 C 120 25, 140 48, 160 42 C 175 36, 185 18, 192 15"
              fill="none"
              stroke="url(#moodLineGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="250"
              strokeDashoffset={sparklineOffset}
              style={{
                transition: "stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />

            {/* Glowing Data Nodes */}
            <circle cx="10" cy="52" r="3.5" fill="#38bdf8" className="shadow-[0_0_8px_#38bdf8]" />
            <circle cx="90" cy="22" r="3.5" fill="#06b6d4" className="shadow-[0_0_8px_#06b6d4]" />
            <circle cx="160" cy="42" r="3.5" fill="#22d3ee" className="shadow-[0_0_8px_#22d3ee]" />
            <circle cx="192" cy="15" r="4.5" fill="#22d3ee" className="shadow-[0_0_12px_#22d3ee]" />
          </svg>
        </div>
      </div>
    </div>
  );
}
