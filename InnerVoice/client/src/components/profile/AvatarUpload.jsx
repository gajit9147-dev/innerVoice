import { useState } from "react";
import { Camera, Upload, Trash2 } from "lucide-react";

function AvatarUpload({ user }) {
  const [avatar, setAvatar] = useState(null);
  const initials = user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : "GU";

  const handleUploadClick = () => {
    alert("Upload functionality will be wired to the backend soon!");
  };

  const handleRemove = () => {
    setAvatar(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-8 border border-gray-100 dark:border-slate-700 flex flex-col items-center transition-colors">
      
      {/* Avatar Display */}
      <div className="relative group mb-6">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white transition-colors">
          {avatar ? (
            <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        
        {/* Hover Overlay */}
        <button 
          onClick={handleUploadClick}
          className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
        >
          <Camera size={28} className="text-white" />
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{user?.full_name || "User"}</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Journaler</p>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full">
        <button 
          onClick={handleUploadClick}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 py-2.5 rounded-xl font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
        >
          <Upload size={18} />
          Upload New
        </button>
        <button 
          onClick={handleRemove}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 py-2.5 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
        >
          <Trash2 size={18} />
          Remove
        </button>
      </div>
    </div>
  );
}

export default AvatarUpload;
