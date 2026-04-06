# GradeTrack — CGPA Calculator

A full-stack MERN app to track CGPA, project current semester grades, and solve for target CGPAs.

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, Vite, Tailwind CSS, React Router v6, React Hook Form, Recharts |
| Backend   | Node.js, Express.js, Mongoose |
| Database  | MongoDB Atlas |
| Auth      | JWT + bcrypt |
| Deploy    | Vercel (frontend) + Render (backend) + MongoDB Atlas (DB) |

---

## Local Development

### 1. Clone and install

```bash
git clone <your-repo-url>
cd cgpa-calculator
npm run install:all
```

### 2. Set up environment variables

**Server** — copy `server/.env.example` to `server/.env`:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/cgpa-calculator
JWT_SECRET=pick_a_long_random_string_here
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Client** — copy `client/.env.example` to `client/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run dev servers

```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

---

## Deployment Guide

### Step 1 — MongoDB Atlas (Free)

1. Go to https://cloud.mongodb.com → Create a free account
2. Create a free **M0** cluster (any region)
3. Under **Database Access** → Add a user with read/write permissions
4. Under **Network Access** → Add `0.0.0.0/0` (allow all IPs for cloud deploy)
5. Click **Connect** → **Drivers** → Copy the connection string
6. Replace `<password>` with your DB user password — this is your `MONGO_URI`

---

### Step 2 — Deploy Backend on Render (Free)

1. Push your code to GitHub
2. Go to https://render.com → New → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root directory**: `server`
   - **Build command**: `npm install`
   - **Start command**: `npm start`
   - **Runtime**: Node
5. Add environment variables:
   ```
   MONGO_URI=<your Atlas connection string>
   JWT_SECRET=<your secret>
   CLIENT_URL=https://<your-vercel-app>.vercel.app
   ```
6. Deploy → copy the Render URL (e.g. `https://cgpa-api.onrender.com`)

> Note: Render free tier spins down after inactivity. For a always-on backend, consider Railway ($5/mo) or Fly.io.

---

### Step 3 — Deploy Frontend on Vercel (Free)

1. Go to https://vercel.com → New Project → Import your GitHub repo
2. Settings:
   - **Root directory**: `client`
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
3. Add environment variable:
   ```
   VITE_API_URL=https://<your-render-url>/api
   ```
4. Deploy → your app is live at `https://<your-app>.vercel.app`

---

### Alternative: Railway (better for resume — one platform)

Railway lets you deploy both frontend and backend + a MongoDB instance on one platform.

1. Go to https://railway.app
2. New project → Deploy from GitHub
3. Add a **MongoDB** plugin (free $5 credit/mo)
4. Set the same env vars as above
5. Railway gives you a single dashboard for everything — looks great on a portfolio

---

## Project Structure

```
cgpa-calculator/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Layout, reusable UI
│   │   ├── context/         # AuthContext (JWT state)
│   │   ├── pages/           # Dashboard, Semesters, CurrentSem, Target, Profile
│   │   └── utils/           # api.js (axios), cgpa.js (all calculations)
│   └── vite.config.js
├── server/                  # Express backend
│   ├── controllers/         # Auth, Semester, Subject logic
│   ├── middleware/          # JWT protect middleware
│   ├── models/              # User, Semester, Subject schemas
│   ├── routes/              # auth, semesters, subjects
│   └── index.js
└── package.json             # Root scripts (concurrently)
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/profile` | Update name/college/targetCGPA |

### Semesters (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/semesters` | Get all past semesters |
| POST | `/api/semesters` | Add a semester |
| PATCH | `/api/semesters/:id` | Update a semester |
| DELETE | `/api/semesters/:id` | Delete a semester |

### Subjects (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | Get all subjects |
| POST | `/api/subjects/save` | Bulk save subjects for a semester |
| DELETE | `/api/subjects/:id` | Delete a subject |

---

## Resume Highlights

- **MERN Stack**: MongoDB, Express, React, Node.js
- **JWT Authentication**: Secure stateless auth with bcrypt password hashing
- **RESTful API**: Clean resource-based API design
- **React best practices**: Context API, React Hook Form, protected routes
- **Data visualization**: Recharts for GPA trend graphs
- **Deployed**: Vercel + Render + MongoDB Atlas (production-grade free tier stack)
