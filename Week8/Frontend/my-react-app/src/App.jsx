import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Reports from "./pages/Reports";
import CreateLead from "./pages/CreateLead";
import CreateManager from "./pages/CreateAdmin";

import ProtectedLayout from "./components/ProtectedLayout";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/create-lead" element={<CreateLead />} />

          {/* Admin Only */}
          <Route
            path="/manager-create"
            element={
              <AdminRoute>
                <CreateManager />
              </AdminRoute>
            }
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;