import { Bell, Moon, Calendar } from "lucide-react";

function Header() {
  // Generate greeting based on time of day
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  // Format today's date
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <header className="bg-white shadow-sm rounded-2xl px-6 py-5 flex items-center justify-between border border-gray-100">
      
      {/* Left side: Greeting and Date */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          👋 {greeting}, Ajeet!
        </h1>
        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1.5 font-medium">
          <Calendar size={14} className="text-blue-500" />
          <span>{dateStr}</span>
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Dark Mode Button (Placeholder) */}
        <button 
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
          title="Toggle Dark Mode"
        >
          <Moon size={20} />
        </button>

        {/* Notification Icon */}
        <button 
          className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
          title="Notifications"
        >
          <Bell size={20} />
          {/* Notification Dot */}
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-gray-200 mx-1"></div>

        {/* User Avatar & Info */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Ajeet Gupta</span>
            <span className="text-xs text-gray-500">Free Plan</span>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
            AG
          </div>
        </div>

      </div>
    </header>
  );
}

export default Header;
