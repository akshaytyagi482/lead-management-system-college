import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();               // clears token
    navigate("/", { replace: true });
  };

  return (
    <div className="w-full h-14 bg-gray-900 text-white flex items-center justify-between px-6">
      <div className="flex gap-6 items-center">
        <span className="font-semibold">Urban Cruise</span>

        <Link to="/dashboard">Dashboard</Link>
        <Link to="/leads">Leads</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/create-lead">Create Lead</Link>

        {user?.role === "Admin" && (
          <Link to="/admin-create">Create Admin</Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
