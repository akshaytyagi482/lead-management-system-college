import { useEffect, useState } from "react";
import api from "../utils/api"; // ✅ axios instance
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Reports = () => {
  const [report, setReport] = useState({
    website: 0,
    google: 0,
    facebook: 0,
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/leads`);

        const summary = {
          website: 0,
          google: 0,
          facebook: 0,
        };

        data.forEach((lead) => {
          const source = lead.source?.toLowerCase();
          if (summary[source] !== undefined) {
            summary[source]++;
          }
        });

        setReport(summary);
      } catch (error) {
        console.error("Failed to fetch report", error);
      }
    };

    fetchReport();
  }, []);

  const chartData = [
    { name: "Website", value: report.website },
    { name: "Google", value: report.google },
    { name: "Facebook", value: report.facebook },
  ];

  const COLORS = ["#3B82F6", "#10B981", "#6366F1"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-500 mt-1">
          Lead source performance overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <ReportCard title="Website Leads" value={report.website} />
        <ReportCard title="Google Leads" value={report.google} />
        <ReportCard title="Facebook Leads" value={report.facebook} />
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Leads Distribution by Source
        </h2>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const ReportCard = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
    <p className="text-sm text-gray-500 uppercase tracking-wide">
      {title}
    </p>
    <p className="text-4xl font-bold text-gray-800 mt-4">
      {value}
    </p>
  </div>
);

export default Reports;
