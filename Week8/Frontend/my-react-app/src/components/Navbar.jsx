import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
      auth: { token },
      transports: ["websocket"],
    });

    const pushNotification = (message) => {
      setNotifications((prev) => [
        {
          id: Date.now() + Math.random(),
          message,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 20));
    };

    socket.on("lead:assigned", (payload) => {
      if (!payload?.leadName || !payload?.manager?.name) return;
      pushNotification(`Lead ${payload.leadName} assigned to ${payload.manager.name}`);
    });

    socket.on("lead:status-updated", (lead) => {
      if (!lead?.name || !lead?.status) return;
      pushNotification(`Lead ${lead.name} moved to ${lead.status}`);
    });

    socket.on("lead:note-added", (payload) => {
      if (!payload?.leadName) return;
      pushNotification(`New note added on ${payload.leadName}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleNotifications = () => {
    setIsNotificationOpen((prev) => !prev);
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

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
          <Link to="/manager-create">Create Manager</Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="relative bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded"
          >
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[22px] text-center">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-lg shadow-lg border z-50">
              <div className="px-4 py-3 border-b font-semibold">Realtime Updates</div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-gray-500 text-center">No notifications yet</p>
                ) : (
                  notifications.map((item) => (
                    <div key={item.id} className="px-4 py-3 border-b last:border-b-0">
                      <p className="text-sm">{item.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t">
                <button
                  onClick={() => setNotifications([])}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

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
