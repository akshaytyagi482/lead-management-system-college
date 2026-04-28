import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const ProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;