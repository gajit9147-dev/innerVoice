import { useState, useEffect } from "react";
import { Camera, Upload, Trash2, X, Pencil, Sparkles, Loader2, ShieldCheck, Zap } from "lucide-react";
import { uploadProfileImage } from "../../api/upload";
import { updateProfileInfo } from "../../api/profile";
import { useToast } from "../../context/ToastContext";

function AvatarUpload({ user, onUploadSuccess }) {
  const { addToast } = useToast();
  const [avatar, setAvatar] = useState(user?.profile_image || null);
  const [isExpanded, setIsExpanded] = useState(false);
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
      setIsExpanded(false);
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
      setIsExpanded(false);
    } catch (err) {
      console.error(err);
      addToast("Failed to remove profile picture.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Hidden File Input */}
      <input
        id="avatarInput"
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />

      {/* Main Profile Card Display */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-slate-700/60 flex flex-col items-center text-center relative overflow-hidden group">
        
        {/* Background Ambient Glows */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all duration-500" />
        <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all duration-500" />

        {/* Circular Avatar Display (Centered) */}
        <div 
          className="relative group/avatar mb-5 cursor-pointer" 
          onClick={() => setIsExpanded(true)}
          title="Click to view profile picture"
        >
          {/* Neon Shimmer Border Ring */}
          <div className="p-1 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-transform duration-300 group-hover/avatar:scale-105">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white dark:border-slate-900 bg-slate-900 flex items-center justify-center text-4xl font-extrabold text-white">
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
          </div>

          <div className="absolute bottom-1 right-1 bg-cyan-500 text-slate-950 p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-900 transition-transform group-hover/avatar:scale-110">
            <Camera size={16} />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white truncate max-w-full flex items-center justify-center gap-1.5">
          {user?.full_name || "InnerVoice User"}
        </h2>

        <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-1 mb-6 flex items-center gap-1 bg-cyan-50 dark:bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-200 dark:border-cyan-800/40">
          <Zap size={12} /> {user?.username ? `@${user.username}` : "Journaler"}
        </p>

        {/* Main Card Action Buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl py-2.5 font-semibold text-sm shadow-md shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
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

      {/* Cyberpunk Glassmorphism Fullscreen Expanded View */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 overflow-hidden animate-fade-in select-none cursor-pointer"
          style={{ background: "radial-gradient(circle at center, #1a1a2e 0%, #0a0a0a 100%)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsExpanded(false);
          }}
        >
          {/* Floating Cyber Particle Accents */}
          <div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-cyan-400/60 blur-[1px] animate-pulse" />
          <div className="absolute top-1/3 right-16 w-3 h-3 rounded-full bg-purple-500/50 blur-[2px] animate-bounce" />
          <div className="absolute bottom-1/4 left-16 w-3 h-3 rounded-full bg-indigo-500/40 blur-[2px]" />
          <div className="absolute bottom-1/3 right-12 w-2 h-2 rounded-full bg-cyan-300/70 blur-[1px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

          {/* Top Bar Header */}
          <div className="w-full max-w-md flex items-center justify-between z-10 pt-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400 uppercase bg-slate-900/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <Sparkles size={13} className="animate-spin" /> PROFILE_VIEW
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              className="p-2.5 rounded-full bg-slate-900/70 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700/60 hover:border-cyan-400/50 transition-all duration-300"
              title="Close View"
            >
              <X size={20} />
            </button>
          </div>

          {/* Centered Expanded Avatar with Cyber Wireframe & Neon Shimmer Ring */}
          <div className="my-auto relative flex items-center justify-center z-10" onClick={(e) => e.stopPropagation()}>
            
            {/* Holographic Outer Glow Ring */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-500 to-indigo-500 blur-xl opacity-40 animate-pulse" />

            {/* Cyber Geometric Wireframe Overlay Ring */}
            <div className="absolute -inset-3 rounded-full border border-cyan-400/30 border-dashed animate-[spin_20s_linear_infinite]" />
            <div className="absolute -inset-6 rounded-full border border-purple-500/20 border-dotted animate-[spin_35s_linear_infinite_reverse]" />

            {/* Neon Border Avatar Container */}
            <div className="relative w-72 h-72 sm:w-88 sm:h-88 rounded-full p-1 bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-500 shadow-[0_0_60px_rgba(6,182,212,0.4)] transition-all duration-500 animate-scale-up">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-950 bg-slate-950 flex items-center justify-center text-8xl font-extrabold text-white relative group">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={user?.full_name || "Profile"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                    {initials}
                  </span>
                )}

                {/* Subtle Edge Pixel Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-cyan-500/10 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Floating Action Buttons at Bottom */}
          <div className="w-full max-w-sm flex items-center justify-between gap-6 z-10 pb-6" onClick={(e) => e.stopPropagation()}>
            
            {/* Left: Edit Button (Pencil Icon) - Glassmorphism Style */}
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400 shadow-lg shadow-cyan-500/20 hover:bg-cyan-500/20 transition-all duration-300 font-semibold text-sm active:scale-95 disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 size={18} className="animate-spin text-cyan-400" />
              ) : (
                <>
                  <Pencil size={18} className="text-cyan-400" />
                  <span>Edit</span>
                </>
              )}
            </button>

            {/* Right: Delete Button (Trash Icon) - Glassmorphism Style with Red Tint */}
            <button
              onClick={handleRemove}
              disabled={isDeleting || !avatar}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl text-red-400 hover:text-red-300 border border-red-500/40 hover:border-red-400 shadow-lg shadow-red-500/20 hover:bg-red-500/20 transition-all duration-300 font-semibold text-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <Loader2 size={18} className="animate-spin text-red-400" />
              ) : (
                <>
                  <Trash2 size={18} className="text-red-400" />
                  <span>Delete</span>
                </>
              )}
            </button>

          </div>
        </div>
      )}
    </>
  );
}

export default AvatarUpload;