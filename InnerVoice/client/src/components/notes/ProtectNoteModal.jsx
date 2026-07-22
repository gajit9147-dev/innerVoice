import { Shield, KeyRound } from "lucide-react";
import Modal from "../common/Modal";

function ProtectNoteModal({ onClose, onSelectGlobal, onSelectCustom }) {
  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col items-center py-4">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-900/50 animate-pulse">
          <Shield className="text-blue-500 w-8 h-8" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Protect Note
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6 leading-relaxed">
          Select a security option to lock this note. Locked notes hide their content from the dashboard.
        </p>

        <div className="w-full space-y-4 max-w-md">
          {/* Option 1: Global PIN */}
          <button
            onClick={onSelectGlobal}
            className="w-full flex items-start p-4 border-2 border-gray-100 hover:border-blue-500 dark:border-slate-800 dark:hover:border-blue-500 rounded-xl text-left bg-gray-50/50 hover:bg-blue-50/10 dark:bg-slate-900/50 transition-all duration-200"
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mr-4 mt-0.5">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-base">
                Global Vault PIN
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Protect this note using your account-wide 4-digit security PIN.
              </p>
            </div>
          </button>

          {/* Option 2: Custom Password */}
          <button
            onClick={onSelectCustom}
            className="w-full flex items-start p-4 border-2 border-gray-100 hover:border-blue-500 dark:border-slate-800 dark:hover:border-blue-500 rounded-xl text-left bg-gray-50/50 hover:bg-blue-50/10 dark:bg-slate-900/50 transition-all duration-200"
          >
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg mr-4 mt-0.5">
              <KeyRound size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-base">
                Custom Password
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Set a unique password and optional hint specifically for this note.
              </p>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 px-5 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition font-medium text-sm w-full max-w-md text-center"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

export default ProtectNoteModal;
