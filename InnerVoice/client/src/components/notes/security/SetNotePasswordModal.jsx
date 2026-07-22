import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { setNotePassword } from "../../../api/note";

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

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!password.trim()) {
      return alert("Password is required.");
    }

    if (password.length < 4) {
      return alert("Password must be at least 4 characters.");
    }

    if (password !== confirmPassword) {
      return alert("Passwords do not match.");
    }

    try {
      setLoading(true);

      await setNotePassword(note.id, {
        password,
        hint,
      });

      alert("Note protected successfully.");

      setPassword("");
      setConfirmPassword("");
      setHint("");

      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Unable to set password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-slate-800 text-gray-900 dark:text-white">

        <div className="flex items-center gap-3 mb-6">
          <Lock className="text-red-500" />
          <h2 className="text-xl font-bold">
            Set Note Password
          </h2>
        </div>

        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Protect this note with a custom password.
        </p>

        <div className="space-y-4">

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border rounded-lg p-3 pr-12 bg-transparent border-gray-200 dark:border-slate-700 outline-none focus:border-red-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border rounded-lg p-3 bg-transparent border-gray-200 dark:border-slate-700 outline-none focus:border-red-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <input
            type="text"
            placeholder="Password Hint (Optional)"
            className="w-full border rounded-lg p-3 bg-transparent border-gray-200 dark:border-slate-700 outline-none focus:border-red-500"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
          />

        </div>

        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-lg border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSave}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Password"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default SetNotePasswordModal;
