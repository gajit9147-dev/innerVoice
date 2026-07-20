import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { Save, User, Mail, Lock, AlertTriangle, AtSign, Phone, FileText } from "lucide-react";
import { updateProfileInfo, changePassword, deleteAccount } from "../../api/profile";
import { useNavigate } from "react-router-dom";

function ProfileForm({ user, onUpdate }) {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    username: user?.username || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: ""
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.full_name || "",
        username: user.username || "",
        phone: user.phone || "",
        bio: user.bio || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload = {
        full_name: formData.fullName,
        username: formData.username,
        phone: formData.phone,
        bio: formData.bio
      };
      const res = await updateProfileInfo(payload);
      
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...savedUser,
        full_name: formData.fullName,
        username: formData.username,
        phone: formData.phone,
        bio: formData.bio
      }));
      
      addToast(res.data.message || "Profile updated successfully!", "success");
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
      
      if (onUpdate) onUpdate();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Password change handler – now inside the component
  const handlePasswordChange = async () => {
    try {
      if (!formData.currentPassword || !formData.newPassword) {
        addToast("Please fill in both password fields.", "error");
        return;
      }

      const res = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      addToast(res.data.message || "Password changed successfully!", "success");

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));
    } catch (error) {
      addToast(error.response?.data?.message || "Something went wrong.", "error");
    }
  };

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

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <div className="relative">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100 transition-colors"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100 transition-colors"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio
          </label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 text-gray-400" size={18} />
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100 transition-colors resize-none"
              placeholder="Tell us something about yourself..."
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

        {/* Current Password - now enabled */}
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

        {/* New Password - now enabled */}
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

        {/* Change Password button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handlePasswordChange}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Lock size={18} />
            Change Password
          </button>
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
      
      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t border-red-100 dark:border-red-900/30">
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
          className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-lg font-medium transition-colors"
        >
          Delete Account
        </button>
      </div>
    </form>
  );
}

export default ProfileForm;