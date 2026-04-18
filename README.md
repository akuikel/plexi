# Plexi — AI Voice Agent Platform

> AI-powered voice assistants that handle your calls, so you don't have to.

---

## What is Plexi?

Plexi is a full-stack AI voice agent platform that lets users make outbound AI phone calls, manage call history, view transcripts, and track all activity from a single dashboard. Built as a Senior Seminar capstone project at Fisk University.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Supabase Auth |
| AI Calls | Vapi AI |
| Backend | Python / FastAPI |
| Database | PostgreSQL (Supabase) |

---

## Features

- Google OAuth + email/password authentication
- Outbound AI phone calls via Vapi
- Dashboard with call management (add, edit, status tracking)
- Transcript editor — add/view call transcripts
- Live voice demo widget on landing page
- Chat interface with AI assistant

---

## Running Locally

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Python 3.10+
- A [Supabase](https://supabase.com) project
- A [Vapi](https://vapi.ai) account

---

### 1. Clone the repo

```bash
git clone https://github.com/akuikel/plexi.git
cd plexi
```

---

### 2. Set up the Next.js frontend

```bash
cd frontend
pnpm install
```

Create a `.env.local` file inside the `frontend/` folder:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_supabase_db_connection_string
DIRECT_URL=your_supabase_direct_connection_string

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
AUTH_SECRET=any_random_32_char_string

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Backend
PERSA_BACKEND_URL=http://localhost:8787

# Vapi
VAPI_PRIVATE_KEY=your_vapi_private_key
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id
```

Start the frontend:

```bash
pnpm dev
```

Frontend runs at **http://localhost:3000**

---

### 3. Set up the Python backend

```bash
cd backend
python -m venv venv

# Mac/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:

```env
PERSA_ENGINE=dummy
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
VAPI_PRIVATE_KEY=your_vapi_private_key
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id
```

Start the backend:

```bash
uvicorn main:app --reload --port 8787
```

Backend runs at **http://localhost:8787**

---

### 4. Open the app

| Page | URL |
|---|---|
| Landing | http://localhost:3000/landing |
| Login | http://localhost:3000/login |
| Dashboard | http://localhost:3000/dashboard |
| Chat | http://localhost:3000/chat |

---

## Project Structure

```
plexi/
├── frontend/               # Next.js app
│   ├── app/                # Pages and API routes
│   ├── components/         # UI components
│   ├── hooks/              # React hooks
│   └── public/             # Static assets
├── backend/                # Python FastAPI server
│   ├── main.py
│   └── requirements.txt
└── src/                    # Original Vite landing page (reference)
```

---

## About

Built at Fisk University as a Senior Seminar capstone project.
