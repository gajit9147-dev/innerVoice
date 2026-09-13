import { useState, useEffect } from "react";
import { Camera, Upload, Eye, User, Sparkles, Loader2 } from "lucide-react";
import { uploadProfileImage } from "../../api/upload";
import { updateProfileInfo } from "../../api/profile";
import { useToast } from "../../context/ToastContext";
import ProfileImageModal from "../common/ProfileImageModal";
import GlassSurface from "../glass/GlassSurface";

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
    : user?.name
    ? user.name.substring(0, 2).toUpperCase()
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
      const imageUrl = res.data.image;
      setAvatar(imageUrl);

      // Save profile_image into localStorage so Header reflects it immediately
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...savedUser, profile_image: imageUrl }));
      window.dispatchEvent(new Event("storage"));

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

      // Clear profile_image from localStorage so Header reflects removal immediately
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...savedUser, profile_image: null }));
      window.dispatchEvent(new Event("storage"));

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
      <input
        id="avatarInput"
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />

      <GlassSurface
        level={1}
        className="p-6 sm:p-7 rounded-3xl relative overflow-hidden transition-all duration-300 border border-white/[0.09] shadow-[0_20px_50px_rgba(0,0,0,0.55)] group"
      >
        {/* Extremely subtle atmospheric background illustration (Dark forest, mountains, starlight) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.07] overflow-hidden select-none">
          <svg className="w-full h-full object-cover" viewBox="0 0 400 300" fill="none" preserveAspectRatio="none">
            {/* Stars */}
            <circle cx="45" cy="35" r="1.5" fill="#e2b17a" />
            <circle cx="120" cy="20" r="1" fill="#fff" />
            <circle cx="280" cy="45" r="1.5" fill="#fff" />
            <circle cx="340" cy="25" r="1" fill="#e2b17a" />
            <circle cx="210" cy="65" r="1.2" fill="#fff" />
            <circle cx="90" cy="90" r="1" fill="#fff" />
            {/* Crescent Moon */}
            <path
              d="M330 50 A 16 16 0 1 0 350 75 A 20 20 0 1 1 330 50 Z"
              fill="#e2b17a"
              opacity="0.8"
            />
            {/* Mountain / Forest Silhouette */}
            <path
              d="M0 240 L60 190 L130 230 L210 170 L280 220 L350 180 L400 210 L400 300 L0 300 Z"
              fill="#d8b27a"
            />
            <path
              d="M0 260 L80 230 L160 250 L240 225 L320 245 L400 230 L400 300 L0 300 Z"
              fill="#fff"
              opacity="0.4"
            />
          </svg>
        </div>

        {/* Card Header */}
        <div className="relative z-10 flex items-start justify-between pb-5 mb-5 border-b border-white/[0.07]">
          <div>
            <div className="flex items-center gap-2">
              <User size={17} className="text-[#e2b17a]" />
              <h2 className="font-serif text-lg text-[#f5f2eb] font-normal tracking-wide">
                Your Profile
              </h2>
            </div>
            <p className="text-xs text-[#9e9990] mt-0.5 font-sans">
              Your journey. Your story.
            </p>
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#e2b17a]/70 bg-[#e2b17a]/10 px-2.5 py-0.5 rounded-full border border-[#e2b17a]/20">
            Private
          </span>
        </div>

        {/* Profile Image & Subtle Script Message Row */}
        <div className="relative z-10 flex items-center justify-center sm:justify-between gap-6 my-2 px-1">
          {/* Avatar Container */}
          <div className="relative group/avatar">
            <div
              onClick={() => setIsModalOpen(true)}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[#d8b27a]/70 shadow-[0_0_24px_rgba(216,178,122,0.22)] bg-[#191a22] flex items-center justify-center cursor-pointer transition-transform duration-300 group-hover/avatar:scale-[1.03]"
              title="View full size photo"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={user?.full_name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl sm:text-4xl font-serif text-[#e2b17a]">
                  {initials}
                </span>
              )}

              {/* Hover View Indicator */}
              <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-[2px]">
                <Eye size={22} className="text-[#f5f2eb] mb-1" />
                <span className="text-[10px] uppercase font-semibold text-[#f5f2eb] tracking-wider">
                  View
                </span>
              </div>
            </div>

            {/* Overlapping Camera Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUploadClick();
              }}
              disabled={isUploading}
              aria-label="Upload profile photo"
              title="Upload new photo"
              className="absolute bottom-1 right-1 bg-gradient-to-br from-[#d8a264] to-[#e8ba7d] text-[#14120f] p-2 rounded-full shadow-lg border border-white/20 transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            >
              {isUploading ? (
                <Loader2 size={15} className="animate-spin text-[#14120f]" />
              ) : (
                <Camera size={15} />
              )}
            </button>
          </div>

          {/* Handwritten-Style Decorative Message (Toward Right Side) */}
          <div className="text-right select-none pr-1">
            <div className="font-script text-xl sm:text-2xl text-[#e2b17a]/75 leading-tight tracking-wide transform -rotate-2">
              <span className="block">A</span>
              <span className="block">Better</span>
              <span className="block">You</span>
              <span className="block text-[#f5f2eb]/90">Everyday</span>
            </div>
            <span className="text-[10px] text-[#9e9990]/60 font-sans tracking-widest uppercase mt-1 block">
              InnerVoice ♡
            </span>
          </div>
        </div>

        {/* User Details & Emotional Subtitle */}
        <div className="relative z-10 text-center mt-5 mb-6">
          <h3 className="font-serif text-xl sm:text-2xl text-[#f5f2eb] font-normal tracking-tight truncate">
            {user?.full_name || user?.name || "InnerVoice Journaler"}
          </h3>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-white/[0.04] border border-white/[0.07] text-xs text-[#d1cdc7]">
            <Sparkles size={12} className="text-[#e2b17a]" />
            <span>{user?.username ? `@${user.username}` : "Journaler"}</span>
          </div>

          <p className="font-serif italic text-sm text-[#e2b17a]/90 mt-3">
            “Stay kind to yourself.”
          </p>
        </div>

        {/* View Photo Button + Quick Upload Action */}
        <div className="relative z-10 flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-amber-glass flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Camera size={15} className="text-[#e2b17a]" />
            <span>View Photo</span>
          </button>

          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isUploading}
            title="Upload new photo"
            aria-label="Upload photo"
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[#9e9990] hover:text-[#f5f2eb] border border-white/[0.08] transition cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin text-[#e2b17a]" />
            ) : (
              <Upload size={16} />
            )}
          </button>
        </div>
      </GlassSurface>

      {/* Profile Image Modal */}
      <ProfileImageModal
        isOpen={isModalOpen}
        image={avatar}
        user={user}
        onClose={() => setIsModalOpen(false)}
        onChangePhoto={handleUploadClick}
        onRemovePhoto={handleRemove}
        isUploading={isUploading}
        isDeleting={isDeleting}
      />
    </>
  );
}

export default AvatarUpload;