import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks';
import { formatCurrency } from '../utils/helpers';

export default function SectionDetail() {
  const { sectionKey } = useParams();
  const navigate = useNavigate();
  const { sectionMetrics, openAddModal, openEditModal } = useApp();

  const currentKey = (sectionKey || 'essentials').toLowerCase();
  const section = sectionMetrics[currentKey] || sectionMetrics.essentials;

  const sectionPills = [
    { key: 'essentials', label: 'Essentials' },
    { key: 'savings', label: 'Savings' },
    { key: 'wants', label: 'Wants' },
    { key: 'invest', label: 'Invest' },
  ];

  const hasPrevCarry = section.prevCarry !== 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-3.5 md:space-y-6 py-1 md:py-3 pb-8">
      {/* ─────────────────────────────────────────────────────────────
          TOP NAVIGATION ROW: Back to Home + Quick Section Switcher Pills
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
        >
          <span>←</span>
          <span>Back to Home</span>
        </button>

        {/* Section Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-900 p-1 border border-slate-800">
          {sectionPills.map((pill) => {
            const isActive = pill.key === currentKey;
            return (
              <button
                key={pill.key}
                onClick={() => navigate(`/section/${pill.key}`)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
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
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">{section.label}</h1>
              <span className={`rounded-full border px-2 py-0.2 text-[10px] font-semibold ${section.badgeClass}`}>
                {section.percent}% Framework
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">
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
        <div className="mt-4 grid grid-cols-4 gap-2">
          {/* Allocated */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-center">
            <div className="text-[10px] font-medium text-slate-400">Allocated</div>
            <div className="mt-0.5 text-xs font-bold text-white">
              {formatCurrency(section.allocated)}
            </div>
          </div>

          {/* Carry Forward */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-center">
            <div className="text-[10px] font-medium text-slate-400">Carry</div>
            <div
              className={`mt-0.5 text-xs font-bold ${
                section.prevCarry < 0 ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {formatCurrency(section.prevCarry)}
            </div>
          </div>

          {/* Spent */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-center">
            <div className="text-[10px] font-medium text-slate-400">Spent</div>
            <div className="mt-0.5 text-xs font-bold text-amber-300">
              {formatCurrency(section.spent)}
            </div>
          </div>

          {/* Remaining */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-center">
            <div className="text-[10px] font-medium text-slate-400">Remaining</div>
            <div
              className={`mt-0.5 text-xs font-black ${
                section.remaining < 0 ? 'text-rose-400' : 'text-sky-300'
              }`}
            >
              {formatCurrency(section.remaining)}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION TRANSACTIONS TABLE
          ───────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Transactions</h2>
            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
              {section.transactions.length + (hasPrevCarry ? 1 : 0)} items
            </span>
          </div>

          <button
            onClick={() => openAddModal(currentKey)}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300"
          >
            + Add New
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Description / Item</th>
                <th className="px-5 py-3">Bank Account</th>
                <th className="px-5 py-3 text-right">Amount (₹)</th>
                <th className="px-5 py-3 text-center">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {/* Pinned First Row: Previous Month Carry Forward (if non-zero) */}
              {hasPrevCarry && (
                <tr className="bg-rose-950/15 font-medium">
                  <td className="whitespace-nowrap px-5 py-3 text-xs text-rose-300">
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-bold">Prev</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-rose-300">
                    Previous Month Carry Forward
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">-</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-xs font-bold text-rose-400">
                    {formatCurrency(section.prevCarry)}
                  </td>
                  <td className="px-5 py-3 text-center text-xs text-slate-500">
                    <span title="Pinned system carry forward">—</span>
                  </td>
                </tr>
              )}

              {/* Transactions List */}
              {section.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    No transactions logged in {section.label} for this month yet.
                  </td>
                </tr>
              ) : (
                section.transactions.map((tx) => (
                  <tr key={tx.id} className="transition hover:bg-slate-800/40">
                    <td className="whitespace-nowrap px-5 py-3 text-xs font-medium text-slate-300">
                      {tx.date}
                    </td>
                    <td className="px-5 py-3 text-xs text-white">
                      {tx.description}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-xs">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${
                          tx.bankAccount === 'HDFC'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}
                      >
                        {tx.bankAccount}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right text-xs font-bold text-slate-100">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-center">
                      <button
                        onClick={() => openEditModal(tx)}
                        title="Edit transaction"
                        className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-sky-400 transition"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
