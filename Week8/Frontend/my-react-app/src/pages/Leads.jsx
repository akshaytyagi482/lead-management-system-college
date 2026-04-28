import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Leads = () => {
  const statusOptions = ["New", "Contacted", "Qualified", "Converted", "Lost"];
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [syncLoadingProvider, setSyncLoadingProvider] = useState("");
  const [managers, setManagers] = useState([]);
  const [assigningLeadId, setAssigningLeadId] = useState("");
  const [selectedLeadForNotes, setSelectedLeadForNotes] = useState(null);
  const [leadNotes, setLeadNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const { user } = useAuth();

  const fetchLeads = async () => {
    try {
      const { data } = await api.get("/leads");

      setLeads(data);
      setFilteredLeads(data);
    } catch {
      console.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchManagers = async () => {
    if (user?.role !== "Admin") return;

    try {
      const { data } = await api.get("/managers");
      setManagers(data);
    } catch {
      console.error("Failed to fetch managers");
    }
  };

  useEffect(() => {
    fetchManagers();
  }, [user?.role]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("lead:created", (lead) => {
      setLeads((prev) => {
        if (prev.some((l) => l._id === lead._id)) return prev;
        return [lead, ...prev];
      });
    });

    socket.on("lead:updated", (lead) => {
      setLeads((prev) => prev.map((l) => (l._id === lead._id ? lead : l)));
    });

    socket.on("lead:status-updated", (lead) => {
      setLeads((prev) => prev.map((l) => (l._id === lead._id ? lead : l)));
    });

    socket.on("lead:assigned", (payload) => {
      if (payload?.lead) {
        setLeads((prev) => prev.map((l) => (l._id === payload.lead._id ? payload.lead : l)));
      }
    });

    socket.on("lead:note-added", (payload) => {
      if (!payload?.leadId) return;
      if (selectedLeadForNotes?._id === payload.leadId) {
        setLeadNotes((prev) => [...prev, payload.note]);
      }
    });

    socket.on("lead:deleted", ({ _id }) => {
      setLeads((prev) => prev.filter((l) => l._id !== _id));
    });

    socket.on("leads:refresh", () => {
      fetchLeads();
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedLeadForNotes?._id]);

  // Filter and search logic
  useEffect(() => {
    let filtered = leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm);

      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });

    setFilteredLeads(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, statusFilter, sourceFilter, leads]);

  const updateLeadStatus = async (id, nextStatus) => {
    try {
      const { data } = await api.patch(`/leads/${id}/status`, { status: nextStatus });

      setLeads((prev) =>
        prev.map((lead) => (lead._id === id ? data : lead))
      );
    } catch {
      alert("Failed to update lead status");
    }
  };

  const syncFromProvider = async (provider) => {
    try {
      setSyncLoadingProvider(provider);
      const { data } = await api.post("/provider/sync", { provider });

      alert(
        `${provider.toUpperCase()} synced. Fetched: ${data.fetched}, Inserted: ${data.inserted}, Updated: ${data.updated}`
      );
      await fetchLeads();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to sync ${provider} leads`);
    } finally {
      setSyncLoadingProvider("");
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Delete this lead permanently?")) return;

    try {
      await api.delete(`/leads/${id}`);

      setLeads((prev) => prev.filter((lead) => lead._id !== id));
    } catch {
      alert("Failed to delete lead");
    }
  };

  const assignLeadToManager = async (leadId, managerId) => {
    if (!managerId) return;

    try {
      setAssigningLeadId(leadId);
      const { data } = await api.patch(`/leads/${leadId}/assign`, { managerId });
      setLeads((prev) => prev.map((lead) => (lead._id === leadId ? data : lead)));
    } catch {
      alert("Failed to assign lead");
    } finally {
      setAssigningLeadId("");
    }
  };

  const openNotes = async (lead) => {
    try {
      setSelectedLeadForNotes(lead);
      setNotesLoading(true);
      const { data } = await api.get(`/leads/${lead._id}/notes`);
      setLeadNotes(data.notes || []);
      setNewNote("");
    } catch {
      alert("Failed to load notes");
    } finally {
      setNotesLoading(false);
    }
  };

  const closeNotes = () => {
    setSelectedLeadForNotes(null);
    setLeadNotes([]);
    setNewNote("");
  };

  const addNote = async () => {
    if (!selectedLeadForNotes || !newNote.trim()) return;

    try {
      const { data } = await api.post(`/leads/${selectedLeadForNotes._id}/notes`, {
        text: newNote,
      });
      setLeadNotes(data.notes || []);
      setNewNote("");
    } catch {
      alert("Failed to add note");
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Source", "Status", "Created Date"];
    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.email,
      lead.phone,
      lead.source,
      lead.status,
      new Date(lead.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    const colors = {
      "new": "bg-blue-100 text-blue-700",
      "contacted": "bg-yellow-100 text-yellow-700",
      "qualified": "bg-green-100 text-green-700",
      "converted": "bg-purple-100 text-purple-700",
      "lost": "bg-red-100 text-red-700",
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const getSourceColor = (source) => {
    const colors = {
      "website": "bg-blue-100 text-blue-700",
      "phone": "bg-green-100 text-green-700",
      "email": "bg-purple-100 text-purple-700",
      "referral": "bg-orange-100 text-orange-700",
      "social": "bg-pink-100 text-pink-700",
    };
    return colors[source?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-500">Loading leads...</div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Leads</h1>
        <div className="flex gap-3">
          <button
            onClick={() => syncFromProvider("google")}
            disabled={syncLoadingProvider === "google"}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
          >
            {syncLoadingProvider === "google" ? "Syncing..." : "Sync Google"}
          </button>
          <button
            onClick={() => syncFromProvider("facebook")}
            disabled={syncLoadingProvider === "facebook"}
            className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
          >
            {syncLoadingProvider === "facebook" ? "Syncing..." : "Sync Facebook"}
          </button>
          <button
            onClick={exportToCSV}
            disabled={filteredLeads.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Source
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sources</option>
              <option value="website">Website</option>
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="referral">Referral</option>
              <option value="social">Social</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Results
            </label>
            <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
              {filteredLeads.length} leads
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-sm uppercase text-gray-600">
            <tr>
              {["Name", "Email", "Phone", "Source", "Status", "Date"].map(h => (
                <th key={h} className="px-5 py-3 text-left">{h}</th>
              ))}
              <th className="px-5 py-3 text-left">Assignee</th>
              <th className="px-5 py-3 text-center">Notes</th>
              {user?.role === "Admin" && (
                <th className="px-5 py-3 text-center">Action</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y">
            {currentLeads.map((lead) => (
              <tr
                key={lead._id}
                className="hover:bg-gray-50 transition"
              >
                <td className="px-5 py-3 font-medium">{lead.name}</td>
                <td className="px-5 py-3">{lead.email}</td>
                <td className="px-5 py-3">{lead.phone}</td>

                <td className="px-5 py-3">
                  <span className={`px-3 py-1 text-xs rounded-full ${getSourceColor(lead.source)} capitalize`}>
                    {lead.source}
                  </span>
                </td>

                <td className="px-5 py-3">
                  {user?.role === "Admin" ? (
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                      className="px-3 py-1 text-xs border rounded-md bg-white"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  )}
                </td>

                <td className="px-5 py-3 text-sm text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>

                <td className="px-5 py-3">
                  {user?.role === "Admin" ? (
                    <select
                      value={lead.assignedTo?._id || ""}
                      onChange={(e) => assignLeadToManager(lead._id, e.target.value)}
                      disabled={assigningLeadId === lead._id}
                      className="px-3 py-1 text-xs border rounded-md bg-white w-full"
                    >
                      <option value="">Unassigned</option>
                      {managers.map((manager) => (
                        <option key={manager._id} value={manager._id}>
                          {manager.name} ({manager.email})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm text-gray-700">
                      {lead.assignedTo?.name || "-"}
                    </span>
                  )}
                </td>

                <td className="px-5 py-3 text-center">
                  <button
                    onClick={() => openNotes(lead)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-3 py-1 rounded transition"
                  >
                    Notes ({lead.notes?.length || 0})
                  </button>
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

        {currentLeads.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No leads available
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg transition ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Leads</p>
          <p className="text-2xl font-bold text-gray-800">{leads.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Filtered Results</p>
          <p className="text-2xl font-bold text-blue-600">{filteredLeads.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Converted Leads</p>
          <p className="text-2xl font-bold text-green-600">
            {leads.filter((l) => l.status === "Converted").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Conversion Rate</p>
          <p className="text-2xl font-bold text-purple-600">
            {leads.length > 0
              ? ((leads.filter((l) => l.status === "Converted").length / leads.length) * 100).toFixed(1)
              : 0}
            %
          </p>
        </div>
      </div>

      {selectedLeadForNotes && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl">
            <div className="flex justify-between items-center border-b px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Notes - {selectedLeadForNotes.name}
              </h2>
              <button onClick={closeNotes} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>

            <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
              {notesLoading ? (
                <p className="text-gray-500">Loading notes...</p>
              ) : leadNotes.length === 0 ? (
                <p className="text-gray-500">No notes yet.</p>
              ) : (
                leadNotes.map((note) => (
                  <div key={note._id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-semibold text-gray-700">{note.author?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="border-t px-5 py-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                placeholder="Write a note for this lead..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={closeNotes}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
