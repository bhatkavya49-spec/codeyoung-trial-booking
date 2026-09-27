# CodeYoung Trial Class Booking System

## Overview
A full-stack trial-class appointment booking system built for the CodeYoung Full Stack Engineer assignment. Parents can register, verify their email via OTP, and book free 45-minute trial classes for their children. The system handles mentor availability across time zones, enforces a maximum of 2 classes per mentor per day, and sends email confirmations with dummy live-class links.

## Assignment Requirements
| # | Requirement | Status |
|---|-------------|--------|
| 1 | Build a trial-class appointment booking system | Implemented |
| 2 | 10 mentors available for trial classes | 10 mentors seeded |
| 3 | Parents can book trial classes | Implemented |
| 4 | Parents and mentors may be in different time zones | Handled via Luxon |
| 5 | Local times always displayed and communicated correctly | Implemented |
| 6 | Daylight Saving Time handled | Luxon IANA time zones |
| 7 | Parents and mentors receive dummy live-class link | Implemented |
| 8 | Each mentor max 2 demo classes per day | Enforced |
| 9 | Error if no mentor available | Implemented |
| 10 | Backend: Node.js or Python | Node.js + Express |
| 11 | Frontend: React | React + Vite |
| 12 | README.md and TRANSCRIPT.md included | Implemented |

## Features Implemented
- **Parent Registration & OTP Verification** — 6-digit email OTP with 5-minute expiry, SHA-256 hashed storage
- **Login with OTP** — Existing parents can log in via email OTP
- **Trial Class Booking Flow** — 2-step: child details (name, grade, subject) → schedule (date, time zone, time slot)
- **Subject-Based Mentor Matching** — English, Mathematics, Science, Coding
- **Time Zone & DST Handling** — Luxon IANA time zones; parent and mentor local times shown side-by-side
- **Mentor Capacity Rule** — Max 2 confirmed classes per mentor per **mentor's local calendar day**
- **Availability Checking** — Optimized single-query per request (batched `$or` across mentors)
- **Conflict Detection** — Overlap prevention between existing bookings and candidate slots
- **Re-check at Booking** — Availability re-verified during `createBooking`; 409 with next available slot if race condition
- **Email Notifications** — Nodemailer + Gmail SMTP; parent confirmation + mentor assignment emails
- **Parent Dashboard** — View booked classes, profile details, book new class
- **Booking Confirmation Page** — Class details, mentor info, time comparison, join link, notification status
- **Toast Notifications** — Success, error, warning, info with auto-dismiss and animations
- **Success Modal** — Copy link, join class, mentor details
- **Responsive UI** — Desktop two-column layout; mobile stacked

## User Booking Flow
1. **Registration** — Parent enters name, email, phone, subject, timezone → OTP sent → verify OTP → account created
2. **Login** — Existing parent enters email → OTP sent → verify → dashboard
3. **Booking Step 1** — Enter child name, select grade (1–12), select subject
4. **Booking Step 2** — Select timezone → select date (next 7 days) → view available 30-min slots (9 AM–9 PM) → select slot
5. **Confirm** — System re-checks mentor availability → creates booking → assigns mentor → generates dummy meet link
6. **Confirmation** — Page shows class details, mentor, both local times, join link; emails sent to parent & mentor

## Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, React Router 6, Axios, Luxon 3 |
| Backend | Node.js, Express 5, Mongoose 9, Luxon 3, Nodemailer 10 |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | Session-based (sessionStorage), OTP via email |
| Email | Nodemailer with Gmail SMTP |
| Styling | Pure CSS (CSS variables, no external UI library) |

## System Architecture
```
┌─────────────┐     REST API      ┌─────────────┐     Mongoose      ┌───────────┐
│   React     │ ─────────────────▶ │  Express    │ ─────────────────▶ │  MongoDB  │
│   (Vite)    │ ◀───────────────── │  (Node.js)  │ ◀───────────────── │  Atlas    │
└─────────────┘                    └─────────────┘                    └───────────┘
        │                                 │
        │                                 ├── /api/auth (register, login, verify-otp)
        │                                 ├── /api/slots (GET availability)
        │                                 └── /api/bookings (POST create)
        │
        ├── AuthContext (sessionStorage)
        ├── ToastContext (notifications)
        └── ProtectedRoute (dashboard, booking, confirmation)
```

