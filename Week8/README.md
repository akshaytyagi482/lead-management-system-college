# Week 8 - Full Web Application Deployment

## Focus: Secure Hosted Site with All Features

### Deliverable
Complete Lead Management System deployed live with HTTPS and all features integrated.

### Features Implemented (Complete Project)

#### Backend (Node.js + Express.js + MongoDB)
- RESTful API with full CRUD operations for leads
- JWT-based authentication with role-based access control (Admin/Manager)
- Password hashing with bcryptjs
- Server-side validation (email, phone, duplicates)
- MongoDB database with Mongoose ODM
- CORS enabled for cross-origin requests
- Morgan logging in development mode
- Meta & Google webhook integrations

#### Frontend (React.js + Vite + Tailwind CSS)
- **Login Page**: Secure authentication with JWT token storage
- **Dashboard**: Real-time stats with Bar & Pie charts (Recharts)
- **Leads Page**: Sortable table with admin delete capability
- **Create Lead**: Form with client-side validation
- **Reports**: Pie chart visualization of lead sources
- **Create Admin**: Admin-only page for creating new admin users
- **Protected Routes**: React Router with auth guards
- **Responsive Design**: Mobile-friendly with Tailwind CSS
- **Auth Context**: Global state management for user authentication

### Project Structure
```
Week8/
├── Backend/
│   ├── server.js
│   ├── package.json
│   ├── config/
│   │   ├── db.js
│   │   ├── google.js
│   │   └── meta.js
│   ├── controllers/
│   │   ├── leadController.js
│   │   ├── userController.js
│   │   ├── googleWebhookController.js
│   │   └── metaWebhookController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Lead.js
│   │   └── User.js
│   └── routes/
│       ├── leadRoutes.js
│       ├── userRoutes.js
│       ├── metaRoutes.js
│       └── googleRoutes.js
└── Frontend/
    └── my-react-app/
        ├── index.html
        ├── package.json
        ├── vite.config.js
        ├── tailwind.config.js
        └── src/
            ├── App.jsx
            ├── main.jsx
            ├── components/
            ├── context/
            ├── pages/
            └── utils/
```

### Deployment

#### Backend Deployment (Render)
1. Push backend code to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT`
4. Deploy with `npm start`

#### Frontend Deployment (Vercel)
1. Push frontend code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set environment variable: `VITE_API_URL` = your Render backend URL
4. Deploy automatically

### Security Features
- HTTPS enforced on both Render and Vercel
- JWT tokens for API authentication
- Password hashing (bcryptjs)
- Role-based access control (Admin vs Manager)
- CORS configured for allowed origins
- Input validation on both client and server

### How to Run Locally
```bash
# Backend
cd Backend
npm install
# Create .env with MONGO_URI, JWT_SECRET, PORT=5000
npm run dev

# Frontend
cd Frontend/my-react-app
npm install
# Create .env with VITE_API_URL=http://localhost:5000/api
npm run dev
```

### Live URLs
- Frontend: _[Add your Vercel URL here]_
- Backend API: _[Add your Render URL here]_

### Technologies Used
- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, React Router v7, Axios
- **Backend**: Node.js, Express.js 5, MongoDB, Mongoose 9, JWT, bcryptjs
- **Deployment**: Vercel (Frontend), Render (Backend)
- **Database**: MongoDB Atlas
