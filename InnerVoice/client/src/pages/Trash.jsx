import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import NoteCard from "../components/notes/NoteCard";
import GlassSurface from "../components/glass/GlassSurface";
import { Archive, Loader2, Trash2 } from "lucide-react";
import { useToast } from "../context/ToastContext";
import {
  getTrashNotes,
  restoreNote,
  deleteForever,
} from "../api/note";

function Trash() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchTrash = async () => {
    try {
      const res = await getTrashNotes();
      setNotes(res.data.notes || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id) => {
    try {
      await restoreNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      addToast("Note restored to your journal", "success");
    } catch (error) {
      console.error(error);
      addToast("Unable to restore note", "error");
    }
  };

  const handleDeleteForever = async (id) => {
    const confirmDelete = window.confirm("Delete this note permanently?");
    if (!confirmDelete) return;

    try {
      await deleteForever(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      addToast("Note permanently removed", "success");
    } catch (error) {
      console.error(error);
      addToast("Unable to delete note", "error");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh] text-[#9e9990] gap-2">
          <Loader2 className="animate-spin text-[#e2b17a]" size={24} />
          <span>Loading archive...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-4 animate-fade-scale">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/[0.06]">
          <div>
            <h1 className="font-serif text-3xl text-[#f5f2eb] font-normal tracking-tight flex items-center gap-2">
              <Archive className="text-[#e2b17a]" size={26} />
              <span>Archive & Trash</span>
            </h1>
            <p className="text-xs text-[#9e9990] mt-1">
              Restore deleted notes or remove them permanently.
            </p>
          </div>
          {notes.length > 0 && (
            <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#9e9990] text-xs">
              {notes.length} {notes.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>

        {notes.length === 0 ? (
          /* Empty State */
          <GlassSurface
            level={1}
            className="p-12 text-center rounded-3xl flex flex-col items-center justify-center gap-3 my-8"
          >
            <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center text-[#e2b17a]">
              <Trash2 size={22} />
            </div>
            <h2 className="font-serif text-xl text-[#f5f2eb]">
              Archive is Empty
            </h2>
            <p className="text-xs text-[#9e9990] max-w-sm">
              Any thoughts or notes you move to trash will be kept here safely until you choose to restore or delete them.
            </p>
          </GlassSurface>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isTrash={true}
                onRestore={handleRestore}
                onDeleteForever={handleDeleteForever}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Trash;
