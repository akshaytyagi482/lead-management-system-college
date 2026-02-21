// ============================
// Sample Lead Data
// ============================
const leadsData = [
    { name: "Rahul Sharma", email: "rahul@example.com", phone: "9876543210", source: "website", status: "New" },
    { name: "Priya Patel", email: "priya@example.com", phone: "9123456789", source: "facebook", status: "Contacted" },
    { name: "Amit Singh", email: "amit@example.com", phone: "9988776655", source: "google", status: "New" },
    { name: "Neha Gupta", email: "neha@example.com", phone: "9871234567", source: "website", status: "Qualified" },
    { name: "Vikram Joshi", email: "vikram@example.com", phone: "9112233445", source: "facebook", status: "New" },
    { name: "Sneha Rao", email: "sneha@example.com", phone: "9223344556", source: "google", status: "Contacted" },
    { name: "Ravi Kumar", email: "ravi@example.com", phone: "9334455667", source: "website", status: "Qualified" },
    { name: "Anita Desai", email: "anita@example.com", phone: "9445566778", source: "google", status: "New" },
];

// ============================
// DOM Content Loaded
// ============================
document.addEventListener("DOMContentLoaded", () => {

    // --- Theme Toggle Button ---
    const themeToggleBtn = document.createElement("button");
    themeToggleBtn.textContent = "🌙 Dark Mode";
    themeToggleBtn.classList.add("theme-toggle");

    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            themeToggleBtn.textContent = "☀️ Light Mode";
        } else {
            themeToggleBtn.textContent = "🌙 Dark Mode";
        }
    });

    document.querySelector(".header").appendChild(themeToggleBtn);

    // --- Dynamically Load Leads Table ---
    loadLeadsTable(leadsData);

    // --- Update Dashboard Stats ---
    updateDashboardStats(leadsData);

    // --- Update Reports ---
    updateReports(leadsData);
});

// ============================
// Load Leads into Table
// ============================
function loadLeadsTable(leads) {
    const tbody = document.getElementById("leadsTableBody");
    tbody.innerHTML = "";

    leads.forEach((lead) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${lead.name}</td>
            <td>${lead.email}</td>
            <td>${lead.phone}</td>
            <td><span class="badge source">${capitalize(lead.source)}</span></td>
            <td><span class="badge status">${lead.status}</span></td>
        `;

        tbody.appendChild(row);
    });
}

// ============================
// Update Dashboard Stats with Animation
// ============================
function updateDashboardStats(leads) {
    const total = leads.length;
    const website = leads.filter(l => l.source === "website").length;
    const facebook = leads.filter(l => l.source === "facebook").length;
    const google = leads.filter(l => l.source === "google").length;

    animateCounter("totalLeads", total);
    animateCounter("websiteLeads", website);
    animateCounter("facebookLeads", facebook);
    animateCounter("googleLeads", google);
}

// ============================
// Animated Counter
// ============================
function animateCounter(elementId, target) {
    const el = document.getElementById(elementId);
    let current = 0;
    const step = Math.ceil(target / 30);
    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        el.textContent = current;
    }, 40);
}

// ============================
// Update Reports Dynamically
// ============================
function updateReports(leads) {
    // Source report
    const sourceReport = document.getElementById("sourceReport");
    const sources = {};
    leads.forEach(l => {
        sources[l.source] = (sources[l.source] || 0) + 1;
    });

    sourceReport.innerHTML = "";
    for (const [source, count] of Object.entries(sources)) {
        const li = document.createElement("li");
        li.innerHTML = `${capitalize(source)}: <strong>${count}</strong>`;
        sourceReport.appendChild(li);
    }

    // Status report
    const statusReport = document.getElementById("statusReport");
    const statuses = {};
    leads.forEach(l => {
        statuses[l.status] = (statuses[l.status] || 0) + 1;
    });

    statusReport.innerHTML = "";
    for (const [status, count] of Object.entries(statuses)) {
        const li = document.createElement("li");
        li.innerHTML = `${status}: <strong>${count}</strong>`;
        statusReport.appendChild(li);
    }
}

// ============================
// Utility: Capitalize
// ============================
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
