# RehabAI Pro

### AI-Powered Rehabilitation Intelligence Platform

[\TypeScript\](https://www.typescriptlang.org/) · [\React\](https://reactjs.org/) · [\FastAPI\](https://fastapi.tiangolo.com/) · [\Vite\](https://vitejs.dev/) · [\Vercel\](https://vercel.com)

---

## ?? Clinical Disclaimer

**RehabAI Pro is an AI-assisted movement analysis and rehabilitation logging software platform designed to assist physiotherapists and patients with exercise adherence and kinematic estimation. It does NOT provide medical diagnoses or replace evaluation by a licensed healthcare professional.**

---

## ?? Features

- **Webcam-Based Exercise Analysis** - Uses MediaPipe's 33-point pose detection for real-time form analysis
- **AI Clinical Coach** - Nova, an intelligent coaching engine providing contextual feedback
- **Bilateral Symmetry Analysis** - Compares left/right side movement patterns
- **Range of Motion Tracking** - Monitors ROM progress over time
- **Repetition Counting** - Automatic rep detection using movement state machines
- **Session Management** - Logs detailed exercise sessions with metrics
- **Rehabilitation Plans** - Patient-specific exercise programs
- **Progress Reports** - Clinical-grade PDF reports with analytics
- **Patient Dashboard** - Multi-patient management for therapists
- **Real-Time 3D Visualization** - Three.js based 3D pose rendering

---

## ??? Technology Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.7** - Type safety
- **Vite 6.0** - Build tool and dev server
- **Tailwind CSS 3.4** - Styling
- **Three.js 0.170** - 3D graphics
- **Recharts 2.15** - Data visualization
- **MediaPipe** - Pose detection (via browser API)

### Backend
- **FastAPI 0.110** - Modern Python web framework
- **SQLAlchemy 2.0** - ORM
- **Pydantic 2.6** - Data validation
- **Python-Jose** - JWT authentication
- **Google Generative AI** - LLM integration (Nova coach)
- **ReportLab** - PDF generation

### Deployment
- **Vercel** - Serverless hosting (frontend + API)
- **SQLite** - Default database
- **PostgreSQL** - Optional for persistent storage

---

## ?? Vercel Deployment (Recommended)

### Quick Start
1. Push this repository to GitHub
2. Go to https://vercel.com/new
3. Import this GitHub repository
4. Vercel will automatically configure and deploy
5. Your app will be live in < 1 minute

### How It Works
- **Frontend:** Built as static Vite app, served globally by Vercel CDN
- **Backend:** FastAPI runs as serverless Python functions at /api/*
- **Database:** SQLite by default (ephemeral) or connect PostgreSQL for persistence
- **Single Deployment:** One GitHub push deploys everything

### Environment Variables (Optional)
Set in Vercel Dashboard ? Settings ? Environment Variables:

\\\env
AI_API_KEY=your_google_genai_key
AI_MODEL=gemini-2.5-flash
JWT_SECRET=your-secure-random-string
DATABASE_URL=postgresql://... (if using PostgreSQL)
\\\

**Note:** If not set, defaults are used. The app works without these.

---

## ?? Local Development

### Prerequisites
- Node.js 18+
- Python 3.9+
- Git

### Setup

\\\ash
# 1. Clone repository
git clone https://github.com/Naveenrajdevops/rehev.git
cd rehev

# 2. Install dependencies
npm install
pip install -r requirements.txt

# 3. Copy environment template
cp .env.example .env
\\\

### Running the App

**Option 1: Frontend Only (Demo Mode)**
- API calls fall back to mock data
\\\ash
npm run dev
# Open http://localhost:5173
\\\

**Option 2: Frontend + Backend (Full Stack)**

Terminal 1 - Backend:
\\\ash
cd backend
python -m uvicorn app.main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/api/docs
\\\

Terminal 2 - Frontend:
\\\ash
npm run dev
# Open http://localhost:5173
# Frontend proxies /api to localhost:8000
\\\

**Option 3: Docker Compose**
\\\ash
docker-compose up
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
\\\

### Building for Production
\\\ash
npm run build
# Output: dist/ folder (ready for Vercel or any static host)
\\\

---

## ?? Project Structure

\\\
rehev/
+-- api/                          # Vercel serverless handler
¦   +-- index.py                 # FastAPI app entry point
+-- src/                          # Frontend (React + TypeScript)
¦   +-- components/
¦   ¦   +-- 3d/                  # 3D visualization
¦   ¦   +-- ai/                  # AI coach components
¦   ¦   +-- common/              # Reusable components
¦   ¦   +-- layout/
¦   +-- pages/                   # Page components
¦   +-- services/                # API client
¦   +-- types/                   # TypeScript types
¦   +-- utils/                   # Utility functions
¦   +-- main.tsx
+-- backend/                      # FastAPI Backend
¦   +-- app/
¦   ¦   +-- main.py
¦   ¦   +-- api/                 # Route handlers
¦   ¦   +-- db/                  # Database layer
¦   ¦   +-- schemas/
¦   +-- requirements.txt
+-- vercel.json                  # Vercel configuration
+-- vite.config.ts              # Vite configuration
+-- package.json
+-- requirements.txt            # Python dependencies (root)
+-- .env.example
+-- README.md
\\\

---

## ?? Security

### Environment Variables
- **Never commit** \.env\ files with real values
- **Always commit** \.env.example\ (template only)
- On Vercel, set secrets in Dashboard ? Environment Variables

### What's Automatically Excluded
- \.env\ files (actual secrets)
- \
ode_modules/\, \env/\
- \.git/\, \dist/\
- Database files

---

## ?? API Documentation

When running locally or deployed:
- **Swagger UI:** \/api/docs\
- **ReDoc:** \/api/redoc\
- **OpenAPI:** \/api/openapi.json\

### Key Endpoints
\\\
GET  /api/health              # Health check
POST /api/auth/login          # Authentication
GET  /api/patients            # List patients
POST /api/sessions            # Log exercise
GET  /api/exercises           # Exercise library
POST /api/chat                # AI coach
GET  /api/reports             # Generate reports
\\\

---

## ?? Webcam & MediaPipe

### How It Works
1. App requests webcam access
2. MediaPipe detects 33 body keypoints in real-time
3. Angles and metrics calculated locally (no upload)
4. Numerical data sent to backend for storage
5. AI coach provides feedback

### Privacy
- Pose detection runs **100% in browser**
- No video uploaded
- Only pose keypoints sent to server
- Works without internet (local analysis)

### Browser Support
- Chrome/Edge (best)
- Firefox (good)
- Safari 15+

---

## ?? AI Coach (Nova)

### How to Enable
1. Get API key from Google AI Studio (free): https://aistudio.google.com
2. Set \AI_API_KEY\ environment variable (or in Vercel)
3. App will use Claude/Gemini for coaching

### Fallback
- If no API key, app uses mock responses
- All features still work

### Privacy
- Check your LLM provider's data retention policy
- For clinical use, review compliance requirements

---

## ?? Testing Locally

\\\ash
# Check TypeScript
npm run build

# Backend (if running locally)
cd backend
pytest tests/

# Manual testing
npm run dev
# Try: login, add patient, start exercise, check reports
\\\

---

## ?? Database

### SQLite (Default)
- File: \ehabai.db\
- Pros: No setup needed, works everywhere
- Cons: Ephemeral on Vercel (data lost after deploy)

### PostgreSQL (Production)
- Set \DATABASE_URL=postgresql://...\
- Data persists between deployments
- Better for high concurrency

---

## ?? Troubleshooting

| Issue | Solution |
|-------|----------|
| **Webcam permission denied** | Check browser privacy settings, use HTTPS |
| **API returns 404** | Backend not running locally, or Vercel not deployed yet |
| **Build fails** | Run \
pm install\ and check for TypeScript errors |
| **Database errors** | Delete \ehabai.db\ to reset |
| **Vercel deployment failed** | Check build logs in Vercel Dashboard |

---

## ?? Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## ?? License & Attribution

- **MediaPipe** - Pose detection (Google, Apache 2.0)
- **FastAPI** - Backend framework (MIT)
- **React** - UI framework (MIT)
- **Three.js** - 3D graphics (MIT)

---

**Status:** Ready for Vercel Deployment  
**Version:** 1.0.0 (Vercel Edition)  
**Last Updated:** 2026-09-01
