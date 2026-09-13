// ============================================================
// client/src/components/auth/AuthPageLayout.jsx
// Production Authentication UI (Email/Password, Google, Apple)
// Features:
// - Official Google Identity Services integration (ID token verification)
// - Official Sign in with Apple web integration
// - Account Linking Modal for existing email accounts
// - Password strength meter & confirm password validation
// - Loading states, accessible labels, disabled states during submission
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  Loader2,
  X,
  ArrowRight,
  KeyRound,
  AlertTriangle,
  Link2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { linkAccountUser } from "../../api/auth";

const formatAuthError = (err, isSignup = false) => {
  if (err?.userMessage) return err.userMessage;
  if (err?.response?.data?.message) return err.response.data.message;

  const raw = err?.message || "";
  const lower = raw.toLowerCase();
  if (lower.includes("timeout") || err?.code === "ECONNABORTED") {
    return "Connection timed out. Please check your internet connection and try again.";
  }
  if (lower.includes("network error") || err?.code === "ERR_NETWORK") {
    return "Unable to connect to the server. Please check your internet connection.";
  }
  if (lower.includes("failed to fetch") || lower.includes("load failed")) {
    return "Network request failed. Please check your network connection.";
  }
  if (err?.response?.status === 401) {
    return isSignup ? "An account with this email may already exist." : "Email or password is incorrect.";
  }
  if (err?.response?.status === 404) {
    return "Authentication service temporarily unavailable. Please try again shortly.";
  }
  if (err?.response?.status >= 500) {
    return "Server encountered an error. Please try again in a few moments.";
  }
  return raw || (isSignup ? "Registration failed. Please try again." : "Email or password is incorrect.");
};

