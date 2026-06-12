# 🍱 Tiffin Manager

A daily tiffin tracking and billing web application built with **React JS + PrimeReact**.  
Supports 3 roles: Super Admin, Tiffin Center, and Customer.

---

## 🚀 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React JS (Vite)                     |
| UI Library| PrimeReact + PrimeFlex + PrimeIcons |
| Icons     | React Icons (FontAwesome)           |
| Routing   | React Router DOM                    |
| State     | React Context API (AuthContext)     |
| Data      | Mock data (JSON) — backend pending  |

---

## 📁 Folder Structure

```
src/
├── assets/
│   └── logo.png                  # App logo
│
├── mock/                         # Mock data — swap for API on integration day
│   ├── users.js                  # 4 users: admin, center, rahul, priya
│   ├── tiffins.js                # Tiffin entries with shift, type, status
│   ├── pricing.js                # Price per tiffin type + chapati count
│   └── approvals.js              # Pending approval helpers
│
├── context/
│   └── AuthContext.jsx           # currentUser, login(), logout(), isRole()
│
├── layouts/
│   ├── MainLayout.jsx            # Sidebar + Topbar + scrollable Outlet
│   └── ProtectedRoute.jsx        # Redirect to /login if not authenticated
│
├── components/
│   ├── AppButton.jsx             # Reusable button (variants + sizes)
│   ├── AppDropdown.jsx           # Reusable custom dropdown
│   ├── AppDataTable.jsx          # Reusable table with built-in pagination
│   ├── AppIcon.jsx               # Central icon component (react-icons)
│   ├── StatusBadge.jsx           # Reusable badge (status, type, shift)
│   ├── StatCard.jsx              # Dashboard stat card
│   ├── Sidebar.jsx               # Role-based nav, hamburger on mobile
│   └── Topbar.jsx                # Page title, avatar, logout
│
├── pages/
│   ├── LoginPage.jsx             # Username + password login
│   ├── DashboardPage.jsx         # Stat cards + recent entries table
│   ├── AddTiffinPage.jsx         # Add tiffin form (type, shift, chapati)
│   ├── ApprovalsPage.jsx         # Tiffin center approve/reject queue
│   ├── ReportsPage.jsx           # Billing report with filters
│   ├── PricingPage.jsx           # Set prices per tiffin type
│   ├── MyBillPage.jsx            # Customer's personal bill + log
│   └── UsersPage.jsx             # Customer profiles + stats
│
├── services/                     # Data layer — only this changes on backend integration
│   ├── tiffinService.js          # getAllTiffins, addTiffin, approve, reject
│   ├── userService.js            # getTiffinUsers, getUserStats
│   └── pricingService.js         # getPricing, updatePricing
│
└── utils/
    ├── constants.js              # ROLES, TIFFIN_TYPES, CHAPATI_OPTIONS, SHIFTS, etc.
    ├── calculateAmount.js        # type + chapati count → rupee amount
    └── formatDate.js             # formatDate, isSameDay, getCurrentMonthRange
```

---

## 👥 Roles & Credentials

| Role          | Username      | Password   | Access                                               |
|---------------|---------------|------------|------------------------------------------------------|
| Super Admin   | superadmin    | admin123   | All pages + pricing + customers + reports            |
| Tiffin Center | tiffincenter  | center123  | Dashboard, Add Tiffin, Approvals, Reports, Pricing   |
| Customer      | rahul         | rahul123   | Dashboard, Add Tiffin, My Bill                       |
| Customer      | priya         | priya123   | Dashboard, Add Tiffin, My Bill                       |

> ⚠️ Remove test credentials hint from `LoginPage.jsx` before going live.

---

## 🍱 Tiffin Types & Pricing

| Type         | Default Chapati | Base Price | Per chapati below default |
|--------------|-----------------|------------|---------------------------|
| Full         | 3               | ₹80        | −₹5                       |
| Half         | 2               | ₹60        | −₹5                       |
| Only Chapati | 2               | ₹40        | −₹5                       |
| Bhakari      | 2               | ₹50        | −₹5                       |
| Dal Rice     | Fixed           | ₹70        | No variation              |

---

## ⚙️ Features

### All roles
- Username + password login (no email)
- Role-based sidebar navigation
- Mobile responsive — hamburger drawer on mobile, fixed sidebar on desktop
- Only Outlet (main content) scrolls — topbar and sidebar stay fixed

