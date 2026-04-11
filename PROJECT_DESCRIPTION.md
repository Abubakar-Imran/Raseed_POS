# Raseed Project Description

## 1. Project Summary
Raseed is a role-based digital receipt and loyalty platform for retailers and customers. It replaces paper receipts with an API-first receipt pipeline, then turns purchase data into customer rewards, retailer analytics, feedback insights, and sustainability tracking.

The solution combines a Next.js full-stack app, Supabase-hosted PostgreSQL data access, JWT authentication, and POS-facing APIs. It is designed to support two primary personas:
- Customer users: OTP-based login, receipt history, rewards, sustainability view, and feedback submission.
- Retailer users: email verification onboarding, password-based sign-in, dashboard analytics, loyalty rule management, customer feedback monitoring, and sustainability metrics.

## 2. Problem Statement
Traditional paper receipts create multiple issues:
- Lost or inaccessible purchase history for customers.
- Limited customer retention mechanisms for small and medium retailers.
- Poor post-purchase visibility for both stores and buyers.
- Environmental cost from thermal paper usage.

Raseed addresses these gaps with a digital-first post-purchase experience that is practical for POS workflows and simple for end users.

## 3. Core Product Capabilities

### 3.1 Digital Receipt Capture
- POS systems send receipts to a backend endpoint.
- Customer identity is resolved by email (existing or auto-created customer profile).
- Receipt and line items are stored as structured records.

### 3.2 Loyalty and Discount Automation
- Retailers define milestone-based loyalty rules (e.g., every N receipts).
- On new receipt ingestion, customer loyalty counters are updated.
- Eligible discounts are generated automatically with expiration windows.
- POS can check and apply available discounts in real time.

### 3.3 Customer Experience
- OTP email login flow for low-friction authentication.
- Dashboard with recent purchases, total spend snapshots, and active rewards.
- Receipt detail view with itemized purchases.
- Feedback submission linked to specific receipts.
- Sustainability view translating receipt usage into impact metrics.

### 3.4 Retailer Experience
- Registration with email verification and token-based password setup.
- Dashboard KPIs: total receipts, total revenue, repeat customers, average rating.
- Loyalty rules CRUD (create + list + delete).
- Feedback monitoring with customer and receipt context.
- Profile management including guarded password update flow.

### 3.5 Sustainability Tracking
- Per-retailer sustainability stats are calculated from receipt counts.
- Estimated carbon reduction uses an explicit factor (5g CO2e per digital receipt).
- Customer and retailer sustainability pages surface impact data in business-friendly language.

## 4. Technical Stack
- Frontend: Next.js 16 (App Router), React 19, TypeScript.
- UI: Tailwind CSS v4, shadcn/base-nova component style, lucide-react icons.
- State and data fetching: TanStack React Query.
- Backend: Next.js route handlers (API routes in app directory).
- Data layer: Supabase JS client against PostgreSQL schema.
- Authentication/security: JWT (jsonwebtoken), bcrypt, OTP flow.
- Email: Nodemailer (SMTP or Ethereal test account fallback).
- Tooling: ESLint, TypeScript strict mode, PostCSS, Turbo dev mode.

## 5. Data Model (High-Level)
Primary entities and purpose:
- Retailer: merchant account, verification and credentials.
- Branch: store branch metadata.
- Customer: buyer identity by email.
- Receipt and ReceiptItem: transaction and line-item records.
- LoyaltyRule: retailer-defined thresholds and reward settings.
- CustomerLoyalty: per retailer-customer accumulation metrics.
- Discount: generated customer rewards with status lifecycle.
- Feedback: rating and optional comment tied to a receipt.
- SustainabilityStats: paper saved and estimated carbon saved.

## 6. API Surface (Representative)
- Auth: register, verify registration token, set password, login, send OTP, verify OTP.
- POS: receipt ingestion, discount check, discount apply.
- Domain read APIs: receipts by id/customer/retailer, discounts by customer, rules by retailer.
- Management APIs: create/delete loyalty rules, retailer profile patch.
- Insights APIs: retailer analytics, retailer feedback list, sustainability stats.

## 7. Architecture Highlights
- Monorepo-style single Next.js codebase serving both frontend and API.
- Role-separated dashboards with shared component system.
- Event-like behavior through Supabase realtime broadcast on new receipts.
- Service layer abstraction for loyalty evaluation and sustainability syncing.
- Uses localStorage tokens for browser session persistence and route-level client checks.

## 8. Engineering Decisions and Trade-Offs

### Strengths
- Fast iteration with unified frontend/backend stack.
- Clean entity model aligned with business outcomes.
- Practical POS integration endpoints for real-world adoption.
- Clear value proposition combining retention + sustainability.

### Trade-offs / Current Risks
- OTP store is in-memory (not distributed/persistent).
- Some authorization checks are token-presence based rather than deep role enforcement.
- Prisma schema remains in repo while runtime path is Supabase client based.
- Type safety is partially generic in database typings.

## 9. Business Value
This project demonstrates full ownership across product and engineering:
- End-to-end product design (UX + APIs + data model).
- Multi-role architecture (customer + retailer + POS integration).
- Secure onboarding and authentication workflows.
- Analytics, rewards engine logic, and sustainability metrics.
- Production-oriented integration patterns (email delivery, real-time notifications, modular services).

## 10. Description
Built Raseed, a full-stack digital receipt and loyalty platform using Next.js, TypeScript, Supabase/PostgreSQL, and React Query. Designed and implemented role-based customer and retailer dashboards, POS-integrated receipt ingestion APIs, automated loyalty/discount rule engine, retailer analytics, feedback pipeline, JWT/OTP authentication flows, and sustainability impact tracking. Delivered an API-first architecture that converts transaction data into retention insights and measurable environmental value.
