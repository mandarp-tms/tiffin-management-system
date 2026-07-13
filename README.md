# 🍱 Tiffinger — Frontend

A daily tiffin tracking and billing web application built with **React JS + Vite**.
Supports a 3-level hierarchy: Super Admin → Tiffin Center → Customer.

---

## 🚀 Tech Stack

| Layer        | Technology                                        |
|--------------|---------------------------------------------------|
| Frontend     | React 19 (Vite)                                   |
| UI Library   | PrimeReact + PrimeFlex + PrimeIcons               |
| Icons        | React Icons (FontAwesome)                         |
| Routing      | React Router DOM v7                               |
| State        | React Context API (AuthContext)                   |
| HTTP Client  | Axios (via `apiClient` with interceptors)         |
| Charts       | Chart.js                                          |
| Styling      | CSS Modules (scoped, colocated)                   |
| Class utils  | clsx                                              |
| Data         | Live API calls — backend on Node.js + Express     |

---

## 🏗️ Role Hierarchy

```
Super Admin
    │
    ├── Tiffin Center (manages its own customers + pricing)
    │        │
    │        ├── Customer A
    │        ├── Customer B
    │        └── ...
    │
    └── Tiffin Center (future — multi-center support planned)
```

Super Admin oversees all tiffin centers. Each tiffin center independently manages its own customers, pricing, approvals, and payments.

---

## 📁 Folder Structure

```
src/
├── assets/
│   └── logo.png                            # App logo — sidebar/topbar/login/favicon
│
├── mock/                                   # Legacy mock data — kept for reference
│   ├── users.js                            # Users with role + centerId
│   ├── tiffins.js                          # Tiffin entries with shift, type, status
│   ├── pricing.js                          # Per-center pricing (pricingByCenter)
│   ├── tiffinCenters.js                    # Tiffin center records
│   ├── approvals.js                        # Pending approval helpers
│   └── payments.js                         # Monthly payment + transaction records
│
├── context/
│   └── AuthContext.jsx                     # currentUser, login(), logout(), isRole(), useAuth()
│                                           # Token stored in localStorage (tms_token / tms_user)
│
├── hooks/
│   └── useApi.js                           # Generic data-fetching hook → { data, loading, error, refetch }
│
├── layouts/
│   ├── MainLayout.jsx + .module.css        # Sidebar + Topbar + scrollable Outlet
│   └── ProtectedRoute.jsx                  # Redirect to /login if not authenticated
│
├── components/
│   ├── AppButton.jsx + .module.css         # Reusable button (variants + sizes)
│   ├── AppDropdown.jsx + .module.css       # Reusable custom dropdown
│   ├── AppDataTable.jsx + .module.css      # Reusable table with built-in pagination
│   ├── AppDatePicker.jsx + .module.css     # Custom date picker (restricted ranges)
│   ├── AppInput.jsx + .module.css          # Reusable text input
│   ├── AppIcon.jsx                         # Central icon component (react-icons)
│   ├── Breadcrumb.jsx + .module.css        # Page breadcrumb trail
│   ├── StatusBadge.jsx + .module.css       # Badge — status/type/shift/payment
│   ├── StatCard.jsx + .module.css          # Dashboard stat card
│   ├── CustomerHistoryChart.jsx + .module.css    # Chart.js bar chart — customer tiffin history
│   ├── CenterTypeBreakdownChart.jsx + .module.css # Chart.js chart — tiffin type breakdown per center
│   ├── TiffinCalendar.jsx                  # Calendar view of tiffin entries
│   ├── TiffinTable.jsx                     # Table view of tiffin entries
│   ├── Sidebar.jsx + .module.css           # Role-based nav + profile drawer
│   └── Topbar.jsx + .module.css            # Page title, avatar, logout
│
├── pages/
│   ├── LoginPage.jsx + .module.css         # Username + password login
│   ├── DashboardPage.jsx + .module.css     # Stat cards + tiffin center card + recent log
│   ├── AddTiffinPage.jsx + .module.css     # Add tiffin (type, shift, chapati, date)
│   ├── ApprovalsPage.jsx + .module.css     # Tiffin center approve/reject queue
│   ├── ReportsPage.jsx + .module.css       # Billing report + payment tracking + charts
│   ├── PricingPage.jsx + .module.css       # Set tiffin prices
│   ├── MyBillPage.jsx + .module.css        # Customer's personal bill + payment status
│   ├── UsersPage.jsx + .module.css         # Customer profiles + stats (Tiffin Center view)
│   ├── TiffinCentersPage.jsx + .module.css # Super Admin — centers table + modals
│   └── PaymentModal.jsx + .module.css      # Record payment modal component
│
├── services/                               # Data layer — only this changes on API changes
│   ├── authService.js                      # login(), getMe(), logout()
│   ├── tiffinService.js                    # getAllTiffins, addTiffin, approve, reject
│   ├── userService.js                      # getTiffinUsers, getUserStats
│   ├── pricingService.js                   # getPricing(centerId), updatePricing(centerId)
│   ├── tiffinCenterService.js              # getAllCenters, getCenterCustomers, getCenterStats
│   ├── paymentService.js                   # getPayment, recordPayment, calculateTotalDue
│   └── reportService.js                    # getDashboard, getBillingReport, getCustomerHistory, getCenterTypeBreakdown
│
└── utils/
    ├── apiClient.js                        # Axios instance — JWT attach, response normalize, 401 auto-logout, optional encryption
    ├── constants.js                        # ROLES, TIFFIN_TYPES, SHIFTS, ROLE_LABELS, etc.
    ├── calculateAmount.js                  # type + chapati count → rupee amount
    └── formatDate.js                       # formatDate, isSameDay, getCurrentMonthRange
```

