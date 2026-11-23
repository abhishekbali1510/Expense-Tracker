# 📱 Expense Tracker PWA — Complete System Architecture & AI Context

> **Purpose of this document**: This is the single source of truth for the Expense Tracker application. Feed this document into any AI assistant (ChatGPT, Claude, Cursor, Antigravity, Gemini) or use it for onboarding to get full context on the business logic, financial math, architecture, and quirks of this project.

---

## 1. Executive Summary & Core Philosophy

**Expense Tracker** is a mobile-first Progressive Web App (PWA) tailored for personal finance, built with **React 19**, **Vite 6**, and **Tailwind CSS v4**, backed by **Google Sheets** via a serverless **Google Apps Script (GAS)** Web App.

### Core Paradigms:
1. **50-30-10-10 Envelope Budgeting**: Monthly income is apportioned across 4 envelopes:
   * **Essentials (50%)**: Food, rent, utilities, groceries, EMIs, family support.
   * **Savings (30%)**: Liquid emergency reserves and short-term capital.
   * **Wants (10%)**: Lifestyle, dining out, entertainment, shopping.
   * **Invest (10%)**: Mutual funds (MF), stocks, long-term wealth assets.
2. **Dual-Bank Real-World Cashflow (Passbook Engine)**:
   * **HDFC Bank**: Primary salary account, credit card bills, large P2P flows, and liquid savings. Base salary is credited directly to HDFC.
   * **SBI Bank**: Daily UPI spends, small payments, and stock/mutual fund debits.
   * **Self-Transfers (HDFC ⇄ SBI)**: Neutral across the net worth; transfers cash between accounts without double-counting as an expense or impacting budget envelopes.
3. **P2P (Person-to-Person) Lending & Debt Engine**:
   * Tracks receivables (money you gave to friends/family/colleagues) and payables (money you owe or borrowed).
   * Follows Splitwise convention:
     * **Outflow (`flow: 'out'`)**: Money given to a person (They owe you / Receivable).
     * **Inflow (`flow: 'in'`)**: Money received from a person (Settlement / Payable).
     * $\text{Net} = \text{Outflow} - \text{Inflow}$. $\text{Net} > 0$ = Green (They owe you); $\text{Net} < 0$ = Red (You owe them).
4. **Human-Readable Database**:
   * Google Sheets acts as the database. Each month is partitioned into its own tab (e.g., `Nov-2026`, `Dec-2026`).
   * A dedicated `Config` tab persists monthly salary, percentage splits, previous carry-forwards, bank configurations, and person rosters.

---

## 2. Financial Math & Calculation Engine

