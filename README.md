# EstateFlow — Production White-Label Multi-Tenant Real Estate CRM SaaS Platform

EstateFlow is a commercial-grade, multi-tenant B2B SaaS platform specifically engineered for real estate builders, developers, and platform operators. Built on **Next.js 16 (App Router)**, **TypeScript**, **Prisma ORM**, and **Tailwind CSS**.

---

## 🌟 Key Architecture & Capabilities

### 1. Multi-Tenant Architecture & Data Isolation
- **Shared Infrastructure, Strict Tenant Isolation**: Every business record is scoped with an `organizationId`. A user from ABC Builders can never query, edit, or view records from XYZ Developers.
- **Dynamic White-Labeling**: Each real estate builder gets their own company branding, logo, palette (`primaryColor`, `secondaryColor`, `accentColor`), and portal welcome messaging.

### 2. Multi-Tier Role Hierarchy & RBAC
- **Platform Super Admin**: Control plane (`/admin`) for SaaS operators. Manage organizations, subscription plans, quotas, lifecycle status (Active/Suspended/Archived), audit logs, and webhook health.
- **Business Owner**: Full tenant workspace administration (`/org/[slug]`). Manages projects, sales teams, CRM pipelines, branding, and Meta integrations.
- **Sales Manager**: Team oversight, lead reassignments, site visit compliance, and sales metrics.
- **Salesperson**: Personal pipeline, assigned leads, call logs, follow-up scheduler, site visit tours, and unit deal bookings.

### 3. Real Estate CRM Workflows
- **Lead Lifecycle Pipeline**: `NEW` → `CONTACTED` → `QUALIFIED` → `SITE_VISIT_SCHEDULED` → `SITE_VISIT_COMPLETED` → `NEGOTIATION` → `WON_BOOKED` → `LOST`.
- **Kanban Board & Table**: Drag/click stage advancement, multi-criteria filtering (Source, Project, Salesperson, Priority, Temperature).
- **Auto-Assignment Engine**: Backend-driven **Round-Robin** and **Least-Active** allocation with capacity overflow guards and unassigned fallback queues.
- **Unit Bookings**: Record unit number, agreed deal value, token deposit advance, and contract notes.

### 4. Official Meta Lead Ads Integration
- **Webhook Endpoint**: `/api/webhooks/meta` supporting GET verification challenge and POST real-time lead ingestion.
- **HMAC SHA-256 Verification**: Cryptographic payload verification preventing spoofed requests.
- **Auto-Routing**: Resolves Meta Page & Form ID to the owning tenant and maps to target real estate projects.

---

## 🚀 Quick Start Guide

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your configuration:
- `DATABASE_URL`: PostgreSQL connection string (Supabase / Neon / Local PostgreSQL).
- `JWT_SECRET`: 32+ character random secret for secure session cookies.
- `META_APP_SECRET` & `META_WEBHOOK_VERIFY_TOKEN`: From Meta App Dashboard.

### 2. Seed Initial Demo Tenants & Roles
Run the database bootstrap script:
```bash
npm run seed
```
This populates:
- **Platform Super Admin**: `superadmin@estateflow.io` / `ChangeThisPassword123!`
- **ABC Builders (Owner)**: `john@abcbuilders.com` / `Password123!`
- **ABC Builders (Sales)**: `bob@abcbuilders.com` / `Password123!`
- **XYZ Developers (Owner)**: `owner@xyzdev.com` / `Password123!`

### 3. Run Automated Tests
```bash
npm test
```
Executes the comprehensive automated test suite verifying:
- Password hashing & JWT session security
- Multi-tenant data isolation & IDOR prevention
- Lead round-robin and capacity balancing
- Meta webhook HMAC signature verification
- KPI statistics and conversion calculations

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Landing Gateway**: [http://localhost:3000](http://localhost:3000)
- **Role Sign In**: [http://localhost:3000/login](http://localhost:3000/login)
- **Platform Admin Control Plane**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **ABC Builders Workspace**: [http://localhost:3000/org/abc-builders](http://localhost:3000/org/abc-builders)
- **XYZ Developers Workspace**: [http://localhost:3000/org/xyz-developers](http://localhost:3000/org/xyz-developers)

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 🔒 Security & Tenant Protection
- **No Client Organization Trust**: Tenant resolution occurs server-side via authenticated session context and validated slug parameters.
- **Audit Logs**: Platform-wide security actions are written to immutable audit logs.
- **Tamper-Evident Sessions**: Secure HttpOnly cookies signed via HMAC-SHA256 with expiration enforcement.
