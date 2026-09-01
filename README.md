# REHABAI PRO
### AI-Powered Rehabilitation Intelligence Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688.svg)](https://fastapi.tiangolo.com/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose%2033--Point-orange.svg)](https://developers.google.com/mediapipe)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Spatial-black.svg)](https://threejs.org/)
[![Status](https://img.shields.io/badge/Status-Production%20Prototype-success.svg)]()

> **CLINICAL SAFETY DISCLAIMER**: RehabAI Pro is an AI-assisted movement analysis and rehabilitation logging software platform designed to assist physiotherapists and patients with exercise adherence and kinematic estimation. It does **NOT** provide medical diagnoses or replace evaluation by a licensed healthcare professional.

---

## 1. Project Overview & Architecture

RehabAI Pro combines on-device monocular computer vision, biomechanical vector geometry, automated repetition state machine counting, bilateral symmetry analysis, range-of-motion (ROM) monitoring, and context-aware clinical coaching from **Nova** into a macOS/VisionPro-inspired spatial interface.

```
                  ┌───────────────────────────────────────────────────────────┐
                  │                      USER / WEBCAM                        │
                  └─────────────────────────────┬─────────────────────────────┘
                                                │
                                                ▼
                  ┌───────────────────────────────────────────────────────────┐
                  │            MediaPipe Pose Landmarker (33 Pts)             │
                  └─────────────────────────────┬─────────────────────────────┘
                                                │
                                                ▼
                  ┌───────────────────────────────────────────────────────────┐
                  │        Vector Trigonometry Joint Angle Engine (10 Joints) │
                  └──────┬──────────────────────┬──────────────────────┬──────┘
                         │                      │                      │
                         ▼                      ▼                      ▼
        ┌─────────────────────────┐ ┌──────────────────────┐ ┌────────────────────────┐
        │ Repetition State Machine│ │  Bilateral Symmetry  │ │ Range of Motion Engine │
        │ (REST/ECC/INF/CON/DONE) │ │  (Δ Degrees & %)     │ │ (Min / Max / Peak ROM) │
        └────────────┬────────────┘ └──────────┬───────────┘ └───────────┬────────────┘
                     │                         │                         │
                     └──────────────────┬──────┴─────────────────────────┘
                                        ▼
                  ┌───────────────────────────────────────────────────────────┐
                  │          Composite Movement Quality Engine (0-100%)       │
                  └─────────────────────┬─────────────────────────────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
        ┌────────────────────────────────┐ ┌──────────────────────────────────────────┐
        │   Live UI HUD & Audio Coach    │ │  FastAPI Backend / SQLite & PostgreSQL   │
        └────────────────────────────────┘ └───────────────────┬──────────────────────┘
                                                               │
                                                               ▼
                                           ┌──────────────────────────────────────────┐
                                           │  Nova AI Assistant & PDF Report Service  │
                                           └──────────────────────────────────────────┘
```

---

## 2. Complete Project Directory Structure

```
rehabai-pro/
├── .env.example                     # Environment configuration template
├── docker-compose.yml               # Multi-container full-stack orchestration
├── Dockerfile                       # Frontend production container
├── package.json                     # Frontend dependencies & scripts
├── vite.config.ts                   # Vite bundler & backend proxy config
├── tailwind.config.js               # Glassmorphism & spatial design system
├── tsconfig.json                    # TypeScript strict compiler options
├── index.html                       # HTML5 mount template & fonts
├── run-dev.bat                      # Windows 1-click startup script
│
├── backend/
│   ├── Dockerfile                   # Backend container definition
│   ├── requirements.txt             # Python dependencies
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry point & CORS
│   │   ├── api/
│   │   │   ├── auth.py              # JWT authentication & RBAC
│   │   │   ├── patients.py          # Patient records CRUD & filters
│   │   │   ├── exercises.py         # 10 clinical exercise protocols
│   │   │   ├── plans.py             # Rehabilitation plan manager
│   │   │   ├── sessions.py          # Session recording & rep-by-rep data
│   │   │   ├── chat.py              # Nova AI clinical coach endpoints
│   │   │   ├── reports.py           # Clinical PDF generation & export
│   │   │   ├── progress.py          # Multi-range trend aggregation
│   │   │   └── notifications.py     # System notifications center
│   │   ├── db/
│   │   │   ├── database.py          # SQLAlchemy SQLite / Postgres engine
│   │   │   ├── models.py            # Relational database models
│   │   │   └── seed.py              # Realistic clinical seed generator
│   │   ├── schemas/                 # Pydantic validation models
│   │   └── services/
│   │       ├── ai_service.py        # Gemini GenAI + clinical rule engine
│   │       └── report_service.py    # ReportLab PDF report builder
│   └── tests/
│       └── test_api.py              # Backend unit tests
│
└── src/
    ├── main.tsx                     # React root mount
    ├── App.tsx                      # App layout & 12-page router
    ├── index.css                    # Glassmorphism, 3D perspectives, theme
    ├── types/
    │   └── index.ts                 # Complete TypeScript interfaces
    ├── data/
    │   ├── exercisesData.ts         # 10 clinical exercise definitions
    │   └── initialData.ts           # Rich offline/demo mock dataset
    ├── context/
    │   ├── AuthContext.tsx          # Role switching & active patient
    │   └── SessionContext.tsx       # Live CV exercise session state
    ├── services/
    │   ├── api.ts                   # Unified API client + demo mode resilience
    │   └── poseService.ts           # MediaPipe Pose loader & canvas skeleton
    ├── utils/
    │   ├── angles.ts                # 3D vector geometry joint angle math
    │   ├── repCounter.ts            # Hysteresis repetition state machine
    │   ├── symmetry.ts              # Bilateral asymmetry engine
    │   ├── scoring.ts               # Composite quality calculation
    │   └── audioCoach.ts            # Web Speech API real-time voice cues
    ├── components/
    │   ├── 3d/
    │   │   ├── NovaOrb3D.tsx        # 3D WebGL glowing AI orb with states
    │   │   ├── ExerciseModelViewer3D.tsx # 3D animated anatomical mannequin
    │   │   └── LivePose3D.tsx       # Rotatable 3D spatial skeleton space
    │   ├── ai/
    │   │   └── GlobalNovaWidget.tsx # Floating bottom-right 3D Nova assistant
    │   ├── common/
    │   │   ├── GlassCard.tsx        # Translucent glass panel
    │   │   ├── Badge.tsx            # Status and telemetry tags
    │   │   ├── MetricCard.tsx       # Biomechanical metric widgets
    │   │   └── DisclaimerBanner.tsx # Non-diagnostic clinical notice
    │   └── layout/
    │       ├── Sidebar.tsx          # 12-item navigation & live system badges
    │       └── Header.tsx           # Topbar with patient/role switcher
    └── pages/
        ├── Dashboard.tsx            # Analytics overview (NO camera)
        ├── LiveAnalysis.tsx         # Computer vision workspace with camera
        ├── ExerciseLibrary.tsx      # 10 exercises with 3D model previews
        ├── PatientProfile.tsx       # Patient demographics & recovery record
        ├── RehabilitationPlan.tsx   # Prescribed protocol builder
        ├── AICoach.tsx              # Nova AI dedicated chat page
        ├── Progress.tsx             # 7d/30d/90d/all interactive charts
        ├── Sessions.tsx             # Completed session logs
        ├── SessionDetail.tsx        # Rep-by-rep telemetry deep dive
        ├── Reports.tsx              # Clinical PDF generator & preview
        ├── TherapistDashboard.tsx   # Clinician patient stratification
        ├── Settings.tsx             # Voice, camera & threshold settings
        ├── AboutSafety.tsx          # Safety framework & vision pipeline
        └── Auth.tsx                 # Login, register & demo quick switch
```

---

## 3. Quick Start Guide

### Prerequisites
- **Node.js**: v18.0 or higher
- **Python**: v3.10 or higher
- **Webcam**: Standard built-in or USB camera

### Step 1: Install Frontend Dependencies
```bash
npm install
```

### Step 2: Install Backend Dependencies
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS / Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### Step 3: Run the Application

**Option A: 1-Click Launch (Windows)**
Double click `run-dev.bat` or run:
```bat
run-dev.bat
```

**Option B: Separate Terminals**

Terminal 1 (Backend FastAPI):
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

Terminal 2 (Frontend React):
```bash
npm run dev
```

Open your browser to:
- **Frontend Application**: `http://localhost:5173`
- **Interactive Backend API Docs (Swagger)**: `http://localhost:8000/api/docs`

---

## 4. Demo Credentials & One-Click Login

RehabAI Pro includes pre-seeded accounts:

| Role | Email | Password | Pre-loaded Data |
|---|---|---|---|
| **Therapist (Clinician)** | `therapist@rehabai.io` | `password123` | Dr. Marcus Reynolds, DPT (5 patients, active clinic) |
| **Patient** | `patient@rehabai.io` | `password123` | Eleanor Vance (Post-op ACL, 8 past sessions) |
| **Administrator** | `admin@rehabai.io` | `password123` | Alex Rivera |

*(Tip: On the Auth screen or Topbar, you can switch roles with a single click).*

---

## 5. Enabling AI Chatbot (Google Gemini API)

RehabAI Pro works **100% out-of-the-box in Demo / Offline Mode** with an intelligent clinical rule engine. To enable real-time Gemini LLM reasoning for Nova:

1. Obtain an API Key from [Google AI Studio](https://aistudio.google.com/).
2. Open your `.env` file or set environment variable:
```env
AI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-2.5-flash
```
3. Restart the backend. Nova will automatically utilize Gemini with structured patient and session context injection!

---

## 6. Enabling PostgreSQL & Docker Deployment

To run with PostgreSQL instead of default SQLite:

```bash
docker-compose up --build
```
This boots:
- `rehabai-postgres`: PostgreSQL 16 on port `5432`
- `rehabai-backend`: FastAPI on port `8000`
- `rehabai-frontend`: Nginx + React on port `5173`

---

## 7. Computer Vision & Repetition Testing Guide

1. Navigate to **Live Analysis** from the sidebar.
2. Click **Start Camera** and grant browser webcam permissions.
3. Step back **2.5 to 3 meters** so your hips, knees, and feet are visible.
4. Select **Squat Rehabilitation** (or any of the 10 exercises).
5. Perform a controlled squat:
   - **Descent (Eccentric)**: Knees bend past 120°.
   - **Bottom (Inflection)**: Reach ~90–100° flexion.
   - **Ascent (Concentric)**: Drive through heels to full standing lockout.
6. The repetition counter will cleanly increment with audible voice encouragement (`"1, great form!"`), computing real-time symmetry and peak ROM.
7. Click **Save & Complete Session** to persist the session and view the rep-by-rep audit!

---

## 8. Clinical Limitations & Disclosures

- **Lighting & Occlusion**: Accurate landmark detection requires adequate ambient lighting and an unobstructed view of the target joints.
- **Monocular Depth**: 3D joint angles are calculated via normalized monocular landmark projection. Slight variances may occur if camera positioning deviates significantly from the recommended 45° or front angles.
- **Non-Diagnostic Scope**: All scores and advisories are algorithmic estimates designed for patient engagement and kinematic logging.
