import { Bell, Search, User } from "lucide-react";

function Header() {
  return (
    <header className="bg-white shadow-sm rounded-xl px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          📝 InnerVoice
        </h1>
        <p className="text-gray-500 text-sm">
          Capture your thoughts anytime.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button className="p-2 rounded-lg hover:bg-gray-100">
          <Bell size={22} />
        </button>

        <button className="p-2 rounded-full bg-blue-600 text-white">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;
