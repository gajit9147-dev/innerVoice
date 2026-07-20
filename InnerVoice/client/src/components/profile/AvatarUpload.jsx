import { useState, useEffect } from "react";
import { Camera, Upload, Trash2, X, Eye, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
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

    // Validate image file type
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

        {/* Profile Avatar Trigger Button */}
        <div className="relative group/avatar mb-5 cursor-pointer" onClick={() => setIsModalOpen(true)}>
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
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">View / Edit</span>
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

      {/* Modern Lightbox Preview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center relative animate-fade-scale">
            
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700/60 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              Profile Photo
            </h3>

            {/* High-Res Image Preview Frame */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 border-blue-500/30 dark:border-blue-400/20 shadow-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-6xl font-extrabold text-white mb-6 relative group">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Full Avatar Preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                initials
              )}
            </div>

            <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-1">
              {user?.full_name}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-400 mb-6">
              {avatar ? "Full Quality Profile Image" : "Default Avatar Initials"}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-3 font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload New
                  </>
                )}
              </button>

              {avatar && (
                <button
                  onClick={handleRemove}
                  disabled={isDeleting}
                  className="flex justify-center items-center gap-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 rounded-xl px-5 py-3 font-semibold text-sm transition-all duration-300 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Remove
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default AvatarUpload;