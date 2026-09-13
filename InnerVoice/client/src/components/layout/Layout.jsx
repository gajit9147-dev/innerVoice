import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout({ children, headerSubtitle }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mobile drawer Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      if (isSidebarOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-[#090a0e] ambient-cinematic-bg flex transition-colors duration-300 text-[#f5f2eb] font-sans select-none">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:relative transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar onCloseMobile={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <div className="p-2.5 sm:p-4 lg:p-6 pb-0 min-w-0">
          <Header
            onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
            subtitle={headerSubtitle}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
