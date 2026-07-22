import { useState, useEffect } from "react";

function NoteForm({ onSave, onCancel, initialData }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    feeling: "Neutral",
    is_locked: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        content: initialData.content || "",
        category: initialData.category || "General",
        feeling: initialData.feeling || "Neutral",
        is_locked: initialData.is_locked === 1 || initialData.is_locked === true || false,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLockToggle = (e) => {
    setFormData((prev) => ({
      ...prev,
      is_locked: e.target.checked,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Title and Content are required");
      return;
    }

    onSave(formData);

    if (!initialData) {
      setFormData({
        title: "",
        content: "",
        category: "General",
        feeling: "Neutral",
        is_locked: false,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
        className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Category & Feeling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="General">📒 General</option>
          <option value="Work">💼 Work</option>
          <option value="Study">📚 Study</option>
          <option value="Personal">👤 Personal</option>
          <option value="Ideas">💡 Ideas</option>
          <option value="Journal">📝 Journal</option>
        </select>

        {/* Feeling */}
        <select
          name="feeling"
          value={formData.feeling}
          onChange={handleChange}
          className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
        >
          <optgroup label="😊 Positive">
            <option value="Neutral">Neutral</option>
            <option value="Happy">Happy</option>
            <option value="Excited">Excited</option>
            <option value="Grateful">Grateful</option>
            <option value="Motivated">Motivated</option>
            <option value="Proud">Proud</option>
            <option value="Hopeful">Hopeful</option>
            <option value="Peaceful">Peaceful</option>
            <option value="Inspired">Inspired</option>
          </optgroup>

          <optgroup label="😔 Sad & Difficult">
            <option value="Lonely">Lonely</option>
            <option value="Sad">Sad</option>
            <option value="Heartbroken">Heartbroken</option>
            <option value="Disappointed">Disappointed</option>
            <option value="Anxious">Anxious</option>
            <option value="Worried">Worried</option>
            <option value="Overwhelmed">Overwhelmed</option>
            <option value="Exhausted">Exhausted</option>
          </optgroup>

          <optgroup label="😡 Stress">
            <option value="Angry">Angry</option>
            <option value="Frustrated">Frustrated</option>
            <option value="Confused">Confused</option>
            <option value="Overthinking">Overthinking</option>
            <option value="Stressed">Stressed</option>
          </optgroup>

          <optgroup label="❤️ Relationships">
            <option value="Love">Love</option>
            <option value="Crush">Crush</option>
            <option value="Friendship">Friendship</option>
            <option value="Family">Family</option>
            <option value="Breakup">Breakup</option>
          </optgroup>

          <optgroup label="🧠 Personal Growth">
            <option value="Healing">Healing</option>
            <option value="Learning">Learning</option>
            <option value="Focused">Focused</option>
            <option value="Self Growth">Self Growth</option>
          </optgroup>

          <optgroup label="🌟 Goals">
            <option value="Dream">Dream</option>
            <option value="Goal">Goal</option>
            <option value="Career">Career</option>
            <option value="Finance">Finance</option>
            <option value="Fitness">Fitness</option>
          </optgroup>

          <optgroup label="🔒 Private">
            <option value="Secret">Secret</option>
            <option value="Confession">Confession</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Memory">Memory</option>
            <option value="Random Thoughts">Random Thoughts</option>
            <option value="Private">Private</option>
          </optgroup>

          <optgroup label="🌍 Daily Life">
            <option value="Travel">Travel</option>
            <option value="Food">Food</option>
            <option value="Gaming">Gaming</option>
            <option value="Music">Music</option>
            <option value="Movies">Movies</option>
            <option value="Photography">Photography</option>
            <option value="Pets">Pets</option>
          </optgroup>
        </select>
      </div>

      {/* Content */}
      <textarea
        rows={6}
        name="content"
        placeholder="Write your thoughts..."
        value={formData.content}
        onChange={handleChange}
        className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />

      {/* Lock Option */}
      <div className="flex items-center gap-2 py-1.5">
        <label className="flex items-center gap-2.5 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition text-sm">
          <input
            type="checkbox"
            name="is_locked"
            checked={formData.is_locked}
            onChange={handleLockToggle}
            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-700 bg-transparent rounded focus:ring-blue-500"
          />
          <span>🔒 Protect this note with Vault PIN</span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
        >
          {initialData ? "Update Note" : "Save Note"}
        </button>
      </div>
    </form>
  );
}

export default NoteForm;