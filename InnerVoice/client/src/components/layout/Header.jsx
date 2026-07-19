import { Bell, Moon, Sun, Calendar, Menu } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";

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

      {/* Right side: Actions and Profile */}
      <div className="flex items-center gap-2 lg:gap-4">
        
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <button className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors relative hidden sm:block">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 transition-colors"></span>
        </button>

        <div className="w-px h-8 bg-gray-200 dark:bg-slate-700 hidden sm:block mx-2 transition-colors"></div>

        {/* User Profile */}
        <Link 
          to="/profile"
          className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 p-1.5 pr-3 rounded-2xl transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm lg:text-base font-bold shadow-sm">
            AG
          </div>
          <div className="hidden sm:block">
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
              Ajeet Gupta
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
              Free Plan
            </p>
          </div>
        </Link>

      </div>
    </header>
  );
}

export default Header;
