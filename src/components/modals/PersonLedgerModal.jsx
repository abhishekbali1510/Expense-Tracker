import { useApp } from '../../hooks';
import { formatCurrency, formatDisplayDate } from '../../utils/helpers';

export default function PersonLedgerModal() {
  const {
    activePersonLedger,
    setActivePersonLedger,
    peopleMetrics,
    p2pScope,
    setP2pScope,
    activeMonth,
    openAddModal,
    openEditModal,
  } = useApp();

  if (!activePersonLedger) return null;

  const metric = peopleMetrics[activePersonLedger] || {
    name: activePersonLedger,
    transactions: [],
    inflow: 0,
    outflow: 0,
    net: 0,
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={() => setActivePersonLedger(null)}
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal / Bottom Sheet */}
      <div className="relative w-full sm:max-w-xl mx-auto max-h-[85vh] rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-none p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/30">
                {metric.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{metric.name}</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">P2P Ledger & Settlements</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Scope Switcher Inside Modal */}
              <div className="flex items-center rounded-xl bg-slate-200/80 dark:bg-slate-900 p-0.5 border border-slate-300 dark:border-slate-800 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setP2pScope('overall')}
                  className={`px-2 py-0.5 rounded-lg transition ${
                    p2pScope === 'overall'
                      ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Overall
                </button>
                <button
                  type="button"
                  onClick={() => setP2pScope('month')}
                  className={`px-2 py-0.5 rounded-lg transition ${
                    p2pScope === 'month'
                      ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {activeMonth || 'Month'}
                </button>
              </div>

              <button
                onClick={() => setActivePersonLedger(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Metric Bar for this Person */}
          <div className="mt-3 grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 p-2 text-center">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                {metric.net > 0 ? 'They Owe You' : metric.net < 0 ? 'You Owe Them' : 'Settled'}
              </div>
              <div
                className={`text-xs sm:text-sm font-bold mt-0.5 ${
                  metric.net > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : metric.net < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {metric.net > 0 ? '+' : ''}
                {formatCurrency(metric.net)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Total Given</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(metric.outflow)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Total Received</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(metric.inflow)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex-none px-4 py-2 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Transaction History ({metric.transactions.length})
          </span>
          <button
            onClick={() => {
              openAddModal('p2p', metric.name);
            }}
            className="flex items-center gap-1 rounded-lg bg-sky-500 px-2.5 py-1 text-xs font-bold text-slate-950 shadow transition hover:bg-sky-400 active:scale-95"
          >
            <span>+</span>
            <span>Add Entry</span>
          </button>
        </div>

        {/* Scrollable Transaction Ledger (Scrollable as per Point 9) */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800/60 p-2">
          {metric.transactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              {p2pScope === 'overall'
                ? `No transactions recorded with ${metric.name} yet.`
                : `No transactions recorded with ${metric.name} for ${activeMonth || 'this month'} yet.`}
            </div>
          ) : (
            metric.transactions.map((tx) => {
              const isReceived = tx.flow === 'in';
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                        isReceived
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isReceived ? '↓' : '↑'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{tx.description}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                        <span>{formatDisplayDate(tx.date)}</span>
                        {p2pScope === 'overall' && tx.month && (
                          <span className="rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 px-1 py-0.2 text-[9px] font-bold">
                            {tx.month}
                          </span>
                        )}
                        <span>•</span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-semibold ${
                            String(tx.bankAccount || '').toUpperCase() === 'NONE' || !tx.bankAccount
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {String(tx.bankAccount || '').toUpperCase() === 'NONE' || !tx.bankAccount
                            ? 'None (Cash)'
                            : tx.bankAccount}
                        </span>
                        {tx.budgetImpact !== 'none' &&
                          String(tx.bankAccount || '').toUpperCase() === 'HDFC' &&
                          tx.description !== 'Previous / Opening Balance' && (
                            <>
                              <span>•</span>
                              <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1 py-0.2 text-[9px] font-semibold">
                                Savings
                              </span>
                            </>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div
                      className={`text-xs font-bold ${
                        isReceived ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isReceived ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </div>

                    <button
                      onClick={() => openEditModal(tx)}
                      title="Edit"
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
