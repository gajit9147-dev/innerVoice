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
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
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
        className="w-[92%] max-w-[420px] rounded-2xl p-6 sm:p-8 flex flex-col items-center relative transition-all duration-200 animate-scale-up border border-white/[0.12] shadow-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(22, 25, 31, 0.96) 0%, rgba(14, 16, 20, 0.98) 100%)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-6 pb-3 border-b border-white/[0.08]">
          <h3
            id="profile-modal-title"
            className="font-serif text-xl sm:text-2xl text-[#f5f2eb] font-normal tracking-tight"
          >
            Profile Portrait
          </h3>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[#9e9990] hover:text-[#f5f2eb] hover:bg-white/[0.06] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Image Frame */}
        <div className="my-2 relative flex items-center justify-center">
          <div
            className="w-52 h-52 sm:w-56 sm:h-56 rounded-full overflow-hidden flex items-center justify-center text-5xl font-serif text-[#d8b27a] transition-all duration-300 relative group"
            style={{
              background: "linear-gradient(135deg, #1d222b 0%, #11141a 100%)",
              border: "2px solid rgba(216, 178, 122, 0.4)",
              boxShadow: "0 0 35px rgba(216, 178, 122, 0.18)",
            }}
          >
            {image ? (
              <img
                src={image}
                alt={user?.full_name || "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
        </div>

        <p className="font-serif text-base text-[#f5f2eb] mt-4 mb-0.5">
          {user?.full_name || "InnerVoice User"}
        </p>
        <p className="text-xs text-[#9e9990] font-sans mb-6">
          {user?.username ? `@${user.username}` : user?.email || "Personal sanctuary"}
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onChangePhoto}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-sans font-medium text-xs sm:text-sm transition-all duration-200 disabled:opacity-50 text-[#121418] shadow-md hover:brightness-105 active:scale-[0.99]"
            style={{
              background: "linear-gradient(180deg, #dfbc86 0%, #c89e62 100%)",
            }}
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Updating Portrait...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Change Photo</span>
              </>
            )}
          </button>

          {image && (
            <button
              onClick={onRemovePhoto}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 font-sans font-normal text-xs sm:text-sm border border-rose-500/25 hover:border-rose-500/40 text-rose-300 hover:bg-rose-500/10 transition-all duration-200 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Removing Portrait...</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} />
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

