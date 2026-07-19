import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

function SearchBar({ search, setSearch }) {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [localSearch, setSearch]);

  // Sync if external search changes (e.g., cleared from somewhere else)
  useEffect(() => {
    if (search === "") {
      setLocalSearch("");
    }
  }, [search]);

  return (
    <div className="relative w-full group">
      {/* Search Icon */}
      <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
      />

      {/* Input Field */}
      <input
        type="text"
        placeholder="Search for a note, idea, or category..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-12 text-gray-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm hover:shadow-md"
      />

      {/* Clear Button */}
      {localSearch && (
        <button
          onClick={() => setLocalSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition bg-gray-50 hover:bg-gray-200 rounded-full p-1.5"
          title="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
