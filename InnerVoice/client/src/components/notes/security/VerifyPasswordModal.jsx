import { useState } from "react";
import { ShieldAlert, ArrowLeft, Lock, KeyRound } from "lucide-react";
import { verifyNotePassword, deleteNotePassword, resetNotePassword } from "../../../api/note";
import { useToast } from "../../../context/ToastContext";
import Modal from "../../common/Modal";

function VerifyPasswordModal({ note, onClose, onSuccess, isDeleteFlow = false }) {
  const { addToast } = useToast();
  
  // Verify Mode states
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset Mode states
  const [isResetMode, setIsResetMode] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [newNotePassword, setNewNotePassword] = useState("");
  const [hint, setHint] = useState("");

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

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (!accountPassword || !newNotePassword) {
      setError("Account password and new note password are required.");
      return;
    }

    if (newNotePassword.length < 4) {
      setError("New password must be at least 4 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await resetNotePassword(note.id, {
        accountPassword,
        newNotePassword,
        hint
      });

      if (response.data.success) {
        setIsResetMode(false);
        setPassword("");
        setAccountPassword("");
        setNewNotePassword("");
        setHint("");
        addToast("Note password reset successfully!", "success");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Verification failed. Incorrect account password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="py-2">
        {/* Dynamic Header Section depending on active view */}
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <span>{isResetMode ? "🔑" : "🔐"}</span> 
          {isResetMode ? "Reset Password" : isDeleteFlow ? "Remove Password" : "Unlock Note"}
        </h3>
        
        {/* Border Divider */}
        <div className="border-b border-gray-150 dark:border-slate-800 w-full mb-4"></div>

        {isResetMode ? (
          /* RESET PASSWORD FORM VIEW */
          <form onSubmit={handleResetSubmit} className="w-full max-w-md space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
              Enter your main account login password to verify identity and configure a new password for this note.
            </p>

            {/* Account Password Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                Account Login Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={accountPassword}
                  onChange={(e) => { setAccountPassword(e.target.value); setError(""); }}
                  placeholder="Enter login password"
                  disabled={loading}
                  required
                  className="w-full border rounded-lg p-3 bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* New Note Password Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                New Note Password
              </label>
              <input
                type="password"
                value={newNotePassword}
                onChange={(e) => { setNewNotePassword(e.target.value); setError(""); }}
                placeholder="Enter new note password"
                disabled={loading}
                required
                className="w-full border rounded-lg p-3 bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 outline-none focus:border-blue-500"
              />
            </div>

            {/* Hint Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                Password Hint (Optional)
              </label>
              <input
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="e.g. My childhood pet"
                disabled={loading}
                className="w-full border rounded-lg p-3 bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 outline-none focus:border-blue-500"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm py-2.5 px-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg animate-fade-scale">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between items-center pt-3">
              <button
                type="button"
                onClick={() => { setIsResetMode(false); setError(""); }}
                disabled={loading}
                className="flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline select-none cursor-pointer"
              >
                <ArrowLeft size={16} /> Back
              </button>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-5 py-2.5 border rounded-lg border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition font-semibold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !accountPassword || !newNotePassword}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-sm disabled:opacity-60 shadow-md cursor-pointer"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* STANDARD UNLOCK NOTE FORM VIEW */
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-1">
              {isDeleteFlow 
                ? "Enter the custom password to remove password protection from this note entirely."
                : "This note has a custom password."
              }
            </p>

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
              <div className="bg-gray-50 dark:bg-slate-900/40 p-3 rounded-lg border border-gray-100 dark:border-slate-850">
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  Password Hint
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                  "{note.password_hint}"
                </p>
              </div>
            )}

            {/* Forgot password link */}
            {!isDeleteFlow && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(true);
                    setError("");
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  Forgot password? Reset using Account Password
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm py-2.5 px-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg animate-fade-scale">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 border rounded-lg border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition font-semibold text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !password}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold text-sm disabled:opacity-60 shadow-md cursor-pointer"
              >
                {loading ? "Verifying..." : isDeleteFlow ? "Remove" : "Unlock"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

export default VerifyPasswordModal;
