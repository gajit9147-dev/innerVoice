import { useEffect, useState } from "react";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import StatsCard from "../components/dashboard/StatsCard";
import SearchBar from "../components/dashboard/SearchBar";

import AddNote from "../components/notes/AddNote";
import NoteCard from "../components/notes/NoteCard";
import EditNote from "../components/notes/EditNote";

import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../api/note";

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  // Fetch Notes
  const fetchNotes = async () => {
    try {
      const res = await getNotes();
      setNotes(res.data.notes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Add Note
  const handleAddNote = async (note) => {
    try {
      await createNote(note);
      fetchNotes();
    } catch (err) {
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
      fetchNotes();
    } catch (err) {
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
      fetchNotes();
    } catch (err) {
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
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 h-screen overflow-y-auto">

        {/* Header */}
        <Header />

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
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-5">
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
              <h2 className="text-2xl font-bold">Your Notes</h2>
              
              <div className="flex gap-3">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white border border-gray-200 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
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
                  className="bg-white border border-gray-200 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="a-z">A-Z</option>
                </select>
              </div>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-10 text-center">
                <p className="text-gray-500 text-lg">
                  No matching notes found.
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
      </div>
    </div>
  );
}

export default Dashboard;