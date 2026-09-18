# Deployment Guide — CHE Dashboard

This app now has 3 moving pieces, all of which have a free tier:

| Piece      | What it is                  | Free host used here |
|------------|------------------------------|----------------------|
| Database   | MongoDB (stores users + all 33 branches/hierarchies) | **MongoDB Atlas** (free M0 cluster, 512MB) |
| Backend    | Node/Express API             | **Render** (free Web Service) |
| Frontend   | React app                    | **Vercel** (free) |

You can swap Render/Vercel for Railway/Netlify/Fly.io etc. — the important
part is the `MONGODB_URI` / `REACT_APP_BACKEND_URL` environment variables.

---

## 1. Create a free MongoDB Atlas database

1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free, no card needed).
2. Create a new **Project** → then **Build a Database** → choose **M0 Free**.
3. Pick any cloud provider/region close to you → **Create**.
4. **Database Access** (left sidebar) → **Add New Database User**:
   - Username/password auth, e.g. `cheUser` / a strong password.
   - Role: "Read and write to any database".
5. **Network Access** (left sidebar) → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).
   - This is required because Render/Vercel use dynamic IPs. It's safe here because the database is still protected by the username/password.
6. Go to **Database** → **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://cheUser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your real password. This whole string is your `MONGODB_URI`.

That's it — the database itself needs no schema setup. The backend automatically creates the `users` and `branches` collections and seeds them (33 branches + 1 admin user) the very first time it connects to an empty database.

---

## 2. Deploy the backend (Render, free)

1. Push this project to a GitHub repo (or GitLab/Bitbucket).
2. Go to https://render.com → sign up/log in → **New +** → **Web Service**.
3. Connect your repo, then set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. Add Environment Variables (Render dashboard → Environment):
   - `MONGODB_URI` = the connection string from step 1
   - `JWT_SECRET` = any long random string (e.g. generate one at https://www.uuidgenerator.net/)
   - `CORS_ORIGIN` = leave blank for now, you'll fill this in after deploying the frontend (step 3)
   - `MONGODB_DB` = `che_dashboard` (optional, this is the default)
5. Click **Create Web Service**. Render will build and deploy; you'll get a URL like:
   ```
   https://che-dashboard-backend.onrender.com
   ```
6. Test it: visit `https://<your-render-url>/api/health` — you should see `{"status":"healthy","db":"connected","branches":33}`.

> Free Render web services "sleep" after 15 minutes of inactivity and take ~30–60s to wake up on the next request. That's normal for the free tier — the login page will just feel slow on the first visit after idling.

---

## 3. Deploy the frontend (Vercel, free)

1. Go to https://vercel.com → sign up/log in → **Add New** → **Project** → import the same repo.
2. Set:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App (Vercel usually auto-detects this)
3. Add an Environment Variable:
   - `REACT_APP_BACKEND_URL` = your Render URL from step 2, e.g. `https://che-dashboard-backend.onrender.com`
4. Click **Deploy**. You'll get a URL like:
   ```
   https://che-dashboard.vercel.app
   ```

## 4. Close the loop: lock down CORS

Now that you know your frontend's real URL, go back to Render → your backend service → Environment → set:

```
CORS_ORIGIN=https://che-dashboard.vercel.app
```

Redeploy the backend (Render does this automatically when you save env vars). This ensures only your deployed frontend (not random third parties) can call your API.

---

## 5. Log in

Visit your Vercel URL and log in with the demo credentials:
- Username: `admin`
- Password: `1234`

**Change this in production** — either update the password directly in MongoDB Atlas (Atlas UI → Browse Collections → `users` → edit, but remember passwords are stored as bcrypt hashes, so you'd need to hash a new one), or add a small "change password" endpoint later.

---

## Local development

```bash
# Backend
cd backend
cp .env.example .env      # then paste your MONGODB_URI in
npm install
npm start                 # runs on http://localhost:8001

# Frontend (in a second terminal)
cd frontend
cp .env.example .env      # REACT_APP_BACKEND_URL=http://localhost:8001
npm install
npm start                 # runs on http://localhost:3000
```

## Resetting / re-seeding branch data

If you ever want to wipe and regenerate the 33 branches (e.g. after editing
`backend/seed/seedData.js`):

```bash
cd backend
npm run seed
```

This only touches the `branches` collection — your `users` collection (and any password changes) is left alone.
