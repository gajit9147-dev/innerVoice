import { useState, useEffect } from "react";
import { Camera, Upload, Trash2, X, Sparkles, Loader2 } from "lucide-react";
import { uploadProfileImage } from "../../api/upload";
import { updateProfileInfo } from "../../api/profile";
import { useToast } from "../../context/ToastContext";

function AvatarUpload({ user, onUploadSuccess }) {
  const { addToast } = useToast();
  const [avatar, setAvatar] = useState(user?.profile_image || null);
  const [isZoomed, setIsZoomed] = useState(false);
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

        {/* Profile Avatar Click Trigger -> Zoom Pic */}
        <div 
          className="relative group/avatar mb-5 cursor-pointer" 
          onClick={() => setIsZoomed(true)}
          title="Click to zoom profile picture"
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

        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-2.5 font-semibold text-sm shadow-md shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload New
              </>
            )}
          </button>

          {avatar && (
            <button
              onClick={handleRemove}
              disabled={isDeleting}
              className="flex justify-center items-center gap-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-2.5 font-semibold text-sm transition-all duration-300 disabled:opacity-50"
              title="Remove Profile Picture"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Pure Fullscreen Photo Zoom Lightbox (No cards or text) */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setIsZoomed(false)}
        >
          {/* Top Right Close Button */}
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300"
            title="Close Zoom"
          >
            <X size={26} />
          </button>

          {/* Standalone Zoomed Image Only */}
          <div 
            className="relative transition-all duration-300 animate-fade-scale"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] rounded-full overflow-hidden border-4 border-white/20 shadow-[0_0_80px_rgba(59,130,246,0.35)] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-8xl font-extrabold text-white">
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
        </div>
      )}
    </>
  );
}

export default AvatarUpload;