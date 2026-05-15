# HireAI: AI-Powered Recruitment Automation Platform
> **Powered by [KDX Labs](https://www.kdxlabs.cloud)**

HireAI is a comprehensive full-stack platform designed to automate the entire job hunt lifecycle. From parsing resumes and generating personalised study plans to tracking applications and preparing for interviews, HireAI leverages cutting-edge AI to give candidates a competitive edge.

![HireAI Dashboard](public/favicon.svg) <!-- Replace with a real screenshot later -->

## 🚀 Key Features

### 🧠 AI-Powered Intelligence
- **Resume AI Parser**: Instantly extract structured data (skills, experience, education) from PDF/DOCX resumes using Google Gemini AI.
- **Smart Recommendations**: Skill-based job matching with detailed gap analysis and "match scores."
- **Personalised Study Plans**: AI-generated day-by-day learning roadmaps to bridge the gap between your current skills and your dream role.
- **Mock Interview Chatbot**: Interactive technical and behavioral interview preparation with real-time feedback and scoring.

### 💼 Job Hunt Automation
- **Application Tracker**: Centralised dashboard for managing both automated and manual job applications with status tracking (Applied, Interviewing, Offer, etc.).
- **ATS Optimiser**: Customise your resume for specific job descriptions to rank higher in Applicant Tracking Systems.
- **Auto-Apply (Beta)**: Headless browser automation using Playwright to fill out application forms across multiple job boards.

### 🎨 Modern Experience
- **Premium UI/UX**: A sleek, high-performance interface built with React and Tailwind-inspired custom CSS.
- **Dark Mode**: Fully immersive dark mode support with persistent user preferences.
* **Real-time Sync**: Bi-directional synchronization between your parsed resume and your professional profile.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Vanilla CSS + Tailwind Utility Classes
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: MongoDB (Motor + Beanie ODM)
- **AI Engine**: Google Gemini Pro (via Generative AI SDK)
- **Automation**: Playwright (Headless Browser)
- **Scheduling**: APScheduler

## 📥 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB (Local or Atlas)
- Gemini API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kunal592/AI-Recruitment-Platform.git
   cd AI-Recruitment-Platform
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env and add your MONGODB_URL and GEMINI_API_KEY
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup**:
   ```bash
   # From the root directory
   npm install
   cp .env.example .env
   npm run dev
   ```

## 📝 Environment Variables

### Backend (`backend/.env`)
- `MONGODB_URL`: Your MongoDB connection string.
- `GEMINI_API_KEY`: Your Google AI Studio API key.
- `SECRET_KEY`: Random string for JWT encryption.

### Frontend (`.env`)
- `VITE_API_URL`: Backend API URL (default: `http://localhost:8000`)

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
