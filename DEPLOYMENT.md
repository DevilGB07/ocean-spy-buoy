# Deployment Guide: OCEAN SPY-BUOY

This guide explains how to push **OCEAN SPY-BUOY** to GitHub/GitLab and deploy it to cloud platforms.

---

## 1. Push to GitHub / Remote Repository

The local git repository has been initialized with the `main` branch and clean commits.

### Step 1: Create a Repository on GitHub
1. Go to [https://github.com/new](https://github.com/new).
2. Name the repository: `ocean-spy-buoy`
3. Choose **Public** or **Private**.
4. Do **NOT** initialize with a README, `.gitignore`, or license (these already exist locally).
5. Click **Create repository**.

### Step 2: Push Local Code to GitHub
Run the following commands in your terminal:
```bash
cd "c:\Gaurav\projects\Appointment_Booking_App\OCEAN SPY-BUOY"

# Add your GitHub repository as remote
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/ocean-spy-buoy.git

# Push the main branch
git push -u origin main
```

---

## 2. One-Click Cloud Deployment (Render.com)

The system supports **Unified Single-Port Deployment** where FastAPI serves both the REST API, WebSockets, and the compiled React frontend application.

### Deploy on Render (Free Tier):
1. Sign in to [Render.com](https://render.com).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your `ocean-spy-buoy` GitHub repository.
4. Configure the service settings:
   - **Name:** `ocean-spy-buoy`
   - **Region:** Any (e.g., Oregon, Frankfurt, Singapore)
   - **Branch:** `main`
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r backend/requirements.txt && cd frontend && npm install && npm run build && cd ..
     ```
   - **Start Command:**
     ```bash
     uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Environment Variables:**
     - `MODE`: `SIMULATION`
5. Click **Create Web Service**.
Your dashboard will be live at `https://ocean-spy-buoy.onrender.com`!

---

## 3. Docker Deployment

### Run Locally with Docker Compose:
```bash
docker-compose up --build
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API & Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 4. Railway / Fly.io Deployment

### Railway:
1. Go to [Railway.app](https://railway.app).
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select `ocean-spy-buoy`.
4. Railway will automatically detect the Dockerfile or Python runtime and deploy the service.
