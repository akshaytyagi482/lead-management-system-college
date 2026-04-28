import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    website: 0,
    facebook: 0,
    google: 0,
    email: 0,
    phone: 0,
    referral: 0,
    social: 0,
  });
  const [statusStats, setStatusStats] = useState({
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [managerPerformance, setManagerPerformance] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/leads");

        // Calculate source stats
        setStats({
          total: data.length,
          website: data.filter((l) => l.source === "website").length,
          facebook: data.filter((l) => l.source === "facebook").length,
          google: data.filter((l) => l.source === "google").length,
          email: data.filter((l) => l.source === "email").length,
          phone: data.filter((l) => l.source === "phone").length,
          referral: data.filter((l) => l.source === "referral").length,
          social: data.filter((l) => l.source === "social").length,
        });

        // Calculate status stats
        setStatusStats({
          new: data.filter((l) => l.status === "New").length,
          contacted: data.filter((l) => l.status === "Contacted").length,
          qualified: data.filter((l) => l.status === "Qualified").length,
          converted: data.filter((l) => l.status === "Converted").length,
          lost: data.filter((l) => l.status === "Lost").length,
        });

        // Get 5 most recent leads
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentLeads(sorted.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchManagerPerformance = async () => {
      if (user?.role !== "Admin") return;

      try {
        const { data } = await api.get("/leads/manager-performance");
        setManagerPerformance(data);
      } catch (error) {
        console.error("Failed to fetch manager performance:", error);
      }
    };

    fetchManagerPerformance();
  }, [user?.role]);

  const sourceChartData = [
    { name: "Website", value: stats.website },
    { name: "Email", value: stats.email },
    { name: "Phone", value: stats.phone },
    { name: "Referral", value: stats.referral },
    { name: "Social", value: stats.social },
    { name: "Facebook", value: stats.facebook },
    { name: "Google", value: stats.google },
  ];

  const statusChartData = [
    { name: "New", value: statusStats.new },
    { name: "Contacted", value: statusStats.contacted },
    { name: "Qualified", value: statusStats.qualified },
    { name: "Converted", value: statusStats.converted },
    { name: "Lost", value: statusStats.lost },
  ];

  const COLORS = ["#3b82f6", "#4f46e5", "#7c3aed", "#ec4899", "#f59e0b"];
  const SOURCE_COLORS = ["#2563eb", "#4f46e5", "#16a34a", "#f59e0b", "#e11d48", "#0891b2", "#7c3aed"];

  const conversionRate = stats.total > 0
    ? ((statusStats.converted / stats.total) * 100).toFixed(1)
    : 0;

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-50 text-blue-700 border-blue-200",
      contacted: "bg-yellow-50 text-yellow-700 border-yellow-200",
      qualified: "bg-green-50 text-green-700 border-green-200",
      converted: "bg-purple-50 text-purple-700 border-purple-200",
      lost: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[status?.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h1>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-5 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-medium">Total Leads</p>
          <p className="text-3xl font-bold mt-2 text-blue-600">{stats.total}</p>
          <p className="text-gray-500 text-xs mt-2">All time</p>
        </div>

        <div className="bg-white shadow rounded-lg p-5 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-medium">Converted</p>
          <p className="text-3xl font-bold mt-2 text-green-600">{statusStats.converted}</p>
          <p className="text-gray-500 text-xs mt-2">Success leads</p>
        </div>

        <div className="bg-white shadow rounded-lg p-5 border-l-4 border-purple-600">
          <p className="text-gray-600 text-sm font-medium">Conversion Rate</p>
          <p className="text-3xl font-bold mt-2 text-purple-600">{conversionRate}%</p>
          <p className="text-gray-500 text-xs mt-2">Of total leads</p>
        </div>

        <div className="bg-white shadow rounded-lg p-5 border-l-4 border-yellow-600">
          <p className="text-gray-600 text-sm font-medium">Qualified</p>
          <p className="text-3xl font-bold mt-2 text-yellow-600">{statusStats.qualified}</p>
          <p className="text-gray-500 text-xs mt-2">Ready for closure</p>
        </div>

        <div className="bg-white shadow rounded-lg p-5 border-l-4 border-red-600">
          <p className="text-gray-600 text-sm font-medium">Lost Leads</p>
          <p className="text-3xl font-bold mt-2 text-red-600">{statusStats.lost}</p>
          <p className="text-gray-500 text-xs mt-2">Not converted</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Leads by Source - Bar Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Leads by Source</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourceChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leads by Status - Pie Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Leads by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold mb-6 text-gray-800">Conversion Funnel</h2>
        <div className="space-y-4">
          {statusChartData.map((item, index) => {
            const percentage = stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(1) : 0;
            return (
              <div key={item.name}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-gray-600 text-sm">{item.value} leads ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className={`h-full rounded-full flex items-center justify-end pr-3 text-white text-xs font-semibold transition-all`}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: COLORS[index],
                    }}
                  >
                    {percentage > 5 && `${percentage}%`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Recent Leads</h2>
        <div className="space-y-3">
          {recentLeads.length > 0 ? (
            recentLeads.map((lead) => (
              <div key={lead._id} className={`p-4 rounded-lg border ${getStatusColor(lead.status)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{lead.name}</p>
                    <p className="text-sm opacity-75">{lead.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-2">
                      {lead.source}
                    </span>
                    <p className="text-xs opacity-75">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No leads yet</p>
          )}
        </div>
      </div>

      {user?.role === "Admin" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Manager Performance</h2>

          {managerPerformance.length === 0 ? (
            <p className="text-gray-500">No manager performance data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Manager</th>
                    <th className="px-4 py-3 text-left">Assigned Leads</th>
                    <th className="px-4 py-3 text-left">Converted</th>
                    <th className="px-4 py-3 text-left">Conversion Rate</th>
                    <th className="px-4 py-3 text-left">Avg Response Time</th>
                    <th className="px-4 py-3 text-left">Overdue Follow-Ups</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {managerPerformance.map((row) => (
                    <tr key={row.manager._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{row.manager.name}</p>
                        <p className="text-xs text-gray-500">{row.manager.email}</p>
                      </td>
                      <td className="px-4 py-3">{row.totalAssigned}</td>
                      <td className="px-4 py-3">{row.converted}</td>
                      <td className="px-4 py-3">{row.conversionRate}%</td>
                      <td className="px-4 py-3">
                        {row.avgResponseMinutes !== null ? `${row.avgResponseMinutes} mins` : "No response yet"}
                      </td>
                      <td className="px-4 py-3">{row.overdueFollowups}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;