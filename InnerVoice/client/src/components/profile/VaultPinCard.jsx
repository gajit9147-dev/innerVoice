import { useState } from "react";
import { Lock } from "lucide-react";
import { setVaultPin } from "../../api/auth";

function VaultPinCard() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!/^\d{4}$/.test(pin)) {
      return alert("PIN must be exactly 4 digits.");
    }

    if (pin !== confirmPin) {
      return alert("PINs do not match.");
    }

    try {
      setLoading(true);

      await setVaultPin(pin);

      alert("Vault PIN saved successfully!");

      setPin("");
      setConfirmPin("");
    } catch (err) {
      console.error(err);
      alert("Unable to save Vault PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-5">
        <Lock className="text-red-500" size={24} />
        <h2 className="text-xl font-bold">Vault Security</h2>
      </div>

      <div className="space-y-4">
        <input
          type="password"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter 4-digit PIN"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="password"
          maxLength={4}
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          placeholder="Confirm PIN"
          className="w-full border rounded-lg p-3"
        />

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-3"
        >
          {loading ? "Saving..." : "Save Vault PIN"}
        </button>
      </div>
    </div>
  );
}

export default VaultPinCard;