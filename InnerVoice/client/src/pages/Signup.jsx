import { Link } from "react-router-dom";

function Signup() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-8">

        <h1 className="text-4xl font-bold text-center text-cyan-400">
          InnerVoice
        </h1>

        <p className="text-center text-gray-400 mt-2">
          Create your account
        </p>

        <form className="mt-8 space-y-5">

          <div>
            <label className="text-gray-300 block mb-2">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              className="w-full rounded-lg bg-slate-700 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-lg bg-slate-700 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              className="w-full rounded-lg bg-slate-700 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <button
            className="w-full bg-cyan-500 hover:bg-cyan-600 transition py-3 rounded-lg font-semibold"
          >
            Create Account
          </button>

        </form>

        <p className="text-center text-gray-400 mt-6">

          Already have an account?

          <Link
            to="/"
            className="text-cyan-400 ml-2 hover:underline"
          >
            Login
          </Link>

        </p>

      </div>
    </div>
  );
}

export default Signup;