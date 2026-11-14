import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  DEFAULT_ACTIVE_MONTH,
  INITIAL_MONTHS_CONFIG,
  INITIAL_PEOPLE,
  BUCKET_DEFINITIONS,
  INITIAL_TRANSACTIONS,
} from '../config/budgetConfig';
import { LS_KEYS } from '../config/constants';
import {
  syncExpenseToSheet,
  deleteExpenseFromSheet,
  fetchSheetExpenses,
  fetchAllConfigs,
  saveMonthConfig,
  savePeopleConfig,
} from '../services/gasApi';
import { normalizeMonthKey, formatDisplayDate, sortTransactionsDesc } from '../utils/helpers';

export const AppContext = createContext(null);

function normalizeConfigsMap(rawConfigs) {
  const normalized = {};
  for (const [k, v] of Object.entries(rawConfigs || {})) {
    const key = normalizeMonthKey(v?.name || k);
    if (!key) continue;
    normalized[key] = { ...v, name: key };
  }
  return normalized;
}

export function AppProvider({ children }) {
  // ── Months Configurations (dynamic per month) ──
  const [monthsConfig, setMonthsConfig] = useState(() => {
    const saved = localStorage.getItem(LS_KEYS.MONTHS_CONFIG);
    return saved ? normalizeConfigsMap(JSON.parse(saved)) : INITIAL_MONTHS_CONFIG;
  });

  // ── Active Month ──
  const [activeMonth, setActiveMonthState] = useState(() => {
    const saved = localStorage.getItem(LS_KEYS.ACTIVE_MONTH);
    return saved ? normalizeMonthKey(saved) : DEFAULT_ACTIVE_MONTH;
  });

  // ── P2P People List ──
  const [people, setPeople] = useState(() => {
    const saved = localStorage.getItem(LS_KEYS.PEOPLE);
    const initial = saved ? JSON.parse(saved) : INITIAL_PEOPLE;
    return (Array.isArray(initial) ? initial : []).filter(
      (p) => p && !['HDFC', 'SBI'].includes(String(p).trim().toUpperCase())
    );
  });

  // ── Transactions Ledger ──
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(LS_KEYS.TRANSACTIONS);
    if (!saved) return INITIAL_TRANSACTIONS;
    return JSON.parse(saved).map((tx) => ({
      ...tx,
      date: formatDisplayDate(tx.date),
    }));
  });

  // ── Modal States ──
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'add', // 'add' | 'edit'
    defaultSection: 'essentials',
    defaultPerson: 'Vivek',
    editingExpense: null,
  });

  const [isMonthConfigModalOpen, setIsMonthConfigModalOpen] = useState(false);
  const [activePersonLedger, setActivePersonLedger] = useState(null); // string (person name) or null
  const [activeBankLedger, setActiveBankLedger] = useState(null); // 'HDFC' | 'SBI' | null

  // ── Sync & Loading Status ──
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const lastMutationRef = useRef(0);

  // ── Theme State ('dark' | 'light') ──
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(LS_KEYS.THEME) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem(LS_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist State
  useEffect(() => {
    localStorage.setItem(LS_KEYS.MONTHS_CONFIG, JSON.stringify(monthsConfig));
  }, [monthsConfig]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.ACTIVE_MONTH, activeMonth);
  }, [activeMonth]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.PEOPLE, JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // ── Initial Load: Fetch Month Configurations from Google Sheets "Config" Tab ──
  useEffect(() => {
    let mounted = true;
    async function loadInitialConfigs() {
      const res = await fetchAllConfigs();
      if (!mounted) return;
      if (res.success && !res.offline && res.configs) {
        const cleanConfigs = normalizeConfigsMap(res.configs);
        setMonthsConfig(cleanConfigs);
        const monthKeys = Object.keys(cleanConfigs);
        setActiveMonthState((prev) => {
          const normPrev = normalizeMonthKey(prev);
          if (normPrev && cleanConfigs[normPrev]) return normPrev;
          return monthKeys[0] || '';
        });
        if (Array.isArray(res.people)) {
          const cleanPeople = res.people.filter(
            (p) => p && !['HDFC', 'SBI'].includes(String(p).trim().toUpperCase())
          );
          setPeople(cleanPeople);
        }
      }
      setIsInitialLoading(false);
    }
    loadInitialConfigs();
    return () => {
      mounted = false;
    };
  }, []);

  // ── Fetch Live Transactions & Configs from Google Sheets ──
  const refreshFromSheet = useCallback(
    async (targetMonth = activeMonth, { silent = false } = {}) => {
      if (!targetMonth) {
        if (!silent) setSyncStatus('idle');
        return;
      }
      if (silent && Date.now() - lastMutationRef.current < 4000) {
        return;
      }
      const startedAt = Date.now();
      if (!silent) setSyncStatus('syncing');

      const [expRes, cfgRes] = await Promise.all([
        fetchSheetExpenses(targetMonth),
        fetchAllConfigs(),
      ]);

      // Avoid overwriting a newer local mutation with a stale in-flight GET
      if (silent && lastMutationRef.current > startedAt) {
        return;
      }

      if (cfgRes.success && !cfgRes.offline && cfgRes.configs) {
        const cleanConfigs = normalizeConfigsMap(cfgRes.configs);
        setMonthsConfig(cleanConfigs);
        if (Array.isArray(cfgRes.people)) {
          const cleanPeople = cfgRes.people.filter(
            (p) => p && !['HDFC', 'SBI'].includes(String(p).trim().toUpperCase())
          );
          setPeople(cleanPeople);
        }
      }

      if (expRes.success && !expRes.offline && Array.isArray(expRes.rows)) {
        const normalizedRows = expRes.rows.map((tx) => ({
          ...tx,
          date: formatDisplayDate(tx.date),
        }));
        setTransactions((prev) => {
          const otherMonths = prev.filter(
            (tx) => tx.month && tx.month.toLowerCase() !== targetMonth.toLowerCase()
          );
          return [...normalizedRows, ...otherMonths];
        });
        // Register any P2P people found in the sheet (strictly p2p section, excluding banks)
        const sheetPeople = expRes.rows
          .filter((r) => r.section && r.section.toLowerCase() === 'p2p')
          .map((r) => r.person)
          .filter(
            (p) =>
              p &&
              typeof p === 'string' &&
              p.trim() !== '' &&
              !['HDFC', 'SBI'].includes(p.trim().toUpperCase())
          );
        if (sheetPeople.length > 0) {
          setPeople((prev) => {
            const next = [...prev];
            sheetPeople.forEach((p) => {
              if (!next.some((existing) => existing.toLowerCase() === p.trim().toLowerCase())) {
                next.push(p.trim());
              }
            });
            return next;
          });
        }
        if (!silent) {
          setSyncStatus('synced');
          setTimeout(() => setSyncStatus('idle'), 2500);
        }
      } else if (!expRes.success) {
        if (!silent) {
          setSyncStatus('error');
          setTimeout(() => setSyncStatus('idle'), 4000);
        }
      } else if (!silent) {
        setSyncStatus('idle');
      }
    },
    [activeMonth]
  );

  useEffect(() => {
    refreshFromSheet(activeMonth);
  }, [activeMonth, refreshFromSheet]);

  // ── Auto-Sync across devices on tab focus & every 30s while visible ──
  useEffect(() => {
    const syncSilently = () => {
      if (document.visibilityState === 'visible') {
        refreshFromSheet(activeMonth, { silent: true });
      }
    };

    window.addEventListener('focus', syncSilently);
    document.addEventListener('visibilitychange', syncSilently);
    const intervalId = setInterval(syncSilently, 30000);

    return () => {
      window.removeEventListener('focus', syncSilently);
      document.removeEventListener('visibilitychange', syncSilently);
      clearInterval(intervalId);
    };
  }, [activeMonth, refreshFromSheet]);

  // Current Month Data
  const currentMonthData = useMemo(() => {
    if (activeMonth && monthsConfig[activeMonth]) {
      return monthsConfig[activeMonth];
    }
    // Clean empty fallback
    return {
      name: activeMonth || '',
      monthlyBase: 0,
      percentages: { essentials: 50, savings: 30, wants: 10, invest: 10 },
      prevCarries: { essentials: 0, savings: 0, wants: 0, invest: 0 },
      banks: {
        HDFC: { name: 'HDFC Bank', subtitle: 'Primary & Invest', balance: 0, prevCarry: 0 },
        SBI: { name: 'SBI Bank', subtitle: 'Daily UPI & Stocks', balance: 0, prevCarry: 0 },
      },
    };
  }, [monthsConfig, activeMonth]);

  // Available Months List
  const availableMonths = useMemo(() => {
    return Object.keys(monthsConfig);
  }, [monthsConfig]);

  // Current Month Transactions (Sorted: Date DESC, then Added Timestamp DESC)
  const currentMonthTransactions = useMemo(() => {
    const filtered = transactions.filter(
      (tx) => !tx.month || tx.month.toLowerCase() === activeMonth.toLowerCase()
    );
    return sortTransactionsDesc(filtered, activeMonth);
  }, [transactions, activeMonth]);

  // ── Calculate Section Metrics ──
  // Formula: Remaining = Allocated + Prev/Carry - Total Spent in Section
  const sectionMetrics = useMemo(() => {
    const metrics = {};
    const base = currentMonthData.monthlyBase || 0;
    const percentages = currentMonthData.percentages || {
      essentials: 50,
      savings: 30,
      wants: 10,
      invest: 10,
    };
    const prevCarries = currentMonthData.prevCarries || {
      essentials: 0,
      savings: 0,
      wants: 0,
      invest: 0,
    };

    BUCKET_DEFINITIONS.forEach((def) => {
      const key = def.key;
      const percent = percentages[key] ?? 25;
      const allocated = Math.round((base * percent) / 100);
      const prevCarry = prevCarries[key] ?? 0;

      const secTransactions = currentMonthTransactions.filter(
        (tx) => tx.section && tx.section.trim().toLowerCase() === key
      );

      const spent = secTransactions.reduce((acc, curr) => {
        const amt = Number(curr.amount) || 0;
        return curr.flow === 'in' ? acc - amt : acc + amt;
      }, 0);
      const remaining = allocated + prevCarry - spent;

      metrics[key] = {
        ...def,
        percent,
        allocated,
        prevCarry,
        spent,
        remaining,
        transactions: secTransactions,
      };
    });

    return metrics;
  }, [currentMonthData, currentMonthTransactions]);

  // ── Calculate Live Bank Balances (HDFC & SBI) ──
  // Base income (monthlyBase) is added to HDFC.
  // Expenses (outflows) and deposits/refunds (inflows) dynamically debit and credit HDFC and SBI balances.
  const liveBanks = useMemo(() => {
    const hdfcConfig = currentMonthData.banks?.HDFC || { balance: 0, prevCarry: 0 };
    const sbiConfig = currentMonthData.banks?.SBI || { balance: 0, prevCarry: 0 };

    const baseIncome = Number(currentMonthData.monthlyBase) || 0;
    const hdfcStartBal = Number(hdfcConfig.balance) || 0;
    const hdfcCarry = Number(hdfcConfig.prevCarry) || 0;

    const sbiStartBal = Number(sbiConfig.balance) || 0;
    const sbiCarry = Number(sbiConfig.prevCarry) || 0;

    // Monthly base income is credited to HDFC
    let hdfcBalance = hdfcStartBal + baseIncome + hdfcCarry;
    let sbiBalance = sbiStartBal + sbiCarry;

    currentMonthTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const bank = String(tx.bankAccount || '').trim().toUpperCase();
      const isOut = tx.flow !== 'in'; // default flow is outflow

      if (bank === 'HDFC') {
        hdfcBalance += isOut ? -amt : amt;
      } else if (bank === 'SBI') {
        sbiBalance += isOut ? -amt : amt;
      }
    });

    return {
      HDFC: {
        name: hdfcConfig.name || 'HDFC Bank',
        subtitle: hdfcConfig.subtitle || 'Primary & Invest',
        balance: hdfcBalance,
        prevCarry: hdfcCarry,
        startingBalance: hdfcStartBal,
      },
      SBI: {
        name: sbiConfig.name || 'SBI Bank',
        subtitle: sbiConfig.subtitle || 'Daily UPI & Stocks',
        balance: sbiBalance,
        prevCarry: sbiCarry,
        startingBalance: sbiStartBal,
      },
    };
  }, [currentMonthData, currentMonthTransactions]);

  // ── Calculate People Metrics for P2P ──
  const peopleMetrics = useMemo(() => {
    const p2pTx = currentMonthTransactions.filter(
      (tx) => tx.section && tx.section.toLowerCase() === 'p2p'
    );

    const metrics = {};

    people.forEach((personName) => {
      const pTx = p2pTx.filter(
        (tx) => tx.person && tx.person.toLowerCase() === personName.toLowerCase()
      );

      const inflow = pTx
        .filter((tx) => tx.flow === 'in')
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

      const outflow = pTx
        .filter((tx) => tx.flow === 'out')
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

      const net = inflow - outflow;

      metrics[personName] = {
        name: personName,
        transactions: pTx,
        inflow,
        outflow,
        net,
        count: pTx.length,
      };
    });

    return metrics;
  }, [people, currentMonthTransactions]);

  // ── P2P Person Management (Syncs to Google Sheets "Config" Tab) ──
  const addPerson = useCallback(
    async (name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      if (['HDFC', 'SBI'].includes(trimmed.toUpperCase())) return;
      if (people.some((p) => p.toLowerCase() === trimmed.toLowerCase())) return;

      const updatedPeople = [...people, trimmed];
      setPeople(updatedPeople);

      setSyncStatus('syncing');
      const res = await savePeopleConfig(updatedPeople);
      if (res.success) {
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 4000);
      }
    },
    [people]
  );

  const deletePerson = useCallback(
    async (personToDelete) => {
      const trimmed = String(personToDelete || '').trim();
      if (!trimmed) return;

      const updatedPeople = people.filter(
        (p) => p.toLowerCase() !== trimmed.toLowerCase()
      );
      setPeople(updatedPeople);

      setSyncStatus('syncing');
      const res = await savePeopleConfig(updatedPeople);
      if (res.success) {
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 4000);
      }
    },
    [people]
  );

  // ── Month Management (Syncs to Google Sheets "Config" Tab) ──
  const addMonth = useCallback(
    async ({ monthName, monthlyBase, percentages, prevCarries, banks }) => {
      const trimmed = monthName.trim();
      if (!trimmed) return;

      const newConfig = {
        name: trimmed,
        monthlyBase: Number(monthlyBase) || 0,
        percentages: percentages || { essentials: 50, savings: 30, wants: 10, invest: 10 },
        prevCarries: prevCarries || { essentials: 0, savings: 0, wants: 0, invest: 0 },
        banks: banks || {
          HDFC: { name: 'HDFC Bank', subtitle: 'Primary & Invest', balance: 0, prevCarry: 0 },
          SBI: { name: 'SBI Bank', subtitle: 'Daily UPI & Stocks', balance: 0, prevCarry: 0 },
        },
      };

      setMonthsConfig((prev) => ({
        ...prev,
        [trimmed]: newConfig,
      }));
      setActiveMonthState(trimmed);
      setIsMonthConfigModalOpen(false);

      setSyncStatus('syncing');
      const res = await saveMonthConfig(newConfig);
      if (res.success) {
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 4000);
      }
    },
    []
  );

  const updateCurrentMonthConfig = useCallback(
    async (updatedFields) => {
      if (!activeMonth) return;
      const updatedConfig = {
        ...currentMonthData,
        ...updatedFields,
        name: activeMonth,
      };

      setMonthsConfig((prev) => ({
        ...prev,
        [activeMonth]: updatedConfig,
      }));

      setSyncStatus('syncing');
      const res = await saveMonthConfig(updatedConfig);
      if (res.success) {
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 4000);
      }
    },
    [activeMonth, currentMonthData]
  );

  // ── Modal Actions ──
  const openAddModal = useCallback((section = 'essentials', person = '') => {
    setModalState({
      isOpen: true,
      mode: 'add',
      defaultSection: section.toLowerCase(),
      defaultPerson: person || 'Vivek',
      editingExpense: null,
    });
  }, []);

  const openEditModal = useCallback((expense) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      defaultSection: expense.section?.toLowerCase() || 'essentials',
      defaultPerson: expense.person || 'Vivek',
      editingExpense: expense,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
      editingExpense: null,
    }));
  }, []);

  // ── Save Expense (Optimistic + GAS Sync) ──
  const saveExpense = useCallback(
    async (expenseData) => {
      lastMutationRef.current = Date.now();
      setSyncStatus('syncing');

      const isEdit = Boolean(modalState.mode === 'edit' && modalState.editingExpense);
      const savedRecord = isEdit
        ? {
            ...modalState.editingExpense,
            ...expenseData,
            amount: Number(expenseData.amount) || 0,
            month: modalState.editingExpense.month || activeMonth,
          }
        : {
            id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            month: activeMonth,
            ...expenseData,
            amount: Number(expenseData.amount) || 0,
          };

      // If person is new and this is a P2P transaction, add them
      if (expenseData.person && expenseData.section?.toLowerCase() === 'p2p') {
        addPerson(expenseData.person);
      }

      setTransactions((prev) => {
        if (isEdit) {
          return prev.map((item) => (item.id === savedRecord.id ? savedRecord : item));
        }
        return [savedRecord, ...prev];
      });

      closeModal();

      // Background synchronization to Google Sheets
      try {
        const res = await syncExpenseToSheet(
          activeMonth,
          savedRecord,
          isEdit ? 'edit' : 'add'
        );
        if (res.success) {
          setSyncStatus('synced');
          setTimeout(() => setSyncStatus('idle'), 3000);
        } else {
          setSyncStatus('error');
          setTimeout(() => setSyncStatus('idle'), 4000);
        }
      } catch (err) {
        console.error('Failed to sync to Google Sheet:', err);
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 4000);
      }
    },
    [activeMonth, modalState, closeModal, addPerson]
  );

  // ── Save Bidirectional Self Transfer (HDFC ⇄ SBI) ──
  const saveTransfer = useCallback(
    async ({ date, fromBank, toBank, amount, description }) => {
      lastMutationRef.current = Date.now();
      setSyncStatus('syncing');

      const now = Date.now();
      const rand = Math.random().toString(36).substring(2, 6);
      const pairId = `xfer_${now}_${rand}`;
      const desc = description?.trim() || `Self Transfer: ${fromBank} ➔ ${toBank}`;
      const amt = Math.abs(Number(amount));
      const formattedDate = date ? formatDisplayDate(date) : formatDisplayDate(new Date());

      // Row 1: Outflow debit from source bank
      const outRecord = {
        id: `tx_${now}_out_${rand}`,
        transferPairId: pairId,
        date: formattedDate,
        month: activeMonth,
        section: 'transfer',
        description: desc,
        amount: amt,
        bankAccount: fromBank,
        flow: 'out',
        person: '',
      };

      // Row 2: Inflow credit to destination bank
      const inRecord = {
        id: `tx_${now}_in_${rand}`,
        transferPairId: pairId,
        date: formattedDate,
        month: activeMonth,
        section: 'transfer',
        description: desc,
        amount: amt,
        bankAccount: toBank,
        flow: 'in',
        person: '',
      };

      setTransactions((prev) => [outRecord, inRecord, ...prev]);
      closeModal();

      try {
        const [resOut, resIn] = await Promise.all([
          syncExpenseToSheet(activeMonth, outRecord, 'add'),
          syncExpenseToSheet(activeMonth, inRecord, 'add'),
        ]);

        if (resOut.success && resIn.success) {
          setSyncStatus('synced');
          setTimeout(() => setSyncStatus('idle'), 3000);
        } else {
          setSyncStatus('error');
          setTimeout(() => setSyncStatus('idle'), 4000);
        }
      } catch (err) {
        console.error('Transfer sync failed:', err);
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 4000);
      }
    },
    [activeMonth, closeModal]
  );

  // ── Delete Expense (With Transfer Pairing support) ──
  const deleteExpense = useCallback(
    async (id) => {
      lastMutationRef.current = Date.now();
      setSyncStatus('syncing');

      // Check if this transaction is part of a paired transfer
      let idsToDelete = [id];
      setTransactions((prev) => {
        const target = prev.find((item) => item.id === id);
        const pairId = target?.transferPairId;
        if (pairId) {
          const paired = prev.find((item) => item.transferPairId === pairId && item.id !== id);
          if (paired) {
            idsToDelete.push(paired.id);
          }
        }
        return prev.filter((item) => !idsToDelete.includes(item.id));
      });
      closeModal();

      try {
        await Promise.all(idsToDelete.map((delId) => deleteExpenseFromSheet(activeMonth, delId)));
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (err) {
        console.error('Delete sync failed:', err);
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 4000);
      }
    },
    [activeMonth, closeModal]
  );

  const value = {
    activeMonth,
    setActiveMonth: setActiveMonthState,
    availableMonths,
    monthsConfig,
    currentMonthData,
    banks: liveBanks,
    people,
    addPerson,
    deletePerson,
    addMonth,
    updateCurrentMonthConfig,
    transactions: currentMonthTransactions,
    sectionMetrics,
    peopleMetrics,
    modalState,
    syncStatus,
    isInitialLoading,
    theme,
    setTheme,
    isMonthConfigModalOpen,
    setIsMonthConfigModalOpen,
    activePersonLedger,
    setActivePersonLedger,
    activeBankLedger,
    setActiveBankLedger,
    openAddModal,
    openEditModal,
    closeModal,
    saveExpense,
    saveTransfer,
    deleteExpense,
    refreshFromSheet,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