---

## 👥 Roles & Credentials

| Role          | Access                                                              |
|---------------|----------------------------------------------------------------------|
| Super Admin   | Tiffin Centers (pricing + customers via modals), Reports            |
| Tiffin Center | Dashboard, Add Tiffin, Approvals, Customers, Pricing, Reports       |
| Customer      | Dashboard, Add Tiffin, My Bill                                      |

> Credentials are managed by the backend. Test users are seeded via the backend seed script.

---

## 🍱 Tiffin Types & Pricing

Pricing is set **per tiffin center** — Super Admin manages it via a modal on the Tiffin Centers page, Tiffin Center manages it directly via the Pricing page.

| Type         | Default Chapati | Base Price | Per chapati below default |
|--------------|------------------|------------|----------------------------|
| Full         | 3                | ₹80        | −₹5                        |
| Half         | 2                | ₹60        | −₹5                        |
| Only Chapati | 2                | ₹40        | −₹5                        |
| Bhakari      | 2                | ₹50        | −₹5                        |
| Dal Rice     | Fixed            | ₹70        | No variation               |

Each tiffin entry also records a **shift** — Morning or Night.

---

## ⚙️ Features

### All roles
- JWT-based login (token stored in `localStorage`)
- Role-based sidebar navigation
- Mobile responsive — hamburger drawer on mobile, fixed sidebar on desktop
- Only the Outlet (main content area) scrolls — sidebar and topbar stay fixed
- Profile drawer (click avatar/name in sidebar footer) — Sign out + "coming soon" menu items

### Customer
- Add tiffin for **today or tomorrow only** — no future-dating
- Choose tiffin type + chapati count + shift (Morning / Night)
- Live amount preview before submitting
- Mark "No Tiffin" for a day
- Dashboard shows their assigned tiffin center (name, address, phone)
- My Bill page shows payment status, balance due, and transaction history

