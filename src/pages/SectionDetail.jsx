import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks';
import { formatCurrency, formatDisplayDate } from '../utils/helpers';

export default function SectionDetail() {
  const { sectionKey } = useParams();
  const navigate = useNavigate();
  const { sectionMetrics, openAddModal, openEditModal } = useApp();

  const currentKey = (sectionKey || 'essentials').trim().toLowerCase();
  const section = sectionMetrics[currentKey] || sectionMetrics.essentials;

  const sectionPills = [
    { key: 'essentials', label: 'Essentials' },
    { key: 'wants', label: 'Wants' },
    { key: 'invest', label: 'Invest' },
    { key: 'savings', label: 'Savings' },
  ];

  const hasPrevCarry = section.prevCarry !== 0;

  return (
    <div
      key={currentKey}
      className="w-full max-w-7xl mx-auto h-full min-h-0 flex flex-col gap-3 md:gap-4 py-1 md:py-2 overflow-hidden"
    >
      {/* ─────────────────────────────────────────────────────────────
          TOP NAVIGATION ROW: Back to Home + Quick Section Switcher Pills
          ───────────────────────────────────────────────────────────── */}
      <div className="flex-none flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm dark:shadow-none transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        >
          <span>←</span>
          <span>Back to Home</span>
        </button>

        {/* Section Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
          {sectionPills.map((pill) => {
            const isActive = pill.key === currentKey;
            return (
              <button
                key={pill.key}
                onClick={() => navigate(`/section/${pill.key}`)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION SUMMARY HEADER CARD (4-Column Metric Bar)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex-none relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 p-3.5 md:p-4 shadow-md dark:shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">{section.label}</h1>
              <span className={`rounded-full border px-2 py-0.2 text-[10px] font-semibold ${section.badgeClass}`}>
                {section.percent}% Framework
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Detailed ledger for {section.label} bucket
            </p>
          </div>

          <button
            onClick={() => openAddModal(currentKey)}
            className="flex items-center gap-1 rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-sky-500/20 transition hover:bg-sky-400 active:scale-95"
          >
            <span className="font-bold">+</span>
            <span>Add Entry</span>
          </button>
        </div>

        {/* 4-Column Metric Bar: Allocated | Carry Forward | Spent | Remaining */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {/* Allocated */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 p-2 text-center">
            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Allocated</div>
            <div className="mt-0.5 text-xs font-bold text-slate-900 dark:text-white">
              {formatCurrency(section.allocated)}
            </div>
          </div>

          {/* Carry Forward */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 p-2 text-center">
            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Carry</div>
            <div
              className={`mt-0.5 text-xs font-bold ${
                section.prevCarry < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              {formatCurrency(section.prevCarry)}
            </div>
          </div>

          {/* Spent */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 p-2 text-center">
            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Spent</div>
            <div className="mt-0.5 text-xs font-bold text-amber-600 dark:text-amber-300">
              {formatCurrency(section.spent)}
            </div>
          </div>

          {/* Remaining */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 p-2 text-center">
            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Remaining</div>
            <div
              className={`mt-0.5 text-xs font-black ${
                section.remaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-sky-300'
              }`}
            >
              {formatCurrency(section.remaining)}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION TRANSACTIONS TABLE (Only this area scrolls)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-md dark:shadow-xl">
        <div className="flex-none flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 md:px-5 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Transactions</h2>
            <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              {section.transactions.length + (hasPrevCarry ? 1 : 0)} items
            </span>
          </div>

          <button
            onClick={() => openAddModal(currentKey)}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300"
          >
            + Add New
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {/* Mobile Compact List (Zero Horizontal Scroll) */}
          <div className="sm:hidden divide-y divide-slate-200 dark:divide-slate-800/60">
            {section.transactions.length === 0 ? (
              <div className="px-4 py-10 text-center text-xs text-slate-500">
                No transactions logged in {section.label} for this month yet.
              </div>
            ) : (
              section.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {tx.description}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{formatDisplayDate(tx.date)}</span>
                      <span>•</span>
                      <span
                        className={`rounded px-1.5 py-0.2 font-semibold ${
                          tx.bankAccount === 'HDFC'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                        }`}
                      >
                        {tx.bankAccount}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        tx.flow === 'in'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {tx.flow === 'in' ? `+${formatCurrency(tx.amount)}` : formatCurrency(tx.amount)}
                    </span>
                    <button
                      onClick={() => openEditModal(tx)}
                      title="Edit transaction"
                      className="rounded p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              ))
            )}

            {hasPrevCarry && (
              <div className="flex items-center justify-between gap-2 bg-rose-50 dark:bg-rose-950/15 px-3.5 py-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-300">
                      Prev
                    </span>
                    <span className="truncate text-xs font-medium text-rose-600 dark:text-rose-300">
                      Previous Month Carry Forward
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(section.prevCarry)}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <table className="hidden sm:table w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Description / Item</th>
                <th className="px-5 py-3">Bank Account</th>
                <th className="px-5 py-3 text-right">Amount (₹)</th>
                <th className="px-5 py-3 text-center">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {/* Transactions List */}
              {section.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    No transactions logged in {section.label} for this month yet.
                  </td>
                </tr>
              ) : (
                section.transactions.map((tx) => (
                  <tr key={tx.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="whitespace-nowrap px-5 py-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {formatDisplayDate(tx.date)}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-900 dark:text-white">
                      {tx.description}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-xs">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${
                          tx.bankAccount === 'HDFC'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                        }`}
                      >
                        {tx.bankAccount}
                      </span>
                    </td>
                    <td
                      className={`whitespace-nowrap px-5 py-3 text-right text-xs font-bold ${
                        tx.flow === 'in'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {tx.flow === 'in' ? `+${formatCurrency(tx.amount)}` : formatCurrency(tx.amount)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-center">
                      <button
                        onClick={() => openEditModal(tx)}
                        title="Edit transaction"
                        className="rounded p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {/* Pinned Last Row: Previous Month Carry Forward (if non-zero) */}
              {hasPrevCarry && (
                <tr className="bg-rose-50 dark:bg-rose-950/15 font-medium">
                  <td className="whitespace-nowrap px-5 py-3 text-xs text-rose-600 dark:text-rose-300">
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-bold">Prev</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-rose-600 dark:text-rose-300">
                    Previous Month Carry Forward
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">-</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-xs font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(section.prevCarry)}
                  </td>
                  <td className="px-5 py-3 text-center text-xs text-slate-500">
                    <span title="Pinned system carry forward">—</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
