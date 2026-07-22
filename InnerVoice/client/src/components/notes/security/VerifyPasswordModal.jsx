import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { verifyNotePassword, deleteNotePassword } from "../../../api/note";
import Modal from "../../common/Modal";

function VerifyPasswordModal({ note, onClose, onSuccess, isDeleteFlow = false }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = isDeleteFlow
        ? await deleteNotePassword(note.id, password)
        : await verifyNotePassword(note.id, password);

      if (response.data.success) {
        onSuccess();
      } else {
        setError(response.data.message || "Incorrect password.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Incorrect password or an error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="py-2">
        {/* Header Section */}
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <span>🔐</span> {isDeleteFlow ? "Remove Password" : "Unlock Note"}
        </h3>
        
        {/* Border Divider */}
        <div className="border-b border-gray-150 dark:border-slate-800 w-full mb-4"></div>

        {/* Subtitle */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {isDeleteFlow 
            ? "Enter the custom password to remove password protection from this note entirely."
            : "This note has a custom password."
          }
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
          {/* Password Input Block */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter custom password"
              disabled={loading}
              autoFocus
              className="w-full border rounded-lg p-3 bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 outline-none focus:border-red-500"
            />
          </div>

          {/* Optional Hint Block (only if not delete flow) */}
          {!isDeleteFlow && note?.password_hint && (
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1.5">
                Hint
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                "{note.password_hint}"
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm py-2.5 px-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border rounded-lg border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold text-sm disabled:opacity-60 shadow-md"
            >
              {loading ? "Verifying..." : isDeleteFlow ? "Remove" : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default VerifyPasswordModal;
