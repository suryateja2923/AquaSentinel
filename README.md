# AquaSentinel / WetlandWatch AI

District-level satellite earth observation monitor and evidence platform for wetlands and water bodies.

---

## 📁 Repository Structure

```
final round hackthon/
├── frontend/                     # React application
│   ├── public/                   # Public assets (icons, manifest, index.html)
│   ├── src/
│   │   ├── components/           # UI panels, Landing, Login, Map, AdminConsole
│   │   ├── config/               # Authorized users & roles config
│   │   ├── data/                 # Wetland preserves, satellite layers & data
│   │   ├── lib/
│   │   │   ├── api.js            # FastAPI integration client with Firebase bearer tokens
│   │   │   ├── auth.js           # Email/Password auth & role resolution helpers
│   │   │   └── firebase.js       # Production Firebase SDK initialization
│   │   ├── services/             # DB & GPS location services
│   │   ├── App.js                # Main application component & routes
│   │   ├── index.css             # Tailwind-style CSS & survey design tokens
│   │   └── index.js              # Entrypoint
│   ├── .env                      # Production & local environment variables
│   ├── .env.example
│   ├── package.json
│   └── vercel.json               # Zero-config Vercel frontend deployment
│
├── backend/                      # FastAPI Python backend
│   ├── main.py                   # FastAPI with CORS, Firebase Admin token verification & routes
│   ├── set_role.py               # Administrative custom claims & roles assignment script
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # Container deployment for Google Cloud Run
│   ├── .env                      # Backend environment variables
│   └── .env.example
│
├── firebase.json                 # Firebase Hosting & Firestore deployment configuration
├── firestore.rules               # Role-based Firestore security rules (Admin, Government Officer)
├── vercel.json                   # Root-level Vercel monorepo configuration
└── README.md
```

---

## 🔐 Credentials & Role Configuration

### Pre-Configured Users:
| Role | Email | Passcode / Password | Designation |
|---|---|---|---|
| **Master Admin** | `chsuryachowdary12@gmail.com` | `admin@2026` / `surya` | Portal Administrator (Level 5) |
| **Government Officer** | `chilimursharma@gmail.com` | `sharma` | Authorized Government Officer (Level 4) |

*You can also register any new official email and password directly on the site!*

---

## 🚀 Running Locally

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv .venv
# Windows:
.\.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```
Backend health check: [http://localhost:8080/health](http://localhost:8080/health)

### 2. Frontend (React)
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```
Frontend will be live at: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment

### 1. Frontend to Vercel (Zero-Config)
1. Push to your GitHub repository:
   ```bash
   git push origin main
   ```
2. In [Vercel Dashboard](https://vercel.com):
   - Click **Add New Project** → Import your repository `AquaSentinel`.
   - Set Root Directory to `frontend`.
   - Add Environment Variables:
     - `VITE_FIREBASE_API_KEY`: `AIzaSyAMfX6b8HFV_kjriE8222hQYD7xUcXSLUE`
     - `VITE_FIREBASE_PROJECT_ID`: `astra-database-f9830`
     - `VITE_API_BASE_URL`: Your backend URL (e.g. Cloud Run URL)
   - Click **Deploy**!

### 2. Frontend to Firebase Hosting
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```
Live URL: [https://astra-database-f9830.web.app](https://astra-database-f9830.web.app)

### 3. Deploy Backend to Google Cloud Run
```bash
cd backend
gcloud run deploy wetlandwatch-api \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars FIREBASE_PROJECT_ID=astra-database-f9830,FRONTEND_ORIGINS=https://astra-database-f9830.web.app
```
Copy the generated Cloud Run URL and set `VITE_API_BASE_URL` in `frontend/.env`.

---

## 🛡️ Assigning Roles with `set_role.py`
To update custom claims directly on Firebase accounts:
```bash
cd backend
python set_role.py chsuryachowdary12@gmail.com admin
python set_role.py chilimursharma@gmail.com government_officer
```
