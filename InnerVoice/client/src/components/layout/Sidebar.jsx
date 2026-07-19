import {
  LayoutDashboard,
  NotebookPen,
  Star,
  Archive,
  Trash2,
  BarChart3,
  Settings,
} from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    name: "Notes",
    icon: <NotebookPen size={20} />,
  },
  {
    name: "Favorites",
    icon: <Star size={20} />,
  },
  {
    name: "Archive",
    icon: <Archive size={20} />,
  },
  {
    name: "Trash",
    icon: <Trash2 size={20} />,
  },
  {
    name: "Analytics",
    icon: <BarChart3 size={20} />,
  },
  {
    name: "Settings",
    icon: <Settings size={20} />,
  },
];

function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-white shadow-lg border-r flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-3xl font-bold text-blue-600">
          📝 InnerVoice
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          Express your thoughts
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menu.map((item) => (
          <button
            key={item.name}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition"
          >
            {item.icon}

            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
            AG
          </div>

          <div>
            <h3 className="font-semibold">
              Ajeet Gupta
            </h3>

            <p className="text-gray-500 text-sm">
              AI/ML Student
            </p>
          </div>

        </div>
      </div>

    </aside>
  );
}

export default Sidebar;
