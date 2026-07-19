import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex transition-colors duration-300 text-gray-900 dark:text-gray-100">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:relative transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="p-4 lg:p-6 pb-0">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
        </div>
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