## Project Structure
```
codeyoung-trial-booking/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── models/
│   │   ├── Parent.js              # Parent schema
│   │   ├── Mentor.js              # Mentor schema
│   │   ├── Booking.js             # Booking schema
│   │   └── Notification.js        # Email notification log
│   ├── routes/
│   │   ├── auth.js                # Registration, login, OTP
│   │   └── booking.js             # Slots, booking creation
│   ├── services/
│   │   ├── mentorService.js       # Availability, assignment, booking logic
│   │   ├── emailService.js        # Nodemailer templates
│   │   └── otpStore.js            # In-memory OTP store (SHA-256, 5-min TTL)
│   ├── seed/
│   │   └── mentors.js             # 10 mentor seed script
│   ├── server.js                  # Express entry point
│   ├── package.json
│   └── .env                       # Excluded from Git
├── frontend/
│   ├── src/
│   │   ├── components/            # Header, DateSelector, TimeSlotSelector, TimezoneSelector,
│   │   │                           ProgressSteps, Toast, ToastContainer, BookingSuccessModal
│   │   ├── context/               # AuthContext, ToastContext
│   │   ├── pages/                 # Register, VerifyOTP, Login, LoginVerifyOTP,
│   │   │                           Dashboard, Booking, BookingConfirmation
│   │   ├── services/
│   │   │   └── api.js             # Axios instance + API calls
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Design system (CSS variables)
│   ├── package.json
│   └── .env                       # Excluded from Git
└── README.md
```

## Database Models
### Parent
```javascript
{
  name: String,
  email: String (unique, lowercase),
  phone: String,
  timezone: String (IANA),
  emailVerified: Boolean (default: false),
  timestamps: true
}
```

### Mentor
```javascript
{
  name: String,
  email: String (unique, lowercase),
  phone: String,
  timezone: String (IANA),
  active: Boolean (default: true),
  maxClassesPerDay: Number (default: 2),
  subjects: [String],  // e.g., ["English"], ["Mathematics", "Science"]
  timestamps: true
}
```

### Booking
```javascript
{
  parentId: ObjectId (ref: Parent),
  mentorId: ObjectId (ref: Mentor),
  childName: String,
  subject: String,
  grade: String,
  startTimeUTC: Date,
  endTimeUTC: Date,
  parentTimezone: String,
  mentorTimezone: String,
  status: Enum ['confirmed', 'cancelled', 'completed'] (default: 'confirmed'),
  classLink: String (dummy meet link),
  timestamps: true
}
index: { mentorId: 1, startTimeUTC: 1, endTimeUTC: 1 }
```

### Notification
```javascript
{
  bookingId: ObjectId (ref: Booking),
  type: Enum ['parent_class_confirmation', 'mentor_class_assignment'],
  recipient: String (email),
  status: Enum ['sent', 'failed'],
  messageId: String,
  sentAt: Date,
  error: String,
  timestamps: true
}
```

## Authentication / OTP Flow
- **No JWT** — uses `sessionStorage` only
- **Registration OTP** — `POST /api/auth/send-otp` → 6-digit code emailed → stored hashed (SHA-256) with 5-min TTL in memory Map → `POST /api/auth/verify-otp` validates → creates Parent document with `emailVerified: true`
- **Login OTP** — `POST /api/auth/login/send-otp` → finds existing parent → sends OTP → `POST /api/auth/login/verify-otp` validates → returns parent data
- **Session** — Parent object stored in `sessionStorage` under `codeyoung_parent`; `AuthContext` restores on app load

