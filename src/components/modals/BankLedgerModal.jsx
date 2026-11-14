import { useState, useMemo } from 'react';
import { useApp } from '../../hooks';
import { formatCurrency, formatDisplayDate } from '../../utils/helpers';

export default function BankLedgerModal() {
  const {
    activeBankLedger,
    setActiveBankLedger,
    banks,
    currentMonthData,
    transactions,
    activeMonth,
    openAddModal,
    openEditModal,
  } = useApp();

  const [filter, setFilter] = useState('all'); // 'all' | 'transfer' | 'expense' | 'inflow'

  const bankName = activeBankLedger; // 'HDFC' | 'SBI'
  const bankData = bankName ? banks[bankName] : null;

  // Filter all transactions for this bank account in the active month
  const bankTransactions = useMemo(() => {
    if (!bankName) return [];
    return transactions.filter(
      (tx) =>
        String(tx.bankAccount || '').trim().toUpperCase() === bankName &&
        (!tx.month || tx.month.toLowerCase() === (activeMonth || '').toLowerCase())
    );
  }, [transactions, bankName, activeMonth]);

  // Compute Inflows & Outflows for this bank
  const { totalInflows, totalOutflows } = useMemo(() => {
    let inflows = 0;
    let outflows = 0;

    bankTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.flow === 'in') {
        inflows += amt;
      } else {
        outflows += amt;
      }
    });

    return { totalInflows: inflows, totalOutflows: outflows };
  }, [bankTransactions]);

  // Filtered list
  const filteredTransactions = useMemo(() => {
    if (filter === 'transfer') {
      return bankTransactions.filter((tx) => tx.section?.toLowerCase() === 'transfer');
    }
    if (filter === 'expense') {
      return bankTransactions.filter(
        (tx) => tx.section?.toLowerCase() !== 'transfer' && tx.flow !== 'in'
      );
    }
    if (filter === 'inflow') {
      return bankTransactions.filter((tx) => tx.flow === 'in');
    }
    return bankTransactions;
  }, [bankTransactions, filter]);

  if (!activeBankLedger || !bankData) return null;

  const isHDFC = bankName === 'HDFC';
  const baseIncome = isHDFC ? Number(currentMonthData?.monthlyBase) || 0 : 0;
  const startingBal = (Number(bankData.startingBalance) || 0) + baseIncome;
  const prevCarry = Number(bankData.prevCarry) || 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={() => setActiveBankLedger(null)}
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal / Bottom Sheet */}
      <div className="relative w-full sm:max-w-xl max-h-[88vh] rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-none p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-black border ${
                  isHDFC
                    ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                    : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
                }`}
              >
                🏦
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {bankData.name}
                  </h2>
                  <span
                    className={`rounded-full px-2 py-0.2 text-[10px] font-bold border ${
                      isHDFC
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                        : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                    }`}
                  >
                    {bankName} Passbook
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isHDFC ? 'Primary salary & investments account' : 'Daily UPI & stocks account'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveBankLedger(null)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* 4-Metric Audit Bar */}
          <div className="mt-3.5 grid grid-cols-4 divide-x divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 p-2 text-center">
            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isHDFC ? 'Start + Salary' : 'Start Balance'}
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(startingBal)}
              </div>
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Prev Carry
              </div>
              <div
                className={`text-[11px] sm:text-xs font-bold mt-0.5 ${
                  prevCarry < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {formatCurrency(prevCarry)}
              </div>
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Inflows (Credits)
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                +{formatCurrency(totalInflows)}
              </div>
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Available Now
              </div>
              <div
                className={`text-[11px] sm:text-xs font-black mt-0.5 ${
                  bankData.balance < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-sky-600 dark:text-sky-400'
                }`}
              >
                {formatCurrency(bankData.balance)}
              </div>
            </div>
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="flex-none px-4 py-2 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-200/60 dark:bg-slate-950 p-0.5 border border-slate-200 dark:border-slate-800">
            {[
              { id: 'all', label: 'All' },
              { id: 'transfer', label: '⇄ Transfers' },
              { id: 'expense', label: 'Expenses' },
              { id: 'inflow', label: 'Inflow' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition ${
                  filter === f.id
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Quick Transfer / Entry Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setActiveBankLedger(null);
                openAddModal('transfer');
              }}
              className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 active:scale-95 transition"
            >
              <span>⇄</span>
              <span>Self Transfer</span>
            </button>
            <button
              onClick={() => {
                setActiveBankLedger(null);
                openAddModal('essentials');
              }}
              className="flex items-center gap-1 rounded-lg bg-sky-500 px-2.5 py-1 text-xs font-bold text-slate-950 hover:bg-sky-400 active:scale-95 shadow transition"
            >
              <span>+</span>
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        {/* Scrollable Transaction Ledger */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800/60 p-2">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No transactions recorded for {bankData.name} under this filter yet.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isInflow = tx.flow === 'in';
              const isTransfer = tx.section?.toLowerCase() === 'transfer';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isTransfer
                          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                          : isInflow
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isTransfer ? '⇄' : isInflow ? '↓' : '↑'}
                    </div>

                    <div className="min-w-0 flex-1 pr-2">
                      <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                        {tx.description}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{formatDisplayDate(tx.date)}</span>
                        <span>•</span>
                        <span
                          className={`rounded px-1.5 py-0.2 font-medium capitalize ${
                            isTransfer
                              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-bold'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isTransfer ? 'Self Transfer' : tx.section}
                        </span>
                        {tx.person && (
                          <>
                            <span>•</span>
                            <span className="truncate">{tx.person}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div
                      className={`text-xs font-bold ${
                        isInflow
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {isInflow ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </div>

                    <button
                      onClick={() => {
                        setActiveBankLedger(null);
                        openEditModal(tx);
                      }}
                      title="Edit transaction"
                      className="rounded p-1 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
