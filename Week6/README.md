# Week 6 - AJAX/JSON Integration

## Focus: Dynamic Data Fetch (Frontend ↔ Backend)

### Deliverable
Dynamic content updates using Fetch API (AJAX) — no page reloads.

### Features Implemented
- **Fetch API (AJAX)** for all server communication — zero page reloads
- **Login via API**: `POST /api/auth/login` with JSON response, token stored in localStorage
- **Fetch Leads from API**: `GET /api/leads` with Bearer token authorization
- **Create Lead via API**: `POST /api/leads` with JSON body, dynamic table refresh
- **Dynamic Dashboard**: Stats update automatically after fetching data from server
- **Loading States**: "Loading leads from server..." indicator during API calls
- **Error Handling**: API errors shown to user without page reload
- **Client + Server Validation**: Form validated on client, then API validates on server

### Project Structure
```
Week6/
├── frontend/
│   ├── index.html      (UI with login, dashboard, form, table)
│   ├── style.css        (Responsive styling)
│   └── script.js        (Fetch API calls, DOM updates)
├── backend/             (Same Express.js API from Week 5)
│   ├── server.js
│   ├── package.json
│   ├── config/db.js
│   ├── models/
│   ├── controllers/
│   ├── middleware/
│   └── routes/
└── README.md
```

### How to Run
```bash
# Start Backend
cd backend
npm install
# Create .env file with MONGO_URI, JWT_SECRET, PORT=5000
npm run dev

# Open Frontend
# Open frontend/index.html in browser
# Or use Live Server extension in VS Code
```

### Technologies Used
- HTML5, CSS3, JavaScript (Fetch API)
- Node.js, Express.js (Backend)
- MongoDB + Mongoose
- JWT Authentication
- AJAX/JSON for dynamic data exchange