### Customer
- Add today's or tomorrow's tiffin only (restricted date picker)
- Choose tiffin type + chapati count + shift (Morning / Night)
- Live amount preview before submitting
- Mark no tiffin for a day
- View personal bill with monthly total

### Tiffin Center
- Add tiffin for any customer (auto-approved, no approval needed)
- Approve or reject customer-submitted entries
- Set pricing (shared with Super Admin)
- View billing reports

### Super Admin
- Full access to all pages
- Manage customers
- Set and update tiffin pricing
- View billing reports with month + customer filters

---

## 🔄 Tiffin Entry Flow

```
Customer submits entry
        ↓
   Status: PENDING
        ↓
Tiffin Center reviews in Approvals page
        ↓
   Approve → Status: APPROVED → Added to billing
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

### `StatusBadge`
```jsx
<StatusBadge status='approved' />   // approved | pending | rejected
<StatusBadge status='morning' />    // morning | night
<StatusBadge status='full' />       // full | half | chapati | bhakari | dalrice | none
<StatusBadge status='active' label='Custom label' />
```

### `AppIcon`
```jsx
import AppIcon from '../components/AppIcon'
<AppIcon name='home' size={16} color='var(--primary-color)' />
// Available: home, plus, check, receipt, chart, users, tag,
//            logout, menu, close, rupee, clock, bag, info, save, approvals
```

---

## 🔧 Services Layer

All pages call service functions — never mock data directly.
On backend integration day, only `services/` files change. Pages stay untouched.

```js
// Current (mock phase)
export const getAllTiffins = () => [...data]

// After integration (just swap this one function)
export const getAllTiffins = () => axios.get('/api/tiffins')
```

---

## 📱 Responsive Design

- **Desktop (> 768px)** — Fixed sidebar on left, content on right
- **Mobile (≤ 768px)** — Hamburger button in topbar, sidebar slides in as drawer overlay
- Only the `<main>` Outlet area scrolls — sidebar and topbar are always visible
- Touch-optimized — 42px input heights, large tap targets, no tap highlight

---

## 🖥️ Installation & Setup

```bash
# 1. Clone the repo
git clone git@github-tms:mandarp-tms/tiffin-management-system.git
cd tiffin-management-system

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open in browser
http://localhost:5173
```

---

## 📦 Dependencies

```json
{
  "primereact":       "UI component library",
  "primeicons":       "Icon set (pi pi-*)",
  "primeflex":        "Utility CSS classes",
  "react-router-dom": "Client-side routing",
  "react-icons":      "FontAwesome + other icon packs"
}
```

---

## 🗺️ Roadmap

### Phase 1 — Frontend with mock data ✅ (current)
- [x] Login with username + password
- [x] Role-based navigation
- [x] Add tiffin form with live price preview
- [x] Approval flow (center approves customer entries)
- [x] Billing reports with filters
- [x] Pricing management
- [x] Customer profiles
- [x] Mobile responsive layout
- [x] Reusable component library (AppButton, AppDropdown, AppDataTable, StatusBadge)
- [x] Shift (Morning / Night) per tiffin entry
- [x] Customer terminology throughout
- [x] Self-hosted icons (react-icons) + favicon

### Phase 2 — Backend (upcoming)
- [ ] MySQL database schema (derived from mock data shapes)
- [ ] Node.js + Express REST API
- [ ] JWT authentication
- [ ] Role-based middleware
- [ ] Replace mock data with real API calls (services/ only)

### Phase 3 — Production
- [ ] Deploy frontend on Vercel / Netlify
- [ ] Deploy backend on Railway / Render
- [ ] Environment variables setup
- [ ] Remove test credentials

---

## 📝 Notes for Developers

- **Adding a new tiffin type** → update `TIFFIN_TYPES`, `CHAPATI_OPTIONS`, `TYPE_LABELS` in `constants.js` and `StatusBadge.jsx`
- **Adding a new customer** → add to `mock/users.js` with role `user`, username, password, avatar initials
- **Changing role labels** → update `ROLE_LABELS` in `constants.js` only — used everywhere automatically
- **Changing prices** → use the Pricing page in-app (Super Admin or Tiffin Center)
- **Page refresh resets mock data** — expected during mock phase, backend will persist data
- **Tiffin center entries are auto-approved** — `addedBy: 'center'` sets status to `approved` automatically
- **Customer date restriction** — customers can only add tiffin for today or tomorrow, not future dates

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
