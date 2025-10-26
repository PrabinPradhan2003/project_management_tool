# Project Management Tool — Intern Assignment
Full-Stack MERN app with Material‑UI and AI-powered user story generation.

## 📋 Project Overview
A comprehensive Project Management Tool built with the MERN stack (MongoDB, Express, React, Node) featuring role-based access control, task tracking, team management, and AI-powered user story generation using Groq. The UI is fully built with Material‑UI, includes an animated landing page, a fixed navbar with avatar menu, reusable confirm dialogs for deletes, an animated SVG logo, and text‑to‑speech on AI stories. The backend includes centralized error handling and robust Groq model selection.

## 👨‍💻 Developer
- Full Name: Mula Prabin Pradhan
- Contact: prabinpradhan1008@gmail.com
- Submission Date: 27/10/2025

## 🚀 Features

### Core
- Auth with JWT + role-based authorization (Admin, Manager, Developer)
- Projects: CRUD, assign members with roles, progress metrics
- Tasks: CRUD, assignment, status (To Do/In Progress/Done), deadlines, reports
- Members: list, add/remove, change role per project
- Dashboard: status distribution, overdue counts, progress bars

### UI/UX
- Material‑UI across the app (AppBar, Dialogs, Cards, etc.)
- Fixed navbar with Google-like avatar menu (name/email/role, logout)
- Animated landing page and animated multi-variant SVG logo
- Reusable ConfirmDialog for all delete actions
- AI Stories page with hover zoom and text‑to‑speech (SpeakButton)

### AI (Bonus)
- Generate user stories from a project description using Groq
- Dynamic model discovery (prefers Llama 3.x family; resilient to deprecations)
- Parses role/action/benefit; stores to DB and converts to tasks

### Resilience & Security
- Central 404 + error middleware; safe handling of invalid JSON and ObjectIds
- JWT auth middleware; role-based authorize middleware
- CORS and environment-based configuration

## 🛠 Tech Stack
- Backend: Node.js, Express, Mongoose, JWT, bcrypt, CORS, dotenv, groq-sdk
- Frontend: React 18, React Router v6, Vite, Axios, Material‑UI v5, Emotion, Day.js

## 📂 Project Structure (key files)
```
Project_management/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── aiController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── error.js
│   │   ├── models/
│   │   │   ├── user.js
│   │   │   ├── project.js
│   │   │   ├── task.js
│   │   │   └── userStory.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── projects.js
│   │   │   ├── tasks.js
│   │   │   └── ai.js
│   │   └── server.js
│   ├── test-groq.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── SpeakButton.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── BackButton.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ProjectsList.jsx
│   │   │   ├── ProjectDetail.jsx
│   │   │   ├── ProjectForm.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── AIUserStories.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔧 Setup (Windows PowerShell)

### Prerequisites
- Node.js 18+
- MongoDB (local service or Atlas)
- Groq API Key (https://console.groq.com)

### 1) Clone
```powershell
git clone <your-repo-url>
cd Project_management
```

### 2) Backend
```powershell
cd backend
npm install

# Copy env
Copy-Item .env.example .env
# Edit .env and set at least:
# PORT=4000
# MONGO_URI=mongodb://localhost:27017/project_management_db
# JWT_SECRET=your_jwt_secret_here
# GROQ_API_KEY=your_groq_api_key_here
```

### 3) Frontend
```powershell
cd ..\frontend
npm install
```

### 4) Start services
```powershell
# Terminal 1 (backend)
cd backend
npm run dev

# If 4000 busy: $env:PORT=4010; npm start

# Terminal 2 (frontend)
cd frontend
npm run dev
```

Frontend: http://localhost:5173  ·  Backend: http://localhost:4000

## 📡 API (highlights)

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Users
- GET /api/users (Admin/Manager)
- GET /api/users/me

### Projects
- GET /api/projects
- POST /api/projects
- GET /api/projects/:id
- PUT /api/projects/:id
- DELETE /api/projects/:id (Admin)
- Members: GET/POST/DELETE/PUT /api/projects/:id/members[/:userId]

### Tasks
- GET /api/tasks?projectId=&assigneeId=&status=
- POST /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id
- GET /api/tasks/reports/summary

### AI
- POST /api/ai/generate-user-stories
- GET /api/ai/user-stories/:projectId
- POST /api/ai/user-stories/:storyId/convert-to-task
- PUT /api/ai/user-stories/:storyId/status
- DELETE /api/ai/user-stories/:storyId

## 🤖 AI usage

Example request:
```json
POST /api/ai/generate-user-stories
{
  "projectDescription": "An ecommerce website where customers can browse products...",
  "projectId": "optional-project-id"
}
```

Groq key/model test:
```powershell
cd backend
node .\test-groq.js
```

## 🧪 Testing
- Use the frontend for end-to-end flows
- Import `postman_collection.json` for API testing

## 🔐 Security & Resilience
- Password hashing (bcrypt), JWT auth, role-based access
- Centralized 404 + error handler; invalid JSON/ObjectId safety
- CORS and env‑based config

## 📊 Data Models (simplified)
- Users: { name, email, password, role }
- Projects: { name, description, status, dates, members[{ user, role }] }
- Tasks: { title, description, status, deadline, project, assignee }
- UserStories: { projectId, story, role, action, benefit, status, taskId }

## � Dependencies (pinned)
Backend: express ^4.18.2, mongoose ^7.3.4, jsonwebtoken ^9.0.0, bcrypt ^5.1.0, cors ^2.8.5, dotenv ^16.3.1, groq-sdk ^0.34.0

Frontend: react ^18, react-router-dom ^6, @mui/material ^5, @mui/icons-material ^5, @emotion/* ^11, axios ^1, dayjs ^1, vite ^5

## 📚 Additional Docs
- QUICKSTART.md — quick steps
- GROQ_SETUP.md — Groq key setup and troubleshooting
- FEATURE_SHOWCASE.md — UI highlights
- ER_DIAGRAM.md — data model diagram
- SUBMISSION_CHECKLIST.md, SUBMISSION_SUMMARY.md — evaluation aids

## 📝 License
This project is for intern assignment evaluation purposes.

## 🙏 Acknowledgments
Groq (AI), Material‑UI (UI), MongoDB (DB)

— Thank you for reviewing my submission! 🚀
