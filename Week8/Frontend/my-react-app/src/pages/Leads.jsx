import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/leads`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLeads(data);
      } catch {
        console.error("Failed to fetch leads");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const deleteLead = async (id) => {
    if (!window.confirm("Delete this lead permanently?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${import.meta.env.VITE_API_URL}/leads/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLeads((prev) => prev.filter((lead) => lead._id !== id));
    } catch {
      alert("Failed to delete lead");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-500">Loading leads...</div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Leads
      </h1>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-sm uppercase text-gray-600">
            <tr>
              {["Name", "Phone", "Email", "Source", "Status", "Date"].map(h => (
                <th key={h} className="px-5 py-3 text-left">{h}</th>
              ))}
              {user?.role === "Admin" && (
                <th className="px-5 py-3 text-center">Action</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y">
            {leads.map((lead) => (
              <tr
                key={lead._id}
                className="hover:bg-gray-50 transition"
              >
                <td className="px-5 py-3 font-medium">{lead.name}</td>
                <td className="px-5 py-3">{lead.phone}</td>
                <td className="px-5 py-3">{lead.email}</td>

                <td className="px-5 py-3">
                  <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 capitalize">
                    {lead.source}
                  </span>
                </td>

                <td className="px-5 py-3">
                  <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                    {lead.status}
                  </span>
                </td>

                <td className="px-5 py-3 text-sm text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>

                {user?.role === "Admin" && (
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => deleteLead(lead._id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded transition"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {leads.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No leads available
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;
