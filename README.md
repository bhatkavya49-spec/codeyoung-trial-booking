# CodeYoung Trial Class Booking

## Overview
A full-stack trial-class appointment booking system. Parents register with email OTP, select their child's grade and subject, pick a date and timezone, and the system automatically assigns an available mentor. Both parent and mentor receive email confirmations with local times and a dummy class link.

## Key Features
- Parent registration and login with email OTP (5-min expiry, SHA-256 hashed)
- Session-based authentication via `sessionStorage` (no JWT)
- Grade (1–12) and Subject (English, Mathematics, Science, Coding) selection via accessible custom dropdowns
- Date selection (next 7 days) and 30-min time-slot grid (9 AM–9 PM local)
- IANA timezone selector with DST-aware conversion using Luxon
- Automatic subject-qualified mentor assignment with max 2 classes/day per mentor (mentor's local day)
- Overlap prevention and race-condition re-check at booking time
- UTC storage of booking times; local times derived from UTC for parent and mentor
- Dummy class link (`https://meet.example.com/...`)
- Email notifications (parent confirmation + mentor assignment) with logging
- Parent dashboard with booking history
- Responsive UI with custom accessible dropdowns

## Tech Stack

### Frontend

* **React 18** – Component-based user interface
* **Vite 5** – Frontend development and build tool
* **React Router 6** – Client-side routing
* **Axios** – REST API communication
* **Luxon 3** – Timezone and date-time handling

### Backend

* **Node.js** – Server-side JavaScript runtime
* **Express 5** – REST API and backend framework
* **Mongoose 9** – MongoDB ODM
* **Luxon 3** – Timezone-aware date and time processing
* **Nodemailer 10** – Email notifications

### Database

* **MongoDB Atlas** – Cloud database
* **Mongoose** – Database modeling and data access

### Authentication & Security

* **Email OTP verification** – Registration and login verification
* **SHA-256 hashing** – OTP protection
* **Session Storage** – Client-side authenticated session management

### Email & Notifications

* **Nodemailer + Gmail SMTP** – Parent and mentor booking notifications

## Prerequisites
- Node.js v18+ (tested with Node.js 20)
- npm v9+ (comes with Node.js)
- MongoDB Atlas account and cluster
- Gmail account with App Password (for SMTP email notifications)

## Setup

### Clone repository
```bash
git clone https://github.com/bhatkavya49-spec/codeyoung-trial-booking.git
cd codeyoung-trial-booking
```

### Backend setup
```bash
cd backend
npm install
# Create .env with the following:
# PORT=5000
# MONGODB_URI=<your-mongodb-connection-string>
# SMTP_USER=<your-gmail-address>
# SMTP_PASS=<your-gmail-app-password>
npm run seed:mentors   # seeds 10 mentors (run once)
```

### Frontend setup
```bash
cd ../frontend
npm install
# Create .env with:
# VITE_API_URL=http://localhost:5000/api
```

## Run the Application

**Backend** (starts on `http://localhost:5000`):
```bash
cd backend
npm run dev
```

**Frontend** (starts on `http://localhost:5173`):
```bash
cd frontend
npm run dev
```

> **Note:** Both servers must run simultaneously. Open a separate terminal for each.

## Application Flow
Register → OTP verification → Login → Dashboard → Book Trial Class → Select child name, grade, subject → Select timezone, date, time slot → System assigns mentor → Confirmation page with both local times and class link → Email notifications sent to parent and mentor.

## AI-Assisted Development
AI assistance was used during implementation, debugging, UI refinement, and documentation. The application was reviewed and tested during development. The detailed AI session transcript is available in `TRANSCRIPT.md`.