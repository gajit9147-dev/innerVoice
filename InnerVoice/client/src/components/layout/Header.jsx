import { Bell, Moon, Sun, Calendar, Menu } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function Header({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();

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
    <header className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl px-5 py-4 lg:px-6 lg:py-5 flex items-center justify-between border border-gray-100 dark:border-slate-700 transition-colors">
      
      {/* Left side: Greeting and Date */}
      <div className="flex items-center gap-3 lg:gap-0">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">
            👋 {greeting}, Ajeet!
          </h1>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs lg:text-sm mt-1 font-medium">
            <Calendar size={14} className="text-blue-500 dark:text-blue-400" />
            <span>{dateStr}</span>
          </div>
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Dark Mode Button */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title="Toggle Dark Mode"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notification Icon */}
        <button 
          className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title="Notifications"
        >
          <Bell size={20} />
          {/* Notification Dot */}
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-slate-700 mx-1 transition-colors"></div>

        {/* User Avatar & Info */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Ajeet Gupta</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Free Plan</span>
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
