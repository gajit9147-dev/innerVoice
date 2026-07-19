import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-slide-in pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border ${
              toast.type === "success" 
                ? "bg-white dark:bg-slate-800 border-green-100 dark:border-green-900/30 text-slate-800 dark:text-slate-100" 
                : "bg-white dark:bg-slate-800 border-red-100 dark:border-red-900/30 text-slate-800 dark:text-slate-100"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="text-green-500" size={20} />
            ) : (
              <XCircle className="text-red-500" size={20} />
            )}
            <span className="font-medium text-sm">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
