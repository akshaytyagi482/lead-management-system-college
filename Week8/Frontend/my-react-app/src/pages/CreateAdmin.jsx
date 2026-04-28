import { useState } from "react";
import api from "../utils/api";

const CreateManager = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/manager/create", form);

      alert("Manager created successfully");
      setCreatedCredentials(data.credentialsToShare || { email: form.email, password: form.password });
      setForm({ name: "", email: "", password: "" });

    } catch (err) {
      alert(err.response?.data?.message || "Failed to create manager");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Create Manager Account</h2>
      <p className="text-sm text-gray-600 mb-4">
        Admin can create manager accounts and share generated login details.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Create Manager
        </button>
      </form>

      {createdCredentials && (
        <div className="mt-5 rounded border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-700 mb-2">
            Share these credentials with the manager:
          </p>
          <p className="text-sm text-gray-800">Email: {createdCredentials.email}</p>
          <p className="text-sm text-gray-800">Password: {createdCredentials.password}</p>
        </div>
      )}
    </div>
  );
};

export default CreateManager;