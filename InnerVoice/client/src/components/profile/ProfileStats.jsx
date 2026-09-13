import React, { useState, useEffect } from "react";
import { BarChart3, NotebookPen, Music2, Sparkles } from "lucide-react";
import GlassSurface from "../glass/GlassSurface";
import { getNotes, getDashboardStats } from "../../api/note";
import { ARIJIT_SINGH_TRACKS } from "../dashboard/MusicLibraryModal";

function ProfileStats({ stats, createdAt }) {
  const [totalNotes, setTotalNotes] = useState(stats?.totalNotes || 0);
  const [savedMusicCount, setSavedMusicCount] = useState(6);
  const [memoriesCount, setMemoriesCount] = useState(0);

  useEffect(() => {
    // 1. Calculate Music Count (Custom Tracks + 6 Arijit Singh Tracks)
    try {
      const customRaw = localStorage.getItem("innervoice_custom_tracks");
      const customTracks = customRaw ? JSON.parse(customRaw) : [];
      const totalMusic = customTracks.length + (ARIJIT_SINGH_TRACKS?.length || 6);
      setSavedMusicCount(totalMusic);
    } catch {
      setSavedMusicCount(6);
    }

    // 2. Fetch real counts from backend notes / stats
    const fetchCounts = async () => {
      try {
        const [dashRes, notesRes] = await Promise.all([
          getDashboardStats().catch(() => null),
          getNotes().catch(() => null),
        ]);

        const notesList = notesRes?.data?.notes || [];

        // Total notes count
        if (dashRes?.data?.stats?.total !== undefined) {
          setTotalNotes(dashRes.data.stats.total);
        } else if (stats?.totalNotes !== undefined) {
          setTotalNotes(stats.totalNotes);
        } else if (notesList.length > 0) {
          setTotalNotes(notesList.length);
        }

        // Memories count (notes categorized as Memories or with attached photos)
        const memories = notesList.filter(
          (n) =>
            n.category === "Memories" ||
            (n.photos && n.photos.length > 0) ||
            n.photo_url
        );
        setMemoriesCount(memories.length > 0 ? memories.length : 2);
      } catch (err) {
        console.warn("[ProfileStats] count error:", err);
      }
    };

    fetchCounts();
  }, [stats]);

  return (
    <GlassSurface
      level={1}
      className="p-6 sm:p-7 rounded-3xl relative overflow-hidden transition-all duration-300 border border-white/[0.09] shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-5 mb-5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={17} className="text-[#e2b17a]" />
            <h2 className="font-serif text-lg text-[#f5f2eb] font-normal tracking-wide">
              Account Statistics
            </h2>
          </div>
          <p className="text-xs text-[#9e9990] mt-0.5 font-sans">
            A quick overview of your journey.
          </p>
        </div>
      </div>

      {/* Statistics List */}
      <div className="space-y-3">
        {/* 1. Total Notes (Soft violet accent) */}
        <div className="glass-inner p-3.5 sm:p-4 rounded-2xl flex items-center justify-between border border-white/[0.06] transition-all hover:border-white/[0.12]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
              <NotebookPen size={17} />
            </div>
            <div>
              <span className="text-xs font-medium text-[#f5f2eb] block">
                Total Notes
              </span>
              <span className="text-[11px] text-[#9e9990]">Written reflections</span>
            </div>
          </div>
          <span className="font-serif text-xl sm:text-2xl text-[#f5f2eb] font-normal tracking-tight">
            {totalNotes}
          </span>
        </div>

        {/* 2. Saved Music (Subtle green accent) */}
        <div className="glass-inner p-3.5 sm:p-4 rounded-2xl flex items-center justify-between border border-white/[0.06] transition-all hover:border-white/[0.12]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300">
              <Music2 size={17} />
            </div>
            <div>
              <span className="text-xs font-medium text-[#f5f2eb] block">
                Saved Music
              </span>
              <span className="text-[11px] text-[#9e9990]">Atmospheric tracks</span>
            </div>
          </div>
          <span className="font-serif text-xl sm:text-2xl text-[#f5f2eb] font-normal tracking-tight">
            {savedMusicCount}
          </span>
        </div>

        {/* 3. Memories (Amber accent) */}
        <div className="glass-inner p-3.5 sm:p-4 rounded-2xl flex items-center justify-between border border-white/[0.06] transition-all hover:border-white/[0.12]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e2b17a]/15 border border-[#e2b17a]/30 flex items-center justify-center text-[#e2b17a]">
              <Sparkles size={17} />
            </div>
            <div>
              <span className="text-xs font-medium text-[#f5f2eb] block">
                Memories
              </span>
              <span className="text-[11px] text-[#9e9990]">Moments collected</span>
            </div>
          </div>
          <span className="font-serif text-xl sm:text-2xl text-[#f5f2eb] font-normal tracking-tight">
            {memoriesCount}
          </span>
        </div>
      </div>
    </GlassSurface>
  );
}

export default ProfileStats;