### Tiffin Center
- Add tiffin for any customer — **auto-approved**, no approval step needed
- Approve or reject customer-submitted entries
- Manage own pricing
- View own customers with tiffin stats + payment status
- Record customer payments (full or partial) with method, reference, and notes
- View billing reports with month, customer, and status filters
- Visual charts — customer tiffin history + tiffin type breakdown per center

### Super Admin
- Tiffin Centers page — table of all centers (designed for multiple)
- Click "Set pricing" → modal to edit that center's prices
- Click "X customers" → modal showing full customer cards for that center
- View billing reports across the system

---

## 💳 Payment Tracking

Payments are tracked **per customer per month**, with support for **partial payments** via multiple transactions.

### How it works
1. Tiffin Center selects a customer in the Reports page customer filter
2. Payment section shows: Total due, Amount paid, Remaining to pay, Status
3. A progress bar visualizes percentage paid
4. Tiffin Center records a payment (amount, method, reference, note) — partial or full
5. Each payment is logged as a transaction; multiple transactions accumulate toward the total
6. "View history" button opens a modal with the full transaction table (AppDataTable)
7. Once `balanceDue` reaches 0, status automatically becomes `paid` and the record form hides

### Payment statuses
- `unpaid` — no payment recorded yet
- `partial` — some amount paid, balance remaining
- `paid` — fully settled

---

## 🔄 Tiffin Entry Flow

```
Customer submits entry
        ↓
   Status: PENDING
        ↓
Tiffin Center reviews in Approvals page
        ↓
   Approve → Status: APPROVED → Counted in billing
   Reject  → Status: REJECTED → Not billed
        ↓
Tiffin Center adds entry directly → Status: APPROVED (auto)
```

---

## 🧩 Reusable Components

### `AppButton`
```jsx
<AppButton
  label='Approve'
  icon={<FaCheck />}
  variant='success'    // primary | secondary | success | danger | warning | ghost
  size='md'            // sm | md | lg
  fullWidth={false}
  loading={false}
  onClick={handleClick}
/>
```

### `AppDropdown`
```jsx
<AppDropdown
  label='Month'
  value={month}
  options={[{ label: 'June 2025', value: '2025-06' }]}
  onChange={e => setMonth(e.value)}
/>
```

### `AppInput`
```jsx
<AppInput
  label='Reference'
  value={ref}
  onChange={e => setRef(e.target.value)}
  placeholder='UPI / cheque no.'
/>
```

### `AppDatePicker`
```jsx
<AppDatePicker
  label='Date'
  value={date}
  onChange={setDate}
  minDate={today}
  maxDate={tomorrow}
/>
```

### `AppDataTable`
```jsx
<AppDataTable
  columns={[
    { header: 'Date',   body: row => formatDate(row.date) },
    { header: 'Amount', body: row => `₹${row.amount}`, align: 'right' },
    { header: 'Status', body: row => <StatusBadge status={row.status} /> },
  ]}
  data={myData}
  emptyMessage='No records found.'
  pageSize={10}
/>
```
`col.body` receives `(row, index)` — index is used for serial numbers in tables like the transaction history modal.

### `StatusBadge`
```jsx
<StatusBadge status='approved' />   // approved | pending | rejected
<StatusBadge status='morning' />    // morning | night
<StatusBadge status='full' />       // full | half | chapati | bhakari | dalrice | none
<StatusBadge status='paid' />       // paid | partial | unpaid
<StatusBadge status='active' label='Custom label' />
```

### `AppIcon`
```jsx
import AppIcon from '../components/AppIcon'
<AppIcon name='home' size={16} color='var(--primary-color)' />
// Available: home, plus, check, receipt, chart, users, tag,
//            logout, menu, close, rupee, clock, bag, info, save, approvals
```

### `useApi` hook
```js
const { data, loading, error, refetch } = useApi(
  () => getAllTiffins(filters),
  [filters]
)
```
Generic async data-fetching hook — wraps any service call with loading/error state and an optional `refetch`.

---

