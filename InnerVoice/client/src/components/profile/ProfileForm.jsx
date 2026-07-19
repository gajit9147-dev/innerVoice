import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { Save, User, Mail, Lock } from "lucide-react";

function ProfileForm() {
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "Ajeet Gupta",
    email: "ajeetgupta80045@gmail.com",
    currentPassword: "",
    newPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API Call
    setTimeout(() => {
      setIsSaving(false);
      addToast("Profile updated successfully!", "success");
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 lg:p-8 border border-gray-100 dark:border-slate-700 transition-colors">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
        Personal Information
      </h3>

      <div className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100 transition-colors"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-colors"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Email address cannot be changed currently.</p>
        </div>

        <div className="w-full h-px bg-gray-100 dark:bg-slate-700 my-8 transition-colors"></div>

        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
          Change Password
        </h3>

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
              placeholder="••••••••"
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
              placeholder="Leave blank to keep current"
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-70"
        >
          <Save size={18} />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default ProfileForm;
