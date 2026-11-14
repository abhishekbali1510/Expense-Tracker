import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks';
import { formatCurrency } from '../utils/helpers';

/**
 * View 1: Home Dashboard Screen
 * - Mobile (< md): Compact, single-screen fit, zero scrolling, thumb-friendly.
 * - Desktop (>= md): Full-width professional financial overview with 4-column portfolio grid.
 */
export default function Dashboard() {
  const {
    banks,
    sectionMetrics,
    availableMonths,
    isInitialLoading,
    setIsMonthConfigModalOpen,
    setActiveBankLedger,
    openAddModal,
  } = useApp();
  const navigate = useNavigate();

  if (isInitialLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto h-full flex flex-col items-center justify-center text-center p-6">
        <div className="h-10 w-10 rounded-full border-2 border-sky-500 border-t-transparent animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Loading from Google Sheet...
        </p>
      </div>
    );
  }

  if (availableMonths.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto h-full flex flex-col items-center justify-center text-center p-6">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 text-2xl text-sky-600 dark:text-sky-400 border border-sky-500/30">
            📊
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Ledger is Clean</h2>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              No months are configured in your Google Sheet yet. Set up your first month with your base income, bank balances, and budget split.
            </p>
          </div>
          <button
            onClick={() => setIsMonthConfigModalOpen(true)}
            className="w-full rounded-xl bg-sky-500 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 hover:bg-sky-400 active:scale-95 transition"
          >
            + Setup First Month
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto h-full flex flex-col justify-between md:justify-center md:space-y-5 overflow-hidden py-1 md:py-0">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — Bank Accounts (Strictly HDFC & SBI Only)
          ───────────────────────────────────────────────────────────── */}
      <section className="flex-none">
        <div className="flex items-center justify-between mb-1.5 md:mb-2.5 px-1">
          <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Bank Accounts
          </h2>

          <button
            type="button"
            onClick={() => openAddModal('transfer')}
            className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] md:text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 active:scale-95 transition"
          >
            <span>⇄</span>
            <span>Self Transfer</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 md:gap-5">
          {/* HDFC Bank Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveBankLedger('HDFC')}
            title="Click to view HDFC passbook & audit ledger"
            className="rounded-2xl border border-blue-200 dark:border-blue-500/20 bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-950 p-3 md:p-5 shadow-sm md:shadow-xl flex flex-col justify-between cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 hidden md:inline-block" />
                <span className="text-xs md:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {banks.HDFC.name}
                </span>
              </div>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold opacity-70 hover:opacity-100">
                Audit ↗
              </span>
            </div>

            <div className="my-2 md:my-3">
              <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">
                Available Balance
              </div>
              <div className="text-lg sm:text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(banks.HDFC.balance)}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800/80 pt-1.5 md:pt-2.5 flex items-center justify-between text-[10px] md:text-xs">
              <span className="text-slate-500 dark:text-slate-400">Prev Carry Forward:</span>
              <span
                className={`font-bold ${
                  (banks.HDFC.prevCarry || 0) < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {formatCurrency(banks.HDFC.prevCarry)}
              </span>
            </div>
          </div>

          {/* SBI Bank Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveBankLedger('SBI')}
            title="Click to view SBI passbook & audit ledger"
            className="rounded-2xl border border-cyan-200 dark:border-cyan-500/20 bg-gradient-to-br from-cyan-50 via-white to-slate-50 dark:from-cyan-950/40 dark:via-slate-900 dark:to-slate-950 p-3 md:p-5 shadow-sm md:shadow-xl flex flex-col justify-between cursor-pointer hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-md transition active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-500 dark:bg-cyan-400 hidden md:inline-block" />
                <span className="text-xs md:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {banks.SBI.name}
                </span>
              </div>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold opacity-70 hover:opacity-100">
                Audit ↗
              </span>
            </div>

            <div className="my-2 md:my-3">
              <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">
                Available Balance
              </div>
              <div className="text-lg sm:text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(banks.SBI.balance)}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800/80 pt-1.5 md:pt-2.5 flex items-center justify-between text-[10px] md:text-xs">
              <span className="text-slate-500 dark:text-slate-400">Prev Carry Forward:</span>
              <span
                className={`font-bold ${
                  (banks.SBI.prevCarry || 0) < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {formatCurrency(banks.SBI.prevCarry || 0)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — Budget Sections & Remaining Balance
          (Mobile: 2x2 Grid fitting screen; Desktop: 4-Column Grid)
          ───────────────────────────────────────────────────────────── */}
      <section className="flex-1 md:flex-none flex flex-col justify-between min-h-0 pt-2 md:pt-0">
        <div className="flex items-center justify-between mb-1.5 md:mb-2.5 px-1 flex-none">
          <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Monthly Budgets
          </h2>
        </div>

        {/* Responsive Grid: 2 cols on mobile, 4 cols on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-5 flex-1 md:flex-none">
          {Object.entries(sectionMetrics).map(([key, sec]) => {
            const isNegativeRemaining = sec.remaining < 0;
            const isNegativeCarry = sec.prevCarry < 0;
            const percentUsed =
              sec.allocated > 0
                ? Math.min(100, Math.round((sec.spent / sec.allocated) * 100))
                : 0;

            return (
              <div
                key={key}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/section/${key}`)}
                className={`relative flex flex-col justify-between rounded-2xl border bg-white dark:bg-slate-900/90 p-3 md:p-4 shadow-sm md:shadow-lg transition duration-200 hover:-translate-y-1 hover:border-sky-500/60 active:scale-[0.98] cursor-pointer ${sec.borderClass}`}
              >
                {/* Header: Label & Percent Badge */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm md:text-lg">{sec.icon}</span>
                      <span className="text-xs md:text-base font-bold text-slate-900 dark:text-white">
                        {sec.label}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-1.5 md:px-2.5 py-0.5 text-[10px] md:text-xs font-bold border ${sec.badgeClass}`}
                    >
                      {sec.percent}%
                    </span>
                  </div>

                  {/* Desktop Progress Bar */}
                  <div className="hidden md:block mt-2.5">
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span>Used: {percentUsed}%</span>
                      <span>Target: {sec.percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentUsed > 90
                            ? 'bg-rose-500'
                            : percentUsed > 70
                            ? 'bg-amber-400'
                            : 'bg-sky-500 dark:bg-sky-400'
                        }`}
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Metric: Remaining */}
                <div className="my-1.5 md:my-3">
                  <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Remaining Balance
                  </div>
                  <div
                    className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight ${
                      isNegativeRemaining
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {formatCurrency(sec.remaining)}
                  </div>
                </div>

                {/* 3-Column Mini Breakdown */}
                <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 p-1.5 md:p-2.5 text-center">
                  <div className="px-0.5 md:px-1">
                    <div className="text-[9px] md:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Budget
                    </div>
                    <div className="text-[10px] md:text-xs font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(sec.allocated)}
                    </div>
                  </div>
                  <div className="px-0.5 md:px-1">
                    <div className="text-[9px] md:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Carry
                    </div>
                    <div
                      className={`text-[10px] md:text-xs font-bold ${
                        isNegativeCarry
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {formatCurrency(sec.prevCarry)}
                    </div>
                  </div>
                  <div className="px-0.5 md:px-1">
                    <div className="text-[9px] md:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Spent
                    </div>
                    <div className="text-[10px] md:text-xs font-bold text-amber-600 dark:text-amber-300">
                      {formatCurrency(sec.spent)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
