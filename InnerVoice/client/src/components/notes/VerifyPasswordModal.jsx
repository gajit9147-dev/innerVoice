import { useState } from "react";
import { KeyRound, ShieldAlert, Info, Unlock } from "lucide-react";
import { verifyNotePassword, deleteNotePassword } from "../../api/note";
import Modal from "../common/Modal";

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
      <div className="flex flex-col items-center py-4">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/50 animate-pulse">
          {isDeleteFlow ? <Unlock className="text-red-500 w-8 h-8" /> : <KeyRound className="text-red-500 w-8 h-8" />}
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isDeleteFlow ? "Remove Password" : "Unlock Note"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6 leading-relaxed">
          {isDeleteFlow 
            ? "Enter the custom password to remove password protection from this note entirely."
            : "This note is protected by a custom password. Enter the password below to unlock and read its content."
          }
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
              Note Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter custom note password"
              disabled={loading}
              autoFocus
              className="w-full border rounded-lg p-3 bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 focus:border-red-500 focus:outline-none"
            />
          </div>

          {!isDeleteFlow && note?.password_hint && (
            <div className="flex items-start gap-2.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-950/50 rounded-lg p-3 leading-relaxed">
              <Info size={16} className="mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Password Hint:</span> {note.password_hint}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm py-2 px-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium text-sm disabled:opacity-50 shadow-md"
            >
              {loading ? "Removing..." : isDeleteFlow ? "Remove Password" : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default VerifyPasswordModal;
