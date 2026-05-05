# HandyHub — Development Handoff

> Last updated: Phase 3 complete (50% overall)
> Sessions: 1 | Sub-agents deployed: 16 | Files created/modified: 35

---

## Roadmap Progress

| Phase | Status | Description |
|-------|--------|-------------|
| 1 — Foundation | ✅ Complete | Middleware, seed data, DB consistency, Recharts, forgot-password |
| 2 — API Routes | ✅ Complete | Bookings, Services, Users, Handymen, Reviews CRUD |
| 3 — Customer Pages | ✅ Complete | Discovery, detail, booking flow, dashboard pages |
| 4 — Admin Pages | ⬜ Pending | User mgmt, bookings mgmt, services mgmt, analytics |
| 5 — PPE Pipeline | ⬜ Pending | CI/CD, staging env, UAT readiness |
| 6 — Production | ⬜ Pending | Hardening, security, launch |

---

## Architecture

```
handyman/
├── src/
│   ├── middleware.ts              # Route protection (dashboard, admin, book)
│   ├── app/
│   │   ├── page.tsx               # Landing page (polished, static)
│   │   ├── layout.tsx             # Root layout + ToastProvider
│   │   ├── globals.css            # Design system (glass, gradients, buttons)
│   │   ├── login/page.tsx         # Sign-in (NextAuth credentials)
│   │   ├── register/page.tsx      # Multi-step registration
│   │   ├── forgot-password/page.tsx # Real API call
│   │   ├── handymen/
│   │   │   ├── page.tsx           # Discovery — search, filters, sort
│   │   │   └── [id]/page.tsx      # Detail profile + reviews
│   │   ├── services/page.tsx      # Service listing + category filter
│   │   ├── book/page.tsx          # 4-step booking wizard
│   │   ├── dashboard/
│   │   │   ├── layout.tsx         # Sidebar nav (client)
│   │   │   ├── page.tsx           # Dashboard home (real API)
│   │   │   ├── bookings/page.tsx  # Booking history + cancel
│   │   │   ├── profile/page.tsx   # View/edit profile
│   │   │   └── notifications/page.tsx # Mock notifications
│   │   ├── admin/
│   │   │   ├── layout.tsx         # Server auth guard + AdminClient
│   │   │   ├── AdminClient.tsx    # Dark sidebar navigation
│   │   │   └── page.tsx           # Dashboard w/ Recharts (real API stats)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts
│   │       │   ├── register/route.ts
│   │       │   ├── forgot-password/route.ts
│   │       │   └── reset-password/route.ts
│   │       ├── bookings/
│   │       │   ├── route.ts       # GET (role-scoped), POST (create)
│   │       │   └── [id]/route.ts  # GET, PUT (status transitions)
│   │       ├── services/
│   │       │   ├── route.ts       # GET (public), POST (admin)
│   │       │   └── [id]/route.ts  # GET, PUT, DELETE (soft)
│   │       ├── users/
│   │       │   ├── route.ts       # GET (admin list, paginated)
│   │       │   ├── [id]/route.ts  # GET, PUT (profile update)
│   │       │   └── me/route.ts    # GET (current user)
│   │       ├── handymen/
│   │       │   ├── route.ts       # GET (public, filterable)
│   │       │   ├── [id]/route.ts  # GET (full profile)
│   │       │   └── [id]/reviews/route.ts # GET (paginated)
│   │       └── reviews/
│   │           ├── route.ts       # GET, POST (with rating calc)
│   │           └── [id]/route.ts  # PUT, DELETE (recalc rating)
│   └── lib/
│       ├── auth.ts                # NextAuth config (credentials + JWT)
│       ├── prisma.ts              # DB client (SQLite via libsql, PG-ready)
│       ├── toast.tsx              # Toast notification system
│       ├── icons.tsx              # 30+ SVG icon components
│       ├── skeleton.tsx           # Skeleton loading components
│       ├── search-bar.tsx         # Global search component
│       └── back-to-top.tsx        # Scroll-to-top button
├── prisma/
│   ├── schema.prisma              # 9 models (User, HandymanProfile, Service, etc.)
│   ├── seed.ts                    # Demo data: 10 services, 7 users, 10 bookings
│   └── dev.db                     # SQLite database
├── tests/features.spec.ts         # Playwright E2E tests
├── docker-compose.yml             # SQLite-based (PG migration path commented)
├── Dockerfile                     # Multi-stage, SQLite-ready
├── .env                           # Local dev (strong NEXTAUTH_SECRET)
└── package.json                   # Next.js 14, Prisma 7, NextAuth 4, Recharts
```

---

## Database — Prisma Schema

9 models: **User**, **HandymanProfile**, **Service**, **HandymanService**, **Availability**, **Booking**, **Review**, **Certification**, **Notification**

