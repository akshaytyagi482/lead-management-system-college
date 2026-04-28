import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-5">
      <h2 className="text-2xl font-bold mb-8">Urban Cruise</h2>

      <nav className="space-y-4">
        <Link to="/dashboard" className="block hover:text-blue-400">
          Dashboard
        </Link>
        <Link to="/leads" className="block hover:text-blue-400">
          Leads
        </Link>
        <Link to="/reports" className="block hover:text-blue-400">
          Reports
        </Link>
      </nav>
    </div>
  );
}