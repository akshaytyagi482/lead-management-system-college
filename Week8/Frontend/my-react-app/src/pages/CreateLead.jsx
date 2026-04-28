import { useState } from "react";
import api from "../utils/api";

const CreateLead = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    source: "website",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.phone || !form.email) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      await api.post("/leads", form);
      setSuccess("Lead created successfully");
      setForm({ name: "", phone: "", email: "", source: "website" });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold mb-4">Create Lead</h2>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {success && <p className="text-green-600 mb-3">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <select
          name="source"
          value={form.source}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="website">Website</option>
          <option value="google">Google</option>
          <option value="facebook">Facebook</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Create Lead"}
        </button>
      </form>
    </div>
  );
};

export default CreateLead;