import { useEffect, useRef } from "react";
import { X, Upload, Trash2, Loader2, Camera } from "lucide-react";

function ProfileImageModal({
  isOpen,
  image,
  user,
  onClose,
  onChangePhoto,
  onRemovePhoto,
  isUploading = false,
  isDeleting = false,
}) {
  const modalRef = useRef(null);

  // Keyboard Escape listener & Body scroll prevention
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Prevent background scrolling while modal is open
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const initials = user?.full_name
    ? user.full_name.substring(0, 2).toUpperCase()
    : "IV";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div
        ref={modalRef}
        className="w-[90%] max-w-[400px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center relative transition-all duration-200 animate-scale-up text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-6 pb-2 border-b border-gray-100 dark:border-slate-800">
          <h3
            id="profile-modal-title"
            className="text-xl font-bold text-gray-900 dark:text-white tracking-tight"
          >
            Profile Picture
          </h3>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Image Frame */}
        <div className="my-2 relative flex items-center justify-center">
          <div
            className="w-56 h-56 sm:w-60 sm:h-60 rounded-full overflow-hidden flex items-center justify-center text-6xl font-extrabold text-white bg-gradient-to-br from-blue-600 to-indigo-600 transition-all duration-300"
            style={{
              border: "2px solid rgba(59, 130, 246, 0.4)",
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.25)",
            }}
          >
            {image ? (
              <img
                src={image}
                alt={user?.full_name || "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
        </div>

        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 mt-4 mb-1">
          {user?.full_name}
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-400 mb-6">
          {user?.username ? `@${user.username}` : "InnerVoice User"}
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onChangePhoto}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl py-3 font-semibold text-sm shadow-md shadow-blue-500/20 transition-all duration-200 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Change Photo</span>
              </>
            )}
          </button>

          {image && (
            <button
              onClick={onRemovePhoto}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 rounded-xl py-3 font-semibold text-sm transition-all duration-200 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  <span>Remove Photo</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileImageModal;
