import { useEffect, useState } from "react";

import Layout from "../components/layout/Layout";
import StatsCard from "../components/dashboard/StatsCard";
import SearchBar from "../components/dashboard/SearchBar";

import AddNote from "../components/notes/AddNote";
import NoteCard from "../components/notes/NoteCard";
import EditNote from "../components/notes/EditNote";
import { NoteCardSkeleton } from "../components/ui/Skeleton";
import { Search } from "lucide-react";

import { useToast } from "../context/ToastContext";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../api/note";

function Dashboard() {
  const { addToast } = useToast();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  // Fetch Notes
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const res = await getNotes();
      setNotes(res.data.notes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Add Note
  const handleAddNote = async (note) => {
    try {
      await createNote(note);
      addToast("Note created successfully!", "success");
      fetchNotes();
    } catch (err) {
      addToast("Failed to create note.", "error");
      console.error(err);
    }
  };

  // Delete Note
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) return;

    try {
      await deleteNote(id);
      addToast("Note deleted.", "success");
      fetchNotes();
    } catch (err) {
      addToast("Failed to delete note.", "error");
      console.error(err);
    }
  };

  // Open Edit Modal
  const handleEdit = (note) => {
    setEditingNote(note);
  };

  // Save Edited Note
  const handleSaveEdit = async (updatedNote) => {
    try {
      await updateNote(updatedNote.id, {
        title: updatedNote.title,
        content: updatedNote.content,
      });

      setEditingNote(null);
      addToast("Note updated!", "success");
      fetchNotes();
    } catch (err) {
      addToast("Failed to update note.", "error");
      console.error(err);
    }
  };

  // Search, Filter, and Sort
  const filteredNotes = notes
    .filter((note) => {
      const keyword = search.toLowerCase();
      const matchesSearch =
        note.title.toLowerCase().includes(keyword) ||
        note.content.toLowerCase().includes(keyword);
      
      const matchesCategory =
        filterCategory === "All" || note.category === filterCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === "a-z") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  // Statistics
  const totalNotes = notes.length;

  const totalCategories = new Set(
    notes.map((note) => note.category)
  ).size;

  const today = new Date().toDateString();

  const todayNotes = notes.filter((note) => {
    if (!note.created_at) return false;
    return new Date(note.created_at).toDateString() === today;
  }).length;

  return (
    <Layout>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
          <StatsCard
            title="Total Notes"
            value={totalNotes}
            icon="📝"
            color="bg-blue-500"
          />

          <StatsCard
            title="Today's Notes"
            value={todayNotes}
            icon="📅"
            color="bg-green-500"
          />

          <StatsCard
            title="Categories"
            value={totalCategories}
            icon="📂"
            color="bg-purple-500"
          />

          <StatsCard
            title="Search Results"
            value={filteredNotes.length}
            icon="🔍"
            color="bg-orange-500"
          />
        </div>

        {/* Main Section */}
        <div className="grid lg:grid-cols-3 gap-6 mt-8">

          {/* Left Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-transparent dark:border-slate-700 transition-colors">
              <h2 className="text-2xl font-bold mb-5 dark:text-white">
                Create New Note
              </h2>

              <AddNote onAdd={handleAddNote} />
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2">

            <SearchBar
              search={search}
              setSearch={setSearch}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 mb-5 gap-4">
              <h2 className="text-2xl font-bold dark:text-white">Your Notes</h2>
              
              <div className="flex gap-3">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition dark:text-white"
                >
                  <option value="All">All Categories</option>
                  <option value="General">General</option>
                  <option value="Personal">Personal</option>
                  <option value="Study">Study</option>
                  <option value="Work">Work</option>
                  <option value="Ideas">Ideas</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition dark:text-white"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="a-z">A-Z</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => <NoteCardSkeleton key={i} />)}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-12 text-center border border-transparent dark:border-slate-700 transition-colors flex flex-col items-center animate-fade-scale">
                <div className="w-24 h-24 bg-gray-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                  <Search className="text-gray-400" size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No notes found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  {search 
                    ? "We couldn't find any notes matching your search. Try different keywords or clear your filters."
                    : "Your dashboard is empty! Start capturing your thoughts by creating a new note."}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editingNote && (
          <EditNote
            note={editingNote}
            onClose={() => setEditingNote(null)}
            onSave={handleSaveEdit}
          />
        )}
    </Layout>
  );
}

export default Dashboard;