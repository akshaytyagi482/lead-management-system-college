import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const initialLeadForm = {
  name: "",
  email: "",
  phone: "",
  source: "website",
};

function getStoredAuth() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (!token || !user) return { token: "", user: null };

  try {
    return { token, user: JSON.parse(user) };
  } catch {
    return { token: "", user: null };
  }
}

export default function App() {
  const [auth, setAuth] = useState(getStoredAuth);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [leadForm, setLeadForm] = useState(initialLeadForm);
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [leadMessage, setLeadMessage] = useState({ type: "", text: "" });
  const [creatingLead, setCreatingLead] = useState(false);

  const stats = useMemo(() => {
    return {
      total: leads.length,
      website: leads.filter((lead) => lead.source === "website").length,
      facebook: leads.filter((lead) => lead.source === "facebook").length,
      google: leads.filter((lead) => lead.source === "google").length,
    };
  }, [leads]);

  useEffect(() => {
    if (auth.token) {
      fetchLeads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token]);

  async function fetchLeads() {
    setLoadingLeads(true);
    setLeadMessage({ type: "", text: "" });
    try {
      const data = await api.getLeads(auth.token);
      setLeads(Array.isArray(data) ? data : []);
    } catch (error) {
      setLeadMessage({ type: "error", text: error.message || "Failed to fetch leads" });
    } finally {
      setLoadingLeads(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");

    try {
      const data = await api.login(loginForm);
      const user = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));

      setAuth({ token: data.token, user });
      setLoginForm({ email: "", password: "" });
    } catch (error) {
      setLoginError(error.message || "Login failed");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: "", user: null });
    setLeads([]);
    setLeadMessage({ type: "", text: "" });
  }

  function validateLeadForm() {
    if (!leadForm.name.trim() || leadForm.name.trim().length < 2) {
      return "Name is required (minimum 2 characters).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadForm.email.trim())) {
      return "Please enter a valid email.";
    }
    if (!/^\d{10}$/.test(leadForm.phone.trim())) {
      return "Phone number must be exactly 10 digits.";
    }
    return "";
  }

  async function handleCreateLead(event) {
    event.preventDefault();
    const error = validateLeadForm();
    if (error) {
      setLeadMessage({ type: "error", text: error });
      return;
    }

    setCreatingLead(true);
    setLeadMessage({ type: "", text: "" });

    try {
      await api.createLead({
        name: leadForm.name.trim(),
        email: leadForm.email.trim(),
        phone: leadForm.phone.trim(),
        source: leadForm.source,
      });

      setLeadForm(initialLeadForm);
      setLeadMessage({ type: "success", text: "Lead created successfully." });
      await fetchLeads();
    } catch (requestError) {
      setLeadMessage({ type: "error", text: requestError.message || "Failed to create lead" });
    } finally {
      setCreatingLead(false);
    }
  }

  if (!auth.token || !auth.user) {
    return (
      <div className="container">
        <header className="header">
          <h1>Lead Management System</h1>
          <p className="tagline">Track, Manage and Convert Your Leads Efficiently</p>
        </header>

        <section className="section login-wrap">
          <h2>Admin Login</h2>
          <div className="form-card">
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="loginEmail">Email</label>
                <input
                  id="loginEmail"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <input
                  id="loginPassword"
                  type="password"
                  placeholder="Enter password"
                  required
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                />
              </div>

              <button className="btn-submit" type="submit">
                Login
              </button>
            </form>

            {loginError ? <p className="form-message error">{loginError}</p> : null}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Lead Management System</h1>
        <p className="tagline">Track, Manage and Convert Your Leads Efficiently</p>
      </header>

      <nav className="navbar">
        <a href="#dashboard">Dashboard</a>
        <a href="#create-lead">Create Lead</a>
        <a href="#leads">Leads</a>
        <span className="user-info">Logged in as: {auth.user.email}</span>
        <button className="btn-logout" type="button" onClick={logout}>
          Logout
        </button>
      </nav>

      <section className="section" id="dashboard">
        <h2>Dashboard Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total Leads</p>
            <p className="stat-value">{stats.total}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Website Leads</p>
            <p className="stat-value blue">{stats.website}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Facebook Leads</p>
            <p className="stat-value indigo">{stats.facebook}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Google Leads</p>
            <p className="stat-value green">{stats.google}</p>
          </div>
        </div>
      </section>

      <section className="section" id="create-lead">
        <h2>Create New Lead</h2>
        <div className="form-card">
          <form onSubmit={handleCreateLead} noValidate>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter full name"
                required
                value={leadForm.name}
                onChange={(event) => setLeadForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter email address"
                required
                value={leadForm.email}
                onChange={(event) => setLeadForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="text"
                placeholder="Enter 10-digit phone"
                required
                value={leadForm.phone}
                onChange={(event) => setLeadForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="source">Lead Source</label>
              <select
                id="source"
                value={leadForm.source}
                onChange={(event) => setLeadForm((prev) => ({ ...prev, source: event.target.value }))}
              >
                <option value="website">Website</option>
                <option value="google">Google</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>

            <button className="btn-submit" type="submit" disabled={creatingLead}>
              {creatingLead ? "Saving..." : "Create Lead"}
            </button>
          </form>

          {leadMessage.text ? <p className={`form-message ${leadMessage.type}`}>{leadMessage.text}</p> : null}
        </div>
      </section>

      <section className="section" id="leads">
        <h2>All Leads</h2>

        {loadingLeads ? <p className="loading">Loading leads from server...</p> : null}

        {!loadingLeads && leads.length === 0 ? <p className="no-leads">No leads found on server.</p> : null}

        {!loadingLeads && leads.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.phone}</td>
                    <td>
                      <span className="badge source">{capitalize(lead.source)}</span>
                    </td>
                    <td>
                      <span className="badge status">{lead.status}</span>
                    </td>
                    <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <footer className="footer">
        <p>Copyright 2026 Lead Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}

function capitalize(value = "") {
  return value.length ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}
