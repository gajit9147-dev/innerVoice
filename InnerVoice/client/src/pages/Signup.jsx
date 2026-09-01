import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser, verifySignupOTP } from "../api/auth";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Details, 2: OTP Verification
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await signupUser(formData);
      setMessage(res.data.message || "OTP sent to your email.");
      setStep(2);
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.message || "Signup Failed";

      if (err.response?.status === 400 && /already exists/i.test(errMsg)) {
        alert("An account with this email already exists. Redirecting to login.");
        navigate("/login");
        return;
      }

      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await verifySignupOTP({
        ...formData,
        otp: otp.trim(),
      });

      alert(res.data.message || "Account created successfully!");
      navigate("/login");
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.message || "Verification Failed";
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center text-cyan-400">
          InnerVoice
        </h1>

        <p className="text-center text-gray-400 mt-2">
          {step === 1 ? "Create your account" : "Verify your email"}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="mt-8 space-y-5">
            <div>
              <label className="text-gray-300 block mb-2">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full rounded-lg bg-slate-700 px-4 py-3 text-white"
                required
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full rounded-lg bg-slate-700 px-4 py-3 text-white"
                required
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full rounded-lg bg-slate-700 px-4 py-3 text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 transition py-3 rounded-lg font-semibold text-white"
            >
              {loading ? "Sending OTP..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="mt-8 space-y-5">
            <div className="bg-slate-700/50 p-3 rounded-lg text-sm text-cyan-300 text-center">
              Enter the 6-digit OTP sent to <strong>{formData.email}</strong>
            </div>

            <div>
              <label className="text-gray-300 block mb-2">Verification Code (OTP)</label>
              <input
                type="text"
                name="otp"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-widest text-2xl font-mono rounded-lg bg-slate-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 transition py-3 rounded-lg font-semibold text-white"
            >
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>

            <div className="flex justify-between items-center text-xs text-gray-400 mt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-white underline"
              >
                Change details
              </button>
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="text-cyan-400 hover:underline"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-gray-400 mt-6">
          Already have an account?
          <Link to="/login" className="text-cyan-400 ml-2 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
