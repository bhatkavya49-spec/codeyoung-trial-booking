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

## Key Features
- **Parent Registration with OTP** — 6-digit email OTP with 5-minute expiry, SHA-256 hashed storage
- **Parent Login with OTP** — Existing parents can log in via email OTP
- **Session-based frontend authentication state** — `sessionStorage` only, no JWT
- **Child name, Grade selection, Subject selection** — Step 1 of booking flow
- **Custom readable Grade/Subject dropdowns** — Accessible dropdown components with 18px option text, keyboard navigation (ArrowUp/Down, Enter, Escape), click-outside close, ARIA attributes
- **Date selection** — Next 7 days, past dates excluded
- **Time-slot selection** — 30-min intervals, 9 AM–9 PM local
- **Parent timezone selection** — IANA timezone selector
- **Timezone conversion & DST-aware calculations** — Luxon IANA time zones throughout
- **Subject-qualified mentor assignment** — English, Mathematics, Science, Coding
- **Maximum 2 confirmed demo classes per mentor local calendar day**
- **Overlap checking** — Prevents double-booking
- **Booking confirmation** — Class details, mentor info, both local times, join link
- **Mentor contact information** — Email and phone displayed
- **Dummy live-class link** — `https://meet.example.com/codeyoung-<timestamp>-<random>`
- **Email notifications** — Parent confirmation + mentor assignment, logged in Notification collection
- **Toast notifications** — Success, error, warning, info with animations
- **Success modal** — Copy link, join class, mentor details
- **Dashboard / booking history** — View booked classes, profile, book new class
- **Responsive UI** — Desktop two-column layout; mobile stacked

## User Flow
1. **Registration** — Parent enters name, email, phone, subject, timezone → OTP sent → verify OTP → account created with `emailVerified: true`
2. **Login** — Existing parent enters email → OTP sent → verify → dashboard
3. **Booking Step 1** — Enter child name, select grade (1–12), select subject (custom dropdowns)
4. **Booking Step 2** — Select timezone → select date (next 7 days) → view available 30-min slots (9 AM–9 PM) → select slot
5. **Confirm** — System re-checks mentor availability → creates booking → assigns mentor → generates dummy meet link
6. **Confirmation** — Page shows class details, mentor, both local times (converted from `startTimeUTC`), join link; emails sent to parent & mentor

## Architecture
**Frontend:** React 18 + Vite 5, React Router 6, Axios, Luxon 3
**Backend:** Node.js + Express 5, Mongoose 9, Luxon 3, Nodemailer 10
**Database:** MongoDB Atlas + Mongoose ODM
**Timezone:** Luxon 3 (IANA time zones, DST-aware)
**Email:** Nodemailer + Gmail SMTP

**Data Flow:** React UI → REST API → Express services → MongoDB
**Booking/Mentor Assignment Flow:**
`createBooking` → `assignMentor` → `getAvailableMentorsForSlot` → filters active mentors by subject → checks mentor's local day capacity (max 2) and overlap → assigns first available → booking created with `startTimeUTC` as canonical UTC instant

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
│   │   │                           ProgressSteps, Toast, ToastContainer, BookingSuccessModal,
│   │   │                           CustomDropdown
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
├── README.md
└── TRANSCRIPT.md
```

## Data Models
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

## Authentication
- **No JWT** — uses `sessionStorage` only (`codeyoung_parent` key)
- **Registration OTP** — `POST /api/auth/send-otp` → 6-digit code emailed → stored hashed (SHA-256) with 5-min TTL in memory Map → `POST /api/auth/verify-otp` validates → creates Parent document with `emailVerified: true`
- **Login OTP** — `POST /api/auth/login/send-otp` → finds existing parent → sends OTP → `POST /api/auth/login/verify-otp` validates → returns parent data
- **Session** — Parent object stored in `sessionStorage`; `AuthContext` restores on app load
- **OTP Store** — In-memory `Map` (resets on server restart), keys hashed with SHA-256, 5-minute TTL

## Mentor Assignment
1. `createBooking` → `assignMentor(startUTC, endUTC, subject)`
2. `assignMentor` → `getAvailableMentorsForSlot(startUTC, endUTC, subject)`
3. `getAvailableMentorsForSlot`:
   - Fetch **active** mentors where `subjects` includes requested subject
   - For each mentor, compute their **local day bounds** using `getMentorLocalDayBounds(mentor, utcDate)`
   - Query bookings for that mentor within their local day
   - Filter: `bookings.length < maxClassesPerDay` AND no time overlap
   - Return first available mentor (array order)
4. Booking created with assigned mentor; dummy link: `https://meet.example.com/codeyoung-<timestamp>-<random>`

