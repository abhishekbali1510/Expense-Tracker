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
  { key: 'savings', label: 'Savings' },
  { key: 'wants', label: 'Wants' },
  { key: 'invest', label: 'Invest' },
  { key: 'p2p', label: 'P2P' },
];

/** LocalStorage keys */
export const LS_KEYS = {
  TRANSACTIONS: 'et_transactions',
  MONTHS_CONFIG: 'et_months_config',
  ACTIVE_MONTH: 'et_active_month',
  PEOPLE: 'et_people',
  GAS_URL_OVERRIDE: 'et_gas_url',
};