All calculations are encapsulated in [`src/context/AppContext.jsx`](file:///c:/Users/LENOVO/Desktop/Abhishek/Projects/Expense%20Tracker/src/context/AppContext.jsx) using React `useMemo` hooks.

### A. Envelope Allocation & Remaining Balances
For any given month:
$$\text{Allocated}(\text{bucket}) = \text{Math.round}\left(\frac{\text{MonthlyBase} \times \text{Percentage}}{100}\right)$$
$$\text{Envelope Remaining} = \text{Allocated} + \text{PrevCarry} - \text{Spent}$$

* **Essentials, Wants, Invest**:
  * An expense debits the envelope if `tx.section === bucket`.
  * If `flow === 'in'` (e.g. refund/cashback), it credits the envelope ($\text{Spent} \mathrel{-}= \text{Amount}$).
* **Savings Envelope (The P2P Bridge Rule)**:
  * In addition to normal `savings` transactions, **HDFC P2P transactions draw from or restore the Savings envelope**:
    * When money is given to someone from HDFC (`flow === 'out'`), it debits Savings ($\text{Spent} \mathrel{+}= \text{Amount}$).
    * When someone repays money into HDFC (`flow === 'in'`), it restores Savings ($\text{Spent} \mathrel{-}= \text{Amount}$).
  * **Strict Exceptions**:
    1. **SBI P2P transactions NEVER touch Savings**: SBI is strictly for daily UPI.
    2. **`budgetImpact === 'none'`**: If explicitly opted out, it touches only the bank cashflow, not Savings.
    3. **`None (Cash)` Bank**: Off-the-books transactions touch neither bank nor budget envelopes.
    4. **Opening Balances**: Transactions with `description === 'Previous / Opening Balance'` establish counterparty debt without affecting monthly envelope spending.

### B. Dual-Bank Passbook Calculations
$$\text{HDFC Available} = \text{HDFC StartBal} + \text{MonthlyBase} + \text{HDFC PrevCarry} + \sum \text{HDFC Inflows} - \sum \text{HDFC Outflows}$$
$$\text{SBI Available} = \text{SBI StartBal} + \text{SBI PrevCarry} + \sum \text{SBI Inflows} - \sum \text{SBI Outflows}$$

* **Self-Transfers**:
  * HDFC ➔ SBI: Appears as Outflow from HDFC and Inflow into SBI.
  * SBI ➔ HDFC: Appears as Outflow from SBI and Inflow into HDFC.

---

## 3. Technology Stack & Directory Structure

```
Expense Tracker/
├── .env.example              # Template for environment variables
├── .env.local                # Local environment (VITE_GAS_WEBAPP_URL) - gitignored
├── vercel.json               # SPA routing rewrite for Vercel deployment
├── vite.config.js            # Vite 6 + Tailwind 4 + PWA Workbox config
├── package.json              # Dependencies: React 19, react-router-dom, vite-plugin-pwa
├── gas/
│   └── Code.gs               # Serverless Google Apps Script backend source
├── public/
│   ├── _redirects            # SPA routing rewrite for Netlify
│   ├── favicon.svg           # Scalable SVG logo
│   ├── apple-touch-icon.png  # 180x180 iOS home screen icon
│   └── icons/                # High-res PWA launcher icons
│       ├── icon-192x192.png  # Chrome / Android launcher
│       ├── icon-512x512.png  # High-DPI splash icon
│       └── icon-maskable-512x512.png # Adaptive maskable Android icon
└── src/
    ├── main.jsx              # React 19 entry point
    ├── App.jsx               # BrowserRouter & Route declarations
    ├── index.css             # Tailwind v4 import, custom scrollbar utilities
    ├── config/
    │   └── constants.js      # Bucket definitions, bank accounts, default percentages
    ├── context/
    │   └── AppContext.jsx    # Global financial state, sync coordinator, calculation engine
    ├── services/
    │   └── gasApi.js         # REST client communicating with Google Apps Script Web App
    ├── utils/
    │   └── helpers.js        # Currency formatters (₹ INR), date helpers, validators
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.jsx    # App shell, sticky header with Month Picker & Sync indicator
    │   │   └── BottomNav.jsx # Bottom navigation (Dashboard, P2P, Config)
    │   └── modals/
    │       ├── AddEditModal.jsx      # Unified modal for Adding/Editing Expenses & Transfers
    │       ├── BankLedgerModal.jsx   # Passbook drawer showing all debits/credits per bank
    │       ├── PersonLedgerModal.jsx # Individual counterparty transaction statement
    │       └── MonthConfigModal.jsx  # Month settings (Base salary, carry forwards, splits)
    └── pages/
        ├── Dashboard.jsx     # View 1: Bank Cards + 4 Budget Envelopes
        ├── SectionDetail.jsx # View 2: Detailed category envelope view with transaction list
        └── P2PDashboard.jsx  # View 3: Counterparty matrix, overall debt balances, settle-up
```

---

## 4. Google Apps Script & Sheets Architecture (`gas/Code.gs`)

The backend runs on Google Apps Script deployed as a Web App with access set to:
* **Execute as**: `Me`
* **Who has access**: `Anyone`

### Sheet Tabs:
1. **Monthly Tabs (e.g. `Nov-2026`)**:
   | Col A | Col B | Col C | Col D | Col E | Col F | Col G | Col H | Col I |
   |---|---|---|---|---|---|---|---|---|
   | **Row ID** | **Date** | **Section** | **Description** | **Bank Account** | **Amount** | **Flow** | **Person** | **Budget Impact** |
   | `tx_...` | `10-Nov` | `p2p` | `balance` | `SBI` | `30000` | `in` | `Neeraj (Ghar)` | `none` |

2. **`Config` Tab**:
   Stores JSON strings of configurations indexed by month name (e.g. `Nov-2026`), plus a special row `__PEOPLE__` storing the counterparty list: `["Vivek", "Neeraj (Ghar)", "OD Account", ...]`.

### API Actions:
* **`GET ?action=getExpenses&sheetName=Nov-2026`**: Returns all rows for the month.
* **`GET ?action=getAllConfigs`**: Returns all month configs and registered people.
* **`GET ?action=getAllP2P`**: Returns all P2P transactions across all monthly tabs for cumulative cross-month calculations.
* **`POST { action: 'addExpense', sheetName, row }`**: Appends row.
* **`POST { action: 'updateExpense', sheetName, row }`**: Replaces row matching `row.rowId`.
* **`POST { action: 'deleteExpense', sheetName, rowId }`**: Deletes row matching `rowId`.
* **`POST { action: 'saveMonthConfig', config }`**: Writes month config to `Config` tab.
* **`POST { action: 'savePeople', people }`**: Updates `__PEOPLE__` in `Config` tab.

---

## 5. Key Domain Rules & Quirks (Critical Context for Future Sessions)

1. **Why Only HDFC P2P Touches Savings**:
   * The user uses **SBI exclusively for small UPI daily spends** and **HDFC for primary capital/savings**.
   * When lending large amounts to friends/family (e.g. Vivek, Neeraj), the funds leave HDFC and should temporarily deplete the Savings envelope.
   * If a transaction is done from SBI, it must **never** touch the Savings envelope.
2. **The "None (Cash)" Bank Option**:
   * In P2P lending, sometimes an adjustment, waiver, or opening debt entry needs to be recorded without withdrawing cash from HDFC or SBI.
   * Choosing **`None (Cash)`** updates the person's net balance without debiting any bank account or budget envelope.
3. **The ₹6 Historical Sheet Discrepancy Insight**:
   * The user's legacy spreadsheet had a discrepancy between the formula `SUM(D5:M5) = 26,128` (summing remaining category envelopes) and cashflow math.
   * In October, odd-rupee Raja transfers (`-30001 - 30002 - 20001 - 20002 + 100000 = -6`) caused a -₹6 carry forward difference.
   * To reconcile: HDFC Prev Carry for Nov-2026 was adjusted to `6,497` to match the old sheet's `₹26,128`.
4. **SBI Passbook Sign Convention in Legacy Sheets**:
   * In the legacy spreadsheet, SBI credits were entered as negative values (`-30000` for Neeraj inflow). In this app, incoming money is cleanly normalized with `flow: 'in'` (positive credit).
5. **PWA Scrollbar Fix**:
   * Tailwind CSS v4 requires `-ms-overflow-style: none !important; scrollbar-width: none !important;` and `::-webkit-scrollbar { display: none !important; }` defined under `.no-scrollbar` in [`src/index.css`](file:///c:/Users/LENOVO/Desktop/Abhishek/Projects/Expense%20Tracker/src/index.css). Standard Tailwind `[&::-webkit-scrollbar]:hidden` is invalid CSS.

---

## 6. How to Run, Test & Deploy

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Ensure .env.local contains:
VITE_GAS_WEBAPP_URL=https://script.google.com/macros/s/AKfycbyZ_Xaz8SFQejo0c9WbX82vtSrar8GfOtORsEh7mBf8bb--Cv99CREjpqVb90NFOvnJBw/exec

# 3. Start dev server
npm run dev
```

### Production Build & Deploy
```bash
# Test production build
npm run build

# Push to GitHub (triggers automatic Vercel deployment)
git add .
git commit -m "Your update message"
git push origin master
```

### Mobile PWA Installation
* **Android**: Open the Vercel URL in Chrome ➔ Tap 3 dots ➔ **"Install app"**.
* **iOS**: Open in Safari ➔ Tap Share button ➔ **"Add to Home Screen"**.
