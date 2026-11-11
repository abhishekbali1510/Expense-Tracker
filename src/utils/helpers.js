/**
 * Shared utility helpers (date formatting, currency formatting, etc.).
 *
 * Implementations will be added as needed by feature work.
 */

/**
 * Format a Date into the sheet-tab name: "MMM-YYYY" (e.g., "Nov-2026").
 * @param {Date} date
 * @returns {string}
 */
export function toSheetName(date = new Date()) {
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }).replace(' ', '-');
}

/**
 * Format a number as Indian Rupee currency string.
 * @param {number} amount
 * @returns {string}  e.g., "₹1,234.56"
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}