## 🌐 API Client (`utils/apiClient.js`)

All HTTP calls go through a single Axios instance:

- **Base URL** — read from `VITE_API_BASE_URL` env var (default: `http://localhost:5000/api`)
- **JWT attach** — `Authorization: Bearer <token>` on every request (from `tms_token` in localStorage)
- **Response normalization** — interceptor unwraps the standard `{ success, data, message, pagination }` envelope
- **Auto-logout** — on 401, clears localStorage and redirects to `/login`
- **Optional encryption** — `VITE_ENCRYPTION_ENABLED=true` base64-encodes request bodies and decodes response bodies

---

## 🔧 Services Layer

All pages call service functions — never `apiClient` directly from a page. On backend changes, only files in `services/` change.

| Service                 | Responsibility                                              |
|-------------------------|-------------------------------------------------------------|
| `authService.js`        | `login`, `getMe`, `logout`                                  |
| `tiffinService.js`      | CRUD on tiffin entries, approve/reject                      |
| `userService.js`        | Customer list + stats                                       |
| `pricingService.js`     | Get/update pricing, scoped by `centerId`                    |
| `tiffinCenterService.js`| Centers, their customers, aggregate stats                   |
| `paymentService.js`     | Payment records, transactions, balance calculation          |
| `reportService.js`      | Dashboard stats, billing report, customer history, center breakdown |

---

## 🎨 Styling — CSS Modules

Every component and page has a colocated `.module.css` file. No global class name conflicts, no inline style soup.

```jsx
import styles from './DashboardPage.module.css'
<div className={styles.page}>
```

For conditional classes, `clsx` is used:
```jsx
import clsx from 'clsx'
<div className={clsx(styles.card, isActive && styles.active)}>
```

Global resets and PrimeReact overrides remain in `src/index.css`.

