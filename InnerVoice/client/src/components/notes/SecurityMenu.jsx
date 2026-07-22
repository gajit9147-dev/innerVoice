import { useRef, useEffect } from "react";
import { Lock, KeyRound, Unlock } from "lucide-react";

function SecurityMenu({ note, onClose, onLockPIN, onLockPassword, onRemovePassword }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const hasCustomPassword = note.security_type === "password";

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-xl z-30 py-2 animate-fade-scale text-sm text-gray-700 dark:text-slate-300"
    >
      <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
        Note Protection
      </div>

      {/* Option: Lock note using PIN */}
      <button
        onClick={() => {
          onLockPIN();
          onClose();
        }}
        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition"
      >
        <Lock size={16} className="text-blue-500" />
        <span>Use Global PIN</span>
      </button>

      {/* Option: Set custom password */}
      <button
        onClick={() => {
          onLockPassword();
          onClose();
        }}
        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition"
      >
        <KeyRound size={16} className="text-indigo-500" />
        <span>{hasCustomPassword ? "Change Password" : "Set Custom Password"}</span>
      </button>

      {/* Option: Remove password protection (if custom password set) */}
      {hasCustomPassword && (
        <button
          onClick={() => {
            onRemovePassword();
            onClose();
          }}
          className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center gap-2.5 border-t border-gray-100 dark:border-slate-800 mt-1 pt-2 transition font-medium"
        >
          <Unlock size={16} />
          <span>Remove Password</span>
        </button>
      )}
    </div>
  );
}

export default SecurityMenu;
