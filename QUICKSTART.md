# 🚀 Quick Start Guide - Project Management Tool

## Prerequisites Checklist
- [ ] Node.js installed (v14+)
- [ ] MongoDB installed or Atlas account
- [ ] GROQ API key ([Get free key](https://console.groq.com))
- [ ] Git installed

## 5-Minute Setup

### Step 1: Environment Setup (2 mins)
```bash
# Navigate to backend
cd backend

# Copy environment file
cp .env.example .env

# Edit .env file with your values:
# - MONGO_URI (use mongodb://localhost:27017/project_management_db for local)
# - JWT_SECRET (any random string)
# - GROQ_API_KEY (get from https://console.groq.com)
```

**Get GROQ API Key:**
1. Visit https://console.groq.com
2. Sign up (free)
3. Go to API Keys → Create API Key
4. Copy and paste into `.env` file

### Step 2: Install Dependencies (2 mins)
```bash
# In backend folder
npm install

# In new terminal, navigate to frontend
cd ../frontend
npm install
```

### Step 3: Test GROQ Integration (30 seconds)
```bash
# In backend folder
node test-groq.js
```

You should see AI-generated user stories! ✅

### Step 4: Start the Application (30 seconds)
```bash
# Terminal 1 - Backend (from backend folder)
npm run dev

# Terminal 2 - Frontend (from frontend folder)
npm run dev
```

### Step 5: Access the Application
Open your browser:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000

## First-Time User Flow

### 1. Register
- Click "Sign Up" on landing page
- Fill in details:
  - Name: Your Name
  - Email: your@email.com
  - Password: (your choice)
  - Role: Manager (recommended for testing)
- **Auto-redirect to Projects page** ✨

### 2. Create Your First Project
- Click "New Project"
- Fill in:
  - Name: "E-commerce Website"
  - Description: "Build modern online store"
  - Status: Planning
  - Dates: (your choice)
- Click "Create Project"

### 3. Generate AI User Stories 🤖
- Open the project you just created
- Click "AI Stories" button
- Enter project description:
  ```
  An ecommerce website where customers can browse products,
  add to cart, and make payments online. Admin should manage
  products and view orders.
  ```
- Click "Generate User Stories"
- **Watch AI create 5-10 user stories instantly!** ✨

### 4. Convert Story to Task
- Click "Convert to Task" on any story
- Assign to yourself (optional)
- Set deadline (optional)
- Click "Create Task"
- ✅ Story is now a task!

### 5. Manage Tasks
- View tasks in project detail
- Change status (To Do → In Progress → Done)
- Track progress with progress bar
- Edit or delete tasks as needed

## Features to Test

### ✅ Core Features
- [ ] User registration & login
- [ ] Create/edit/delete projects
- [ ] Add team members to projects
- [ ] Change member roles (Manager/Developer)
- [ ] Create/edit/delete tasks
- [ ] Update task status
- [ ] View dashboard metrics
- [ ] Track overdue tasks

### 🌟 AI Features (BONUS)
- [ ] Generate user stories from description
- [ ] View generated stories
- [ ] Convert stories to tasks
- [ ] Reject/restore stories
- [ ] Delete stories

## Common Issues & Solutions

### ❌ "Cannot connect to MongoDB"
**Solution:**
```bash
# Start MongoDB locally
mongod

# Or use MongoDB Atlas connection string in .env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

### ❌ "GROQ API Key invalid"
**Solution:**
1. Check you copied the entire key
2. No extra spaces in `.env` file
3. Regenerate key if needed at https://console.groq.com

### ❌ "Port 4000 already in use"
**Solution:**
```bash
# Change port in backend/.env
PORT=5000

# Or kill process on port 4000
# Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:4000 | xargs kill -9
```

### ❌ Frontend can't reach backend
**Solution:**
Check `frontend/src/services/api.js` has correct base URL:
```javascript
baseURL: 'http://localhost:4000/api'
```

## Testing the BONUS Feature

### Quick AI Test (30 seconds)
```bash
# In backend folder
node test-groq.js
```

Expected output:
```
✅ GROQ_API_KEY found
✅ Groq client initialized
⏳ Generating user stories...
✅ SUCCESS! Generated User Stories:
1. As a customer, I want to browse products...
2. As a customer, I want to add to cart...
...
✨ GROQ integration is working perfectly!
```

### API Test with Postman
1. Import `postman_collection.json`
2. Login to get JWT token
3. Test `/api/ai/generate-user-stories` endpoint
4. See AI-generated stories in response

## Default Credentials

After first registration, use your own credentials.

To create admin user, register with:
- Role: Admin

## Project Structure Overview

```
Project_management/
├── backend/              → Express API
│   ├── src/
│   │   ├── controllers/  → Business logic
│   │   ├── models/       → Database schemas
│   │   ├── routes/       → API endpoints
│   │   └── middleware/   → Auth middleware
│   └── test-groq.js      → GROQ test script
├── frontend/             → React app
│   └── src/
│       ├── pages/        → React pages
│       ├── components/   → Reusable components
│       └── services/     → API & auth services
└── README.md             → Full documentation
```

## Next Steps

1. ✅ Complete the setup above
2. 📖 Read full README.md for detailed documentation
3. 🧪 Test all features
4. 🎨 Customize for your needs
5. 🚀 Deploy to Vercel/Render

## Deployment Quick Links

### Frontend (Vercel)
1. Push to GitHub
2. Connect repo to Vercel
3. Deploy!

### Backend (Render/Railway)
1. Push to GitHub
2. Connect to hosting platform
3. Add environment variables
4. Deploy!

## Need Help?

- 📚 Full docs: See README.md
- 🔑 GROQ setup: See GROQ_SETUP.md
- 🗄️ Database: See ER_DIAGRAM.md
- 🧪 API testing: Import postman_collection.json

## Success Checklist

Before submission, verify:
- [ ] All core features working
- [ ] AI user story generator working
- [ ] Frontend deployed (Vercel/Netlify)
- [ ] Backend deployed (Render/Railway)
- [ ] README.md updated with your name
- [ ] Postman collection tested
- [ ] Screenshots/video demo ready (optional)

---

**🎉 Congratulations! You're ready to showcase your project!**

For detailed documentation, see the main [README.md](README.md)
