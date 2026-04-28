import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password }
      );

      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      
      {/* Glow Background */}
      <div className="absolute w-[500px] h-[500px] bg-blue-500 opacity-20 blur-3xl rounded-full top-[-100px] left-[-100px]"></div>
      <div className="absolute w-[400px] h-[400px] bg-purple-500 opacity-20 blur-3xl rounded-full bottom-[-100px] right-[-100px]"></div>

      <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] rounded-2xl p-8 text-white">
        
        <h2 className="text-3xl font-bold text-center mb-2 tracking-wide">
          Admin Login
        </h2>
        <p className="text-center text-gray-400 text-sm mb-6">
          Lead Management System
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md backdrop-blur">
            {error}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-5">
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Password
            </label>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500 text-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-white/10 pt-6">
          <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;