/**
 * Shared Application Constants
 */

/** Sheet name format: "MMM-YYYY" (e.g., "Nov-2026") */
export const SHEET_DATE_FORMAT = 'MMM-yyyy';

/**
 * Standard Human-Readable Columns for Google Sheets sync
 * Row ID | Date | Section | Description | Bank Account | Amount
 */
export const SHEET_COLUMNS = [
  'Row ID',
  'Date',
  'Section',
  'Description',
  'Bank Account',
  'Amount',
];

/** Supported Banks */
export const BANK_ACCOUNTS = ['SBI', 'HDFC'];

/** Available Budget Sections for Expense Entry */
export const EXPENSE_SECTIONS = [
  { key: 'essentials', label: 'Essentials' },
  { key: 'wants', label: 'Wants' },
  { key: 'invest', label: 'Invest' },
  { key: 'savings', label: 'Savings' },
  { key: 'p2p', label: 'P2P' },
  { key: 'transfer', label: '⇄ Transfer' },
];

/** LocalStorage keys */
export const LS_KEYS = {
  TRANSACTIONS: 'et_transactions_v3',
  MONTHS_CONFIG: 'et_months_config_v3',
  ACTIVE_MONTH: 'et_active_month_v3',
  PEOPLE: 'et_people_v3',
  THEME: 'et_theme_v3',
  GAS_URL_OVERRIDE: 'et_gas_url',
};
