# EduSaaS

EduSaaS is a role-based education management platform built for admins, faculty, students, and parents. The project combines a modern Next.js frontend with a lightweight Express backend to support dashboards, attendance tracking, announcements, fee payments, certificates, live classes, and more.

## Project Overview

The application is organized as a two-part workspace:

- `frontend/` contains the main web application built with Next.js.
- `backend/` contains a small Express API used for backend utilities and health checks.

The frontend provides separate experiences for:

- Admin
- Faculty
- Student
- Parent

Each role has its own dashboard and workflows, with shared data managed through a client-side store.

## Setup Instructions

### Prerequisites

- Node.js 18+ recommended
- npm, pnpm, or yarn
- Razorpay and Zoom credentials if you want to use the payment and meeting integrations

### 1. Install dependencies

```bash
cd frontend
npm install

cd ../backend
npm install
```

### 2. Configure environment variables

Frontend environment variables are documented in `frontend/.env.example`. At minimum, set:

- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `NEXT_PUBLIC_BACKEND_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `TWILIO_SID`
- `TWILIO_TOKEN`
- `TWILIO_WHATSAPP_FROM`
- `ZOOM_S2S_ACCOUNT_ID`
- `ZOOM_S2S_CLIENT_ID`
- `ZOOM_S2S_CLIENT_SECRET`
- `ZOOM_ACCESS_TOKEN` if you want to use a pre-scoped Zoom bearer token instead of S2S credentials
- `ZOOM_HOST_USER_ID`
- `ZOOM_TIMEZONE`

For WhatsApp alerts, the Twilio WhatsApp sandbox or a WhatsApp-enabled Twilio number must be configured. For email alerts, set a verified Resend sender in `RESEND_FROM_EMAIL`.

Set `NEXT_PUBLIC_BACKEND_URL` to the Express backend URL so the student AI study assistant can reach `/api/study-assistant` from the browser. For local development, `http://localhost:5000` is the default.

For the backend, set:

- `PORT` if you want to override the default `5000`
- `FRONTEND_URL` if the frontend is not running on `http://localhost:3000`
- `XAI_API_KEY` for Grok-powered chat in the student AI study assistant
- `GEMINI_API_KEY` for Gemini-powered quiz, flashcards, slides, and source summarization
- Optional: `GROK_MODEL` (default `grok-3-mini`), `GEMINI_MODEL` (default `gemini-2.0-flash`)

Copy `backend/.env.example` to `backend/.env` and add your provider keys. Without keys, the study assistant falls back to demo responses.

### 3. Run the frontend

```bash
cd frontend
npm run dev
```

The app runs on `http://localhost:3000` by default.

### 4. Run the backend

```bash
cd backend
npm run dev
```

The API runs on `http://localhost:5000` by default.

### 5. Deploy the frontend on Netlify

Deploy the `frontend/` folder as the site root.

- Build command: `npm run build`
- Publish directory: `.next`
- Netlify plugin: `@netlify/plugin-nextjs`

Add the frontend environment variables in Netlify's site settings before deploying, especially the Razorpay, Resend, Twilio, and Zoom values listed above.

### 6. Useful scripts

Frontend:

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - start the production server
- `npm run lint` - run ESLint

Backend:

- `npm run dev` - start the API with Nodemon
- `npm start` - start the API with Node.js

## Features Implemented

- Role-based authentication and dashboard routing for admin, faculty, student, and parent users
- Admin dashboard with analytics, operational alerts, and quick actions
- Batch, course, faculty, student, and parent management screens
- Attendance tracking across admin, faculty, student, and parent views
- Announcement and internal messaging workflows
- Assignment creation, submission, and review flows
- Certificate generation and certificate viewing pages
- Fee invoice management and Razorpay-backed payment checkout
- Zoom meeting creation flow for live classes
- Student AI study assistant with chat, source selection, and study studio outputs
- Notifications and activity updates across the platform
- Shared client-side state management with persistence
- Security-focused backend middleware, including Helmet, CORS, and rate limiting

## Tech Stack Used

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- Radix UI
- Recharts
- Lucide React
- Sonner
- Razorpay checkout integration
- Zoom meeting API integration

### Backend

- Node.js
- Express
- dotenv
- helmet
- cors
- express-rate-limit
- nodemon

## Additional Notes

- The repository also includes supporting documentation in `docs/` for architecture, database design, API flow, testing, scaling, security, and deployment.
- The backend exposes a health endpoint at `/api/health`.
