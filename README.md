# ReferBridge — Hospital Referral & Patient Coordination Network

## Evaluation 1–2 Integration & React Migration

ReferBridge is a unified healthcare capacity coordination platform connecting regional hospitals, intensive care units, and emergency triage coordinators. This release upgrades the initial static/vanilla prototype into an incremental **React + Vite** hybrid architecture powered by **Supabase (PostgreSQL, Auth, RLS)** and **Google Maps / Routes API**, adhering strictly to the React syllabus (Topics 49–72).

---

## 1. Architecture & Technology Stack

- **Frontend**:
  - **React 18** with **Vite** for blazing fast HMR and optimized production bundles.
  - **React Router (HashRouter)**: Multi-page SPA navigation (`#/login`, `#/dashboard`, `#/network`, `#/patients`, `#/requests`) that functions seamlessly across local file environments, VS Code Live Server, Vite dev server, and production hosts.
  - **Context API**: `AuthContext` (session, user profile, role-based access) and `ToastContext` (notifications).
  - **CSS3 & Design Preservation**: Preserved 100% of the ReferBridge visual identity—aurora backgrounds, animated floating orbs, moving referral journey banner, radar animations, light/dark mode themes, and responsive sidebar navigation.
  - **Vanilla JavaScript**: Retained legacy pages (`home.html`, `beds.html`, `profile.html`, `analytics.html`) with interactive bridges.
- **Backend & Database**:
  - **Supabase Auth**: Real user authentication, session persistence, role-based access for `admin` and `hospital_staff`.
  - **PostgreSQL Database**: Structured relational schema with tables: `hospitals`, `profiles`, `patients`, `referrals`.
  - **Row Level Security (RLS)**: Enforces access control on hospital listings, patient records, and referral triage actions.
  - **Automatic Triggers**: Profile creation on signup, `updated_at` timestamps.
- **Third-Party APIs**:
  - **Google Maps JavaScript API**: Real-time interactive map, custom markers with capacity status, and InfoWindows.
  - **Google Routes API / DirectionsService**: Multi-facility route rendering, road distance, and travel duration calculations with graceful fallback.

---

## 2. Directory Structure

```
REFERBRIDGE/
├── assets/                          # Images, SVGs, video backgrounds, brand icons
├── scripts/                         # Maintenance and legacy bridge scripts
│   ├── updateLegacyPages.js
│   └── updateNav.js
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx   # Route guard for authenticated staff/admin
│   │   └── layout/
│   │       ├── AppLayout.jsx        # Shell layout for React portion
│   │       ├── Sidebar.jsx          # Unified sidebar with theme toggle & logout
│   │       └── Topbar.jsx           # Top header with capacity indicators & status
│   ├── context/
│   │   ├── AuthContext.jsx          # Supabase session, role checks, login/logout
│   │   └── ToastContext.jsx         # Global toast system synced with legacy
│   ├── lib/
│   │   └── supabaseClient.js        # Supabase client initializer & config check
│   ├── pages/
│   │   ├── Dashboard.jsx            # Live database metrics, KPIs, recent triage
│   │   ├── HospitalNetwork.jsx      # Dynamic hospital CRUD, filters, Google Map & Routes
│   │   ├── Login.jsx                # Backend login, form validation, animated visual panel
│   │   ├── PatientRecords.jsx       # Patient CRUD, dossiers, referral handoff
│   │   └── ReferralRequests.jsx     # Referral status lifecycle (Pending/Accepted/Declined)
│   ├── services/
│   │   ├── authService.js           # Supabase Auth with evaluation fallback
│   │   ├── hospitalService.js       # Hospital PostgreSQL CRUD & queries
│   │   ├── mapsService.js           # Google Maps, Routes & Haversine fallback
│   │   ├── patientService.js        # Patient registry PostgreSQL CRUD
│   │   └── referralService.js       # Referral lifecycle & database persistence
│   ├── App.jsx                      # HashRouter configuration
│   └── main.jsx                     # Vite React root entry
├── supabase/
│   └── schema.sql                   # Complete PostgreSQL schema, RLS, triggers & seed data
├── tests/
│   └── eval_tests.mjs               # 15-point automated verification test suite
├── .env.example                     # Environment variables template
├── index.html                       # Vite entry point hosting React SPA
├── index.legacy.html                # Backup snapshot of original vanilla login
├── home.html                        # Legacy landing hub with video & journey story
├── dashboard.html                   # Legacy dashboard snapshot with React switcher
├── network.html                     # Legacy network snapshot with React switcher
├── requests.html                    # Legacy requests snapshot with React switcher
├── beds.html                        # Bed capacity management view
├── profile.html                     # Hospital profile settings
├── analytics.html                   # Referral flow analytics
├── signup.html                      # Hospital registration portal
├── package.json                     # Vite, React, React Router, Supabase dependencies
└── vite.config.js                   # Multi-page Vite configuration
```

---

## 3. Quick Start & Setup Instructions

### Prerequisites
- **Node.js** v18+ (tested on Node.js v24)
- **npm** v9+

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your Supabase and Google Maps credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-public-key-here
VITE_GOOGLE_MAPS_API_KEY=AIzaSyYourGoogleMapsApiKeyHere
```
> **Evaluation Mode Note**: If API keys are not supplied, ReferBridge automatically activates **Evaluation Demo Mode** with pre-seeded data, in-memory/localStorage persistence, and geographic route estimation. The UI and all workflows remain 100% testable out of the box!

### Step 3: Run the Database Migrations (Supabase)
In your Supabase project dashboard:
1. Navigate to the **SQL Editor**.
2. Open `supabase/schema.sql`.
3. Paste and run the entire script. It creates:
   - Tables: `hospitals`, `profiles`, `patients`, `referrals`.
   - Triggers for automatic `updated_at` and new user profile provisioning.
   - Row Level Security (RLS) policies for authenticated operations.
   - Realistic seed data for 8 regional Punjab/Chandigarh hospitals, 5 patient cases, and 5 referral requests.

### Step 4: Run the Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### Step 5: Build for Production
```bash
npm run build
```
Creates an optimized, minified production distribution in `/dist`.

---

## 4. Evaluation Credentials

- **Admin Account**: `admin@referbridge.com`
- **Password**: `admin123`
- **1-Click Auto Fill**: Click **"⚡ 1-Click Auto Fill"** on the Login card to immediately populate and test authentication.

---

## 5. Automated Verification Tests

A comprehensive 15-test suite verifies all core functionality:
```bash
node tests/eval_tests.mjs
```

### Verified Test Categories:
1. **Maps & Routing Logic**: Haversine distance calculations, coordinate edge cases, and transit duration estimation.
2. **Authentication & Roles**: Admin sign-in, session resolution, invalid password rejection, and role-based permissions.
3. **Hospital Network Dynamic Directory**: Database retrieval, new facility registration, capacity updates, and sorting.
4. **Patient Records Clinical Registry**: Record retrieval, patient creation with validation, and medical history updates.
5. **Referral Requests & Status Lifecycle**: Queue retrieval, outbound referral creation, and status transitions (`Pending` ➔ `Accepted` ➔ `Cancelled`).
