import React from "react";
import GlassSurface from "../glass/GlassSurface";

function AnalyticsCard({ title, value, hint, icon }) {
  return (
    <GlassSurface
      level={1}
      className="rounded-2xl p-4 sm:p-6 border border-white/[0.08] hover:border-[#e2b17a]/30 transition-all duration-300 group min-w-0"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-sans text-[#9e9990] tracking-wide leading-tight">{title}</p>
          <h2 className="text-xl sm:text-3xl font-serif font-normal mt-1.5 text-[#f5f2eb] truncate">
            {value ?? 0}
          </h2>
          {hint && <p className="text-[11px] text-[#9e9990] mt-1 truncate">{hint}</p>}
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.04] text-[#d8b27a] group-hover:bg-[#d8b27a]/15 transition-colors shrink-0">
          {icon}
        </div>
      </div>
    </GlassSurface>
  );
}

export default AnalyticsCard;
