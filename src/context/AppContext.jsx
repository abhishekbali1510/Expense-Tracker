import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  DEFAULT_ACTIVE_MONTH,
  INITIAL_MONTHS_CONFIG,
  INITIAL_PEOPLE,
  BUCKET_DEFINITIONS,
  INITIAL_TRANSACTIONS,
} from '../config/budgetConfig';
import { LS_KEYS } from '../config/constants';
import { syncExpenseToSheet, deleteExpenseFromSheet } from '../services/gasApi';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Months Configurations (dynamic per month) ──
  const [monthsConfig, setMonthsConfig] = useState(() => {
    const saved = localStorage.getItem(LS_KEYS.MONTHS_CONFIG);
    return saved ? JSON.parse(saved) : INITIAL_MONTHS_CONFIG;
  });

  // ── Active Month ──
  const [activeMonth, setActiveMonthState] = useState(() => {
    return localStorage.getItem(LS_KEYS.ACTIVE_MONTH) || DEFAULT_ACTIVE_MONTH;
  });

  // ── P2P People List ──
  const [people, setPeople] = useState(() => {
    const saved = localStorage.getItem(LS_KEYS.PEOPLE);
    return saved ? JSON.parse(saved) : INITIAL_PEOPLE;
  });

  // ── Transactions Ledger ──
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(LS_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
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

  // ── Sync Status ──
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'

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

  // Current Month Data
  const currentMonthData = useMemo(() => {
    if (monthsConfig[activeMonth]) {
      return monthsConfig[activeMonth];
    }
    // Fallback if month is missing
    return (
      INITIAL_MONTHS_CONFIG[activeMonth] || {
        name: activeMonth,
        monthlyBase: 142900,
        percentages: { essentials: 50, savings: 30, wants: 10, invest: 10 },
        prevCarries: { essentials: 0, savings: 0, wants: 0, invest: 0 },
        banks: {
          HDFC: { name: 'HDFC Bank', subtitle: 'Primary & Invest', balance: 0, prevCarry: 0 },
          SBI: { name: 'SBI Bank', subtitle: 'Daily UPI & Stocks', balance: 0, prevCarry: 0 },
        },
      }
    );
  }, [monthsConfig, activeMonth]);

  // Available Months List
  const availableMonths = useMemo(() => {
    return Object.keys(monthsConfig);
  }, [monthsConfig]);

  // Current Month Transactions
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(
      (tx) => !tx.month || tx.month.toLowerCase() === activeMonth.toLowerCase()
    );
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
        (tx) => tx.section && tx.section.toLowerCase() === key
      );

      const spent = secTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
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

  // ── P2P Person Management ──
  const addPerson = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPeople((prev) => {
      if (prev.some((p) => p.toLowerCase() === trimmed.toLowerCase())) return prev;
      return [...prev, trimmed];
    });
  }, []);

  // ── Month Management ──
  const addMonth = useCallback(
    ({ monthName, monthlyBase, percentages, prevCarries, banks }) => {
      const trimmed = monthName.trim();
      if (!trimmed) return;

      setMonthsConfig((prev) => ({
        ...prev,
        [trimmed]: {
          name: trimmed,
          monthlyBase: Number(monthlyBase) || 140000,
          percentages: percentages || { essentials: 50, savings: 30, wants: 10, invest: 10 },
          prevCarries: prevCarries || { essentials: 0, savings: 0, wants: 0, invest: 0 },
          banks: banks || {
            HDFC: { name: 'HDFC Bank', subtitle: 'Primary & Invest', balance: 0, prevCarry: 0 },
            SBI: { name: 'SBI Bank', subtitle: 'Daily UPI & Stocks', balance: 0, prevCarry: 0 },
          },
        },
      }));
      setActiveMonthState(trimmed);
      setIsMonthConfigModalOpen(false);
    },
    []
  );

  const updateCurrentMonthConfig = useCallback(
    (updatedFields) => {
      setMonthsConfig((prev) => ({
        ...prev,
        [activeMonth]: {
          ...prev[activeMonth],
          ...updatedFields,
        },
      }));
    },
    [activeMonth]
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
      setSyncStatus('syncing');

      let savedRecord = null;
      let isEdit = false;

      // If person is new, add them
      if (expenseData.person) {
        addPerson(expenseData.person);
      }

      setTransactions((prev) => {
        if (modalState.mode === 'edit' && modalState.editingExpense) {
          isEdit = true;
          savedRecord = {
            ...modalState.editingExpense,
            ...expenseData,
            amount: Number(expenseData.amount) || 0,
            month: modalState.editingExpense.month || activeMonth,
          };
          return prev.map((item) => (item.id === savedRecord.id ? savedRecord : item));
        } else {
          savedRecord = {
            id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            month: activeMonth,
            ...expenseData,
            amount: Number(expenseData.amount) || 0,
          };
          return [savedRecord, ...prev];
        }
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

  // ── Delete Expense ──
  const deleteExpense = useCallback(
    async (id) => {
      setSyncStatus('syncing');
      setTransactions((prev) => prev.filter((item) => item.id !== id));
      closeModal();

      try {
        const res = await deleteExpenseFromSheet(activeMonth, id);
        if (res.success) {
          setSyncStatus('synced');
          setTimeout(() => setSyncStatus('idle'), 3000);
        } else {
          setSyncStatus('error');
          setTimeout(() => setSyncStatus('idle'), 4000);
        }
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
    banks: currentMonthData.banks,
    people,
    addPerson,
    addMonth,
    updateCurrentMonthConfig,
    transactions: currentMonthTransactions,
    sectionMetrics,
    peopleMetrics,
    modalState,
    syncStatus,
    isMonthConfigModalOpen,
    setIsMonthConfigModalOpen,
    activePersonLedger,
    setActivePersonLedger,
    openAddModal,
    openEditModal,
    closeModal,
    saveExpense,
    deleteExpense,
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
