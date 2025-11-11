# Proof Response Funding Intelligence Engine ⚡

> This platform extends PipeProof’s main website by automating the discovery and structuring of grants, rebates, RFPs, RFQs, bursaries, and co-marketing funds across B2B and B2C markets. It ensures every opportunity is structured, scored, and ready for activation by the Proof360 ecosystem.

A clean, minimal, and scalable Next.js application that will power the Proof Response Funding Intelligence Engine. It ships with MongoDB (via Mongoose), basic authentication, and a protected dashboard, ready to extend with future automation.

## Highlights

- **Automated discovery**: pipelines to ingest and create funding opportunities
- **Structured intelligence**: region, vertical, eligibility, amounts, deadline, tags, status
- **B2B vs B2C ready**: supports RFPs/RFQs/Tenders (B2B), rebates (Both), grants/bursaries (Both), co‑marketing funds (Primarily B2B)
- **Activation‑ready**: unified responses, CORS, and auth for Proof360 activation
- **Simple auth**: JWT in HTTP‑only cookie (`token`) with `/auth/login`, `/auth/signup`, `/auth/me`, `/auth/logout`
- **MongoDB via Mongoose**: clean models for `User` and `FundingOpportunity`
- **Consistent API**: `jsonSuccess` / `jsonError` helpers and standard validation

## Table of Contents

- Core Concepts & Terminology
- System Roles & Flow (Summary)
- API Overview (TL;DR)
- API Endpoints (Detailed)
- API Requirements & Conventions
- Automation of Tasks (Roles, Flow, 12‑Week Plan)
- Installation & Setup
- Project Structure
- Development Notes
- Next Steps
- License

## Core Concepts & Terminology

- Funding Opportunity: grant, rebate, RFP/RFQ/tender, bursary, or co‑marketing fund discoverable by the upstream engine.
- OffersCanonical: normalized schema (title, amounts, currency, region, vertical, eligibility, deadline, tags, status).
- ProofScore: per‑opportunity scoring of value, eligibility, and urgency to guide activation.
- Upstream (Discovery / Data Engine): automated discovery, parsing, normalization, deduplication, scoring.
- Midstream (Activation Layer): validates and deploys opportunities to sites, landing pages, campaigns, vendor workflows.
- Parallel (Financing Systems): BNPL, vendor credit, 0% financing, lease‑to‑own programs attachable to offers.
- Downstream (Finance Oversight): ROI tracking, reimbursements, inflows, lifecycle credits.
- B2B vs B2C mapping:
  - B2B only: RFPs/RFQs/Tenders
  - Both: Rebates; Grants/Funding/Bursaries
  - Primarily B2B: Co‑Marketing Funds
- Eligibility: rules for who qualifies (industry, company size, consumer profile, region).
- Status: open, closed, or unknown.
- Lifecycle: Discovery → Normalization → Scoring → Activation → Measurement.

## System Roles & Flow (Summary)

| Stage                  | Owner                              | Output                                      |
|------------------------|------------------------------------|---------------------------------------------|
| Discovery (Upstream)   | Adeel                              | Normalized, scored opportunities (ProofScore)|
| Activation (Midstream) | Shubham                            | Live offers across web, vendors, campaigns  |
| Financing (Parallel)   | Monetization & Financing Architect | Credit/payment programs linked to offers    |
| Finance (Downstream)   | Yinka                              | ROI, reimbursements, lifecycle credits      |

## Project Structure

```
proof-response/
├── pages/              # Next.js pages and API routes
│   ├── api/           # Backend API endpoints
│   │   ├── auth/      # Authentication routes (login, signup, logout, me)
│   │   ├── users/     # User CRUD routes
│   │   ├── test.js    # Example API endpoint
│   │   └── test-db.js # MongoDB connection test endpoint
│   ├── index.js       # Main homepage
│   ├── login.js       # Login page
│   ├── signup.js      # Signup page
│   └── dashboard.js   # Protected dashboard
│   └── _app.js        # Next.js app wrapper
├── components/         # Reusable React components
│   ├── Header.js      # Site header component
│   ├── Footer.js      # Site footer component
│   └── Layout.js      # Main layout wrapper
├── lib/                # Utility functions and helpers
│   ├── db.js          # Mongoose connection helper
│   └── auth.js        # JWT helpers and cookie utilities
├── models/             # Mongoose models
│   └── User.js        # User schema and model
├── styles/             # Global styles
│   └── globals.css    # Global CSS styles
├── scripts/            # Automation scripts (placeholder)
├── .env                # Environment variables (MongoDB URI, JWT secret)
├── .env.example        # Example environment variables
├── next.config.js      # Next.js configuration
└── package.json        # Project dependencies
```

