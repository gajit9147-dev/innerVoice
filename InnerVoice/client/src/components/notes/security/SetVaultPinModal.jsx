import { useState } from "react";
import { Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { setVaultPin } from "../../../api/auth";
import Modal from "../../common/Modal";
import { useToast } from "../../../context/ToastContext";

function SetVaultPinModal({ onClose, onSuccess }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addToast } = useToast();

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

      addToast("Vault PIN saved successfully!", "success");
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
      <div className="flex flex-col items-center py-4 text-[#f5f2eb]">
        <div className="w-14 h-14 bg-[#d8b27a]/15 text-[#d8b27a] rounded-full flex items-center justify-center mb-4 border border-[#d8b27a]/30 shadow-lg">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="font-serif text-2xl text-[#f5f2eb] mb-1 font-normal tracking-tight">
          Set Security PIN
        </h3>
        <p className="text-xs text-[#9e9990] text-center max-w-sm mb-6 font-sans">
          Create a 4-digit Vault PIN to lock and protect private thoughts.
        </p>

        <form onSubmit={handleSave} className="w-full max-w-sm space-y-4 font-sans">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#9e9990] mb-1.5">
              4-Digit PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(""); }}
              placeholder="••••"
              disabled={loading}
              className="w-full rounded-xl p-3 bg-white/[0.04] text-[#f5f2eb] border border-white/[0.1] focus:border-[#d8b27a]/60 focus:bg-white/[0.07] focus:outline-none text-center font-serif tracking-[0.5em] text-2xl placeholder-[#9e9990]/40 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#9e9990] mb-1.5">
              Confirm PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => { setConfirmPin(e.target.value); setError(""); }}
              placeholder="••••"
              disabled={loading}
              className="w-full rounded-xl p-3 bg-white/[0.04] text-[#f5f2eb] border border-white/[0.1] focus:border-[#d8b27a]/60 focus:bg-white/[0.07] focus:outline-none text-center font-serif tracking-[0.5em] text-2xl placeholder-[#9e9990]/40 transition"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-300 text-xs py-2 px-3 bg-rose-500/10 border border-rose-500/25 rounded-xl">
              <ShieldAlert size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.1] text-[#9e9990] hover:text-[#f5f2eb] hover:bg-white/[0.05] transition text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-[#121418] shadow-md hover:brightness-105 active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              style={{
                background: "linear-gradient(180deg, #dfbc86 0%, #c89e62 100%)",
              }}
            >
              <ShieldCheck size={16} />
              <span>{loading ? "Saving..." : "Save PIN"}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default SetVaultPinModal;

