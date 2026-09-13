import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-slide-in pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl bg-[#14161b]/95 border border-white/[0.12] text-[#f5f2eb] transition-all"
          >
            {toast.type === "success" ? (
              <div className="w-6 h-6 rounded-full bg-[#d8b27a]/15 text-[#d8b27a] flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle size={16} />
              </div>
            )}
            <span className="font-sans text-xs sm:text-sm font-normal text-[#f5f2eb] flex-1 leading-snug">
              {toast.message}
            </span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 text-[#9e9990] hover:text-[#f5f2eb] rounded-lg transition-colors shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      addToast: (msg) => console.log("[Toast fallback]:", msg),
    };
  }
  return ctx;
};

