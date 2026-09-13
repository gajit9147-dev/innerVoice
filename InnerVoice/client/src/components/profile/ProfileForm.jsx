import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { Save, User, AtSign, Phone, FileText, Loader2 } from "lucide-react";
import { updateProfileInfo } from "../../api/profile";
import GlassSurface from "../glass/GlassSurface";

function ProfileForm({ user, onUpdate }) {
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || user?.name || "",
    username: user?.username || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || user.name || "",
        username: user.username || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Cap bio at 200 characters if bio
    if (name === "bio" && value.length > 200) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        full_name: formData.fullName,
        username: formData.username,
        phone: formData.phone,
        bio: formData.bio,
      };

      const res = await updateProfileInfo(payload);

      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...savedUser,
          full_name: formData.fullName,
          name: formData.fullName,
          username: formData.username,
          phone: formData.phone,
          bio: formData.bio,
        })
      );

      // Dispatch storage event so header/sidebar updates dynamically
      window.dispatchEvent(new Event("storage"));

      addToast(res.data.message || "Personal information updated successfully!", "success");

      if (onUpdate) onUpdate();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <GlassSurface
      level={1}
      className="p-6 sm:p-7 rounded-3xl relative overflow-hidden transition-all duration-300 border border-white/[0.09] shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-5 mb-5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2">
            <User size={17} className="text-[#e2b17a]" />
            <h2 className="font-serif text-lg text-[#f5f2eb] font-normal tracking-wide">
              Personal Information
            </h2>
          </div>
          <p className="text-xs text-[#9e9990] mt-0.5 font-sans">
            Keep your details up to date.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-[#d1cdc7] mb-1.5">
            Full Name
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-[#9e9990] pointer-events-none">
              <User size={16} />
            </div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              required
              className="w-full h-12 bg-[#0e131d]/90 border border-white/[0.09] rounded-xl pl-10 pr-4 text-sm text-[#f5f2eb] placeholder-[#6f6b64] font-sans focus:border-[#d8b27a]/70 focus:ring-1 focus:ring-[#d8b27a]/30 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-medium text-[#d1cdc7] mb-1.5">
            Username
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-[#9e9990] pointer-events-none">
              <AtSign size={16} />
            </div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="username"
              className="w-full h-12 bg-[#0e131d]/90 border border-white/[0.09] rounded-xl pl-10 pr-4 text-sm text-[#f5f2eb] placeholder-[#6f6b64] font-sans focus:border-[#d8b27a]/70 focus:ring-1 focus:ring-[#d8b27a]/30 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-medium text-[#d1cdc7] mb-1.5">
            Phone Number
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-[#9e9990] pointer-events-none">
              <Phone size={16} />
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full h-12 bg-[#0e131d]/90 border border-white/[0.09] rounded-xl pl-10 pr-4 text-sm text-[#f5f2eb] placeholder-[#6f6b64] font-sans focus:border-[#d8b27a]/70 focus:ring-1 focus:ring-[#d8b27a]/30 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-[#d1cdc7]">
              Bio
            </label>
            <span className="text-[11px] font-mono text-[#9e9990]">
              {formData.bio.length}/200
            </span>
          </div>
          <div className="relative">
            <div className="absolute left-3.5 top-3.5 text-[#9e9990] pointer-events-none">
              <FileText size={16} />
            </div>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us something about your journey..."
              className="w-full bg-[#0e131d]/90 border border-white/[0.09] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f5f2eb] placeholder-[#6f6b64] font-sans focus:border-[#d8b27a]/70 focus:ring-1 focus:ring-[#d8b27a]/30 focus:outline-none transition-colors resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-champagne w-full py-2.5 px-5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin text-[#1a140d]" />
            ) : (
              <Save size={16} className="text-[#1a140d]" />
            )}
            <span>{isSaving ? "Saving Changes..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </GlassSurface>
  );
}

export default ProfileForm;