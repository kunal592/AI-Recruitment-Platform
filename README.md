# HireAI: AI-Powered Recruitment & Job Automation Platform

HireAI is a full-stack job automation platform designed to streamline the career search process. It uses Gemini AI to tailor resumes, draft personalized cover emails, generate interview roadmaps, and track job applications in real-time.

---

## 🚀 Key Features

### 🧠 AI Power Tools
- **ATS Resume Tailoring**: Instantly optimize your resume for specific job descriptions.
- **Smart Cover Emails**: Generate professional, context-aware outreach emails for recruiters.
- **AI Study Plans**: Get a 30-day personalized learning roadmap for any target role.
- **Resume Parsing**: Upload your PDF/DOCX and let Gemini AI extract your skills and experience into your profile.

### 💼 Job Discovery & Tracking
- **Multi-Source Job Search**: Real-time listings from JSearch (RapidAPI) and RemoteOK.
- **Skill-Based Recommendations**: Proprietary matching engine scores jobs based on your unique profile.
- **Application Tracker**: Manage your pipeline with statuses like "Applied", "Interviewing", and "Offer Received".
- **Manual Entries**: Track applications made outside the platform.

### 🎨 Modern Experience
- **Dynamic Theming**: Smooth transition between Light and Dark modes.
- **Premium UI**: Built with Tailwind CSS v4, Framer Motion, and Lucide icons for a state-of-the-art feel.
- **Interactive Dashboards**: Visualize your progress with Recharts.

---

## 🛠 Tech Stack

**Backend:**
- **FastAPI**: High-performance Python web framework.
- **MongoDB (Beanie ODM)**: Document database for flexible data modeling.
- **Gemini AI SDK**: Integration with Google's state-of-the-art LLMs.
- **Pydantic**: Data validation and settings management.

**Frontend:**
- **React 19**: Modern component-based architecture.
- **Redux Toolkit**: Centralized state management for auth, jobs, and AI results.
- **Tailwind CSS v4**: Advanced styling with class-based dark mode.
- **Framer Motion**: Smooth micro-animations and page transitions.
- **Vite**: Ultra-fast build tool.

---

## ⚙️ Environment Setup

Create a `.env` file in the **backend** directory.

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=hireai_db

# Security
SECRET_KEY=your_super_secret_random_key_here
ALGORITHM=HS256

# AI Configuration (REQUIRED for Power Tools)
GEMINI_API_KEY=your_google_gemini_api_key

# External Job APIs (Optional but Recommended)
JSEARCH_API_KEY=your_rapidapi_jsearch_key

# App Settings
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 📦 Installation & Running

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** (Running locally or via Atlas)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
# In the project root
npm install
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## 📂 Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── config/      # Settings & ENV mapping
│   │   ├── core/        # Security & Auth logic
│   │   ├── models/      # MongoDB (Beanie) documents
│   │   ├── routes/      # API Endpoints (Auth, Jobs, AI, Profile)
│   │   ├── schemas/     # Pydantic request/response models
│   │   └── services/    # Business logic & AI Integrations
│   └── main.py          # App entry point
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/         # Theme & Global context
│   ├── layouts/         # Page wrappers (DashboardLayout)
│   ├── pages/           # Main views (Dashboard, Jobs, tracker, etc.)
│   ├── redux/           # Global state management
│   └── services/        # Frontend API clients (Axios)
└── public/              # Static assets
```

---

## 🔧 Troubleshooting

- **Theme issues?** Make sure `index.css` has the `@variant dark` override to prevent OS settings from forcing dark mode in light theme.
- **AI Tools not working?** Verify your `GEMINI_API_KEY` is active and has credits.
- **Stats showing 0?** Statistics are based on your **Applications** and **Profile Skills**. Complete your profile to see real-time ATS scores!

---

Developed with ❤️ for the future of hiring.
