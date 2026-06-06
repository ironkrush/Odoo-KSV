# VendorBridge — Procurement & Vendor Management ERP

A full-stack procurement platform covering the end-to-end lifecycle of vendor management — from raising an RFQ to approving a quotation, generating a purchase order, and delivering a GST-inclusive invoice. Built with TypeScript throughout, SQLite via Prisma, and a React/Vite frontend.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Setup Instructions](#setup-instructions)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)
- [Contributors](#contributors)

---

## Overview

VendorBridge is a multi-tenant procurement ERP. Each organisation has its own isolated data space. Users are assigned one of four roles — **Admin**, **Procurement Officer**, **Manager/Approver**, or **Vendor** — and the UI adapts entirely to what that role can see and do.

The core procurement flow:

```
RFQ (created by Procurement Officer)
  └─> Vendors submit Quotations
        └─> Manager/Approver approves a Quotation
              └─> Purchase Order auto-generated
                    └─> Invoice created & emailed as PDF
```

Every action in this chain is written to an audit `ActivityLog` and triggers in-app `Notification` records for relevant users.

---

## Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend — React 19 / Vite / Tailwind"]
        A[Auth.tsx] --> B[App.tsx — central state & routing]
        B --> C[Dashboard]
        B --> D[RFQs]
        B --> E[Quotations]
        B --> F[Vendors]
        B --> G[POs & Invoices]
        B --> H[Analytics / Reports]
    end

    subgraph Server["Backend — Express / Node.js / TypeScript"]
        I[index.ts — entry point, CORS, middleware mount]
        I --> J[auth middleware — JWT validation & role check]
        I --> K[/api/auth]
        I --> L[/api/vendors]
        I --> M[/api/rfqs]
        I --> N[/api/quotations]
        I --> O[/api/purchase-orders]
        I --> P[/api/invoices]
        I --> Q[/api/analytics]
        I --> R[/api/notifications]
        I --> S[/api/activity-logs]
        I --> T[/api/upload]
    end

    subgraph Data["Data Layer"]
        U[(SQLite — dev.db)]
        V[Prisma ORM]
        V --> U
    end

    subgraph External["External Services"]
        W[SMTP — Nodemailer]
        X[PDFKit — invoice PDF stream]
    end

    Client -->|REST + Bearer JWT| Server
    Server --> V
    P -->|PDF stream| X
    P -->|email delivery| W
```

**Key design decisions:**

- **Vertical slice architecture** — each domain (vendors, rfqs, quotations, …) lives in its own module folder with its own router. Nothing bleeds across boundaries.
- **Single SQLite file** — keeps local dev and demos dead simple. Swapping to Postgres is a one-line `DATABASE_URL` change since Prisma abstracts the rest.
- **JWT with 7-day expiry** — stateless auth, no session store needed. The token carries `userId`, `role`, and `organizationId`, so every request is self-contained for RBAC.
- **Auto-generated POs** — when a Manager approves a Quotation, the server derives unit price (`amount / itemsCount`) and applies 18% GST automatically. No manual step required.
- **Ethereal fallback for email** — if no SMTP credentials are configured, Nodemailer creates an Ethereal test account and logs the preview URL to stdout so email flows don't crash in dev.

---

## Folder Structure

```
Odoo-KSV/
├── vendorBackend/
│   ├── prisma/
│   │   ├── schema.prisma          # All models, relations, enums
│   │   └── seed.ts                # Demo org, users, vendors, RFQs, quotations, POs, invoices
│   └── src/
│       ├── index.ts               # Server bootstrap, middleware, route registration
│       ├── db.ts                  # Singleton Prisma client
│       ├── middleware/
│       │   └── auth.ts            # authenticate() + authorize(roles[]) middleware
│       └── modules/
│           ├── auth/              # Register, login, invite, /me
│           ├── vendors/           # CRUD for vendor records
│           ├── rfqs/              # Create, list, patch status
│           ├── quotations/        # Submit, list, approve/reject (triggers PO creation)
│           ├── purchaseorders/    # Create, list, patch status
│           ├── invoices/          # Create, list, PDF stream, email send
│           ├── activities/        # Read-only audit log
│           ├── analytics/         # KPI counts + daily spend trend
│           └── notifications/     # Per-user notification feed + mark-read
├── vendorFrontend/
│   ├── src/
│   │   ├── App.tsx                # All state, API calls, page rendering
│   │   ├── types.ts               # Shared TypeScript interfaces
│   │   ├── main.tsx               # React entry point
│   │   ├── index.css              # Tailwind imports + custom font & reset rules
│   │   └── components/
│   │       ├── Auth.tsx                      # Login / registration screen
│   │       ├── Dashboard.tsx                 # KPI + spend chart + recent POs
│   │       ├── DashboardSidebar.tsx          # Role-filtered navigation
│   │       ├── KPIGrid.tsx                   # Metric cards
│   │       ├── Rfqcomponents.tsx             # RFQ creation form
│   │       ├── ProcurementActivityFeed.tsx   # Live activity log
│   │       ├── RecentPurchaseOrders.tsx      # PO summary table
│   │       ├── ProcurementSpendChart.tsx     # Recharts area chart
│   │       └── VendorPerformanceCard.tsx     # Vendor stats card
│   ├── vite.config.ts
│   └── package.json
├── dist/                          # Pre-built frontend static files
├── ngrok.yml                      # ngrok tunnel config (ports 3000 & 5001)
├── .env.example                   # Environment variable reference
└── tsconfig.json                  # Root TS config
```

---

## Database Schema

SQLite via Prisma. The `DATABASE_URL` in `.env` points to `prisma/dev.db`.

```
Organization
  ├── id, name
  └── has many: User, Vendor, RFQ, Quotation, PurchaseOrder, Invoice, ActivityLog

User
  ├── id, fullName, email (unique), password (bcrypt), role, createdAt
  ├── belongs to: Organization
  └── optionally linked to: Vendor (when role = Vendor)

Vendor
  ├── id, name, category, rating, status, contactEmail, gstNumber, contactPhone, createdAt
  └── belongs to: Organization

RFQ (Request for Quotation)
  ├── id, title, vendorCategory, status [Draft | Sent | Received | Closed]
  ├── itemsCount, description, deadline, assignedVendors (JSON array), attachmentUrl
  └── belongs to: Organization

Quotation
  ├── id, vendorName, amount, deliveryTimeDays, notes, approvalRemarks
  ├── status [Pending Review | Approved | Rejected]
  ├── belongs to: RFQ, Vendor, Organization
  └── approval triggers automatic PurchaseOrder creation

PurchaseOrder
  ├── id, product, qty, unitPrice, subtotal, taxAmount (18% GST), total
  ├── status [Pending Approval | In Transit | Delivered | Cancelled]
  └── belongs to: RFQ, Vendor, Organization

Invoice
  ├── id, vendorName, amount, subtotal, taxAmount (18% GST), totalAmount
  ├── status [Pending | Paid | Overdue]
  └── belongs to: PurchaseOrder, Organization

ActivityLog
  ├── id, type [rfq | quotation | po | invoice | vendor], title, detail, createdAt
  └── belongs to: Organization

Notification
  ├── id, message, read (bool), createdAt
  └── belongs to: User
```

All monetary calculations apply 18% GST. Unit price on a PO is derived as `quotation.amount / rfq.itemsCount`.

---

## API Endpoints

Base URL: `http://localhost:5001`

All routes except `/api/auth/register` and `/api/auth/login` require an `Authorization: Bearer <token>` header.

### Auth — `/api/auth`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/register` | Public | Create organisation + admin user |
| POST | `/login` | Public | Returns JWT token |
| GET | `/me` | Any authenticated | Current user profile |
| POST | `/invite` | Admin | Create a new user under the same org |
| GET | `/users` | Admin | List all users in the organisation |

### Vendors — `/api/vendors`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | All | List vendors (Vendor role sees only their own record) |
| POST | `/` | Admin, Procurement Officer | Add a vendor |
| PATCH | `/:id` | Admin, Procurement Officer | Update vendor details |
| DELETE | `/:id` | Admin, Procurement Officer | Remove a vendor |

### RFQs — `/api/rfqs`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | All | List RFQs (Vendor sees only assigned ones) |
| POST | `/` | Admin, Procurement Officer | Create RFQ; triggers Vendor notifications |
| PATCH | `/:id` | Admin, Procurement Officer | Update status or details |

### Quotations — `/api/quotations`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | All | List quotations (role-filtered) |
| POST | `/` | Vendor | Submit a quotation against an RFQ |
| PATCH | `/:id` | Vendor | Edit own quotation while status is Pending |
| PATCH | `/:id/status` | Admin, Manager | Approve or reject; approval auto-creates a PO |

### Purchase Orders — `/api/purchase-orders`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | All | List purchase orders |
| POST | `/` | Admin, Procurement Officer | Manually create a PO |
| PATCH | `/:id/status` | Admin, Procurement Officer | Update delivery status |

### Invoices — `/api/invoices`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | All | List invoices |
| POST | `/` | Admin, Procurement Officer | Record an invoice against a PO |
| GET | `/:id/pdf` | All | Stream invoice as PDF via PDFKit |
| POST | `/:id/email` | Admin, Procurement Officer | Email invoice PDF via SMTP |

### Analytics — `/api/analytics`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | All | KPI counts: vendors, RFQs, POs, invoices |
| GET | `/spend-trend` | All | Daily spend aggregated from recent POs |

### Notifications — `/api/notifications`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Authenticated | Fetch notifications for current user |
| PATCH | `/:id/read` | Authenticated | Mark a single notification read |
| POST | `/read-all` | Authenticated | Mark all notifications read |

### Activity Logs — `/api/activity-logs`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | All | Last 50 activity entries for the organisation |

### File Upload — `/api/upload`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/upload` | Authenticated | Upload file (base64 payload); served from `/uploads/` |

### Seed — `/api/setup`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/seed` | Public | Trigger database seed with demo data |

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm 9+

### 1. Clone & configure environment

```bash
git clone <repo-url>
cd Odoo-KSV
cp .env.example vendorBackend/.env
```

Edit `vendorBackend/.env`:

```env
PORT=5001
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="change-this-to-something-long-and-random"

# Optional — leave blank to use Ethereal test accounts in dev
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password

SENDER_EMAIL=your_gmail@gmail.com
VENDOR_EMAIL=recipient@example.com
```

> **Do not** commit `.env` or use the placeholder `JWT_SECRET` in any environment that handles real data.

### 2. Backend

```bash
cd vendorBackend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed        # loads demo org, users, vendors, RFQs, etc.
npm run dev                # starts on http://localhost:5001
```

### 3. Frontend

```bash
cd ../vendorFrontend
npm install
npm run dev                # starts on http://localhost:3000
```

### Demo credentials (post-seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vendorbridge.com | admin123 |
| Procurement Officer | procurement@vendorbridge.com | procure123 |
| Manager / Approver | manager@vendorbridge.com | manage123 |
| Vendor | vendor@vendorbridge.com | vendor123 |

---

## Development Workflow

### Running both services

```bash
# Terminal 1
cd vendorBackend && npm run dev

# Terminal 2
cd vendorFrontend && npm run dev
```

Vite proxies `/api` to `localhost:5001` — check `vite.config.ts` if you change the backend port.

### Prisma migrations

```bash
# After editing schema.prisma
cd vendorBackend
npx prisma migrate dev --name describe_your_change

# Wipe and re-seed (destructive)
npx prisma migrate reset
npm run prisma:seed
```

### Keeping types in sync

`vendorFrontend/src/types.ts` mirrors the Prisma model shapes manually. When you add a field to `schema.prisma`, update the corresponding interface in `types.ts` or the frontend compiler will catch it at build time.

### Adding a new module

1. Create `vendorBackend/src/modules/<name>/<name>.router.ts`
2. Register it in `src/index.ts` with `app.use('/api/<name>', router)`
3. Apply `authenticate()` and `authorize([...roles])` as needed
4. Add any new models to `schema.prisma` and run `prisma migrate dev`

---

## Deployment

### Option A — single Express server

The backend can serve the pre-built frontend statically. Build both, then point a static middleware at the frontend dist folder:

```bash
cd vendorFrontend && npm run build    # output → vendorFrontend/dist/
cd ../vendorBackend && npm run build  # compiles TS → dist/
node dist/index.js
```

### Option B — separate hosting

1. Build the frontend: `cd vendorFrontend && npm run build`
2. Serve `vendorFrontend/dist/` from any static host (Nginx, Vercel, Cloudflare Pages)
3. Deploy the backend to any Node-capable host; set all environment variables server-side
4. Update the API base URL in `vendorFrontend/src/App.tsx` (currently `localhost:5001`) to point at your backend

### ngrok (demos & previews)

```bash
ngrok start --all --config ngrok.yml
```

`ngrok.yml` defines tunnels for port 3000 (frontend) and 5001 (backend).

### Production database

SQLite is fine for small teams. For anything with concurrent write pressure, update `DATABASE_URL` to a Postgres connection string — Prisma handles everything else with no code changes required.

---

## Security Considerations

**What's already in place:**

- Passwords hashed with bcrypt (10 salt rounds) — plaintext never reaches the DB
- JWT tokens signed with `JWT_SECRET`; keep this at least 32 random characters in production
- Every protected route passes through `authenticate()` before any handler runs
- `authorize([roles])` middleware enforces role checks at the router level
- Multi-tenancy is enforced via `organizationId` on every Prisma query — the value always comes from the verified JWT, never from the request body
- Uploaded files are stored on disk with server-assigned names under `/uploads/`

**What still needs attention before a public deployment:**

- The default `JWT_SECRET` from `.env.example` must be replaced immediately — rotate any tokens if it was ever deployed as-is
- `cors()` is called without an `origin` whitelist, allowing any domain to call the API — restrict this to your frontend's domain
- No rate limiting on auth endpoints — add `express-rate-limit` to `/api/auth/login` and `/api/auth/register` to prevent brute-force and registration abuse
- The file upload endpoint accepts base64 payloads with no MIME-type validation or size cap
- SMTP credentials belong in a secrets manager, not in `.env` files that might get committed
- SQLite has no network-level access control; if moving to Postgres, keep the DB on a private network accessible only to the backend process

---

## Troubleshooting

**`prisma generate` or `prisma migrate` fails**

Run these commands from inside `vendorBackend/`, not the repo root. The schema lives at `vendorBackend/prisma/schema.prisma`.

**Frontend shows network errors / can't reach the API**

Confirm the backend is running on port 5001 and that the Vite proxy in `vendorFrontend/vite.config.ts` targets the same port. If you changed the backend port, update both.

**Emails are not sending**

If `SMTP_*` vars are empty, Nodemailer uses an Ethereal test account — check the backend terminal for the preview URL. If SMTP is configured but delivery is failing, verify the port (587 for STARTTLS, 465 for SSL) and that your provider allows programmatic sending (Gmail requires an App Password, not your account password).

**PDF download returns empty or errors**

The PDF is streamed directly via `res.pipe()`. If the invoice ID doesn't exist, the route returns a 404 before the stream opens — confirm the ID against the database. Also check that the backend process has write access to its working directory.

**Seed fails with "unique constraint" errors**

The seed script is not idempotent. Run `npx prisma migrate reset` first to wipe the database, then re-run `npm run prisma:seed`.

**Role-based UI elements not appearing**

The sidebar and page rendering in `App.tsx` match `currentUser.role` as a case-sensitive string. If the stored role differs from the literal used in `DashboardSidebar.tsx`, the condition silently fails — verify the exact value in the database matches what the component checks.

**ngrok tunnel keeps disconnecting**

The free ngrok tier has session time limits. Use a paid plan or self-host an alternative (e.g., Cloudflare Tunnel) if you need a stable public URL for a demo.

---

## Future Improvements

These are gaps visible from the current codebase — not speculative additions.

- **Idempotent seed** — the seed has no upsert logic, so re-running it without a full reset throws constraint errors; wrapping each insert in `upsert` would fix this
- **Request body validation** — no schema validation layer (Zod, Joi, etc.) sits between the router and Prisma; malformed payloads produce raw Prisma errors that leak internal detail
- **Rate limiting on auth** — `express-rate-limit` on login and register is a small addition with a real security payoff
- **CORS origin whitelist** — locking down the allowed origins is a one-liner in `index.ts`
- **File upload hardening** — MIME-type checking and a size cap before any file hits disk
- **Token revocation** — JWTs have no server-side revocation; a short expiry combined with refresh tokens would allow real logout behaviour
- **Pagination on list endpoints** — all list routes return the full dataset; as data grows this will become a problem for both performance and UI
- **Frontend API layer** — all fetch calls are inlined in `App.tsx`; extracting them into a typed client module would make the file significantly easier to navigate and test
- **Environment-aware API URL** — the backend URL is hardcoded to `localhost:5001` in the frontend; this should be injected via `import.meta.env` so the same build can point at different environments
- **Test coverage** — particularly around the quotation approval → auto-PO path, which carries enough derived business logic (unit price, GST calculation) to warrant integration tests

---

## Contributors

- **Krish Patel**
- **Krushil Patel**
- **Megh Patel**
- **Smit Patel**
