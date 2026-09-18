# Centre of Higher Education, Haryana — Branch Dashboard

An internal admin portal for browsing the 33 branches of the Centre of
Higher Education (Panchkula) and each branch's officer hierarchy
(Assistant Director → Superintendent → Assistant → Clerk → DEO).

## Stack

- **Frontend**: React (CRA + craco), Tailwind CSS, shadcn/radix UI components, Framer Motion for animation
- **Backend**: Node.js + Express, JWT auth, bcrypt password hashing
- **Database**: MongoDB (works locally or on the free MongoDB Atlas cloud tier)

## Quick start (local)

```bash
# 1) Backend
cd backend
cp .env.example .env     # paste in your MongoDB connection string
npm install
npm start                # http://localhost:8001

# 2) Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm start                # http://localhost:3000
```

Demo login: `admin` / `1234` (change this before going to production).

## Deploying for real (free tier)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step instructions to
put this online for free using MongoDB Atlas + Render + Vercel.

## Project structure

```
backend/
  server.js          Express app & routes
  db.js              MongoDB connection
  models/            Mongoose schemas (User, Branch)
  seed/seedData.js   Source data for the 33 branches + generated avatars/contact info
  seed/run.js        Standalone "npm run seed" script to reset branch data

frontend/
  src/pages/         LoginPage, DashboardPage, BranchPage
  src/components/    AppShell, PersonCard (interactive hierarchy card),
                     AnimatedBackground, PageTransition
  src/lib/api.js     Axios client + auth token handling
```
