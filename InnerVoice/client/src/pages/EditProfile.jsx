import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { getProfileInfo, updateProfileInfo } from "../api/profile";
import { useToast } from "../context/ToastContext";
import { 
  ArrowLeft, 
  Save, 
  User, 
  AtSign, 
  Phone, 
  FileText, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Mail,
  ShieldCheck
} from "lucide-react";

function EditProfile() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    phone: "",
    bio: "",
    email: "",
    profile_image: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const res = await getProfileInfo();
      const p = res.data.profile || {};

      setForm({
        full_name: p.full_name || "",
        username: p.username || "",
        phone: p.phone || "",
        bio: p.bio || "",
        email: p.email || "",
        profile_image: p.profile_image || ""
      });
    } catch (err) {
      console.error(err);
      addToast("Failed to load profile details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      addToast("Full Name is required.", "error");
      return;
    }

    try {
      setIsSaving(true);
      await updateProfileInfo({
        full_name: form.full_name,
        username: form.username,
        phone: form.phone,
        bio: form.bio
      });

      addToast("Profile updated successfully!", "success");
      
      // Update local stored user
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...savedUser,
        full_name: form.full_name,
        username: form.username
      }));

      setTimeout(() => {
        navigate("/profile");
      }, 500);

    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to update profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = form.full_name
    ? form.full_name.substring(0, 2).toUpperCase()
    : "IV";

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={44} />
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400 animate-pulse">
            Loading your profile...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-4 px-2 sm:px-4 animate-fade-scale">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate("/profile")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 mb-3 transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Profile
            </button>
            
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
              Edit Profile
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                <Sparkles size={13} /> Customization
              </span>
            </h1>
          </div>

          <button
            type="submit"
            form="edit-profile-form"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Live Preview Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-100 dark:border-slate-700/60 rounded-3xl p-6 shadow-xl flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
              
              <div className="relative mb-4">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white">
                  {form.profile_image ? (
                    <img
                      src={form.profile_image}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-full">
                {form.full_name || "Your Name"}
              </h2>

              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                {form.username ? `@${form.username}` : "@username"}
              </p>

              <p className="text-xs text-gray-500 dark:text-slate-400 mt-3 line-clamp-3 italic">
                {form.bio || "No bio added yet..."}
              </p>

              <div className="w-full border-t border-gray-100 dark:border-slate-700/60 my-5" />

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 w-full justify-center">
                <ShieldCheck size={16} /> Live Profile Preview
              </div>
            </div>
          </div>

          {/* Right Column: Edit Form */}
          <div className="lg:col-span-8">
            <form
              id="edit-profile-form"
              onSubmit={handleSubmit}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-100 dark:border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Personal Details
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Update your display name, handle, and contact information.
                </p>
              </div>

              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      placeholder="e.g. Alex Johnson"
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 transition-all font-medium text-sm"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="e.g. alexj"
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 transition-all font-medium text-sm"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 transition-all font-medium text-sm"
                    />
                  </div>
                </div>

                {/* Email (Read Only) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-2">
                    Email Address <span className="text-gray-400 font-normal">(Non-editable)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      disabled
                      className="w-full bg-gray-100 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-gray-500 dark:text-slate-400 cursor-not-allowed font-medium text-sm"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-2">
                    Bio / About You
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 text-gray-400 dark:text-slate-500" size={18} />
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Share a short bio or personal note..."
                      rows={4}
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 transition-all font-medium text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Footer */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="px-5 py-2.5 rounded-xl font-medium text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition-all duration-300 disabled:opacity-70 text-sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </Layout>
  );
}

export default EditProfile;