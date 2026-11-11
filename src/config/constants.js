/**
 * Shared application constants.
 */

/** Sheet name format: "MMM-YYYY" (e.g., "Nov-2026") */
export const SHEET_DATE_FORMAT = 'MMM-yyyy';

/** Columns in each monthly sheet (order matters for GAS mapping) */
export const SHEET_COLUMNS = [
  'Date',
  'Time',
  'Bucket',
  'Category',
  'Amount',
  'Description/Notes',
  'Payment Mode',
];

/** LocalStorage keys */
export const LS_KEYS = {
  MONTHLY_INCOME: 'et_monthly_income',
  THEME: 'et_theme',
  GAS_URL_OVERRIDE: 'et_gas_url',
};
