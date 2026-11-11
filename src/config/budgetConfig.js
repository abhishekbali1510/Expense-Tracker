/**
 * Budget & category configuration.
 *
 * Defines the 50/30/10/10 budgeting framework and category taxonomy.
 * These constants drive both the Add Expense form and the Dashboard summaries.
 */

/** Monthly income — will be configurable via Settings page in a later iteration. */
export const DEFAULT_MONTHLY_INCOME = 0;

/**
 * Budget buckets following the 50/30/10/10 rule.
 * Each bucket has a label, allocation percentage, and the categories it contains.
 */
export const BUDGET_BUCKETS = [
  {
    key: 'essentials',
    label: 'Essentials',
    percent: 50,
    categories: [
      'Rent / Housing',
      'Groceries',
      'Utilities',
      'Transport',
      'Insurance',
      'Healthcare',
      'Education',
    ],
  },
  {
    key: 'savings',
    label: 'Savings',
    percent: 30,
    categories: [
      'Emergency Fund',
      'Fixed Deposits',
      'Recurring Deposits',
      'General Savings',
    ],
  },
  {
    key: 'wants',
    label: 'Wants',
    percent: 10,
    categories: [
      'Dining Out',
      'Entertainment',
      'Shopping',
      'Subscriptions',
      'Travel / Leisure',
      'Personal Care',
    ],
  },
  {
    key: 'investments',
    label: 'Investments',
    percent: 10,
    categories: [
      'Mutual Funds / SIP',
      'Stocks',
      'PPF / NPS',
      'Gold',
      'Crypto',
      'Other Investments',
    ],
  },
];

/**
 * Person-to-Person (P2P) transfer type — tracked outside the 50/30/10/10 split.
 */
export const P2P_BUCKET = {
  key: 'p2p',
  label: 'P2P Transfers',
  categories: ['Lent', 'Borrowed', 'Repaid', 'Received'],
};

/** Payment modes shown in the expense form. */
export const PAYMENT_MODES = [
  'UPI',
  'Cash',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Wallet',
  'Other',
];

/**
 * Flat list of every category (useful for validation / dropdowns).
 */
export const ALL_CATEGORIES = [
  ...BUDGET_BUCKETS.flatMap((b) => b.categories),
  ...P2P_BUCKET.categories,
];
