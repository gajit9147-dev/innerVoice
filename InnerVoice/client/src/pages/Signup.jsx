import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../api/auth";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await signupUser(formData);

      alert(res.data.message);

      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Signup Failed";

      if (err.response?.status === 400 && /already exists/i.test(message)) {
        alert("Account already exists. Redirecting to login.");
        navigate("/login");
        return;
      }

      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center text-cyan-400">
          InnerVoice
        </h1>

        <p className="text-center text-gray-400 mt-2">Create your account</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
            className="w-full bg-cyan-500 hover:bg-cyan-600 transition py-3 rounded-lg font-semibold"
          >
            Create Account
          </button>
        </form>

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