export default function AuthPageLayout({ initialMode = "signup" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, loginWithGoogle, loginWithApple } = useAuth();

  const [mode, setMode] = useState(initialMode); // "signup" | "login"
  const isSignup = mode === "signup";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);

  // Status and Loading states
  const [loading, setLoading] = useState(false);
  const [authActionText, setAuthActionText] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Account Linking Modal state
  const [linkingModal, setLinkingModal] = useState({
    isOpen: false,
    provider: "google",
    email: "",
    password: "",
    oauthId: "",
    idToken: "",
    loading: false,
    error: "",
  });

  // Setup / Configuration Modal for Missing OAuth Keys
  const [configModal, setConfigModal] = useState({
    isOpen: false,
    provider: "google", // "google" | "apple"
    clientIdInput: "",
    error: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

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

  // Password strength score (0 to 100%)
  const calculateStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 30;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[a-z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15;
    return Math.min(score, 100);
  };

  const strength = calculateStrength(formData.password);

  const getStrengthLabel = (score) => {
    if (score < 40) return { label: "Weak", color: "from-rose-500 to-red-600" };
    if (score < 70) return { label: "Fair", color: "from-amber-500 to-yellow-400" };
    return { label: "Strong", color: "from-pink-500 via-purple-500 to-cyan-400" };
  };

  const strengthMeta = getStrengthLabel(strength);

  // ==========================================
  // GOOGLE SIGN IN (Official Google ID Token)
  // ==========================================
  const handleGoogleClick = () => {
    setError("");
    setSuccessMsg("");

    const DEFAULT_GOOGLE_CLIENT_ID = "104942402554-buppqtd0bio5um986ibvq2sq669raf85.apps.googleusercontent.com";
    const rawClientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      DEFAULT_GOOGLE_CLIENT_ID;

    const googleClientId = (rawClientId || DEFAULT_GOOGLE_CLIENT_ID).trim();

    if (!googleClientId || googleClientId.includes("your-google-client-id")) {
      setConfigModal({
        isOpen: true,
        provider: "google",
        clientIdInput: "",
        error: "",
      });
      return;
    }

    triggerGoogleAuth(googleClientId);
  };

  const triggerGoogleAuth = (clientId) => {
    if (!window.google?.accounts) {
      setError("Google Sign-In SDK is loading. Please check your internet connection and try again.");
      return;
    }

    setLoading(true);
    setAuthActionText("Connecting to Google...");

    try {
      if (window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          use_fedcm_for_prompt: false,
          callback: async (response) => {
            if (!response?.credential) {
              setError("Google sign-in could not be completed. Please try again.");
              setLoading(false);
              return;
            }

            setAuthActionText("Verifying Google account...");

            try {
              const data = await loginWithGoogle(response.credential);

              if (data?.requireLinking) {
                setLinkingModal({
                  isOpen: true,
                  provider: "google",
                  email: data.email,
                  password: "",
                  oauthId: "",
                  idToken: response.credential,
                  loading: false,
                  error: "",
                });
                setLoading(false);
                return;
              }

              setSuccessMsg("Signed in with Google! Redirecting...");
              const destination = location.state?.from?.pathname || "/dashboard";
              navigate(destination, { replace: true });
            } catch (err) {
              const resData = err.response?.data;
              if (resData?.requireLinking) {
                setLinkingModal({
                  isOpen: true,
                  provider: "google",
                  email: resData.email,
                  password: "",
                  oauthId: "",
                  idToken: response.credential,
                  loading: false,
                  error: "",
                });
              } else {
                setError(formatAuthError(err));
              }
            } finally {
              setLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      }

      // If token client is available, trigger directly in user click stack so mobile browsers don't block popup
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid profile email",
          callback: async (tokenResp) => {
            if (tokenResp.error) {
              setLoading(false);
              if (tokenResp.error !== "popup_closed_by_user") {
                setError("Google sign-in was cancelled or interrupted.");
              }
              return;
            }
            try {
              setAuthActionText("Verifying Google account...");
              const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResp.access_token}` },
              });
              const userInfo = await res.json();
              if (userInfo.email) {
                const data = await loginWithGoogle(tokenResp.access_token, {
                  access_token: tokenResp.access_token,
                  userinfo: userInfo,
                });

                if (data?.requireLinking) {
                  setLinkingModal({
                    isOpen: true,
                    provider: "google",
                    email: data.email,
                    password: "",
                    oauthId: "",
                    idToken: tokenResp.access_token,
                    loading: false,
                    error: "",
                  });
                  setLoading(false);
                  return;
                }

                setSuccessMsg("Signed in with Google! Redirecting...");
                const destination = location.state?.from?.pathname || "/dashboard";
                navigate(destination, { replace: true });
              }
            } catch (e) {
              const resData = e.response?.data;
              if (resData?.requireLinking) {
                setLinkingModal({
                  isOpen: true,
                  provider: "google",
                  email: resData.email,
                  password: "",
                  oauthId: "",
                  idToken: tokenResp.access_token,
                  loading: false,
                  error: "",
                });
              } else {
                setError(formatAuthError(e));
              }
            } finally {
              setLoading(false);
            }
          },
        });
        client.requestAccessToken({ prompt: "" });
      } else if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setLoading(false);
          }
        });
      }
    } catch (err) {
      setLoading(false);
      setError(formatAuthError(err));
    }
  };

  // ==========================================
  // APPLE SIGN IN (Official Sign in with Apple)
  // ==========================================
  const handleAppleClick = async () => {
    setError("");
    setSuccessMsg("");

    const appleClientId =
      import.meta.env.VITE_APPLE_CLIENT_ID ||
      localStorage.getItem("innervoice_apple_client_id") ||
      "";

    if (!appleClientId || appleClientId.includes("com.innervoice.app.web")) {
      setConfigModal({
        isOpen: true,
        provider: "apple",
        clientIdInput: "",
        error: "",
      });
      return;
    }

    if (!window.AppleID?.auth) {
      setAuthActionText("Loading Apple SDK...");
      const loaded = await new Promise((resolve) => {
        const s = document.createElement("script");
        s.src = "https://appleid.cdn-apple.com/appleid/auth/auth.js";
        s.async = true;
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.head.appendChild(s);
      });
      if (!loaded || !window.AppleID?.auth) {
        setError("Apple Sign-In SDK is loading or unavailable. Please check your internet connection.");
        return;
      }
    }

    setLoading(true);
    setAuthActionText("Connecting to Apple...");

    try {
      const redirectURI =
        import.meta.env.VITE_APPLE_REDIRECT_URI ||
        window.location.origin + window.location.pathname;

      window.AppleID.auth.init({
        clientId: appleClientId,
        scope: "name email",
        redirectURI,
        state: "innervoice_apple_auth_" + Date.now(),
        usePopup: true,
      });

      const response = await window.AppleID.auth.signIn();

      if (!response?.authorization?.id_token) {
        throw new Error("No identity token received from Apple.");
      }

      setAuthActionText("Verifying Apple account...");

      const data = await loginWithApple({
        id_token: response.authorization.id_token,
        code: response.authorization.code,
        user: response.user,
      });

      if (data?.requireLinking) {
        setLinkingModal({
          isOpen: true,
          provider: "apple",
          email: data.email,
          password: "",
          oauthId: "",
          idToken: response.authorization.id_token,
          loading: false,
          error: "",
        });
        setLoading(false);
        return;
      }

      setSuccessMsg("Signed in with Apple! Redirecting...");
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      if (err?.error !== "popup_closed_by_user") {
        const resData = err.response?.data;
        if (resData?.requireLinking) {
          setLinkingModal({
            isOpen: true,
            provider: "apple",
            email: resData.email,
            password: "",
            oauthId: "",
            idToken: "",
            loading: false,
            error: "",
          });
        } else {
          setError(formatAuthError(err));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // EMAIL + PASSWORD SUBMIT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (isSignup && !agreeTerms) {
      setError("Please agree to the Terms of Service & Privacy Policy to proceed.");
      return;
    }

    if (isSignup && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (isSignup && formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setAuthActionText(isSignup ? "Creating account..." : "Signing in...");

    try {
      if (isSignup) {
        const res = await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });

        setSuccessMsg(res?.message || "Account created successfully! Redirecting...");
        const destination = location.state?.from?.pathname || "/dashboard";
        navigate(destination, { replace: true });
      } else {
        await login(formData.email, formData.password);
        setSuccessMsg("Login successful! Redirecting...");
        const destination = location.state?.from?.pathname || "/dashboard";
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setError(formatAuthError(err, isSignup));
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CONFIRM ACCOUNT LINKING
  // ==========================================
  const handleConfirmLink = async (e) => {
    e.preventDefault();
    if (!linkingModal.password) {
      setLinkingModal((prev) => ({ ...prev, error: "Please enter your password." }));
      return;
    }

    setLinkingModal((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      if (linkingModal.provider === "google") {
        await loginWithGoogle(linkingModal.idToken, {
          link_account: true,
          password: linkingModal.password,
        });
      } else {
        await loginWithApple({
          id_token: linkingModal.idToken,
          link_account: true,
          password: linkingModal.password,
        });
      }

      setLinkingModal((prev) => ({ ...prev, isOpen: false }));
      setSuccessMsg("Account linked and authenticated! Redirecting...");
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      setLinkingModal((prev) => ({
        ...prev,
        loading: false,
        error: formatAuthError(err),
      }));
    }
  };

  // Save manual client ID in configuration modal
  const handleSaveConfigId = (e) => {
    e.preventDefault();
    const input = configModal.clientIdInput.trim();
    if (!input) {
      setConfigModal((prev) => ({ ...prev, error: "Please provide a valid Client ID." }));
      return;
    }

    if (configModal.provider === "google") {
      localStorage.setItem("innervoice_google_client_id", input);
      setConfigModal((prev) => ({ ...prev, isOpen: false }));
      triggerGoogleAuth(input);
    } else {
      localStorage.setItem("innervoice_apple_client_id", input);
      setConfigModal((prev) => ({ ...prev, isOpen: false }));
      handleAppleClick();
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-[#090a0e] ambient-cinematic-bg overflow-x-hidden select-none font-sans py-10">
      {/* Subtle warm ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#e2b17a]/[0.03] rounded-full blur-[160px]" />
      </div>

      {/* Top Brand Tagline (Matches reference image bottom-left) */}
      <div className="relative z-10 text-center mb-6 sm:mb-8 space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#f5f2eb] tracking-tight font-normal">
          InnerVoice
        </h1>
        <p className="text-sm sm:text-base text-[#9e9990] font-sans">
          A space for your real self.
        </p>
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#9e9990]/80 pt-1">
          <span>Write</span>
          <span>•</span>
          <span>Capture</span>
          <span>•</span>
          <span>Listen</span>
          <span>•</span>
          <span>Feel</span>
          <span>•</span>
          <span>Grow</span>
        </div>
      </div>

      {/* Main Liquid Glass Container */}
      <div className="relative z-10 w-full max-w-[860px] rounded-3xl p-6 sm:p-8 md:p-10 glass-floating border border-white/[0.12] shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* LEFT SIDE: AUTH FORM */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {/* Title Header with Mobile Quick Switch */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#f5f2eb] tracking-tight font-normal">
                  {isSignup ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-xs text-[#9e9990] mt-1">
                  {isSignup
                    ? "Begin your private journaling sanctuary"
                    : "Enter your quiet reflective space"}
                </p>
              </div>

              {/* Quick Mode Switcher for Mobile */}
              <button
                type="button"
                onClick={() => handleToggleMode(isSignup ? "login" : "signup")}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-[11px] font-medium text-[#f5f2eb] transition shrink-0"
              >
                <span>{isSignup ? "Log In" : "Sign Up"}</span>
                <ArrowRight size={12} className="text-[#e2b17a]" />
              </button>
            </div>

            {/* Error / Success Toast Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <Shield size={15} className="shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* OFFICIAL OAUTH BUTTONS (Google & Apple) */}
            <div className="space-y-2.5 pt-1">
              {/* Google Button */}
              <button
                type="button"
                id="btn-google-auth"
                disabled={loading}
                onClick={handleGoogleClick}
                className="w-full py-2.5 min-h-[42px] px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.2] text-white text-xs font-medium tracking-wide transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                id="btn-apple-auth"
                disabled={loading}
                onClick={handleAppleClick}
                className="w-full py-2.5 min-h-[42px] px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.2] text-white text-xs font-medium tracking-wide transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.61 1.35-.55.63-1.03 1.68-.9 2.7 1 .08 2.02-.51 2.59-1.2" />
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Clear Divider */}
            <div className="flex items-center gap-3 pt-1">
              <div className="h-[1px] flex-1 bg-white/[0.08]" />
              <span className="text-[11px] text-[#9e9990] uppercase tracking-wider font-medium">
                or continue with email
              </span>
              <div className="h-[1px] flex-1 bg-white/[0.08]" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              {/* Full Name Input (Signup only) */}
              {isSignup && (
                <div className="relative group">
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="input-name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ajeet Kumar"
                    required={isSignup}
                    className="w-full bg-slate-900/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-3 sm:py-2.5 text-sm sm:text-xs text-white outline-none transition"
                  />
                </div>
              )}

              {/* Email Input */}
              <div className="relative group">
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="input-email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@domain.com"
                  required
                  className="w-full bg-slate-900/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-3 sm:py-2.5 text-sm sm:text-xs text-white outline-none transition"
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="input-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={isSignup ? "Minimum 8 characters (letters & numbers)" : "Your account password"}
                    required
                    className="w-full bg-slate-900/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-3 sm:py-2.5 pr-11 text-sm sm:text-xs text-white outline-none font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input (Signup only) */}
              {isSignup && (
                <div className="relative group">
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      id="input-confirm-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      required={isSignup}
                      className="w-full bg-slate-900/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-3 sm:py-2.5 pr-11 text-sm sm:text-xs text-white outline-none font-mono transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Password Strength Pill (Signup only) */}
              {isSignup && formData.password && (
                <div className="flex items-center gap-3 pt-0.5">
                  <div className="w-28 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${strengthMeta.color} rounded-full transition-all duration-300`}
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    Strength: <span className="text-white">{strengthMeta.label}</span>
                  </span>
                </div>
              )}

              {/* Main Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="btn-auth-submit"
                  disabled={loading}
                  className="btn-champagne w-full py-3 min-h-[44px] px-6 rounded-xl font-semibold text-xs tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(226,177,122,0.35)] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-[#1a140d]" />
                      <span>{authActionText || "Processing..."}</span>
                    </>
                  ) : (
                    <span>{isSignup ? "Create Account" : "Log In"}</span>
                  )}
                </button>
              </div>

              {/* Agreement / Remember Me */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[#9e9990]">
                {isSignup ? (
                  <label className="flex items-center gap-2 cursor-pointer hover:text-white py-1">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="accent-[#e2b17a] rounded cursor-pointer w-4 h-4"
                    />
                    <span>I agree to Terms & Privacy</span>
                  </label>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer hover:text-white py-1">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-[#e2b17a] rounded cursor-pointer w-4 h-4"
                    />
                    <span>Remember me</span>
                  </label>
                )}

                <button
                  type="button"
                  onClick={() => handleToggleMode(isSignup ? "login" : "signup")}
                  className="text-[#e2b17a] hover:text-[#f2c794] transition hover:underline cursor-pointer py-1"
                >
                  {isSignup ? "Already have an account?" : "Need an account?"}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT SIDE: SHOWCASE CARD */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full min-h-[220px] lg:min-h-[360px] space-y-6 pt-4 lg:pt-0 border-t border-white/[0.08] lg:border-t-0">
            {/* Top Right Mode Toggle Badge (Desktop only) */}
            <div className="hidden lg:flex justify-end">
              <button
                type="button"
                onClick={() => handleToggleMode(isSignup ? "login" : "signup")}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] backdrop-blur-md transition-all group cursor-pointer"
              >
                <span className="text-xs font-medium text-[#9e9990] group-hover:text-white transition">
                  {isSignup ? "Welcome back" : "New to InnerVoice?"}
                </span>
                <div className="w-6 h-6 rounded-full bg-[#e2b17a] flex items-center justify-center text-[#1a140d] font-semibold text-xs transition">
                  <Lock size={12} />
                </div>
              </button>
            </div>

            {/* Frosted Quote Card with Delicate Leaves */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl text-[#d1cdc7] space-y-4">
              <p className="font-serif italic text-sm leading-relaxed text-[#f5f2eb]/90">
                “ The clearer the mind, the deeper we venture. InnerVoice is your private space to reflect, unburden, and capture the thoughts that matter most. ”
              </p>
              <div className="font-handwriting text-2xl text-[#e2b17a] text-right pt-2">
                Your story matters.
              </div>
            </div>

            {/* Bottom Security Badge */}
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-[#9e9990]">
                <Shield size={12} className="text-[#e2b17a]" />
                <span className="text-[11px]">Private, secure & encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACCOUNT LINKING MODAL */}
      {linkingModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-[#09101d] border border-cyan-500/40 shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(6,182,212,0.25)] text-white space-y-5">
            <button
              onClick={() => setLinkingModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shadow-lg text-cyan-400 shrink-0">
                <Link2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Link Your Account</h3>
                <p className="text-xs text-slate-400">
                  Existing account detected: <strong className="text-white">{linkingModal.email}</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This email is already associated with an account. Enter your password to securely link{" "}
              <strong className="text-cyan-400 capitalize">{linkingModal.provider}</strong> to your account.
            </p>

            {linkingModal.error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                {linkingModal.error}
              </div>
            )}

            <form onSubmit={handleConfirmLink} className="space-y-4">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Account Password
                </label>
                <input
                  type="password"
                  value={linkingModal.password}
                  onChange={(e) =>
                    setLinkingModal((prev) => ({ ...prev, password: e.target.value, error: "" }))
                  }
                  placeholder="Enter your existing account password"
                  required
                  className="w-full bg-slate-900/90 border border-white/20 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={linkingModal.loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-xs text-white transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {linkingModal.loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Authorizing linking...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Link Account</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OAUTH CREDENTIALS CONFIGURATION MODAL */}
      {configModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-[#09101d] border border-cyan-500/40 shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(6,182,212,0.25)] text-white space-y-6">
            <button
              onClick={() => setConfigModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-lg shrink-0">
                {configModal.provider === "google" ? (
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
                ) : (
                  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.61 1.35-.55.63-1.03 1.68-.9 2.7 1 .08 2.02-.51 2.59-1.2" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white capitalize">
                  Connect {configModal.provider === "google" ? "Google" : "Apple"} Sign-In
                </h3>
                <p className="text-xs text-slate-400">
                  {configModal.provider === "google"
                    ? "Official Google Identity Services OAuth 2.0"
                    : "Official Sign in with Apple Web"}
                </p>
              </div>
            </div>

            {configModal.error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                {configModal.error}
              </div>
            )}

            <form onSubmit={handleSaveConfigId} className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <KeyRound size={14} />
                  <span>Client ID Setup</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Paste your {configModal.provider === "google" ? "Google Cloud" : "Apple Services"} Client ID below to launch live authentication.
                </p>

                <div className="pt-1">
                  <input
                    type="text"
                    value={configModal.clientIdInput}
                    onChange={(e) =>
                      setConfigModal((prev) => ({ ...prev, clientIdInput: e.target.value, error: "" }))
                    }
                    placeholder={
                      configModal.provider === "google"
                        ? "e.g. 123456789-abcdef.apps.googleusercontent.com"
                        : "e.g. com.innervoice.app.web"
                    }
                    required
                    className="w-full bg-slate-900/90 border border-white/20 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-xs text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Save & Launch {configModal.provider === "google" ? "Google" : "Apple"} Sign-In</span>
                <ArrowRight size={14} />
              </button>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 uppercase tracking-wider block">
                  Configuration Guide:
                </span>
                {configModal.provider === "google" ? (
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
                    <li>Visit Google Cloud Console &gt; APIs &amp; Services &gt; Credentials.</li>
                    <li>Create OAuth 2.0 Client ID (Application type: Web application).</li>
                    <li>Add Authorized JavaScript origin: <code className="text-cyan-300 bg-white/5 px-1 py-0.5 rounded">http://localhost:5173</code></li>
                    <li>Paste above or set in <code className="text-pink-300">client/.env</code> as <code className="text-pink-300">VITE_GOOGLE_CLIENT_ID</code> and <code className="text-pink-300">server/.env</code> as <code className="text-pink-300">GOOGLE_CLIENT_ID</code>.</li>
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
                    <li>Visit Apple Developer &gt; Certificates, Identifiers &amp; Profiles &gt; Identifiers.</li>
                    <li>Create a Services ID (e.g. <code className="text-cyan-300">com.innervoice.app.web</code>).</li>
                    <li>Set Web Domain to <code className="text-cyan-300">localhost:5173</code> and Return URL to <code className="text-cyan-300">http://localhost:5173/login</code>.</li>
                    <li>Paste above or set in <code className="text-pink-300">client/.env</code> as <code className="text-pink-300">VITE_APPLE_CLIENT_ID</code>.</li>
                  </ol>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