**Concurrency Note:** The system re-checks availability inside `createBooking` (race-condition guard). If the selected slot becomes unavailable between selection and confirmation, it returns 409 with `nextAvailableSlot` suggestion. This is an application-level re-check; no database transactions or distributed locks are used.

## Timezone and DST
- **Luxon 3** used throughout (backend + frontend)
- All timestamps stored as **UTC** in MongoDB (`startTimeUTC`, `endTimeUTC`)
- Parent selects IANA timezone at registration (also editable on booking step 2)
- Mentor has fixed IANA timezone in seed data
- Local day boundaries calculated per-mentor using `DateTime.setZone(mentor.timezone).startOf('day')` / `.endOf('day')` → converted to UTC for query
- Display: `DateTime.fromISO(utcString).setZone(userTimezone).toFormat(...)`
- DST transitions handled automatically by Luxon's IANA zone database
- **Booking Confirmation fix (commit b4ba8c6):** Page now uses `booking.startTimeUTC` as the single source of truth. A helper `formatBookingTime(utcISO, timezone)` explicitly converts that UTC instant to `parentTimezone` and `mentorTimezone` using `DateTime.fromISO(utcISO, { zone: 'utc' }).setZone(timezone)`. No reliance on browser/system timezone.

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

## Prerequisites
- **Node.js** v18+ (tested with Node.js 20)
- **npm** v9+ (comes with Node.js)
- **MongoDB Atlas** account and cluster (or local MongoDB)
- **Gmail account** with App Password (for SMTP email notifications)

## Installation
```bash
# Clone the repository
git clone <repository-url>
cd codeyoung-trial-booking

# Backend setup
cd backend
npm install

# Seed mentors (run once after first install)
npm run seed:mentors

# Frontend setup
cd ../frontend
npm install
```

## Running the Application
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

## Implemented
- Full registration → OTP → login → booking → confirmation flow
- 10 mentors, 4 subjects, 7-day rolling schedule
- Timezone-aware local times for parent and mentor
- DST-safe Luxon calculations
- Mentor capacity (2/day per mentor local day)
- Overlap prevention + race-condition re-check
- Email notifications (parent + mentor) with logging
- Parent dashboard with profile + booked classes
- Toast notifications + success modal
- Responsive CSS design system
- Custom accessible dropdowns for Grade/Subject (keyboard, ARIA, readable option text)

## Not Implemented
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
- ❌ Database transactions / distributed locking for race conditions

## Responsive Design
- **Layout:** Flexible widths with max-width containers; natural document flow (no forced vertical centering)
- **Breakpoints:** 900px (tablet) and 480px (mobile) with stacked cards and full-width forms
- **Scrolling:** Natural vertical scrolling when content exceeds viewport; no horizontal overflow
- **Components:** Responsive cards, forms, custom dropdowns, progress steps, and modals
- **Viewport tested:** Common laptop sizes (1366×768, 1536×864, 1280×720) and mobile (375×667, 480×800)
- **No device-specific hacks:** Uses fluid CSS, flexbox, and media queries based on layout needs

## Design/UX Notes
Custom EdTech-style interface with CSS variable design system (primary navy, warm coral accent, semantic colors). Responsive breakpoints at 900px and 480px. Booking card with 2-step progress indicator. Readable form controls (labels 1rem, inputs 1.05rem, dropdown options 1.125rem / 18px). Accessible custom dropdowns with ArrowUp/Down, Enter/Space, Escape, Home/End, click-outside close, ARIA combobox/listbox/option pattern, visible focus states.

## AI-Assisted Development
Parts of this project were developed with AI assistance (code generation, debugging, refactoring, documentation). All AI-generated code was reviewed, tested, and integrated manually. The final implementation reflects deliberate engineering decisions aligned with the assignment requirements. TRANSCRIPT.md documents the AI-assisted development process.

## Submission Notes
- GitHub repository contains `README.md`
- GitHub repository contains `TRANSCRIPT.md`
- `TRANSCRIPT.md` documents the available OpenCode AI sessions and clearly identifies redacted/unavailable user prompts rather than fabricating them