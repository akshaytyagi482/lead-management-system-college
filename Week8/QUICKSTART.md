# Quick Start Guide - Week 8 Lead Management System

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally on port 27017)
- npm or yarn

## Setup Instructions

### 1. Start MongoDB Locally
Make sure MongoDB is running on your machine:
```bash
# Windows - if MongoDB is installed as a service
net start MongoDB

# Or run mongod directly
mongod --port 27017
```

### 2. Backend Setup
```bash
cd Week8/Backend
npm install
npm start
```
The backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd Week8/Frontend/my-react-app
npm install
npm run dev
```
The frontend will run on `http://localhost:5173` (or another port)

## Environment Variables

### Backend (.env file - already configured)
```
PORT=5000
NODE_ENV=development
MONGO_URI='mongodb://localhost:27017/lead-management'
JWT_SECRET='mySuperSecretKey'
```

### Frontend (.env.local - if needed)
Create `.env.local` in `Week8/Frontend/my-react-app/` if VITE_API_URL is not set:
```
VITE_API_URL=http://localhost:5000/api
```

## Default Login Credentials

After creating a user through signup, you can login with those credentials.

### Create First Admin (if needed)
Send POST request to create manager:
```
POST /api/manager/create
Headers: Authorization: Bearer {token}
Body: {
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "password123"
}
```

## New Features Available

### 1. User Signup
- Go to `/signup` page
- Create account with name, email, password, and role
- Login with your credentials

### 2. Enhanced Leads Management
- **Search**: Find leads by name, email, or phone
- **Filter**: Filter by status or lead source
- **Export**: Download leads as CSV
- **Pagination**: Navigate through pages of leads
- **Statistics**: View conversion rates and metrics

### 3. Advanced Dashboard
- View conversion funnel
- See recent leads
- Check statistics by status and source
- Track conversion rate

## API Endpoints

### Authentication
```
POST /api/auth/register        - Register new user
POST /api/auth/login           - Login user
GET  /api/auth/profile         - Get user profile (requires token)
POST /api/manager/create       - Create manager (admin only)
```

### Leads
```
GET    /api/leads              - Get all leads
POST   /api/leads              - Create new lead
GET    /api/leads/:id          - Get single lead
PUT    /api/leads/:id          - Update lead
DELETE /api/leads/:id          - Delete lead (admin only)
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check if port 27017 is available
- Verify MONGO_URI in .env

### Frontend won't start
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

### CORS Error
- Make sure backend is running on port 5000
- Check VITE_API_URL in frontend .env

### Port Already in Use
```bash
# Change PORT in .env for backend or frontend
# For Windows: 
netstat -ano | findstr :5000
taskkill /PID {PID} /F
```

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **API Testing**: Use Postman or Thunder Client to test API endpoints
3. **Database**: Use MongoDB Compass to view data in database
4. **Console Logs**: Check browser console and terminal for debug information

Enjoy using the Lead Management System! 🚀