Enums: `UserRole` (CUSTOMER, HANDYMAN, ADMIN), `BookingStatus` (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED), `ServiceCategory` (10 values)

User model has `resetToken` + `resetTokenExpiry` fields for forgot-password flow.

---

## API Endpoint Inventory

### Auth
| Method | Route | Auth | Notes |
|--------|-------|------|-------|
| POST | `/api/auth/register` | Public | Creates user + handyman profile if role=HANDYMAN |
| POST | `/api/auth/[...nextauth]` | Public | NextAuth handler |
| POST | `/api/auth/forgot-password` | Public | Generates token, logs URL to console |
| POST | `/api/auth/reset-password` | Public | Validates token, updates password |

### Bookings
| Method | Route | Auth | Notes |
|--------|-------|------|-------|
| GET | `/api/bookings` | Required | Role-scoped (customer/handyman see own, admin sees all) |
| POST | `/api/bookings` | Required | Creates PENDING booking, auto-assigns handyman |
| GET | `/api/bookings/[id]` | Required | Must own or be admin |
| PUT | `/api/bookings/[id]` | Required | Status transitions by role |

### Services
| Method | Route | Auth | Notes |
|--------|-------|------|-------|
| GET | `/api/services` | Public | Active services, ?category= filter |
| POST | `/api/services` | Admin | Create service |
| GET | `/api/services/[id]` | Public | With handymen offering it |
| PUT | `/api/services/[id]` | Admin | Update |
| DELETE | `/api/services/[id]` | Admin | Soft delete (isActive=false) |

### Users
| Method | Route | Auth | Notes |
|--------|-------|------|-------|
| GET | `/api/users` | Admin | Paginated, ?role= filter |
| GET | `/api/users/me` | Required | Current user profile |
| GET | `/api/users/[id]` | User/Admin | Own or admin |
| PUT | `/api/users/[id]` | User/Admin | Update profile, admin can change role |

### Handymen
| Method | Route | Auth | Notes |
|--------|-------|------|-------|
| GET | `/api/handymen` | Public | ?service=, ?city=, ?rating=, ?available=, ?search=, ?sort= |
| GET | `/api/handymen/[id]` | Public | Full profile + reviews + availability |
| GET | `/api/handymen/[id]/reviews` | Public | Paginated reviews |

### Reviews
| Method | Route | Auth | Notes |
|--------|-------|------|-------|
| GET | `/api/reviews` | Public | ?targetId=, ?authorId=, paginated |
| POST | `/api/reviews` | Customer | Validates booking completed, recalculates rating |
| PUT | `/api/reviews/[id]` | Author | Update rating/comment |
| DELETE | `/api/reviews/[id]` | Author/Admin | Recalculates rating |

---

## Demo Credentials (from seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@handyhub.com` | `Admin123!` |
| Customer | `sarah@example.com` | `Customer123!` |
| Handyman | `mike.johnson@handyhub.com` | `Handyman123!` |

---

## Quick Start

```bash
cd handyman
npm install
npm run db:push      # Sync schema (adds resetToken fields)
npm run db:seed      # Populate demo data
npm run dev          # http://localhost:3000
```

---

## Phase 4 — Pending Tasks (Admin Pages)

These pages are linked from the admin sidebar but don't exist yet:

| Page | Route | What to build |
|------|-------|---------------|
| Users Management | `/admin/users` | Table with role filter, pagination, edit role/status |
| Bookings Management | `/admin/bookings` | All bookings table, status update (admin can set any) |
| Services Management | `/admin/services` | CRUD table for services, toggle active |
| Analytics | `/admin/analytics` | Wire Recharts to real API data from /api/bookings and /api/users |

Also pending:
- Wire admin charts to real API data (currently static mock)
- Add real notification API endpoint + wire notifications page
- Add settings page at `/dashboard/settings`

---

## Phase 5 — Pending Tasks (PPE Pipeline)

- CI/CD configuration (GitHub Actions or similar)
- Staging environment config (.env.staging)
- Environment variable management for PPE
- UAT test plan / test data preparation
- Health check endpoint

---

## Known Gaps

- No email service configured (forgot-password logs to console)
- Charts on admin dashboard use static data (need API wiring)
- No notification API endpoint (dashboard uses mock data)
- No image/file upload for avatars
- No payment integration
- Docker PostgreSQL path is commented out but untested
- Playwright tests may need updates for new pages

---

## Design System Reference

**Colors**: Primary blue (#2563eb), Accent orange (#f97316)
**Components**: `.btn-primary`, `.btn-secondary`, `.card`, `.card-hover`, `.input-field`, `.badge-*`, `.glass`, `.gradient-text`
**Animations**: float, pulse-glow, shimmer, slide-up, scale-in, gradient-shift
**Icons**: `/src/lib/icons.tsx` — 30+ custom SVG components
