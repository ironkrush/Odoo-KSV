# VendorBridge Procurement ERP

Centralized Procurement & Vendor Management ERP built with **React/Vite/TS (Frontend)** and **Express/Prisma/SQLite (Backend)** using **Vertical Slice Architecture**.

## Demo Credentials

You can use these accounts to sign in and test different roles in the portal:

| Role | Email Address | Password |
|---|---|---|
| **Procurement Officer** | `procurement@vendorbridge.com` | `procure123` |
| **Manager / Approver** | `manager@vendorbridge.com` | `manage123` |
| **Vendor** | `vendor@vendorbridge.com` | `vendor123` |
| **Admin** | `admin@vendorbridge.com` | `admin123` |

---

## Local Setup

### 1. Environment Configuration
Create a `.env` file in the `vendorBackend/` directory and configure your SMTP variables to send real emails:
```env
PORT=5001
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="super-secret-vendorbridge-key-2026-draft"

# SMTP Gmail parameters
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password

# Custom Sender and Recipient Emails
SENDER_EMAIL="your_gmail@gmail.com"
VENDOR_EMAIL="friend_email@example.com"
```

### 2. Seeding & Database setup
Install dependencies and run the Prisma seed script to set up default organizations, roles, and initial demo items:
```bash
cd vendorBackend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 3. Running the servers

#### Run Backend:
```bash
cd vendorBackend
npm run dev
```

#### Run Frontend:
```bash
cd vendorFrontend
npm install
npm run dev
```
*(The frontend automatically proxies to `localhost:5001` or maps to your backend's host location).*
