/**
 * Financial Model & Budget Configuration
 *
 * Implements per-month dynamic percentage allocation, customizable base income,
 * bank accounts (HDFC & SBI), and P2P counterparty tracking.
 */

export const DEFAULT_ACTIVE_MONTH = 'Nov-2026';

export const INITIAL_PEOPLE = ['Vivek', 'Mummy / Home'];

/**
 * Per-month configuration dictionary.
 * Supports changing base income, percentage breakdown, and carry forwards per month.
 */
export const INITIAL_MONTHS_CONFIG = {
  'Nov-2026': {
    name: 'Nov-2026',
    monthlyBase: 142900,
    percentages: {
      essentials: 50,
      savings: 30,
      wants: 10,
      invest: 10,
    },
    prevCarries: {
      essentials: -3179,
      savings: -3292,
      wants: -26,
      invest: 0,
    },
    banks: {
      HDFC: {
        name: 'HDFC Bank',
        subtitle: 'Primary & Invest',
        balance: 48250,
        prevCarry: -8997,
      },
      SBI: {
        name: 'SBI Bank',
        subtitle: 'Daily UPI & Stocks',
        balance: 19420,
        prevCarry: 0,
      },
    },
  },
  'Oct-2026': {
    name: 'Oct-2026',
    monthlyBase: 140000,
    percentages: {
      essentials: 50,
      savings: 30,
      wants: 10,
      invest: 10,
    },
    prevCarries: {
      essentials: 0,
      savings: 0,
      wants: 0,
      invest: 0,
    },
    banks: {
      HDFC: {
        name: 'HDFC Bank',
        subtitle: 'Primary & Invest',
        balance: 40000,
        prevCarry: 0,
      },
      SBI: {
        name: 'SBI Bank',
        subtitle: 'Daily UPI & Stocks',
        balance: 15000,
        prevCarry: 0,
      },
    },
  },
};

/**
 * Visual metadata for the 4 core budget buckets
 */
export const BUCKET_DEFINITIONS = [
  {
    key: 'essentials',
    label: 'Essentials',
    colorName: 'blue',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    borderClass: 'border-blue-500/30 hover:border-blue-500/60',
    glowClass: 'from-blue-500/10 to-transparent',
    icon: '🏠',
  },
  {
    key: 'savings',
    label: 'Savings',
    colorName: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borderClass: 'border-emerald-500/30 hover:border-emerald-500/60',
    glowClass: 'from-emerald-500/10 to-transparent',
    icon: '🛡️',
  },
  {
    key: 'wants',
    label: 'Wants',
    colorName: 'purple',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    borderClass: 'border-purple-500/30 hover:border-purple-500/60',
    glowClass: 'from-purple-500/10 to-transparent',
    icon: '✨',
  },
  {
    key: 'invest',
    label: 'Invest',
    colorName: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    borderClass: 'border-amber-500/30 hover:border-amber-500/60',
    glowClass: 'from-amber-500/10 to-transparent',
    icon: '📈',
  },
];

/**
 * Initial Seed Transactions
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
    description: 'Project Settlement',
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
    description: 'Travel Expense Split',
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
    description: 'Monthly Support Transfer',
    person: 'Mummy / Home',
    bankAccount: 'SBI',
    amount: 10000,
    flow: 'out', // given (-)
    month: 'Nov-2026',
  },
];
