import { Search } from "lucide-react";

function SearchBar({ search, setSearch }) {
  return (
    <div className="relative max-w-xl">
      <Search
        size={20}
        className="absolute left-3 top-3 text-gray-500"
      />

      <input
        type="text"
        placeholder="Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg py-3 pl-10 pr-4"
      />
    </div>
  );
}

export default SearchBar;
