/**
 * Financial Model & Budget Configuration
 *
 * Implements per-month dynamic percentage allocation, customizable base income,
 * bank accounts (HDFC & SBI), and P2P counterparty tracking.
 */

export const DEFAULT_ACTIVE_MONTH = '';

export const INITIAL_PEOPLE = [];

/**
 * Per-month configuration dictionary.
 * Starts empty — populated dynamically from the Google Sheet "Config" tab.
 */
export const INITIAL_MONTHS_CONFIG = {};

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
  {
    key: 'savings',
    label: 'Savings',
    colorName: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borderClass: 'border-emerald-500/30 hover:border-emerald-500/60',
    glowClass: 'from-emerald-500/10 to-transparent',
    icon: '🛡️',
  },
];

/**
 * Initial Seed Transactions (Empty — live data comes from Google Sheets)
 */
export const INITIAL_TRANSACTIONS = [];
