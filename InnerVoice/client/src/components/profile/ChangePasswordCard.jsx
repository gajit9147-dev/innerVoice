import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { changePassword } from "../../api/profile";
import GlassSurface from "../glass/GlassSurface";

function ChangePasswordCard() {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword) {
      addToast("Please fill in both current and new password.", "error");
      return;
    }

    if (formData.confirmPassword && formData.newPassword !== formData.confirmPassword) {
      addToast("New password and confirm password do not match.", "error");
      return;
    }

    if (formData.newPassword.length < 6) {
      addToast("Password must be at least 6 characters long.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      addToast(res.data.message || "Password updated successfully!", "success");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to update password.", "error");
    } finally {
      setIsSubmitting(false);
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
            <Lock size={17} className="text-[#e2b17a]" />
            <h2 className="font-serif text-lg text-[#f5f2eb] font-normal tracking-wide">
              Change Password
            </h2>
          </div>
          <p className="text-xs text-[#9e9990] mt-0.5 font-sans">
            Keep your account secure.
          </p>
        </div>
      </div>

      <form onSubmit={handlePasswordChange} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-medium text-[#d1cdc7] mb-1.5">
            Current Password
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-[#9e9990] pointer-events-none">
              <Lock size={16} />
            </div>
            <input
              type={showCurrent ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              required
              className="w-full h-12 bg-[#0e131d]/90 border border-white/[0.09] rounded-xl pl-10 pr-11 text-sm text-[#f5f2eb] placeholder-[#6f6b64] font-sans focus:border-[#d8b27a]/70 focus:ring-1 focus:ring-[#d8b27a]/30 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3.5 text-[#9e9990] hover:text-[#f5f2eb] transition"
              aria-label="Toggle current password visibility"
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-medium text-[#d1cdc7] mb-1.5">
            New Password
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-[#9e9990] pointer-events-none">
              <Lock size={16} />
            </div>
            <input
              type={showNew ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password (min. 6 chars)"
              required
              className="w-full h-12 bg-[#0e131d]/90 border border-white/[0.09] rounded-xl pl-10 pr-11 text-sm text-[#f5f2eb] placeholder-[#6f6b64] font-sans focus:border-[#d8b27a]/70 focus:ring-1 focus:ring-[#d8b27a]/30 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3.5 text-[#9e9990] hover:text-[#f5f2eb] transition"
              aria-label="Toggle new password visibility"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-medium text-[#d1cdc7] mb-1.5">
            Confirm New Password
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-[#9e9990] pointer-events-none">
              <Lock size={16} />
            </div>
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className="w-full h-12 bg-[#0e131d]/90 border border-white/[0.09] rounded-xl pl-10 pr-11 text-sm text-[#f5f2eb] placeholder-[#6f6b64] font-sans focus:border-[#d8b27a]/70 focus:ring-1 focus:ring-[#d8b27a]/30 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 text-[#9e9990] hover:text-[#f5f2eb] transition"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Update Password Button (Replaces bright green button with amber glass button) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-champagne w-full py-2.5 px-5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin text-[#1a140d]" />
            ) : (
              <Lock size={16} className="text-[#1a140d]" />
            )}
            <span>{isSubmitting ? "Updating..." : "Update Password"}</span>
          </button>
        </div>
      </form>
    </GlassSurface>
  );
}

export default ChangePasswordCard;