## Mentor Assignment Logic
1. `createBooking` → `assignMentor(startUTC, endUTC, subject)`
2. `assignMentor` → `getAvailableMentorsForSlot(startUTC, endUTC, subject)`
3. `getAvailableMentorsForSlot`:
   - Fetch **active** mentors where `subjects` includes requested subject
   - For each mentor, compute their **local day bounds** using `getMentorLocalDayBounds(mentor, utcDate)`
   - Query bookings for that mentor within their local day
   - Filter: `bookings.length < maxClassesPerDay` AND no time overlap
   - Return first available mentor (array order)
4. Booking created with assigned mentor; dummy link: `https://meet.example.com/codeyoung-<timestamp>-<random>`

## Timezone and DST Handling
- **Luxon 3** used throughout (backend + frontend)
- All timestamps stored as **UTC** in MongoDB (`startTimeUTC`, `endTimeUTC`)
- Parent selects IANA timezone at registration (also editable on booking step 2)
- Mentor has fixed IANA timezone in seed data
- Local day boundaries calculated per-mentor using `DateTime.setZone(mentor.timezone).startOf('day')` / `.endOf('day')` → converted to UTC for query
- Display: `DateTime.fromISO(utcString).setZone(userTimezone).toFormat(...)`
- DST transitions handled automatically by Luxon's IANA zone database

## Mentor 2-Classes-Per-Day Capacity Rule
- **Per mentor, per mentor's local calendar day** (not parent's day, not UTC day)
- Checked in two places:
  - **Availability API** (`getAvailableSlots`): batches all mentor day queries in single `$or`
  - **Booking Creation** (`getAvailableMentorsForSlot`): re-checks per mentor before assignment
- Counts only `status: 'confirmed'` bookings

## Booking Conflict Handling
- **Overlap detection**: `existingStart < candidateEnd && existingEnd > candidateStart`
- Applied during availability check (per slot) and during booking creation (race-condition guard)
- If slot becomes unavailable between selection and confirmation: returns 409 with `nextAvailableSlot` suggestion

## Email Notifications
- **Nodemailer** with Gmail SMTP (`smtp.gmail.com:587`, STARTTLS)
- **Parent Confirmation** — sent after booking created; includes child name, grade, subject, mentor, both local times, class link
- **Mentor Assignment** — sent to mentor; includes student details, both local times, class link
- **Notification Log** — each attempt creates `Notification` document (status: sent/failed, messageId, error)
- **Non-blocking** — email failures logged but do not roll back booking

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/send-otp` | Send registration OTP |
| POST | `/api/auth/verify-otp` | Verify OTP, create parent |
| POST | `/api/auth/login/send-otp` | Send login OTP |
| POST | `/api/auth/login/verify-otp` | Verify login OTP |
| GET | `/api/auth/me?parentId=` | Get parent profile |
| GET | `/api/slots?date=&timezone=&subject=&grade=` | Get available slots for date |
| POST | `/api/bookings` | Create booking (requires auth) |

**Slot Request Params:** `date` (YYYY-MM-DD), `timezone` (IANA), `subject` (English|Mathematics|Science|Coding), `grade` (optional)

**Booking Request Body:** `parentId`, `childName`, `grade`, `subject`, `date`, `time` (HH:mm), `parentTimezone`

## Local Setup Instructions
```bash
# Clone
git clone <repo-url>
cd codeyoung-trial-booking

# Backend
cd backend
cp .env.example .env   # Fill in values (see below)
npm install
npm run seed:mentors   # Seeds 10 mentors
npm run dev            # Starts on port 5000

# Frontend (new terminal)
cd ../frontend
cp .env.example .env   # Set VITE_API_URL
npm install
npm run dev            # Starts on port 5173
```

## Environment Variables
**Backend (`backend/.env`)** — *excluded from Git*
```env
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
SMTP_USER=<your-gmail-address>
SMTP_PASS=<your-gmail-app-password>
```

**Frontend (`frontend/.env`)** — *excluded from Git*
```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ Real credentials are **not** committed. `.env` files are in `.gitignore`.

