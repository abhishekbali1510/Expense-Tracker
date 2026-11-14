const EXPENSE_HEADERS = [
  'Row ID', 'Date', 'Section', 'Description', 'Bank Account', 'Amount', 'Flow', 'Person'
];

const CONFIG_SHEET_NAME = 'Config';
const PEOPLE_ROW_KEY = '__PEOPLE__';
const CONFIG_HEADERS = [
  'Month', 'Monthly Base', 'Essentials %', 'Savings %', 'Wants %', 'Invest %',
  'Ess Carry', 'Sav Carry', 'Wants Carry', 'Invest Carry',
  'HDFC Balance', 'HDFC Carry', 'SBI Balance', 'SBI Carry'
];

function getOrCreateSheet(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f1f5f9');
    sheet.setFrozenRows(1);
  } else {
    // Ensure all headers (including column N: SBI Carry) are present and formatted
    const currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    let needsUpdate = false;
    for (let h = 0; h < headers.length; h++) {
      if (!currentHeaders[h] || String(currentHeaders[h]).trim() !== headers[h]) {
        needsUpdate = true;
        break;
      }
    }
    if (needsUpdate) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#f1f5f9');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function normalizeMonthKey(val, ss) {
  if (!val) return '';
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (val instanceof Date) {
    try {
      const tz = ss ? ss.getSpreadsheetTimeZone() : Session.getScriptTimeZone();
      return Utilities.formatDate(val, tz, 'MMM-yyyy');
    } catch (e) {
      const midDay = new Date(val.getTime() + 12 * 60 * 60 * 1000);
      return monthNames[midDay.getUTCMonth()] + '-' + midDay.getUTCFullYear();
    }
  }

  let str = String(val).trim();
  if (str.startsWith("'")) str = str.substring(1).trim();

  // Match format "MMM-YYYY" e.g. "Nov-2026", "nov-2026"
  const mMatch = str.match(/^([A-Za-z]{3})-(\d{4})$/);
  if (mMatch) {
    const m = mMatch[1].charAt(0).toUpperCase() + mMatch[1].slice(1).toLowerCase();
    return m + '-' + mMatch[2];
  }

  // Parse string dates (e.g. "Sun Nov 01 2026...", "2026-11-01", etc.)
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    try {
      const tz = ss ? ss.getSpreadsheetTimeZone() : Session.getScriptTimeZone();
      return Utilities.formatDate(parsed, tz, 'MMM-yyyy');
    } catch (e) {
      const midDay = new Date(parsed.getTime() + 12 * 60 * 60 * 1000);
      return monthNames[midDay.getUTCMonth()] + '-' + midDay.getUTCFullYear();
    }
  }

  return str;
}

