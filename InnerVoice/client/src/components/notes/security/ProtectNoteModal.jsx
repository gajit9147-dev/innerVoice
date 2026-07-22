import Modal from "../../common/Modal";

function ProtectNoteModal({ note, onClose, onSelectGlobal, onPassword, onRemovePassword }) {
  const hasCustomPassword = note?.security_type === "custom_password";

  return (
    <Modal onClose={onClose}>
      <div className="py-2 text-center">
        {/* Header Section */}
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-2 mb-3">
          <span>🔒</span> Protect Note
        </h3>
        
        {/* Border Divider */}
        <div className="border-b border-gray-150 dark:border-slate-800 w-full mb-4"></div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-6 leading-relaxed">
          Choose how you'd like to protect this note.
        </p>

        {/* Options List */}
        <div className="space-y-4 max-w-md mx-auto">
          {/* Option 1: Vault PIN */}
          <button
            onClick={onSelectGlobal}
            className="w-full flex items-start p-4 border border-gray-200 dark:border-slate-800 rounded-xl text-left bg-gray-50 hover:bg-blue-50/20 dark:bg-slate-900 dark:hover:bg-slate-800/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 group"
          >
            <span className="text-2xl mr-4 mt-1 select-none">🔐</span>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Vault PIN
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Protect using your global PIN.
              </p>
            </div>
          </button>

          {/* Option 2: Custom Password */}
          <button
            onClick={onPassword}
            className="w-full flex items-start p-4 border border-gray-200 dark:border-slate-800 rounded-xl text-left bg-gray-50 hover:bg-indigo-50/20 dark:bg-slate-900 dark:hover:bg-slate-800/50 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-200 group"
          >
            <span className="text-2xl mr-4 mt-1 select-none">🔑</span>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Custom Password
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {hasCustomPassword ? "Change note password." : "Create a password for this note."}
              </p>
            </div>
          </button>

          {/* Option 3: Remove Password (only shown if a custom password exists) */}
          {hasCustomPassword && (
            <button
              onClick={onRemovePassword}
              className="w-full flex items-start p-4 border border-red-100 hover:border-red-500 dark:border-red-950/30 dark:hover:border-red-800 rounded-xl text-left bg-red-50/50 hover:bg-red-50/20 dark:bg-slate-900/50 transition-all duration-200 group"
            >
              <span className="text-2xl mr-4 mt-1 select-none">🔓</span>
              <div>
                <h4 className="font-bold text-red-600 dark:text-red-500 text-base group-hover:text-red-700 transition-colors">
                  Remove Password
                </h4>
                <p className="text-xs text-red-400/80 dark:text-red-400 mt-1">
                  Remove password protection from this note.
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 px-5 py-3 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-400 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition font-semibold text-sm w-full max-w-md text-center"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

export default ProtectNoteModal;
