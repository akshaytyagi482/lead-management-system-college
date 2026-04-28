import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    website: 0,
    facebook: 0,
    google: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/leads`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats({
        total: data.length,
        website: data.filter((l) => l.source === "website").length,
        facebook: data.filter((l) => l.source === "facebook").length,
        google: data.filter((l) => l.source === "google").length,
      });
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: "Website", value: stats.website },
    { name: "Facebook", value: stats.facebook },
    { name: "Google", value: stats.google },
  ];

  const COLORS = ["#2563eb", "#4f46e5", "#16a34a"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {/* EXISTING CARDS — UNTOUCHED */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-gray-500 text-sm">Total Leads</p>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-gray-500 text-sm">Website Leads</p>
          <p className="text-3xl font-bold mt-2 text-blue-600">
            {stats.website}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-gray-500 text-sm">Facebook Leads</p>
          <p className="text-3xl font-bold mt-2 text-indigo-600">
            {stats.facebook}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-gray-500 text-sm">Google Leads</p>
          <p className="text-3xl font-bold mt-2 text-green-600">
            {stats.google}
          </p>
        </div>
      </div>

      {/* 🔥 CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* BAR CHART */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Leads by Source (Bar)
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PIE CHART */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Leads Distribution (Pie)
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;