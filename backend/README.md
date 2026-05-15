# 🤖 AI-Powered Recruitment Automation Platform

A production-grade FastAPI backend that automates the entire job-hunting lifecycle — from resume parsing to auto-filling applications using Playwright.

---

## 📋 Feature Map

| # | Feature | Endpoint(s) |
|---|---------|-------------|
| 1 | JWT Authentication | `POST /auth/register` · `POST /auth/login` · `GET /auth/me` |
| 2 | Resume Upload + AI Parse | `POST /resume/upload` · `GET /resume/{id}` |
| 3 | User Profile Management | `GET /profile` · `PUT /profile` · `POST /profile/skills` |
| 4 | Job Discovery | `GET /jobs` · `GET /jobs/search` |
| 5 | Save / Bookmark Jobs | `POST /jobs/save` · `GET /jobs/saved` |
| 6 | AI Job Recommendations | `GET /jobs/recommendations` |
| 7 | AI Resume Customiser | `POST /ai/customize-resume` |
| 8 | AI Email Generator | `POST /ai/generate-email` |
| 9 | AI Study Plan | `POST /ai/study-plan` |
| 10 | Mock Interview Chatbot | `POST /interview/questions` · `POST /interview/evaluate` |
| 11 | Playwright Auto-Apply | `POST /automation/auto-apply` |
| 12 | Reminder Scheduler | `POST /scheduler/reminder` · `DELETE /scheduler/reminder/{id}` |

---

## 🏗 Project Structure

```
backend/
├── app/
│   ├── main.py                   # App factory + lifespan hooks
│   ├── config/
│   │   └── settings.py           # Pydantic Settings (env vars)
│   ├── database/
│   │   └── connection.py         # Motor + Beanie initialisation
│   ├── models/                   # Beanie ODM documents
│   │   ├── user.py
│   │   ├── profile.py
│   │   ├── resume.py
│   │   ├── job.py
│   │   ├── interview.py
│   │   ├── study_plan.py
│   │   └── reminder.py
│   ├── schemas/                  # Pydantic request/response models
│   │   ├── auth.py
│   │   ├── profile.py
│   │   ├── resume.py
│   │   ├── job.py
│   │   └── ai.py
│   ├── routes/                   # FastAPI routers
│   │   ├── __init__.py           # Master router aggregator
│   │   ├── auth.py
│   │   ├── resume.py
│   │   ├── profile.py
│   │   ├── jobs.py
│   │   ├── ai_routes.py
│   │   ├── interview.py
│   │   ├── automation.py
│   │   └── scheduler.py
│   ├── services/                 # Business logic layer
│   │   ├── auth_service.py
│   │   ├── resume_service.py
│   │   ├── profile_service.py
│   │   ├── job_service.py
│   │   ├── interview_service.py
│   │   └── study_plan_service.py
│   ├── ai/
│   │   ├── gemini_client.py      # Singleton Gemini SDK wrapper
│   │   ├── gemini_service.py     # High-level AI feature functions
│   │   └── prompts.py            # Modular prompt templates
│   ├── automation/
│   │   ├── browser.py            # Playwright browser lifecycle
│   │   ├── form_filler.py        # Smart form-fill helpers
│   │   └── auto_apply.py         # End-to-end apply orchestrator
│   ├── scheduler/
│   │   └── reminder_scheduler.py # APScheduler integration
│   ├── resume_parser/
│   │   └── extractor.py          # pdfplumber + python-docx
│   ├── middleware/
│   │   └── error_handler.py      # Global exception handlers
│   ├── core/
│   │   ├── security.py           # bcrypt + JWT helpers
│   │   └── dependencies.py       # FastAPI dependency injections
│   └── utils/
│       └── helpers.py            # Shared utilities
├── uploads/                      # Uploaded resume files (gitignored)
├── logs/                         # Log files (gitignored)
├── requirements.txt
├── .env.example
└── README.md
```

---

## ⚡ Quick Start

### 1 — Prerequisites

- Python 3.11+
- MongoDB Atlas cluster (or local MongoDB 6+)
- Google Gemini API key
- (Optional) JSearch RapidAPI key for job search

### 2 — Clone & Install

```bash
git clone <repo-url>
cd backend

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Install Playwright browser
playwright install chromium
```

### 3 — Configure Environment

```bash
cp .env.example .env
# Edit .env with your real credentials
```

Required values in `.env`:

| Variable | Description |
|----------|-------------|
| `MONGODB_URL` | MongoDB Atlas connection string |
| `SECRET_KEY` | JWT signing secret (≥32 chars) |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `JSEARCH_API_KEY` | RapidAPI key for JSearch (optional) |

### 4 — Run the Server

```bash
# Development (auto-reload)
uvicorn app.main:app --reload --port 8000

# Or directly
python -m app.main
```

### 5 — Open API Docs

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/health

---

## 🔑 Authentication Flow

```bash
# 1. Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Jane Doe","email":"jane@example.com","password":"Str0ngP@ss"}'

# 2. Login → get access_token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Str0ngP@ss"}'

# 3. Use token in subsequent requests
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer <access_token>"
```

---

## 📤 Resume Upload

```bash
curl -X POST http://localhost:8000/resume/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/resume.pdf"
```

---

## 🤖 AI Features

### Customise Resume for a Job

```bash
curl -X POST http://localhost:8000/ai/customize-resume \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "We are looking for a senior Python developer...",
    "resume_id": "<your_resume_id>"
  }'
```

### Generate Application Email

```bash
curl -X POST http://localhost:8000/ai/generate-email \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email_type": "application",
    "job_title": "Senior Backend Engineer",
    "company_name": "TechCorp"
  }'
```

### Start Mock Interview

```bash
# Step 1: Generate questions
curl -X POST http://localhost:8000/interview/questions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"job_title":"Backend Engineer","interview_type":"technical","num_questions":5}'

# Step 2: Submit + evaluate an answer
curl -X POST http://localhost:8000/interview/evaluate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "<session_id_from_step1>",
    "question_index": 0,
    "answer": "I would use a message queue to decouple the services..."
  }'
```

---

## 🎭 Playwright Auto-Apply

```bash
curl -X POST "http://localhost:8000/automation/auto-apply?submit=false" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_url": "https://example.com/jobs/apply/12345",
    "resume_id": "<resume_id>",
    "cover_letter": "Dear Hiring Manager..."
  }'
```

Set `?submit=true` to actually click the Submit button.

---

## 🔒 Security Notes

- All passwords are bcrypt-hashed (cost factor 12)
- JWTs expire after 24 hours (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- CORS is restricted to `ALLOWED_ORIGINS`
- File uploads are validated for type and size
- The auto-apply endpoint defaults to **safe mode** (no submit) to prevent accidents

---

## 🧩 Extending the Platform

### Add a new AI prompt
Edit `app/ai/prompts.py` and add a new function in `app/ai/gemini_service.py`.

### Add a new automation script
Add a new module under `app/automation/` and call `BrowserManager.page_session()`.

### Add email notifications for reminders
Edit `_fire_reminder()` in `app/scheduler/reminder_scheduler.py` — add SMTP or
SendGrid calls there.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI 0.111 |
| Database | MongoDB Atlas (Motor + Beanie ODM) |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| AI | Google Gemini 1.5 Flash |
| Automation | Playwright (Chromium) |
| Scheduling | APScheduler (AsyncIO) |
| Resume Parsing | pdfplumber + python-docx |
| Validation | Pydantic v2 |
| Logging | Loguru |
| HTTP Client | httpx + aiohttp |
