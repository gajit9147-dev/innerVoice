import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ children, onClose, maxWidth = "max-w-xl" }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    // Lock body scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex justify-center items-center z-50 p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className={`glass-floating text-[#f5f2eb] rounded-3xl p-5 sm:p-7 w-full ${maxWidth} max-h-[90dvh] overflow-y-auto relative shadow-2xl border border-white/[0.12] animate-fade-scale`}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-[#9e9990] hover:text-[#f5f2eb] hover:bg-white/[0.08] transition cursor-pointer z-20"
        >
          <X size={17} />
        </button>

        {children}
      </div>
    </div>
  );
}
