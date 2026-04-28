import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Reports from "./pages/Reports";
import CreateLead from "./pages/CreateLead";
import CreateAdmin from "./pages/CreateAdmin";

import ProtectedLayout from "./components/ProtectedLayout";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/create-lead" element={<CreateLead />} />

          {/* Admin Only */}
          <Route
            path="/admin-create"
            element={
              <AdminRoute>
                <CreateAdmin />
              </AdminRoute>
            }
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;