## Mentor / Seed Data
10 mentors seeded via `npm run seed:mentors`:
| Name | Email | Timezone | Subjects |
|------|-------|----------|----------|
| Ananya Sharma | ananya.sharma@gmail.com | Asia/Kolkata | English |
| Rahul Mehta | rahul.mehta@gmail.com | Asia/Kolkata | English |
| Michael Brown | michael.brown@gmail.com | Asia/Kolkata | English |
| Priya Nair | priya.nair@gmail.com | Asia/Kolkata | Mathematics |
| Arjun Rao | arjun.rao@gmail.com | Asia/Kolkata | Mathematics |
| Neha Kapoor | neha.kapoor@gmail.com | Asia/Kolkata | Science |
| James Wilson | james.wilson@gmail.com | Asia/Kolkata | Science |
| Olivia Davis | olivia.davis@gmail.com | Asia/Kolkata | Science |
| Emily Smith | emily.smith@gmail.com | Asia/Kolkata | Coding |
| Sarah Johnson | sarah.johnson@gmail.com | Asia/Kolkata | Coding |

All mentors: `active: true`, `maxClassesPerDay: 2`

## Edge Cases Handled
- OTP expiry (5 min) and reuse prevention
- Duplicate email registration blocked (409)
- Unverified email login blocked (403)
- Invalid timezone/date rejected (400)
- No mentors for subject → empty slots array
- Slot fully booked → 409 with next available slot
- Email send failure → booking still confirmed, notification logged
- Concurrent booking race → re-check in `createBooking`
- Past dates excluded (DateSelector starts from today)
- Slot generation stops at 9 PM local (45-min class fits)
- Mobile responsive: hero hidden, card full-width

## Performance Considerations
- **Availability Query Optimization**: Single mentor fetch + single `$or` booking query (2 queries) vs original N+1 (264 queries)
- **Lean queries** (`.lean()`) for read-only availability checks
- **In-memory filtering** after batched fetch
- **Index** on `Booking { mentorId: 1, startTimeUTC: 1, endTimeUTC: 1 }`
- Frontend: `useEffect` dependencies prevent duplicate slot requests

## What Is Implemented
- Implemented Full registration → OTP → login → booking → confirmation flow
- Implemented 10 mentors, 4 subjects, 7-day rolling schedule
- Implemented Timezone-aware local times for parent and mentor
- Implemented DST-safe Luxon calculations
- Implemented Mentor capacity (2/day per mentor local day)
- Implemented Overlap prevention + race-condition re-check
- Implemented Email notifications (parent + mentor) with logging
- Implemented Parent dashboard with profile + booked classes
- Implemented Toast notifications + success modal
- Implemented Responsive CSS design system

## What Is NOT Implemented
- ❌ JWT or persistent server-side sessions
- ❌ Real video conferencing integration (dummy links only)
- ❌ Cancellation / rescheduling flow
- ❌ Mentor portal / dashboard
- ❌ Payment / subscription
- ❌ Admin panel
- ❌ Unit / integration tests
- ❌ Rate limiting, CAPTCHA, or advanced security
- ❌ Multi-language / i18n
- ❌ Persistent OTP store (in-memory Map resets on server restart)

## Future Improvements
- Replace in-memory OTP store with Redis (TTL, horizontal scaling)
- Add JWT refresh/access tokens for stateless auth
- Implement cancellation & rescheduling with slot release
- Mentor dashboard (view schedule, manage availability)
- Admin analytics (bookings, mentor utilization, conversion)
- WebSocket / Server-Sent Events for real-time slot updates
- Automated email retry queue (BullMQ + Redis)
- Comprehensive test suite (Jest + React Testing Library + Supertest)

## AI-Assisted Development
Parts of this project were developed with AI assistance (code generation, debugging, refactoring, documentation). All AI-generated code was reviewed, tested, and integrated manually. The final implementation reflects deliberate engineering decisions aligned with the assignment requirements.