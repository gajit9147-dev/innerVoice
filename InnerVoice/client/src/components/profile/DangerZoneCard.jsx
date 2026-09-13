import { useNavigate } from "react-router-dom";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { deleteAccount } from "../../api/profile";
import GlassSurface from "../glass/GlassSurface";

function DangerZoneCard() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      "Are you absolutely sure you want to permanently delete your account? This action cannot be undone and will delete all your notes."
    );

    if (isConfirmed) {
      try {
        await deleteAccount();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        addToast("Account permanently deleted.", "success");
        navigate("/login");
      } catch (err) {
        addToast(err.response?.data?.message || "Failed to delete account.", "error");
      }
    }
  };

  return (
    <GlassSurface
      level={1}
      className="p-6 sm:p-7 rounded-3xl relative overflow-hidden transition-all duration-300 border border-red-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
    >
      <div className="flex items-start justify-between pb-5 mb-5 border-b border-red-500/15">
        <div>
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle size={17} />
            <h2 className="font-serif text-lg text-rose-300 font-normal tracking-wide">
              Danger Zone
            </h2>
          </div>
          <p className="text-xs text-[#9e9990] mt-0.5 font-sans">
            Permanent account deletion.
          </p>
        </div>
      </div>

      <p className="text-xs text-[#d1cdc7] leading-relaxed mb-5">
        Permanently delete your account and all your associated thoughts, music memories, and reflections. This action cannot be reversed.
      </p>

      <button
        type="button"
        onClick={handleDeleteAccount}
        className="w-full py-2.5 px-4 bg-red-500/15 hover:bg-red-500/25 text-rose-300 border border-red-500/30 hover:border-red-500/50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
      >
        <Trash2 size={15} />
        <span>Delete My Account</span>
      </button>
    </GlassSurface>
  );
}

export default DangerZoneCard;
