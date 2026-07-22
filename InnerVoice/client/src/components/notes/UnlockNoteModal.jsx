import { useState, useRef, useEffect } from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { verifyVaultPin } from "../../api/auth";
import Modal from "../common/Modal";

function UnlockNoteModal({ onClose, onSuccess }) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value !== "" && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError("");

    // Automatically focus next input if we entered a digit
    if (value !== "" && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && pin[index] === "" && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{4}$/.test(pastedData)) {
      setError("Please paste a 4-digit code.");
      return;
    }

    const digits = pastedData.split("");
    setPin(digits);
    setError("");
    if (inputRefs[3].current) {
      inputRefs[3].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const pinString = pin.join("");
    if (pinString.length !== 4) {
      setError("Please enter a 4-digit PIN.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await verifyVaultPin(pinString);
      
      if (response.data.success) {
        onSuccess();
      } else {
        setError(response.data.message || "Invalid PIN.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Incorrect PIN or an error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  // Automatically submit if all 4 digits are filled
  useEffect(() => {
    if (pin.every((digit) => digit !== "")) {
      handleSubmit();
    }
  }, [pin]);

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col items-center justify-center py-4">
        {/* Lock Icon container */}
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/50 animate-pulse">
          <Lock className="text-red-500 w-8 h-8" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Unlock Note
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6 leading-relaxed">
          This note is encrypted and locked. Please enter your 4-digit security PIN to access it.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <div className="flex gap-4 mb-6" onPaste={handlePaste}>
            {pin.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={loading}
                className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-transparent text-gray-900 dark:text-white focus:border-red-500 focus:outline-none transition-all duration-200 shadow-sm"
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm mb-6 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-lg border border-red-100 dark:border-red-900/30">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 w-full max-w-xs mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || pin.some(d => d === "")}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? "Unlocking..." : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default UnlockNoteModal;
