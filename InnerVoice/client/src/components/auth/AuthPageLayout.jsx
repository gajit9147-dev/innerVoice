import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Check, Shield, Sparkles, ArrowRight, Loader2, X } from "lucide-react";
import { signupUser, loginUser, socialLoginUser } from "../../api/auth";

export default function AuthPageLayout({ initialMode = "signup" }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode); // "signup" or "login"
  const isSignup = mode === "signup";

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Social Auth Modal State
  const [socialModal, setSocialModal] = useState({
    isOpen: false,
    provider: "google", // "google" | "apple" | "github"
    email: "",
    name: "",
    loading: false,
    error: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  // Toggle mode smoothly
  const handleToggleMode = (targetMode) => {
    setError("");
    setSuccessMsg("");
    setMode(targetMode);
    if (targetMode === "login") {
      navigate("/login", { replace: true });
    } else {
      navigate("/signup", { replace: true });
    }
  };

  // Dynamic password strength (0 to 100%)
  const calculateStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 25;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]|[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };

  const strength = calculateStrength(formData.password);

  // Open social authentication modal
  const handleOpenSocialModal = (provider) => {
    let defaultEmail = formData.email;
    let defaultName = formData.full_name;

    if (!defaultEmail) {
      if (provider === "google") defaultEmail = "user.google@gmail.com";
      else if (provider === "apple") defaultEmail = "user.apple@icloud.com";
      else defaultEmail = "developer@github.com";
    }

    if (!defaultName) {
      if (provider === "google") defaultName = "Google User";
      else if (provider === "apple") defaultName = "Apple User";
      else defaultName = "GitHub Developer";
    }

    setSocialModal({
      isOpen: true,
      provider,
      email: defaultEmail,
      name: defaultName,
      loading: false,
      error: "",
    });
  };

  // Perform social authentication
  const handleExecuteSocialLogin = async (customEmail, customName) => {
    const emailToUse = customEmail || socialModal.email;
    const nameToUse = customName || socialModal.name;

    if (!emailToUse || !emailToUse.includes("@")) {
      setSocialModal((prev) => ({ ...prev, error: "Please enter a valid email address." }));
      return;
    }

    setSocialModal((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const res = await socialLoginUser({
        provider: socialModal.provider,
        email: emailToUse,
        full_name: nameToUse,
      });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setSocialModal((prev) => ({ ...prev, isOpen: false }));
        setSuccessMsg(res.data.message || `Signed in with ${socialModal.provider}!`);
        setTimeout(() => navigate("/dashboard"), 500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Social login failed. Please try again.";
      setSocialModal((prev) => ({ ...prev, loading: false, error: msg }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (isSignup && !agreeTerms) {
      setError("Please agree to the Terms of Service to continue.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        // Signup flow
        const res = await signupUser({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
        });

        setSuccessMsg(res.data?.message || "Account created successfully! Logging you in...");

        // Auto login right after signup
        try {
          const loginRes = await loginUser({
            email: formData.email,
            password: formData.password,
          });
          if (loginRes.data?.token) {
            localStorage.setItem("token", loginRes.data.token);
            localStorage.setItem("user", JSON.stringify(loginRes.data.user));
            setTimeout(() => navigate("/dashboard"), 1200);
            return;
          }
        } catch {
          // If auto login fails, switch to login view
          setTimeout(() => handleToggleMode("login"), 1500);
        }
      } else {
        // Login flow
        const res = await loginUser({
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || (isSignup ? "Signup failed" : "Login failed");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 md:p-8 bg-[#040614] overflow-hidden select-none font-sans">
      {/* 3D NEON BACKGROUND ELEMENTS MATCHING REFERENCE IMAGE */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep ambient lighting */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[160px]" />
        <div className="absolute top-10 right-1/3 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px]" />

        {/* Top-Center Floating Magenta Orb */}
        <div className="absolute top-[8%] left-[48%] -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 via-fuchsia-500 to-purple-800 shadow-[0_0_50px_rgba(236,72,153,0.8)] opacity-90 animate-pulse" />

        {/* Bottom-Left 3D Neon Torus Ring */}
        <div
          className="absolute -bottom-16 -left-16 w-80 h-80 md:w-96 md:h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 35% 35%, #ec4899 0%, #a855f7 40%, #1d4ed8 75%, #050b28 100%)",
            boxShadow: "0 0 90px 20px rgba(217,70,239,0.4), inset 0 0 60px rgba(6,182,212,0.6)",
            transform: "perspective(800px) rotateX(55deg) rotateY(-25deg) rotateZ(30deg)",
            border: "18px solid rgba(236, 72, 153, 0.4)",
            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.8))",
          }}
        >
          {/* Inner cutout to form the donut hole */}
          <div className="absolute inset-16 md:inset-20 rounded-full bg-[#040614] shadow-[inset_0_0_40px_rgba(236,72,153,0.7)]" />
        </div>

        {/* Right 3D Curved Neon Tube / Ribbon Ring */}
        <div
          className="absolute -top-10 -right-20 w-[420px] h-[750px] rounded-[220px] pointer-events-none opacity-85"
          style={{
            background: "linear-gradient(145deg, #f43f5e 0%, #ec4899 25%, #8b5cf6 50%, #3b82f6 80%, #06b6d4 100%)",
            boxShadow: "0 0 100px 30px rgba(236,72,153,0.35), inset 0 0 50px rgba(255,255,255,0.4)",
            transform: "perspective(1000px) rotateZ(-35deg) rotateY(40deg) rotateX(15deg)",
            filter: "drop-shadow(-20px 30px 60px rgba(0,0,0,0.9))",
            border: "14px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          {/* Internal reflection cutout */}
          <div className="absolute inset-16 rounded-[180px] bg-[#040614] opacity-95 shadow-[inset_0_0_80px_rgba(6,182,212,0.5)]" />
        </div>
      </div>

      {/* MAIN FROSTED GLASS CARD CONTAINER (Exact visual match to image) */}
      <div className="relative z-10 w-full max-w-[940px] rounded-[36px] md:rounded-[42px] p-6 sm:p-10 md:p-14 bg-white/[0.04] backdrop-blur-[45px] saturate-[190%] border border-white/[0.18] shadow-[0_35px_90px_-15px_rgba(0,0,0,0.85),inset_0_1px_1px_0_rgba(255,255,255,0.3)] transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT SIDE: AUTH FORM */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title Header */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-white tracking-tight leading-tight font-sans">
                {isSignup ? "Join the" : "Welcome"}
                <br />
                <span className="text-white">{isSignup ? "Future" : "Back"}</span>
              </h1>

              {/* Dual Gradient Accent Line under title */}
              <div className="h-[3.5px] w-20 mt-3.5 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-cyan-400 shadow-[0_0_12px_rgba(236,72,153,0.8)]" />
            </div>

            {/* Error / Success Toast Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs leading-relaxed animate-in fade-in duration-200">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs leading-relaxed animate-in fade-in duration-200">
                {successMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              {/* Full Name Input (Signup only) */}
              {isSignup && (
                <div className="relative group">
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required={isSignup}
                    className="w-full bg-transparent border-b border-white/25 focus:border-cyan-400 py-2.5 text-white text-sm outline-none transition-all placeholder:text-slate-400/70"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-pink-500 to-cyan-400 transition-all duration-300 group-focus-within:w-full" />
                </div>
              )}

              {/* Email Input */}
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="w-full bg-transparent border-b border-white/25 focus:border-cyan-400 py-2.5 text-white text-sm outline-none transition-all placeholder:text-slate-400/70"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-pink-500 to-cyan-400 transition-all duration-300 group-focus-within:w-full" />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="w-full bg-transparent border-b border-white/25 focus:border-cyan-400 py-2.5 pr-9 text-white text-sm outline-none transition-all placeholder:text-slate-400/70 font-mono tracking-wide"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 text-slate-400 hover:text-white p-1 transition cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-pink-500 to-cyan-400 transition-all duration-300 group-focus-within:w-full" />
              </div>

              {/* Password Strength Pill Bar (matching reference) */}
              <div className="pt-1">
                <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-300"
                    style={{ width: `${formData.password ? Math.max(strength, 20) : 0}%` }}
                  />
                </div>
              </div>

              {/* Social / Quick Login Icons Row */}
              <div className="flex items-center gap-4 pt-1">
                <span className="text-[11px] text-slate-400 tracking-wide">continue with</span>
                <div className="flex items-center gap-3">
                  {/* Apple (iOS) */}
                  <button
                    type="button"
                    onClick={() => handleOpenSocialModal("apple")}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
                    title="Sign in with Apple (iOS)"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.61 1.35-.55.63-1.03 1.68-.9 2.7 1 .08 2.02-.51 2.59-1.2" />
                    </svg>
                  </button>

                  {/* Google */}
                  <button
                    type="button"
                    onClick={() => handleOpenSocialModal("google")}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-cyan-400/40 flex items-center justify-center transition cursor-pointer"
                    title="Sign in with Google"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 20.4 7.5 23 12 23z"
                      />
                    </svg>
                  </button>

                  {/* GitHub */}
                  <button
                    type="button"
                    onClick={() => handleOpenSocialModal("github")}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
                    title="Sign in with GitHub"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Main CTA Gradient Pill Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-full font-bold text-white text-sm tracking-wide transition-all duration-300 shadow-[0_0_24px_rgba(236,72,153,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: "linear-gradient(90deg, #f43f5e 0%, #ec4899 30%, #a855f7 65%, #06b6d4 100%)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{isSignup ? "Creating Account..." : "Signing in..."}</span>
                    </>
                  ) : (
                    <span>{isSignup ? "Sign up" : "Sign in"}</span>
                  )}
                </button>
              </div>

              {/* Bottom Agreement / Remember Me */}
              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                {isSignup ? (
                  <label className="flex items-center gap-2 cursor-pointer hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="accent-pink-500 rounded cursor-pointer"
                    />
                    <span>I agree to the Terms & Privacy</span>
                  </label>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-cyan-400 rounded cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                )}

                <button
                  type="button"
                  onClick={() => handleToggleMode(isSignup ? "login" : "signup")}
                  className="text-cyan-400 hover:text-cyan-300 transition hover:underline cursor-pointer"
                >
                  {isSignup ? "Already registered?" : "Need an account?"}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT SIDE: GLASS SHOWCASE & QUOTE CARD */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full min-h-[360px] space-y-8 pt-4 lg:pt-0">
            {/* Top Right Pill Badge with Lock (Mode Toggle) */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleToggleMode(isSignup ? "login" : "signup")}
                className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 backdrop-blur-md transition-all duration-300 group cursor-pointer shadow-lg hover:border-pink-500/50"
                title={`Switch to ${isSignup ? "Login" : "Sign up"}`}
              >
                <span className="text-xs font-medium text-slate-200 group-hover:text-white transition">
                  {isSignup ? "Welcome back" : "Join the Future"}
                </span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-600 to-fuchsia-500 flex items-center justify-center text-white shadow-[0_0_12px_rgba(236,72,153,0.8)] group-hover:scale-110 transition">
                  <Lock size={13} />
                </div>
              </button>
            </div>

            {/* Center Frosted Glass Quote Card */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] text-slate-200 space-y-4">
              <p className="text-xs sm:text-sm italic leading-relaxed text-slate-300">
                “ The clearer the mind, the deeper we venture. InnerVoice is your private space to reflect, unburden, and capture the thoughts that matter most. ”
              </p>
              <div className="text-[11px] font-semibold tracking-wider text-pink-400/90 uppercase">
                / Your mind's sanctuary.
              </div>
            </div>

            {/* Bottom Right Security Badge */}
            <div className="flex justify-end">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-cyan-500/30 text-xs text-slate-300 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center">
                  <Shield size={10} className="text-white" />
                </div>
                <span className="font-medium text-slate-200">Secure & Encrypted</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SOCIAL AUTHENTICATION MODAL (Working One-Click Sign In/Up with Google, Apple, GitHub) */}
      {socialModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-[#09101d] border border-cyan-500/40 shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(6,182,212,0.25)] text-white space-y-6">
            
            {/* Close Button */}
            <button
              onClick={() => setSocialModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Provider Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-lg shrink-0">
                {socialModal.provider === "google" && (
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 20.4 7.5 23 12 23z"
                    />
                  </svg>
                )}
                {socialModal.provider === "apple" && (
                  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.61 1.35-.55.63-1.03 1.68-.9 2.7 1 .08 2.02-.51 2.59-1.2" />
                  </svg>
                )}
                {socialModal.provider === "github" && (
                  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white capitalize">
                  Sign in with {socialModal.provider === "apple" ? "Apple (iOS)" : socialModal.provider}
                </h3>
                <p className="text-xs text-slate-400">
                  Instant, secure authentication for InnerVoice
                </p>
              </div>
            </div>

            {/* Error in modal */}
            {socialModal.error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                {socialModal.error}
              </div>
            )}

            {/* Quick 1-Click Action Card */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>One-Click Authorization</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Click below to instantly authenticate and access your private journal space.
              </p>
              <button
                type="button"
                disabled={socialModal.loading}
                onClick={() => handleExecuteSocialLogin()}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-xs tracking-wide text-white transition shadow-[0_0_18px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {socialModal.loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>Continue as {socialModal.name}</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>

            {/* Or custom account details */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-[11px] text-slate-500 uppercase tracking-wider">or custom account</span>
                <div className="h-[1px] flex-1 bg-white/10" />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Social Email
                </label>
                <input
                  type="email"
                  value={socialModal.email}
                  onChange={(e) => setSocialModal((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-900/80 border border-white/15 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={socialModal.name}
                  onChange={(e) => setSocialModal((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your Name"
                  className="w-full bg-slate-900/80 border border-white/15 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <button
                type="button"
                disabled={socialModal.loading}
                onClick={() => handleExecuteSocialLogin(socialModal.email, socialModal.name)}
                className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Sign In with this Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
