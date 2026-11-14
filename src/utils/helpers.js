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
  const str = String(date).trim();
  if (/^\d{1,2}-[A-Za-z]{3}$/.test(str)) return str;

  const d = typeof date === 'string' ? new Date(str) : date;
  if (isNaN(d.getTime())) return str;

  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleDateString('en-US', { month: 'short' });
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
 * Normalize a month key that Google Sheets may have auto-parsed into a Date string
 * (e.g., "Sun Nov 01 2026 00:00:00 GMT+0530 (India Standard Time)") back into "Nov-2026".
 *
 * @param {string} raw
 * @returns {string}
 */
export function normalizeMonthKey(raw) {
  if (!raw) return '';
  const str = String(raw).trim();
  if (/^[A-Za-z]{3}-\d{4}$/.test(str)) return str;

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && (str.includes('GMT') || /^\d{4}-\d{2}-\d{2}/.test(str))) {
    const month = parsed.toLocaleDateString('en-US', { month: 'short' });
    const year = parsed.getFullYear();
    return `${month}-${year}`;
  }
  return str;
}

/**
 * Convert a display date (e.g., "12-Nov"), ISO date, or Date into "YYYY-MM-DD" for <input type="date">.
 *
 * @param {string|Date} value
 * @param {string} [referenceMonth] - Optional "MMM-YYYY" string (e.g., "Nov-2026") for year fallback
 * @returns {string}
 */
export function toInputDate(value, referenceMonth = '') {
  const formatLocalYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  if (!value) return formatLocalYMD(new Date());
  if (value instanceof Date && !isNaN(value.getTime())) return formatLocalYMD(value);

  const str = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // Handle "DD-MMM" e.g. "12-Nov"
  const shortMatch = str.match(/^(\d{1,2})-([A-Za-z]{3})$/);
  if (shortMatch) {
    const day = Number(shortMatch[1]);
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthIdx = monthNames.indexOf(shortMatch[2].toLowerCase());
    if (monthIdx !== -1) {
      const yearMatch = String(referenceMonth).match(/(\d{4})$/);
      const year = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();
      return formatLocalYMD(new Date(year, monthIdx, day));
    }
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return formatLocalYMD(parsed);

  return formatLocalYMD(new Date());
}

/**
 * Convert "YYYY-MM-DD" from <input type="date"> into display format "12-Nov".
 *
 * @param {string} ymd
 * @returns {string}
 */
export function fromInputDate(ymd) {
  if (!ymd) return formatDisplayDate(new Date());
  const match = String(ymd).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const localDate = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return formatDisplayDate(localDate);
  }
  return formatDisplayDate(ymd);
}

/**
 * Extract numeric creation timestamp from a row/tx ID (e.g. "row_1794495..._abc").
 *
 * @param {string} id
 * @returns {number}
 */
function getCreatedTimestamp(id) {
  const match = String(id || '').match(/^(?:row|tx)_(\d+)/);
  return match ? Number(match[1]) : 0;
}

/**
 * Sort transactions by date descending, then by creation order descending (newest added first).
 *
 * @param {Array} list
 * @param {string} [fallbackMonth]
 * @returns {Array}
 */
export function sortTransactionsDesc(list, fallbackMonth = '') {
  return [...list].sort((a, b) => {
    const dateA = toInputDate(a.date, a.month || fallbackMonth);
    const dateB = toInputDate(b.date, b.month || fallbackMonth);
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA);
    }
    return getCreatedTimestamp(b.id) - getCreatedTimestamp(a.id);
  });
}

/**
 * Generate a unique row ID for Google Sheets synchronization.
 *
 * @returns {string}
 */
export function generateRowId() {
  return `row_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}
