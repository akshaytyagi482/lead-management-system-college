// ============================
// API Base URL - Loaded from config.js (environment variable)
// ============================
const API_BASE = config.API_BASE;

// ============================
// DOM Content Loaded
// ============================
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();

    // Login form
    document.getElementById("loginForm").addEventListener("submit", handleLogin);

    // Lead form
    document.getElementById("leadForm").addEventListener("submit", handleCreateLead);

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", handleLogout);
});

// ============================
// Authentication
// ============================
function checkAuth() {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (token && user) {
        showApp(user);
        fetchLeadsFromAPI();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("appContent").style.display = "none";
}

function showApp(user) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("appContent").style.display = "block";
    document.getElementById("userInfo").textContent = `Logged in as: ${user.email}`;
}

// ============================
// Login Handler (AJAX - fetch API)
// ============================
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const msgEl = document.getElementById("loginMessage");

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }

        // Store token and user in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role
        }));

        showApp(data);
        fetchLeadsFromAPI();

    } catch (error) {
        msgEl.textContent = error.message;
        msgEl.className = "form-message error";
    }
}

// ============================
// Logout
// ============================
function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showLogin();
}

// ============================
// Fetch Leads from API (AJAX - no page reload)
// ============================
async function fetchLeadsFromAPI() {
    const token = localStorage.getItem("token");
    const loadingEl = document.getElementById("loadingIndicator");
    const noLeadsEl = document.getElementById("noLeads");

    loadingEl.style.display = "block";
    noLeadsEl.style.display = "none";

    try {
        const response = await fetch(`${API_BASE}/leads`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch leads");
        }

        const leads = await response.json();

        loadingEl.style.display = "none";
        renderLeadsTable(leads);
        updateDashboardStats(leads);

    } catch (error) {
        loadingEl.textContent = "Failed to load leads from server.";
        console.error("Fetch error:", error);
    }
}

// ============================
// Create Lead via API (AJAX POST)
// ============================
async function handleCreateLead(e) {
    e.preventDefault();
    clearErrors();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const source = document.getElementById("source").value;

    let isValid = true;

    // Client-side validation
    if (!name || name.length < 2) {
        showError("nameError", "Name is required (min 2 chars)");
        isValid = false;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError("emailError", "Valid email is required");
        isValid = false;
    }

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
        showError("phoneError", "Phone must be exactly 10 digits");
        isValid = false;
    }

    if (!isValid) return;

    const btn = document.getElementById("createLeadBtn");
    btn.disabled = true;
    btn.textContent = "Saving...";

    try {
        // AJAX POST to API - JSON data sent without page reload
        const response = await fetch(`${API_BASE}/leads`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, source })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to create lead");
        }

        showFormMessage("Lead created successfully via API!", "success");
        document.getElementById("leadForm").reset();

        // Re-fetch leads from server (dynamic update without reload)
        fetchLeadsFromAPI();

    } catch (error) {
        showFormMessage(error.message, "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Create Lead";
    }
}

// ============================
// Render Leads Table
// ============================
function renderLeadsTable(leads) {
    const tbody = document.getElementById("leadsTableBody");
    const noLeads = document.getElementById("noLeads");
    tbody.innerHTML = "";

    if (leads.length === 0) {
        noLeads.style.display = "block";
        return;
    }

    noLeads.style.display = "none";

    leads.forEach((lead) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${lead.name}</td>
            <td>${lead.email}</td>
            <td>${lead.phone}</td>
            <td><span class="badge source">${capitalize(lead.source)}</span></td>
            <td><span class="badge status">${lead.status}</span></td>
            <td>${new Date(lead.createdAt).toLocaleDateString()}</td>
        `;
        tbody.appendChild(row);
    });
}

// ============================
// Update Dashboard Stats
// ============================
function updateDashboardStats(leads) {
    document.getElementById("totalLeads").textContent = leads.length;
    document.getElementById("websiteLeads").textContent = leads.filter(l => l.source === "website").length;
    document.getElementById("facebookLeads").textContent = leads.filter(l => l.source === "facebook").length;
    document.getElementById("googleLeads").textContent = leads.filter(l => l.source === "google").length;
}

// ============================
// UI Helpers
// ============================
function showError(id, msg) {
    document.getElementById(id).textContent = msg;
}

function clearErrors() {
    document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
}

function showFormMessage(text, type) {
    const msg = document.getElementById("formMessage");
    msg.textContent = text;
    msg.className = "form-message " + type;
    setTimeout(() => {
        msg.className = "form-message";
        msg.style.display = "none";
    }, 4000);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