function formatCellDate(val, ss) {
  if (!val) return '';
  if (val instanceof Date) {
    try {
      const tz = ss ? ss.getSpreadsheetTimeZone() : Session.getScriptTimeZone();
      return Utilities.formatDate(val, tz, 'dd-MMM');
    } catch (e) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const midDay = new Date(val.getTime() + 12 * 60 * 60 * 1000);
      const day = String(midDay.getUTCDate()).padStart(2, '0');
      return day + '-' + monthNames[midDay.getUTCMonth()];
    }
  }
  return String(val);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = data.action;

    // ── Save / Update Month Configuration ──
    if (action === 'saveConfig') {
      const c = data.config;
      const sheet = getOrCreateSheet(ss, CONFIG_SHEET_NAME, CONFIG_HEADERS);
      const rows = sheet.getDataRange().getValues();
      const targetNormalized = normalizeMonthKey(c.name, ss) || String(c.name).trim();
      const rowValues = [
        targetNormalized,
        Number(c.monthlyBase) || 0,
        Number(c.percentages?.essentials) || 0,
        Number(c.percentages?.savings) || 0,
        Number(c.percentages?.wants) || 0,
        Number(c.percentages?.invest) || 0,
        Number(c.prevCarries?.essentials) || 0,
        Number(c.prevCarries?.savings) || 0,
        Number(c.prevCarries?.wants) || 0,
        Number(c.prevCarries?.invest) || 0,
        Number(c.banks?.HDFC?.balance) || 0,
        Number(c.banks?.HDFC?.prevCarry) || 0,
        Number(c.banks?.SBI?.balance) || 0,
        Number(c.banks?.SBI?.prevCarry) || 0
      ];

      let peopleRowIndex = -1;
      let updated = false;
      const duplicateRowIndices = [];

      for (let i = 1; i < rows.length; i++) {
        const cellVal = String(rows[i][0]).trim();
        if (cellVal === PEOPLE_ROW_KEY) {
          peopleRowIndex = i + 1;
          continue;
        }
        const rowMonth = normalizeMonthKey(rows[i][0], ss);
        if (rowMonth && rowMonth.toLowerCase() === targetNormalized.toLowerCase()) {
          if (!updated) {
            sheet.getRange(i + 1, 1).setNumberFormat('@');
            sheet.getRange(i + 1, 1, 1, CONFIG_HEADERS.length).setValues([rowValues]);
            updated = true;
          } else {
            // Found duplicate row for the same month - mark for cleanup
            duplicateRowIndices.push(i + 1);
          }
        }
      }

      // Delete any duplicate month rows from bottom to top so indices remain stable
      for (let d = duplicateRowIndices.length - 1; d >= 0; d--) {
        sheet.deleteRow(duplicateRowIndices[d]);
      }

      if (updated) {
        return jsonResponse({ success: true, message: 'Config updated' });
      }

      if (peopleRowIndex > 0) {
        sheet.insertRowBefore(peopleRowIndex);
        sheet.getRange(peopleRowIndex, 1).setNumberFormat('@');
        sheet.getRange(peopleRowIndex, 1, 1, CONFIG_HEADERS.length).setValues([rowValues]);
      } else {
        sheet.appendRow(["'" + targetNormalized, ...rowValues.slice(1)]);
      }
      return jsonResponse({ success: true, message: 'Config added' });
    }

    // ── Save P2P People List inside the Config Tab (no extra tab needed) ──
    if (action === 'savePeople') {
      const list = Array.isArray(data.people)
        ? data.people
            .map((p) => String(p).trim())
            .filter((p) => p && !['HDFC', 'SBI'].includes(p.toUpperCase()))
        : [];
      const sheet = getOrCreateSheet(ss, CONFIG_SHEET_NAME, CONFIG_HEADERS);
      const rows = sheet.getDataRange().getValues();
      const serialized = list.join(', ');
      const rowValues = [PEOPLE_ROW_KEY, serialized];
      while (rowValues.length < CONFIG_HEADERS.length) rowValues.push('');

      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).trim() === PEOPLE_ROW_KEY) {
          sheet.getRange(i + 1, 1, 1, CONFIG_HEADERS.length).setValues([rowValues]);
          return jsonResponse({ success: true, message: 'People updated in Config' });
        }
      }
      sheet.appendRow(rowValues);
      return jsonResponse({ success: true, message: 'People saved in Config' });
    }

    // ── Monthly Expense Actions ──
    const sheet = getOrCreateSheet(ss, data.sheetName || 'Nov-2026', EXPENSE_HEADERS);

    if (action === 'addExpense') {
      const r = data.row;
      sheet.appendRow([
        r.rowId, "'" + String(r.date || ''), r.section, r.description,
        r.bankAccount, Number(r.amount) || 0, r.flow || 'out', r.person || ''
      ]);
      return jsonResponse({ success: true, message: 'Row added' });
    }

    if (action === 'updateExpense') {
      const r = data.row;
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(r.rowId)) {
          sheet.getRange(i + 1, 2).setNumberFormat('@');
          sheet.getRange(i + 1, 1, 1, EXPENSE_HEADERS.length).setValues([[
            r.rowId, String(r.date || ''), r.section, r.description,
            r.bankAccount, Number(r.amount) || 0, r.flow || 'out', r.person || ''
          ]]);
          return jsonResponse({ success: true, message: 'Row updated' });
        }
      }
      return jsonResponse({ success: false, error: 'Row ID not found' });
    }

    if (action === 'deleteExpense') {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.rowId)) {
          sheet.deleteRow(i + 1);
          return jsonResponse({ success: true, message: 'Row deleted' });
        }
      }
      return jsonResponse({ success: false, error: 'Row ID not found' });
    }

    return jsonResponse({ success: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // ── Fetch All Month Configurations & People List ──
    if (action === 'getConfigs') {
      const sheet = getOrCreateSheet(ss, CONFIG_SHEET_NAME, CONFIG_HEADERS);
      const data = sheet.getDataRange().getValues();
      const configs = {};
      let people = [];
      const duplicateRowIndices = [];

      for (let i = 1; i < data.length; i++) {
        const [
          name, monthlyBase, essPct, savPct, wntPct, invPct,
          essCarry, savCarry, wntCarry, invCarry,
          hdfcBal, hdfcCarry, sbiBal, sbiCarry
        ] = data[i];
        if (!name) continue;
        if (String(name).trim() === PEOPLE_ROW_KEY) {
          const raw = String(monthlyBase || '').trim();
          if (raw.startsWith('[')) {
            try {
              people = JSON.parse(raw)
                .map((p) => String(p).trim())
                .filter((p) => p && !['HDFC', 'SBI'].includes(p.toUpperCase()));
            } catch (err) {
              people = [];
            }
          } else if (raw) {
            people = raw
              .split(',')
              .map((p) => p.trim())
              .filter((p) => p && !['HDFC', 'SBI'].includes(p.toUpperCase()));
          }
          continue;
        }
        const monthKey = normalizeMonthKey(name, ss);
        if (!monthKey) continue;

        if (configs[monthKey]) {
          // Found duplicate row in sheet - merge non-zero values and mark for deletion
          duplicateRowIndices.push(i + 1);
          const existing = configs[monthKey];
          if (!existing.monthlyBase && Number(monthlyBase)) existing.monthlyBase = Number(monthlyBase);
          if (!existing.banks.HDFC.balance && Number(hdfcBal)) existing.banks.HDFC.balance = Number(hdfcBal);
          if (!existing.banks.HDFC.prevCarry && Number(hdfcCarry)) existing.banks.HDFC.prevCarry = Number(hdfcCarry);
          if (!existing.banks.SBI.balance && Number(sbiBal)) existing.banks.SBI.balance = Number(sbiBal);
          if (!existing.banks.SBI.prevCarry && Number(sbiCarry)) existing.banks.SBI.prevCarry = Number(sbiCarry);
          continue;
        }

        configs[monthKey] = {
          name: monthKey,
          monthlyBase: Number(monthlyBase) || 0,
          percentages: {
            essentials: Number(essPct) || 0,
            savings: Number(savPct) || 0,
            wants: Number(wntPct) || 0,
            invest: Number(invPct) || 0,
          },
          prevCarries: {
            essentials: Number(essCarry) || 0,
            savings: Number(savCarry) || 0,
            wants: Number(wntCarry) || 0,
            invest: Number(invCarry) || 0,
          },
          banks: {
            HDFC: {
              name: 'HDFC Bank',
              subtitle: 'Primary & Invest',
              balance: Number(hdfcBal) || 0,
              prevCarry: Number(hdfcCarry) || 0,
            },
            SBI: {
              name: 'SBI Bank',
              subtitle: 'Daily UPI & Stocks',
              balance: Number(sbiBal) || 0,
              prevCarry: Number(sbiCarry) || 0,
            },
          },
        };
      }

      // Automatically purge any duplicate month rows from bottom to top
      for (let d = duplicateRowIndices.length - 1; d >= 0; d--) {
        sheet.deleteRow(duplicateRowIndices[d]);
      }
      return jsonResponse({ success: true, configs, people });
    }

    // ── Fetch Monthly Expenses ──
    if (action === 'getExpenses') {
      const sheetName = e.parameter.sheetName;
      if (!sheetName) return jsonResponse({ success: true, rows: [] });
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return jsonResponse({ success: true, rows: [] });

      const data = sheet.getDataRange().getValues();
      const rows = [];
      for (let i = 1; i < data.length; i++) {
        const [id, date, section, description, bankAccount, amount, flow, person] = data[i];
        if (!id) continue;
        rows.push({
          id: String(id),
          date: formatCellDate(date, ss),
          section: String(section).toLowerCase(),
          description: String(description),
          bankAccount: String(bankAccount),
          amount: Number(amount) || 0,
          flow: flow || 'out',
          person: person || '',
          month: sheetName
        });
      }
      return jsonResponse({ success: true, rows });
    }

    return jsonResponse({ success: false, error: 'Unknown GET action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}
