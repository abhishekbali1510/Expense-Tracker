/**
 * Shared utility helpers for currency formatting, date manipulation, and ID generation.
 */

/**
 * Format a number into Indian Rupee format (e.g., ₹1,42,900 or -₹8,997).
 *
 * @param {number} amount
 * @param {object} [options]
 * @param {boolean} [options.showSign=false] - If true, prepends '+' for positive amounts
 * @param {boolean} [options.compact=false]  - Format with compact notation if desired
 * @returns {string}
 */
export function formatCurrency(amount, options = {}) {
  const { showSign = false } = options;
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';

  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const formattedAbs = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(absNum);

  if (isNegative) {
    return `-${formattedAbs}`;
  }

  if (showSign && num > 0) {
    return `+${formattedAbs}`;
  }

  return formattedAbs;
}

/**
 * Format a Date object or date string into short display format e.g. "11-Nov".
 *
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDisplayDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);

  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleDateString('en-IN', { month: 'short' });
  return `${day}-${month}`;
}

/**
 * Format date into sheet-tab name format e.g. "Nov-2026".
 *
 * @param {Date|string} date
 * @returns {string}
 */
export function toSheetName(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.toLocaleDateString('en-IN', { month: 'short' });
  const year = d.getFullYear();
  return `${month}-${year}`;
}

/**
 * Generate a unique row ID for Google Sheets synchronization.
 *
 * @returns {string}
 */
export function generateRowId() {
  return `row_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}
