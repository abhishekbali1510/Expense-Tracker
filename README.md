# 💰 Expense Tracker PWA

A **mobile-first Progressive Web App** for personal expense tracking, built with the **50/30/10/10 budgeting framework** and backed by **Google Sheets** as a human-readable database.

## Tech Stack

| Layer          | Technology                                  |
| -------------- | ------------------------------------------- |
| **Frontend**   | React 19 · Vite 6 · Tailwind CSS 4         |
| **PWA**        | vite-plugin-pwa (Workbox)                   |
| **Backend**    | Google Apps Script Web App (serverless)     |
| **Database**   | Google Sheets (monthly partitioned ledger)  |
| **Hosting**    | Vercel / Cloudflare Pages                   |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in your GAS deployment URL
cp .env.example .env.local

# 3. Start dev server (accessible on LAN for mobile testing)
npm run dev

# 4. Production build
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── layout/        # App shell — Layout, BottomNav
│   └── ui/            # Reusable atomic components (Button, Card, etc.)
├── config/            # Budget buckets, constants, feature flags
├── context/           # React Context providers (global state)
├── hooks/             # Custom React hooks
├── pages/             # Route-level page components
├── services/          # API layer — Google Apps Script communication
└── utils/             # Pure helper functions (formatting, dates)
```

## Budget Model — 50/30/10/10

| Bucket         | Allocation | Purpose                        |
| -------------- | ---------- | ------------------------------ |
| **Essentials** | 50%        | Rent, groceries, bills, etc.   |
| **Savings**    | 30%        | Emergency fund, FDs, RDs       |
| **Wants**      | 10%        | Dining, entertainment, travel  |
| **Investments**| 10%        | MFs, stocks, PPF, gold         |

P2P transfers (lent/borrowed/repaid) are tracked separately outside the budget split.

## Data Flow

```
React PWA  →  fetch (POST/GET)  →  Google Apps Script Web App  →  Google Sheets
                                          (doPost / doGet)          (monthly tabs)
```

Each month auto-creates a sheet tab named `MMM-YYYY` (e.g., `Nov-2026`) with columns:
`Date | Time | Bucket | Category | Amount | Description/Notes | Payment Mode`

## License

Private — not open source.
