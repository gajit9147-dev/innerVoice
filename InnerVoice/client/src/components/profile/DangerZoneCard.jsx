import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { deleteAccount } from "../../api/profile";

function DangerZoneCard() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      "Are you absolutely sure you want to permanently delete your account? This action cannot be undone and will delete all your notes."
    );

    if (isConfirmed) {
      try {
        await deleteAccount();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        addToast("Account permanently deleted.", "success");
        navigate("/login");
      } catch (err) {
        addToast(err.response?.data?.message || "Failed to delete account.", "error");
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 lg:p-8 border border-red-150 dark:border-red-900/30 transition-colors">
      <h3 className="text-lg font-bold text-red-600 dark:text-red-500 mb-2 flex items-center gap-2">
        <AlertTriangle size={20} />
        Danger Zone
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
        Permanently delete your account and all your notes. This action cannot be undone.
      </p>
      <button
        type="button"
        onClick={handleDeleteAccount}
        className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-lg font-medium transition-colors cursor-pointer"
      >
        Delete Account
      </button>
    </div>
  );
}

export default DangerZoneCard;
