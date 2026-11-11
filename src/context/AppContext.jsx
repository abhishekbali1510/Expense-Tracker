import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_MONTHLY_BASE,
  DEFAULT_ACTIVE_MONTH,
  AVAILABLE_MONTHS,
  INITIAL_BANKS,
  INITIAL_SECTIONS,
  INITIAL_P2P_SUMMARY,
  INITIAL_TRANSACTIONS,
} from '../config/budgetConfig';
import { LS_KEYS } from '../config/constants';
import { syncExpenseToSheet, deleteExpenseFromSheet } from '../services/gasApi';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Active Month & Base ──
  const [activeMonth, setActiveMonthState] = useState(() => {
    return localStorage.getItem(LS_KEYS.ACTIVE_MONTH) || DEFAULT_ACTIVE_MONTH;
  });

  const [monthlyBase] = useState(() => {
    const saved = localStorage.getItem(LS_KEYS.MONTHLY_BASE);
    return saved ? Number(saved) : INITIAL_MONTHLY_BASE;
  });

  // ── Bank Accounts (Strictly HDFC & SBI) ──
  const [banks, setBanks] = useState(() => {
    const saved = localStorage.getItem(LS_KEYS.BANKS);
    return saved ? JSON.parse(saved) : INITIAL_BANKS;
  });

  // ── Budget Sections Configuration ──
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem(LS_KEYS.SECTIONS);
    return saved ? JSON.parse(saved) : INITIAL_SECTIONS;
  });

  // ── Transactions Ledger ──
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(LS_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // ── P2P Summary Baseline ──
  const [p2pSummary, setP2pSummary] = useState(() => {
    const saved = localStorage.getItem(LS_KEYS.P2P_SUMMARY);
    return saved ? JSON.parse(saved) : INITIAL_P2P_SUMMARY;
  });

  // ── Add/Edit Modal State ──
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'add', // 'add' | 'edit'
    defaultSection: 'essentials',
    editingExpense: null,
  });

  // ── Sync Status Indicator ──
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'

  // Persist transactions
  useEffect(() => {
    localStorage.setItem(LS_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // Persist active month
  useEffect(() => {
    localStorage.setItem(LS_KEYS.ACTIVE_MONTH, activeMonth);
  }, [activeMonth]);

  // Persist banks
  useEffect(() => {
    localStorage.setItem(LS_KEYS.BANKS, JSON.stringify(banks));
  }, [banks]);

  // ── Filter transactions by active month ──
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(
      (tx) => !tx.month || tx.month.toLowerCase() === activeMonth.toLowerCase()
    );
  }, [transactions, activeMonth]);

  // ── Calculate Section Metrics ──
  // Formula: Remaining = Allocated + Prev/Carry - Total Spent in Section
  const sectionMetrics = useMemo(() => {
    const metrics = {};

    sections.forEach((sec) => {
      const secKey = sec.key.toLowerCase();
      const secTransactions = currentMonthTransactions.filter(
        (tx) => tx.section && tx.section.toLowerCase() === secKey
      );

      const spent = secTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      const allocated = sec.allocated || 0;
      const prevCarry = sec.prevCarry || 0;
      const remaining = allocated + prevCarry - spent;

      metrics[secKey] = {
        ...sec,
        spent,
        remaining,
        transactions: secTransactions,
      };
    });

    return metrics;
  }, [sections, currentMonthTransactions]);

  // ── Calculate P2P Metrics ──
  const p2pMetrics = useMemo(() => {
    const p2pTx = currentMonthTransactions.filter(
      (tx) => tx.section && tx.section.toLowerCase() === 'p2p'
    );

    // Dynamic calculations for Vivek & Mummy / Home
    const vivekInflow = p2pTx
      .filter((tx) => tx.person?.toLowerCase().includes('vivek') && tx.flow === 'in')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

    const vivekOutflow = p2pTx
      .filter((tx) => tx.person?.toLowerCase().includes('vivek') && tx.flow === 'out')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

    const mummyTotal = p2pTx
      .filter((tx) => tx.person?.toLowerCase().includes('mummy'))
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

    return {
      transactions: p2pTx,
      vivekNetPool: p2pSummary.vivekPool.netBalance,
      vivekPoolIn: p2pSummary.vivekPool.breakdownPositive,
      vivekPoolOut: p2pSummary.vivekPool.breakdownNegative,
      thisMonthVivekIn: vivekInflow > 0 ? vivekInflow : p2pSummary.vivekMonth.inflow,
      thisMonthVivekOut: vivekOutflow > 0 ? -Math.abs(vivekOutflow) : p2pSummary.vivekMonth.outflow,
      thisMonthVivekNet:
        (vivekInflow > 0 || vivekOutflow > 0)
          ? (vivekInflow - vivekOutflow)
          : p2pSummary.vivekMonth.netPosition,
      mummyTotal: mummyTotal > 0 ? mummyTotal : p2pSummary.mummyHome.totalTransfer,
    };
  }, [currentMonthTransactions, p2pSummary]);

  // ── Modal Actions ──
  const openAddModal = useCallback((section = 'essentials') => {
    setModalState({
      isOpen: true,
      mode: 'add',
      defaultSection: section.toLowerCase(),
      editingExpense: null,
    });
  }, []);

  const openEditModal = useCallback((expense) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      defaultSection: expense.section?.toLowerCase() || 'essentials',
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

  // ── Save (Create or Update) Expense ──
  const saveExpense = useCallback(
    async (expenseData) => {
      setSyncStatus('syncing');

      let savedRecord = null;
      let isEdit = false;

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
    [activeMonth, modalState, closeModal]
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
    availableMonths: AVAILABLE_MONTHS,
    monthlyBase,
    banks,
    sections,
    transactions: currentMonthTransactions,
    allTransactions: transactions,
    sectionMetrics,
    p2pMetrics,
    modalState,
    syncStatus,
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