## Folder Purposes

### `/pages`
Contains all Next.js pages and API routes. The `/pages/api` subdirectory houses all backend API endpoints that handle server-side logic and database operations.

### `/components`
Reusable React components that can be used across different pages. Currently includes Header, Footer, and Layout components.

### `/lib`
Utility functions and helpers. The `db.js` file provides a Mongoose connection helper that manages MongoDB connections with caching to prevent multiple connections during development hot reloads.

### `/styles`
Global CSS styles and theme variables. The `globals.css` file is imported in `_app.js` and applies site-wide styling.

### `/scripts`
Placeholder directory for future automation scripts, build tools, or deployment scripts.



## API Overview (TL;DR)

- Auth: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Users: `GET /api/users`, `POST /api/users` (admin), `GET/PUT/DELETE /api/users/:id`
- Funding: `GET /api/funding-opportunity/list`, `GET /api/funding-opportunity/:id`, `POST /api/funding-opportunity/create`
- Utilities: `GET /api/test`, `GET /api/test-db`

## API Endpoints (Detailed)

### Auth

- **POST** `/api/auth/signup`
  - Create a user and set HTTP-only auth cookie.
  - Body (JSON): `{ name: string, email: string, password: string, role?: 'user'|'admin' }`
  - Responses:
    - 201 `{ success: true, data: { user, token } }`
    - 400 `Missing required field(s)` / invalid email
    - 409 `Email already registered`
    - 500 if `JWT_SECRET` is not configured
- **POST** `/api/auth/login`
  - Authenticate and set HTTP-only auth cookie.
  - Body (JSON): `{ email: string, password: string }`
  - Responses: 200 with `{ user, token }`, 401 invalid creds, 500 if `JWT_SECRET` missing
- **POST** `/api/auth/logout`
  - Clears auth cookie. Response: 200 `{ message: 'Logged out' }`
- **GET** `/api/auth/me`
  - Returns current authenticated user from cookie or `{ user: null }` if not logged in

### Users

- **GET** `/api/users`
  - List users (password omitted)
- **POST** `/api/users` (admin only)
  - Create user. Body: `{ name, email, password, role? }`
  - Requires an authenticated admin (via cookie)
- **GET** `/api/users/:id`
- **PUT** `/api/users/:id`
  - Auth required. Non-admins cannot change `role`. Use dedicated flow to change password.
- **DELETE** `/api/users/:id` (admin only)

### Funding Opportunities

- **GET** `/api/funding-opportunity/list`
  - Query params: `limit?=number` (default 50, max 200), `offset?=number` (default 0)
  - Response: `{ items, total, limit, offset }`
- **GET** `/api/funding-opportunity/:id`
  - `id` must be a valid MongoDB ObjectId
- **POST** `/api/funding-opportunity/create`
  - Creates a funding opportunity
  - If an authenticated user cookie is present, `createdBy` is set automatically
  - Body (JSON):
    ```json
    {
      "title": "string (required)",
      "description": "string",
      "source": "string",
      "url": "string",
      "deadline": "ISO date string",
      "amountMin": 0,
      "amountMax": 10000,
      "currency": "USD",
      "eligibility": "string",
      "tags": ["string"],
      "status": "open|closed|unknown"
    }
    ```
  - Validation:
    - `title` required
    - `amountMin`/`amountMax` must be numbers; `amountMin` ≤ `amountMax`
    - `deadline` must be a valid date string
    - `id` path parameters must be valid ObjectId where applicable

### Utilities / Examples

- **GET** `/api/test` — Simple health check JSON
- **GET** `/api/test-db` — Connects to MongoDB, writes, and returns a test document

You can extend this by adding more endpoints in `/pages/api/` following the same patterns.

