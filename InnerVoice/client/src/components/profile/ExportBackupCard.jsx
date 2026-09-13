import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { Database, Download, FileJson, FileText, Loader2, Check } from "lucide-react";
import { getNotes } from "../../api/note";
import GlassSurface from "../glass/GlassSurface";

function ExportBackupCard() {
  const { addToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState("json"); // "json" | "markdown"

  const triggerDownload = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (overrideFormat) => {
    const formatToUse = overrideFormat || exportFormat;
    try {
      setIsExporting(true);
      addToast("Preparing your backup archive...", "success");
      const res = await getNotes();
      const notesList = res.data.notes || [];

      if (notesList.length === 0) {
        addToast("No notes found to export.", "error");
        return;
      }

      // Read custom music tracks & user metadata to bundle comprehensive data
      const customMusicRaw = localStorage.getItem("innervoice_custom_tracks");
      const customMusic = customMusicRaw ? JSON.parse(customMusicRaw) : [];
      const userProfile = JSON.parse(localStorage.getItem("user") || "{}");

      if (formatToUse === "markdown") {
        let markdownContent = `# InnerVoice Journal Backup\n`;
        markdownContent += `*User*: ${userProfile.full_name || userProfile.name || "InnerVoice User"}  \n`;
        markdownContent += `*Exported on*: ${new Date().toLocaleString()}  \n`;
        markdownContent += `*Total Entries*: ${notesList.length}  \n\n`;
        markdownContent += `---\n\n`;

        notesList.forEach((note) => {
          markdownContent += `## ${note.title || "Untitled Note"}\n`;
          markdownContent += `**Date**: ${note.created_at ? new Date(note.created_at).toLocaleDateString() : "N/A"}  \n`;
          markdownContent += `**Category**: ${note.category || "General"}  \n`;
          if (note.feeling) {
            markdownContent += `**Feeling**: ${note.feeling}  \n`;
          }
          markdownContent += `**Status**: ${note.is_locked ? "🔒 Locked" : "🔓 Unlocked"}  \n\n`;
          markdownContent += `${note.content || ""}\n\n`;
          markdownContent += `---\n\n`;
        });

        triggerDownload(markdownContent, "innervoice_archive.md", "text/markdown");
        addToast("Markdown archive downloaded successfully!", "success");
      } else {
        // Complete JSON Archive (Notes, Music metadata, Export Timestamp)
        const completeArchive = {
          archive_version: "2.0",
          exported_at: new Date().toISOString(),
          user: {
            name: userProfile.full_name || userProfile.name,
            username: userProfile.username,
            email: userProfile.email,
          },
          total_notes: notesList.length,
          notes: notesList,
          saved_music: customMusic,
        };

        const jsonStr = JSON.stringify(completeArchive, null, 2);
        triggerDownload(jsonStr, "innervoice_archive.json", "application/json");
        addToast("Complete JSON archive downloaded successfully!", "success");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to export archive.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <GlassSurface
      level={1}
      className="p-6 sm:p-7 rounded-3xl relative overflow-hidden transition-all duration-300 border border-white/[0.09] shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-5 mb-5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2">
            <Database size={17} className="text-[#e2b17a]" />
            <h2 className="font-serif text-lg text-[#f5f2eb] font-normal tracking-wide">
              Export & Backup
            </h2>
          </div>
          <p className="text-xs text-[#9e9990] mt-0.5 font-sans">
            Keep your memories safe.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs text-[#d1cdc7] leading-relaxed">
          Download a complete archive of your notes, memories, music and profile data.
        </p>

        {/* Format Selector Pills */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setExportFormat("json")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition border cursor-pointer ${
              exportFormat === "json"
                ? "bg-[#e2b17a]/20 text-[#e2b17a] border-[#e2b17a]/40 shadow-[0_0_12px_rgba(226,177,122,0.15)]"
                : "bg-white/[0.03] text-[#9e9990] hover:text-[#f5f2eb] border-white/[0.07]"
            }`}
          >
            <FileJson size={14} />
            <span>JSON Archive</span>
            {exportFormat === "json" && <Check size={12} className="ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => setExportFormat("markdown")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition border cursor-pointer ${
              exportFormat === "markdown"
                ? "bg-[#e2b17a]/20 text-[#e2b17a] border-[#e2b17a]/40 shadow-[0_0_12px_rgba(226,177,122,0.15)]"
                : "bg-white/[0.03] text-[#9e9990] hover:text-[#f5f2eb] border-white/[0.07]"
            }`}
          >
            <FileText size={14} />
            <span>Markdown (.md)</span>
            {exportFormat === "markdown" && <Check size={12} className="ml-0.5" />}
          </button>
        </div>

        {/* Main Export Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => handleExport()}
            disabled={isExporting}
            className="btn-amber-glass w-full py-2.5 px-5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
          >
            {isExporting ? (
              <Loader2 size={16} className="animate-spin text-[#e2b17a]" />
            ) : (
              <Download size={16} className="text-[#e2b17a]" />
            )}
            <span>{isExporting ? "Exporting Data..." : "Export My Data"}</span>
          </button>
        </div>
      </div>
    </GlassSurface>
  );
}

export default ExportBackupCard;
