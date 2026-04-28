import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Manager",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }
      );

      alert("Account created successfully! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      
      {/* Glow Background */}
      <div className="absolute w-[500px] h-[500px] bg-purple-500 opacity-20 blur-3xl rounded-full top-[-120px] right-[-120px]"></div>
      <div className="absolute w-[400px] h-[400px] bg-blue-500 opacity-20 blur-3xl rounded-full bottom-[-120px] left-[-120px]"></div>

      <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] rounded-2xl p-8 text-white">
        
        <h2 className="text-3xl font-bold text-center mb-2 tracking-wide">
          Create Account
        </h2>
        <p className="text-center text-gray-400 text-sm mb-6">
          Join our Lead Management System
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md backdrop-blur">
            {error}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-5">
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500 text-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500 text-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            >
              <option value="Manager" className="bg-black">Manager</option>
              <option value="Admin" className="bg-black">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md font-semibold bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-white/10 pt-6">
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;