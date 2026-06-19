# SortMyScene — Event Ticket Booking

A MERN-stack seat reservation and booking flow. Users log in, browse events, hold
seats for 10 minutes, and confirm a booking. Concurrent reservations cannot
double-book a seat.

## Stack
- Backend: Node.js, Express, Mongoose, MongoDB Atlas, JWT
- Frontend: React, Vite, Tailwind CSS, axios

## Prerequisites
- Node.js 18+
- A MongoDB Atlas connection string

## Backend setup
```bash
cd backend
cp .env.example .env        # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed                # seeds sample events + seats
npm run dev                 # http://localhost:4000
npm test                    # run the test suite
```

## Frontend setup
```bash
cd frontend
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:4000/api
npm install
npm run dev                 # http://localhost:5173
```

## API
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | – | Register, returns JWT |
| POST | /api/auth/login | – | Login, returns JWT |
| GET | /api/events | – | List events |
| GET | /api/events/:id | – | Event + seats |
| POST | /api/reserve | ✅ | Reserve seats for 10 min |
| POST | /api/bookings | ✅ | Confirm booking |

## Design decisions

**Preventing double booking.** Reserving uses an atomic conditional `updateMany`
that only flips seats currently `available` to `reserved`, tagged with a unique
reservation token. Because each per-document update is atomic, two concurrent
requests for the same seat can never both succeed. If fewer seats than requested
were flipped (someone else grabbed one), the request rolls back its own tagged
seats and returns 409.

**Expiry.** Reservations carry an `expiresAt`. A TTL index removes the reservation
document automatically; a 60-second sweeper releases any still-reserved seats whose
reservation is gone. Booking re-checks `expiresAt` and returns 410 for expired holds,
so an expired reservation can never be booked.

**Auth.** JWT issued on register/login (bcrypt-hashed passwords). Reserve and book
require a valid token; the booking verifies the reservation belongs to the caller.
The frontend attaches the token on every request and redirects to login on a 401.

## Assumptions
- Seats are seeded per event as `A1..An` (rows of 10) via `npm run seed`.
- A user holds one active reservation per event at a time.
- Atlas (replica set) is assumed; the design also works on standalone MongoDB since
  it relies on atomic single-document updates, not multi-doc transactions.
