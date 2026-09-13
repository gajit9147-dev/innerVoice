import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, X, AlertCircle } from "lucide-react";
import { setNotePassword } from "../../../api/note";
import { useToast } from "../../../context/ToastContext";

function SetNotePasswordModal({
  isOpen,
  note,
  onClose,
  onSuccess,
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hint, setHint] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSave = async () => {
    setError("");

    if (!password.trim()) {
      setError("Password is required to protect this entry.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await setNotePassword(note.id || note._id, {
        password,
        hint,
      });

      addToast("Note secured with password", "success");

      setPassword("");
      setConfirmPassword("");
      setHint("");
      setError("");

      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Unable to set password for this note.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 sm:p-7 text-[#f5f2eb] border border-white/[0.12] shadow-2xl animate-scale-up relative"
        style={{
          background: "linear-gradient(180deg, rgba(22, 25, 31, 0.96) 0%, rgba(14, 16, 20, 0.98) 100%)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#d8b27a]/15 text-[#d8b27a] flex items-center justify-center">
              <Lock size={18} />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl text-[#f5f2eb] font-medium">
                Protect Thought
              </h2>
              <p className="text-[11px] text-[#9e9990] font-sans">
                Set a secret passphrase for this private journal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#9e9990] hover:text-[#f5f2eb] rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3.5">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter passphrase"
              className="w-full rounded-xl p-3 pr-12 bg-white/[0.04] border border-white/[0.1] text-sm text-[#f5f2eb] placeholder-[#9e9990]/60 outline-none focus:border-[#d8b27a]/60 focus:bg-white/[0.07] transition"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
            />

            <button
              type="button"
              className="absolute right-3 top-3 text-[#9e9990] hover:text-[#f5f2eb] transition"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <input
            type="password"
            placeholder="Confirm passphrase"
            className="w-full rounded-xl p-3 bg-white/[0.04] border border-white/[0.1] text-sm text-[#f5f2eb] placeholder-[#9e9990]/60 outline-none focus:border-[#d8b27a]/60 focus:bg-white/[0.07] transition"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError("");
            }}
          />

          <input
            type="text"
            placeholder="Passphrase hint (optional)"
            className="w-full rounded-xl p-3 bg-white/[0.04] border border-white/[0.1] text-sm text-[#f5f2eb] placeholder-[#9e9990]/60 outline-none focus:border-[#d8b27a]/60 focus:bg-white/[0.07] transition"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-sans text-[#9e9990] hover:text-[#f5f2eb] rounded-xl transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl font-sans font-medium text-xs sm:text-sm text-[#121418] shadow-md hover:brightness-105 active:scale-[0.99] transition disabled:opacity-50 flex items-center gap-2"
            style={{
              background: "linear-gradient(180deg, #dfbc86 0%, #c89e62 100%)",
            }}
          >
            <ShieldCheck size={16} />
            <span>{loading ? "Locking..." : "Lock Note"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SetNotePasswordModal;

