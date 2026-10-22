import { useMemo } from "react";
import { History } from "lucide-react";
import GlassSurface from "../glass/GlassSurface";
import { getOnThisDay } from "../../utils/journalInsights";

// Shows notes written on this day in earlier years, and 1 week / 1 month ago. Hidden when there are none.
export default function OnThisDayCard({ notes = [], onSelectNote }) {
  const items = useMemo(() => getOnThisDay(notes), [notes]);
  if (items.length === 0) return null;

  return (
    <GlassSurface level={1} className="p-4 sm:p-5 rounded-3xl border border-white/[0.08]">
      <div className="flex items-center gap-2 mb-3">
        <History size={16} className="text-[#e2b17a]" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9e9990]">On this day</h3>
      </div>
      <ul className="space-y-2">
        {items.slice(0, 3).map(({ note, label }) => (
          <li key={note.id}>
            <button
              type="button"
              onClick={() => onSelectNote && onSelectNote(note)}
              className="w-full text-left p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-colors"
            >
              <span className="text-[11px] text-[#e2b17a]">{label}</span>
              <span className="block font-serif text-[#f5f2eb] truncate">{note.title || "Untitled"}</span>
              {note.content && (
                <span className="text-xs text-[#9e9990] line-clamp-2 mt-0.5">{note.content}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </GlassSurface>
  );
}
