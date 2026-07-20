import { useState, useEffect } from "react";
import { Camera, Upload, Trash2, X, Eye, Sparkles, Loader2 } from "lucide-react";
import { uploadProfileImage } from "../../api/upload";
import { updateProfileInfo } from "../../api/profile";
import { useToast } from "../../context/ToastContext";

function AvatarUpload({ user, onUploadSuccess }) {
  const { addToast } = useToast();
  const [avatar, setAvatar] = useState(user?.profile_image || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setAvatar(user?.profile_image || null);
  }, [user]);

  const initials = user?.full_name
    ? user.full_name.substring(0, 2).toUpperCase()
    : "IV";

  const handleUploadClick = () => {
    document.getElementById("avatarInput").click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Please select a valid image file.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsUploading(true);
      const res = await uploadProfileImage(formData);

      setAvatar(res.data.image);

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      addToast("Profile picture updated successfully!", "success");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to upload profile picture.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsDeleting(true);
      await updateProfileInfo({ profile_image: null });
      setAvatar(null);

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      addToast("Profile picture removed.", "success");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast("Failed to remove profile picture.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-slate-700/60 flex flex-col items-center text-center relative overflow-hidden group">
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-500" />
        
        <input
          id="avatarInput"
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />

        {/* Profile Avatar Click Trigger */}
        <div 
          className="relative group/avatar mb-5 cursor-pointer" 
          onClick={() => setIsModalOpen(true)}
          title="Click to view profile picture"
        >
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-4xl font-extrabold text-white transition-transform duration-300 group-hover/avatar:scale-105">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-slate-900/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
            <Eye size={26} className="text-white mb-1 animate-pulse" />
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">View Photo</span>
          </div>

          <div className="absolute bottom-1 right-1 bg-blue-600 dark:bg-blue-500 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-800 transition-transform group-hover/avatar:scale-110">
            <Camera size={16} />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white truncate max-w-full">
          {user?.full_name || "InnerVoice User"}
        </h2>

        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 mb-6 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800/40">
          <Sparkles size={12} /> {user?.username ? `@${user.username}` : "Journaler"}
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-2.5 font-semibold text-sm shadow-md shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Eye size={16} />
            View Photo
          </button>

          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex justify-center items-center gap-2 bg-gray-100 dark:bg-slate-700/60 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl px-4 py-2.5 font-semibold text-sm transition-all duration-300 disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          </button>
        </div>
      </div>

      {/* Instagram-Style Pure Photo Lightbox Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          {/* Top Close Button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300"
            title="Close"
          >
            <X size={24} />
          </button>

          {/* Standalone Instagram Circular Photo View */}
          <div className="relative group mb-8 animate-fade-scale">
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-4 border-white/20 shadow-[0_0_50px_rgba(59,130,246,0.3)] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-7xl font-extrabold text-white">
              {avatar ? (
                <img
                  src={avatar}
                  alt={user?.full_name || "Profile Photo"}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
          </div>

          <p className="text-white font-bold text-lg mb-1">{user?.full_name}</p>
          <p className="text-white/60 text-xs mb-8">@{user?.username || "profile"}</p>

          {/* Instagram Action Buttons */}
          <div className="flex flex-col gap-3 w-full max-w-xs animate-fade-scale">
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3.5 font-bold text-sm shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading Photo...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload New Photo
                </>
              )}
            </button>

            {avatar && (
              <button
                onClick={handleRemove}
                disabled={isDeleting}
                className="w-full flex justify-center items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-full py-3.5 font-bold text-sm backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Remove Current Photo
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full flex justify-center items-center bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full py-3 font-semibold text-sm backdrop-blur-md transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AvatarUpload;