## API Requirements & Conventions

- Content-Type: use `application/json` for request bodies
- Authentication: JWT stored in HTTP-only cookie named `token`
  - Set via `/api/auth/login` and `/api/auth/signup`
  - Read via server-side helper `getUserFromRequest`
- Environment variables:
  - `MONGODB_URI` (required in production)
  - `JWT_SECRET` (required; used to sign/verify auth tokens)
- CORS:
  - Lightweight CORS with preflight support is applied in funding routes
  - Allowed headers: `Content-Type, Authorization`; credentials enabled
- Error/Success Response Shape:
  - Success: `{ success: true, message, data? }`
  - Error: `{ success: false, message, error? }`
  - Implemented via `lib/response.js`
- Pagination:
  - `limit` and `offset` query params (defaults: 50, 0; max limit: 200) where applicable



## Development Notes

- This project uses the **Pages Router** (not App Router)
- **No TypeScript** - all files use JavaScript
- **No ESLint** - minimal linting setup
- Components use **styled-jsx** for scoped styling
- Mongoose connection is optimized for both development and production with connection caching
- Authentication uses HTTP-only cookies with JWT. Update `JWT_SECRET` in `.env`.

## Next Steps

1. Add more API endpoints in `/pages/api/`
2. Create additional pages in `/pages/`
3. Build out reusable components in `/components/`
4. Extend the MongoDB connection with specific database operations
5. Add authentication if needed
6. Implement CRUD operations for your data models

## Automation of Tasks

The project includes a foundation for automating upstream funding data ingestion and normalization. It reflects the upstream → activation → financing flow required by Proof360:

- Controllers and validation for creating/listing funding opportunities
- CORS and unified error handling for API routes
- Placeholders for ProofScore and normalization (`utils/proofscore.js`) to evolve into the Funding Intelligence Engine

### ⚡ Teams Message — Introducing Adeel (Final Polished Version)

Excited to officially welcome Adeel to the Proof360 core team.

He’ll be leading the new Funding Intelligence System — the upstream engine that powers every grant, rebate, and funding opportunity across both B2B and B2C.

Please welcome Adeel, who’s officially leading the build of our Funding Intelligence System inside Proof360.

Adeel’s mission is to build and maintain the upstream engine that constantly discovers, structures, and feeds grants, rebates, RFPs, RFQs, bursaries, co-marketing funds, and other funding opportunities into Proof360 — across both B2B and B2C markets.

In simple terms:

- Adeel finds and structures the money.
- Shubham activates and monetizes it.
- Our upcoming Monetization & Financing Architect manages credit and payment systems (BNPL, trade credit, 0% financing).
- Yinka oversees financial inflows, reimbursements, and ROI tracking.

💡 Adeel — Funding Intelligence (Upstream / Data Engine)

- Automates discovery of all funding types (grants, rebates, bursaries, RFPs/RFQs, co-marketing funds).
- Structures everything into Proof360’s schema with region, vertical, eligibility, and value scoring (ProofScore).
- Distinguishes B2B vs B2C clearly:
  - RFPs/RFQs/Tenders → B2B only
  - Rebates → Both B2B & B2C
  - Grants/Funding/Bursaries → Both B2B & B2C
  - Co-Marketing Funds → Primarily B2B
- Works with Manjiri (schema), Abhinav (AI tagging), and Yinka (financial classification) to ensure every opportunity is structured, accurate, and ready to activate.

💰 Shubham — Funding Monetization (Midstream / Activation Layer)

- Turns Adeel’s structured data into active offers visible across our ecosystem.
- Works with Aastha & Rahman to deploy dynamic funding and rebate offers across the website, landing pages, and ad campaigns.
- Partners with Jeremy to align vendors with relevant RFPs and RFQs.
- Coordinates with Yinka for financial validation and ROI tracking.
- Hands all financing-related items to our Monetization & Financing Architect for credit and payment design.

🏗️ Monetization & Financing Architect (Upcoming Role)

- Owns all repayable and credit-based programs — BNPL, vendor credit, 0% financing, lease-to-own, etc.
- Works closely with Yinka to integrate repayment, financing, and ROI systems into Proof360.

🧭 The Flow

