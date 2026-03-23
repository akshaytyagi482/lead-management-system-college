# Week 6 - Vite Frontend + API Integration

## Focus: Dynamic Data Fetch (Frontend <-> Backend)

### Deliverable
Week 6 frontend migrated to Vite + React with backend API integration.

### Features Implemented
- Login using API endpoint `POST /api/auth/login` and store JWT in localStorage
- Fetch protected leads using `GET /api/leads` with Bearer token
- Create leads using `POST /api/leads`
- Dashboard stats derived from live API data
- Loading and API error states shown in UI
- API base URL configured through Vite environment variable (`VITE_API_BASE`)

### Project Structure
```
Week6/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js
│       └── styles.css
├── backend/
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
# 1) Start backend
cd backend
npm install
# create .env with MONGO_URI, JWT_SECRET, PORT=5000
npm run dev

# 2) Start frontend (new terminal)
cd ../frontend
npm install
# copy .env.example to .env if needed and edit VITE_API_BASE
npm run dev
```

### Default API URL
- `VITE_API_BASE=http://localhost:5000/api`

### Technologies Used
- Vite + React
- JavaScript (Fetch API)
- Node.js, Express.js
- MongoDB + Mongoose
- JWT Authentication
