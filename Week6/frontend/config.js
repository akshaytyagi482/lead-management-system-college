// ============================
// Environment Configuration
// ============================
const config = {
  API_BASE: window.__API_BASE__ || process.env.REACT_APP_API_URL || "http://localhost:5000/api"
};

// For Node/build environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}
