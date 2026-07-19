import { Link } from "react-router-dom";
import { ArrowLeft, Ghost } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl shadow-xl border border-transparent dark:border-slate-700 flex flex-col items-center max-w-md w-full animate-fade-scale">
        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          <Ghost size={48} className="text-blue-500" />
        </div>
        
        <h1 className="text-6xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">
          Page not found
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Oops! The page you're looking for seems to have vanished into the void. Let's get you back home.
        </p>

        <Link
          to="/dashboard"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold transition-colors duration-300"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;