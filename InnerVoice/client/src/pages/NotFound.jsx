import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import GlassSurface from "../components/glass/GlassSurface";

function NotFound() {
  return (
    <div className="min-h-screen bg-[#0c0e12] text-[#f5f2eb] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d8b27a]/10 rounded-full blur-3xl pointer-events-none" />

      <GlassSurface
        level={2}
        className="p-8 sm:p-12 rounded-3xl max-w-md w-full flex flex-col items-center relative z-10 border border-white/[0.1] shadow-2xl"
      >
        <div className="w-20 h-20 bg-[#d8b27a]/15 text-[#d8b27a] rounded-full flex items-center justify-center mb-6 border border-[#d8b27a]/30">
          <Compass size={38} />
        </div>

        <h1 className="font-serif text-6xl text-[#f5f2eb] mb-2 tracking-tight">
          404
        </h1>

        <h2 className="font-serif text-xl sm:text-2xl text-[#f5f2eb] mb-3">
          Thought Not Found
        </h2>

        <p className="text-xs sm:text-sm text-[#9e9990] font-sans mb-8 leading-relaxed">
          The page or memory you are seeking seems to have wandered away into the quiet. Let's return to your sanctuary.
        </p>

        <Link
          to="/dashboard"
          className="w-full flex items-center justify-center gap-2 text-[#121418] font-sans font-medium text-xs sm:text-sm py-3.5 rounded-xl shadow-lg hover:brightness-105 active:scale-[0.99] transition-all"
          style={{
            background: "linear-gradient(180deg, #dfbc86 0%, #c89e62 100%)",
          }}
        >
          <ArrowLeft size={16} />
          <span>Return to Journal</span>
        </Link>
      </GlassSurface>
    </div>
  );
}

export default NotFound;