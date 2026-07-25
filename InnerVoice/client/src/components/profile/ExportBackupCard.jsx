import { useToast } from "../../context/ToastContext";
import { Database, FileDown, Download } from "lucide-react";
import { getNotes } from "../../api/note";

function ExportBackupCard() {
  const { addToast } = useToast();

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

  const handleExportJSON = async () => {
    try {
      addToast("Preparing your backup...", "success");
      const res = await getNotes();
      const notesList = res.data.notes || [];

      if (notesList.length === 0) {
        addToast("No notes found to export.", "error");
        return;
      }

      const jsonStr = JSON.stringify(notesList, null, 2);
      triggerDownload(jsonStr, "innervoice_notes_backup.json", "application/json");
      addToast("JSON backup downloaded successfully!", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to export notes.", "error");
    }
  };

  const handleExportMarkdown = async () => {
    try {
      addToast("Preparing your backup...", "success");
      const res = await getNotes();
      const notesList = res.data.notes || [];

      if (notesList.length === 0) {
        addToast("No notes found to export.", "error");
        return;
      }

      let markdownContent = `# InnerVoice Journal Backup\n*Exported on: ${new Date().toLocaleString()}*\n\n---\n\n`;

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

      triggerDownload(markdownContent, "innervoice_notes_backup.md", "text/markdown");
      addToast("Markdown backup downloaded successfully!", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to export notes.", "error");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 lg:p-8 border border-gray-100 dark:border-slate-700 transition-colors">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
        <Database size={20} className="text-blue-500" />
        Export & Backup
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
        Download a complete archive of your journal entries. Choose JSON for machine-readable raw backups or Markdown for document readers.
      </p>
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={handleExportJSON}
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
        >
          <FileDown size={18} />
          Export JSON
        </button>
        
        <button
          type="button"
          onClick={handleExportMarkdown}
          className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:text-indigo-400 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
        >
          <Download size={18} />
          Export Markdown (.md)
        </button>
      </div>
    </div>
  );
}

export default ExportBackupCard;