**Only exception (still inline):** dynamic per-item colors that come from data (e.g. a pricing field's accent color).

---

## 📱 Responsive Design

- **Desktop (> 768px)** — Fixed sidebar on left, content scrolls independently on right
- **Mobile (≤ 768px)** — Hamburger button in topbar opens sidebar as a sliding drawer overlay
- Only `<main>` (the Outlet) scrolls — sidebar and topbar are always visible and fixed
- Touch-optimized — 42px input heights, large tap targets, no tap highlight flash
- Profile drawer in sidebar adapts to both desktop and mobile (slides up from sidebar footer)

---

## 🖥️ Installation & Setup

```bash
# 1. Clone the repo
git clone git@github-tms:mandarp-tms/tiffin-management-system.git
cd tiffin-management-system

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.development .env.local
# Edit VITE_API_BASE_URL to point at your running backend

# 4. Run development server
npm run dev

# 5. Open in browser
http://localhost:5173
```

---

## 🔑 Environment Variables

| Variable                  | Default                          | Description                             |
|---------------------------|----------------------------------|-----------------------------------------|
| `VITE_API_BASE_URL`       | `http://localhost:5000/api`      | Backend API base URL                    |
| `VITE_ENCRYPTION_ENABLED` | `false`                          | Enable base64 request/response encoding |

Two env files are provided: `.env.development` (local) and `.env.production` (Render/Vercel).

---

## 📦 Dependencies

```json
{
  "axios":            "HTTP client for API calls",
  "chart.js":         "Charts — bar, doughnut (CustomerHistoryChart, CenterTypeBreakdownChart)",
  "primereact":       "UI component library (Dropdown, InputText, Password, Toast, Avatar, Button)",
  "primeicons":       "Icon set (pi pi-*)",
  "primeflex":        "Utility CSS classes",
  "react-router-dom": "Client-side routing (v7)",
  "react-icons":      "FontAwesome icon set",
  "clsx":             "Conditional className merging"
}
```

---

## 🗺️ Roadmap

### Phase 1 — Frontend with mock data ✅ (complete)
- [x] Login with username + password
- [x] Role-based navigation with hierarchy (Admin → Center → Customer)
- [x] Add tiffin form — type, chapati count, shift, date-restricted picker
- [x] Approval flow with auto-approve for center-added entries
- [x] Billing reports with month/customer/status filters
- [x] Pricing management — per tiffin center, accessible to Admin (via modal) and Center
- [x] Tiffin Centers page (Super Admin) — table with pricing + customers modals
- [x] Customer profiles with tiffin stats
- [x] Payment tracking — partial payments, transaction history, balance due
- [x] Transaction history modal using AppDataTable
- [x] Mobile responsive layout — hamburger drawer
- [x] Profile drawer replacing plain logout button
- [x] Reusable component library — AppButton, AppDropdown, AppInput, AppDatePicker, AppDataTable, StatusBadge
- [x] Full CSS Modules migration — zero inline styles, zero visual changes
- [x] Self-hosted icons (react-icons) + full favicon package
- [x] Customer terminology throughout (replaced "Users")

### Phase 2 — Backend integration ✅ (complete)
- [x] PostgreSQL schema designed and created (7 tables, 35 indexes, triggers)
- [x] Node.js + Express + Sequelize backend scaffolded
- [x] JWT authentication (login → token → `tms_token` in localStorage)
- [x] Role-based middleware on all routes
- [x] Axios `apiClient` with JWT attach + response normalization + auto-logout on 401
- [x] `authService`, `reportService` added; all services wired to real API
- [x] `useApi` hook for consistent data fetching across pages
- [x] Chart.js charts — `CustomerHistoryChart`, `CenterTypeBreakdownChart`
- [x] `AppInput`, `AppDatePicker`, `Breadcrumb`, `TiffinCalendar`, `TiffinTable` components added
- [x] Environment-based config (`.env.development` / `.env.production`)
- [x] Optional request/response encryption via `VITE_ENCRYPTION_ENABLED`

### Phase 3 — Production
- [ ] Deploy frontend on Vercel
- [ ] Deploy backend on Render
- [ ] Production environment variables finalized
- [ ] Remove any remaining dev-only UI elements

---

## 📝 Notes for Developers

- **Adding a new tiffin type** → update `TIFFIN_TYPES`, `CHAPATI_OPTIONS`, `TYPE_LABELS` in `constants.js` and the badge config in `StatusBadge.jsx` / `.module.css`
- **Changing role labels** → update `ROLE_LABELS` in `constants.js` only — used everywhere automatically
- **Changing prices** → use the Pricing page (Tiffin Center) or the pricing modal (Super Admin → Tiffin Centers page)
- **Tiffin center entries are auto-approved** — `addedBy: 'center'` sets status to `approved` directly, skipping the approvals queue
- **Customer date restriction** — customers can only add tiffin for today or tomorrow
- **Payment balance** — `balanceDue = totalDue - amountPaid`, recomputed live from approved tiffin entries; never let `amountPaid` exceed `balanceDue` in the form (validated client-side)
- **One customer dropdown only** — Reports page uses a single customer filter for both the tiffin table and the payment section
- **API errors** — all errors from `apiClient` are normalized to `{ success, status, code, message }` — always catch and show `err.message` in the UI
- **401 auto-logout** — `apiClient` clears `tms_token` + `tms_user` and redirects to `/login` automatically on any 401 response

---

## 🔐 Git Setup (SSH — multiple GitHub accounts)

This repo uses a dedicated SSH key for the `mandarp-tms` GitHub account:

```bash
# Generate key (run once)
ssh-keygen -t ed25519 -C "mandarp-tms@github" -f ~/.ssh/id_ed25519_tms

# SSH config (~/.ssh/config)
Host github-tms
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_tms

# Remote URL for this repo
git remote set-url origin git@github-tms:mandarp-tms/tiffin-management-system.git

# Push
git push origin <branch-name>
```

---
