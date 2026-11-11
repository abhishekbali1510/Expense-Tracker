/**
 * Google Apps Script API service.
 *
 * All communication with the Google Sheets backend flows through this module.
 * It wraps fetch calls to the deployed GAS Web App URL.
 *
 * The actual endpoint methods (addExpense, getExpenses, etc.) will be
 * implemented once the API contract is finalised.
 */

const GAS_URL = import.meta.env.VITE_GAS_WEBAPP_URL;

/**
 * Generic POST helper for the GAS webhook.
 * @param {string} action  - The action identifier understood by the GAS doPost handler.
 * @param {object} payload - JSON-serialisable data to send.
 * @returns {Promise<object>}
 */
export async function postToGAS(action, payload = {}) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // GAS quirk: text/plain avoids CORS preflight
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error(`GAS request failed: ${res.status}`);
  return res.json();
}

/**
 * Generic GET helper (query-string params forwarded to GAS doGet).
 * @param {Record<string, string>} params
 * @returns {Promise<object>}
 */
export async function getFromGAS(params = {}) {
  const url = new URL(GAS_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`GAS request failed: ${res.status}`);
  return res.json();
}
