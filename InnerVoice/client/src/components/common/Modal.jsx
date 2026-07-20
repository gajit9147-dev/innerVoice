function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">

      <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl p-6 w-full max-w-xl relative shadow-2xl border border-gray-100 dark:border-slate-800 animate-fade-scale">

        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
        >
          ✕
        </button>

        {children}

      </div>
    </div>
  );
}

export default Modal;
