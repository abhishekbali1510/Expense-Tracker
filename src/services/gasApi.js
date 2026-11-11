/**
 * Google Apps Script Web App API Service
 *
 * Communicates with the serverless Google Sheets backend using clean REST/JSON
 * payloads formatted for the human-readable ledger columns:
 * Row ID | Date | Section | Description | Bank Account | Amount
 */

const GAS_URL = import.meta.env.VITE_GAS_WEBAPP_URL || '';

/**
 * Format a transaction row into the standardized Google Sheet ledger structure.
 *
 * @param {object} item
 * @returns {object} Standardized row payload
 */
export function formatRowForSheet(item) {
  return {
    rowId: item.id || `row_${Date.now()}`,
    date: item.date || '',
    section: item.section || 'Essentials',
    description: item.description || '',
    bankAccount: item.bankAccount || 'SBI',
    amount: Number(item.amount) || 0,
    flow: item.flow || 'out', // 'in' or 'out' for P2P
  };
}

/**
 * Execute a POST request against the Google Apps Script Web App.
 * Uses Content-Type: text/plain;charset=utf-8 and redirect: "follow" for GAS compatibility.
 *
 * @param {string} action - 'addExpense' | 'updateExpense' | 'deleteExpense' | 'syncAll'
 * @param {object} payload - Action-specific payload
 * @returns {Promise<{success: boolean, message?: string, data?: any}>}
 */
export async function postToGAS(action, payload = {}) {
  if (!GAS_URL || GAS_URL.includes('YOUR_DEPLOYMENT_ID')) {
    console.info(`[GAS Offline Mode] Action: ${action}`, payload);
    return {
      success: true,
      offline: true,
      message: 'Saved locally. Google Apps Script Web App URL not configured yet.',
    };
  }

  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action,
        timestamp: new Date().toISOString(),
        ...payload,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP Error from GAS: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return { success: true, ...data };
  } catch (err) {
    console.warn(`[GAS Sync Warning] Failed to reach Google Sheets (${action}):`, err);
    return {
      success: false,
      offline: true,
      error: err.message,
    };
  }
}

/**
 * Sync an individual expense row to the active monthly sheet tab (e.g., "Nov-2026").
 *
 * @param {string} tabName - Target sheet tab name (e.g. "Nov-2026")
 * @param {object} expense - Transaction item
 * @param {string} [mode='add'] - 'add' or 'update'
 */
export async function syncExpenseToSheet(tabName, expense, mode = 'add') {
  const rowData = formatRowForSheet(expense);
  return postToGAS(mode === 'edit' ? 'updateExpense' : 'addExpense', {
    sheetName: tabName,
    row: rowData,
  });
}

/**
 * Remove an expense row from the active sheet tab by its Row ID.
 *
 * @param {string} tabName
 * @param {string} rowId
 */
export async function deleteExpenseFromSheet(tabName, rowId) {
  return postToGAS('deleteExpense', {
    sheetName: tabName,
    rowId,
  });
}

/**
 * Fetch monthly transactions from the Google Sheet Web App (doGet).
 *
 * @param {string} tabName
 */
export async function fetchSheetExpenses(tabName) {
  if (!GAS_URL || GAS_URL.includes('YOUR_DEPLOYMENT_ID')) {
    return { success: true, offline: true, rows: [] };
  }

  try {
    const url = new URL(GAS_URL);
    url.searchParams.set('action', 'getExpenses');
    url.searchParams.set('sheetName', tabName);

    const res = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
    });

    if (!res.ok) throw new Error(`GAS GET failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[GAS Fetch Warning] Error fetching sheet "${tabName}":`, err);
    return { success: false, error: err.message, rows: [] };
  }
}
