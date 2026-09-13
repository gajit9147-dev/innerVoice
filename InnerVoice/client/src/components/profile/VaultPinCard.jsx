import { useState } from "react";
import { Lock, Shield, Loader2, Check } from "lucide-react";
import { setVaultPin } from "../../api/auth";
import { useToast } from "../../context/ToastContext";
import GlassSurface from "../glass/GlassSurface";

function VaultPinCard() {
  const { addToast } = useToast();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (!/^\d{4}$/.test(pin)) {
      addToast("PIN must be exactly 4 digits.", "error");
      return;
    }

    if (pin !== confirmPin) {
      addToast("PINs do not match.", "error");
      return;
    }

    try {
      setLoading(true);
      await setVaultPin(pin);
      addToast("Vault security PIN updated successfully!", "success");
      setPin("");
      setConfirmPin("");
    } catch (err) {
      console.error(err);
      addToast("Unable to update Vault PIN.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassSurface
      level={1}
      className="p-6 sm:p-7 rounded-3xl relative overflow-hidden transition-all duration-300 border border-white/[0.09] shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
    >
      <div className="flex items-start justify-between pb-5 mb-5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2">
            <Shield size={17} className="text-[#e2b17a]" />
            <h2 className="font-serif text-lg text-[#f5f2eb] font-normal tracking-wide">
              Vault Security PIN
            </h2>
          </div>
          <p className="text-xs text-[#9e9990] mt-0.5 font-sans">
            Protect private notes with a 4-digit PIN.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#d1cdc7] mb-1.5">
            4-Digit PIN
          </label>
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••"
            className="w-full h-12 bg-[#0e131d]/90 border border-white/[0.09] rounded-xl px-4 text-center tracking-[0.5em] text-lg text-[#f5f2eb] placeholder-[#6f6b64] font-mono focus:border-[#d8b27a]/70 focus:ring-1 focus:ring-[#d8b27a]/30 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#d1cdc7] mb-1.5">
            Confirm PIN
          </label>
          <input
            type="password"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••"
            className="w-full h-12 bg-[#0e131d]/90 border border-white/[0.09] rounded-xl px-4 text-center tracking-[0.5em] text-lg text-[#f5f2eb] placeholder-[#6f6b64] font-mono focus:border-[#d8b27a]/70 focus:ring-1 focus:ring-[#d8b27a]/30 focus:outline-none transition-colors"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-amber-glass w-full py-2.5 px-5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin text-[#e2b17a]" />
            ) : (
              <Lock size={16} className="text-[#e2b17a]" />
            )}
            <span>{loading ? "Saving PIN..." : "Save Vault PIN"}</span>
          </button>
        </div>
      </form>
    </GlassSurface>
  );
}

export default VaultPinCard;