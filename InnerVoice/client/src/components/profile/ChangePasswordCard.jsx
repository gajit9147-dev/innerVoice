import { useState } from "react";
import { Lock } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { changePassword } from "../../api/profile";

function ChangePasswordCard() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword) {
      addToast("Please fill in both password fields.", "error");
      return;
    }

    try {
      const res = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      addToast(res.data.message || "Password changed successfully!", "success");

      setFormData({
        currentPassword: "",
        newPassword: "",
      });
    } catch (error) {
      addToast(error.response?.data?.message || "Something went wrong.", "error");
    }
  };

  return (
    <form
      onSubmit={handlePasswordChange}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 lg:p-8 border border-gray-100 dark:border-slate-700 transition-colors"
    >
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
        Change Password
      </h3>

      <div className="space-y-5">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer"
        >
          <Lock size={18} />
          Change Password
        </button>
      </div>
    </form>
  );
}

export default ChangePasswordCard;
