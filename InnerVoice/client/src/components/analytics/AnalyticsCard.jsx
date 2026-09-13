import React from "react";
import GlassSurface from "../glass/GlassSurface";

function AnalyticsCard({ title, value, icon, color }) {
  return (
    <GlassSurface
      level={1}
      className="rounded-2xl p-5 sm:p-6 border border-white/[0.08] hover:border-[#e2b17a]/30 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-sans text-[#9e9990] tracking-wide">
            {title}
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal mt-1.5 text-[#f5f2eb]">
            {value ?? 0}
          </h2>
        </div>
        <div className={`p-3 rounded-xl bg-white/[0.04] text-[#d8b27a] group-hover:bg-[#d8b27a]/15 transition-colors`}>
          {icon}
        </div>
      </div>
    </GlassSurface>
  );
}

export default AnalyticsCard;

