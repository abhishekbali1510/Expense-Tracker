/**
 * Financial Model & Budget Configuration
 *
 * Implements the 50/30/10/10 framework with P2P ledger support and November 2026 baseline.
 */

export const INITIAL_MONTHLY_BASE = 142900;
export const DEFAULT_ACTIVE_MONTH = 'Nov-2026';
export const AVAILABLE_MONTHS = ['Nov-2026', 'Oct-2026'];

/**
 * Bank Accounts — Strictly HDFC & SBI Only
 */
export const INITIAL_BANKS = {
  HDFC: {
    id: 'HDFC',
    name: 'HDFC Bank',
    balance: 48250,
    prevCarry: -8997,
    subtitle: 'Primary & Invest',
    color: 'from-blue-600/20 to-blue-900/10 border-blue-500/30 text-blue-400',
  },
  SBI: {
    id: 'SBI',
    name: 'SBI Bank',
    balance: 19420,
    prevCarry: 0,
    subtitle: 'Daily UPI & Stocks',
    color: 'from-cyan-600/20 to-cyan-900/10 border-cyan-500/30 text-cyan-400',
  },
};

/**
 * Budget Sections (50/30/10/10 Model)
 */
export const INITIAL_SECTIONS = [
  {
    key: 'essentials',
    label: 'Essentials',
    percent: 50,
    allocated: 71450,
    prevCarry: -3179,
    accentColor: 'blue',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    borderClass: 'border-blue-500/30 hover:border-blue-500/60',
    glowClass: 'from-blue-500/10 to-transparent',
    categories: ['Rent / Housing', 'Groceries', 'Utilities', 'Transport', 'Healthcare'],
  },
  {
    key: 'savings',
    label: 'Savings',
    percent: 30,
    allocated: 42870,
    prevCarry: -3292,
    accentColor: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borderClass: 'border-emerald-500/30 hover:border-emerald-500/60',
    glowClass: 'from-emerald-500/10 to-transparent',
    categories: ['Emergency Fund', 'Fixed Deposits', 'Recurring Deposits', 'General Savings'],
  },
  {
    key: 'wants',
    label: 'Wants',
    percent: 10,
    allocated: 14290,
    prevCarry: -26,
    accentColor: 'purple',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    borderClass: 'border-purple-500/30 hover:border-purple-500/60',
    glowClass: 'from-purple-500/10 to-transparent',
    categories: ['Dining Out', 'Entertainment', 'Shopping', 'Subscriptions', 'Personal Care'],
  },
  {
    key: 'invest',
    label: 'Invest',
    percent: 10,
    allocated: 14290,
    prevCarry: 0,
    accentColor: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    borderClass: 'border-amber-500/30 hover:border-amber-500/60',
    glowClass: 'from-amber-500/10 to-transparent',
    categories: ['Mutual Funds / SIP', 'Stocks', 'PPF / NPS', 'Gold', 'Crypto'],
  },
];

/**
 * P2P Summary Baseline
 */
export const INITIAL_P2P_SUMMARY = {
  vivekPool: {
    title: 'Vivek Net Pool',
    netBalance: 250000,
    breakdownPositive: 37650,
    breakdownNegative: -48960,
  },
  vivekMonth: {
    title: 'This Month (Vivek)',
    netPosition: 39995,
    outflow: -45005,
    inflow: 85000,
  },
  mummyHome: {
    title: 'Mummy / Home',
    totalTransfer: 10000,
  },
};

/**
 * Initial Seed Transactions (Replacing / separated cell cramming with discrete records)
 */
export const INITIAL_TRANSACTIONS = [
  // Essentials
  {
    id: 'tx_ess_1',
    date: '11-Nov',
    section: 'essentials',
    description: 'Groceries & Provisions',
    bankAccount: 'SBI',
    amount: 2450,
    month: 'Nov-2026',
  },
  {
    id: 'tx_ess_2',
    date: '09-Nov',
    section: 'essentials',
    description: 'Electricity & Broadband Bill',
    bankAccount: 'HDFC',
    amount: 3200,
    month: 'Nov-2026',
  },
  {
    id: 'tx_ess_3',
    date: '05-Nov',
    section: 'essentials',
    description: 'Petrol Fuel Fill-up',
    bankAccount: 'SBI',
    amount: 2000,
    month: 'Nov-2026',
  },

  // Savings
  {
    id: 'tx_sav_1',
    date: '03-Nov',
    section: 'savings',
    description: 'Emergency Fund RD Transfer',
    bankAccount: 'HDFC',
    amount: 15000,
    month: 'Nov-2026',
  },

  // Wants
  {
    id: 'tx_wnt_1',
    date: '10-Nov',
    section: 'wants',
    description: 'Chicken / Roti / Ras Malai (Dinner)',
    bankAccount: 'SBI',
    amount: 816,
    month: 'Nov-2026',
  },
  {
    id: 'tx_wnt_2',
    date: '06-Nov',
    section: 'wants',
    description: 'Diwali Gifts & Sweets',
    bankAccount: 'HDFC',
    amount: 3500,
    month: 'Nov-2026',
  },
  {
    id: 'tx_wnt_3',
    date: '02-Nov',
    section: 'wants',
    description: 'Weekend Cafe & Snacks',
    bankAccount: 'SBI',
    amount: 450,
    month: 'Nov-2026',
  },

  // Invest
  {
    id: 'tx_inv_1',
    date: '07-Nov',
    section: 'invest',
    description: 'Nifty 50 Index Fund SIP',
    bankAccount: 'HDFC',
    amount: 10000,
    month: 'Nov-2026',
  },

  // P2P Transactions
  {
    id: 'tx_p2p_1',
    date: '08-Nov',
    section: 'p2p',
    description: 'Vivek - Project Settlement',
    person: 'Vivek',
    bankAccount: 'SBI',
    amount: 85000,
    flow: 'in', // received (+)
    month: 'Nov-2026',
  },
  {
    id: 'tx_p2p_2',
    date: '04-Nov',
    section: 'p2p',
    description: 'Vivek - Travel Expense Split',
    person: 'Vivek',
    bankAccount: 'HDFC',
    amount: 45005,
    flow: 'out', // given (-)
    month: 'Nov-2026',
  },
  {
    id: 'tx_p2p_3',
    date: '01-Nov',
    section: 'p2p',
    description: 'Mummy / Home - Monthly Support Transfer',
    person: 'Mummy / Home',
    bankAccount: 'SBI',
    amount: 10000,
    flow: 'out', // given (-)
    month: 'Nov-2026',
  },
];