| Stage                    | Owner                            | Description                                                                 |
|--------------------------|----------------------------------|-----------------------------------------------------------------------------|
| Discovery (Upstream)     | Adeel                            | Finds, structures, and scores all funding and rebate opportunities.        |
| Activation (Midstream)   | Shubham                          | Validates, activates, and deploys offers to marketing, vendors, customers. |
| Financing (Parallel)     | Monetization & Financing Architect | Designs and manages all credit and payment systems.                         |
| Finance Oversight        | Yinka                            | Tracks ROI, inflows, reimbursements, and lifecycle credits.                |

📊 Adeel’s 12-Week Phased Approach

| Phase  | Timeline   | Focus                                   | Collaborators                 | Example Deliverables |
|--------|------------|-----------------------------------------|-------------------------------|----------------------|
| Phase 1| Week 1     | Transition FVG Global Assist → Proof Response | Anne, Lynne, Manjiri       | Move automations to `recruit.proofresponse.com`; wire APIs (`/api/newCandidate`, `/api/requestIntro`, `/api/jobComplete`); create city + service URLs (`/ab/calgary/electrician/high-voltage-electrician/`). |
| Phase 2| Weeks 2–5  | Build the Funding Intelligence Engine   | Shubham, Abhinav, Yinka      | Automate grants, rebates, RFPs; normalize data into `OffersCanonical`; apply ProofScore tagging (value, eligibility, urgency); QA accuracy ≥ 95%. |
| Phase 3| Weeks 6–9  | Integrate with Proof360 + launch across 5 cities | Yinka, Jeremy, Manjiri | Link Recruiting + Funding data; create unified dashboards; activate Calgary → Winnipeg → Edmonton → Saskatoon → Regina; train ProofScore on closed wins. |
| Phase 4| Weeks 10–12| Optimize & Globalize                    | Yinka, Manjiri, Seun         | Add global fields (country, FX rate); refactor pipelines; finalize performance reports; document runbooks in Proof360 Registry. |

In practice, Adeel’s system powers both sides of the business — **B2B** (RFPs, RFQs, vendor grants, co‑marketing funds) and **B2C** (rebates, residential funding, bursaries, consumer energy programs). It ensures Proof360 always knows what funding exists, who it applies to, and how to activate it.

## Installation & Setup

### Prerequisites

- Node.js 18.x or later
- MongoDB instance (local or cloud)

### Installation (Local)

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env` (or `.env.local`)
   - Update values as needed:
     ```env
     MONGODB_URI=mongodb://127.0.0.1:27017/proofresponse
     JWT_SECRET=change_me_to_a_long_random_string
     NEXT_PUBLIC_BASE_URL=http://localhost:3000
     ```
   - For production, set `MONGODB_URI` to your managed MongoDB URI and use a strong `JWT_SECRET`

3. Run the development server:
```bash
npm run dev
```

4. Open `http://localhost:3000` in your browser.

### Windows: Fixing SWC Binary Warning/Errors

If you see:

```
⚠ Attempted to load @next/swc-win32-x64-msvc, but an error occurred:
⨯ Failed to load SWC binary for win32/x64
```

Follow these steps:

1) Verify 64‑bit Node.js
```powershell
node -p "process.platform + ' ' + process.arch + ' ' + process.versions.node"
```
Expected: `win32 x64 <node-version>`. If you see `ia32`, uninstall Node and install the 64‑bit LTS (Node 20+ recommended).

2) Install Microsoft Visual C++ Redistributable (x64)
Install the latest supported x64 redistributable for Visual Studio 2015–2022, then restart the terminal:
`https://aka.ms/vs/17/release/vc_redist.x64.exe`

3) Clean install
```powershell
rd /s /q node_modules
rd /s /q .next
del /f /q package-lock.json
npm cache clean --force
npm install
```

4) Start dev server
```powershell
npm run dev
```

5) Optional fallback (only if the error persists)
- Disable SWC minify in `next.config.js`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // fallback to Terser
}
module.exports = nextConfig
```
- Or use Babel by adding a `.babelrc`:
```json
{
  "presets": ["next/babel"]
}
```
Then re-run the clean install steps above.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## License

Private project - All rights reserved

