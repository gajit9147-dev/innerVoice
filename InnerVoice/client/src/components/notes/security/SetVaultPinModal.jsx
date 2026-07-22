import { useState } from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { setVaultPin } from "../../../api/auth";
import Modal from "../../common/Modal";

function SetVaultPinModal({ onClose, onSuccess }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();

    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await setVaultPin(pin);

      alert("Vault PIN saved successfully!");
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Unable to save Vault PIN."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col items-center py-4">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-900/50 animate-pulse">
          <Lock className="text-blue-500 w-8 h-8" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Set Security PIN
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6 leading-relaxed">
          You need to set a 4-digit Vault PIN to lock your notes. Please choose a PIN below.
        </p>

        <form onSubmit={handleSave} className="w-full max-w-md space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
              4-Digit PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(""); }}
              placeholder="Enter 4-digit PIN"
              disabled={loading}
              className="w-full border rounded-lg p-3 bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none text-center font-bold tracking-widest text-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
              Confirm PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => { setConfirmPin(e.target.value); setError(""); }}
              placeholder="Confirm 4-digit PIN"
              disabled={loading}
              className="w-full border rounded-lg p-3 bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none text-center font-bold tracking-widest text-xl"
            />
          </div>

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
              disabled={loading || pin.length !== 4}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm disabled:opacity-50 shadow-md"
            >
              {loading ? "Saving..." : "Save & Lock Note"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default SetVaultPinModal;
