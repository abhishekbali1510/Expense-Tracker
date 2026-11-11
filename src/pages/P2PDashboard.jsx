import { useApp } from '../hooks';
import { formatCurrency } from '../utils/helpers';

export default function P2PDashboard() {
  const { p2pMetrics, openAddModal, openEditModal } = useApp();

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4">
      {/* ─────────────────────────────────────────────────────────────
          HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            P2P & Personal Ledger Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Track loans, reimbursements, split expenses, and family transfers
          </p>
        </div>

        <button
          onClick={() => openAddModal('p2p')}
          className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-sky-500/20 transition hover:bg-sky-400 active:scale-95"
        >
          <span className="font-bold">+</span>
          <span>Add P2P Entry</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOP SUMMARY CARDS (3-Column Grid)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Card 1: Vivek Net Pool */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Counterparty Pool
            </span>
            <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-400 border border-sky-500/20">
              All-Time
            </span>
          </div>

          <h3 className="mt-2 text-base font-bold text-white">Vivek Net Pool</h3>

          <div className="mt-2 text-2xl font-black text-white sm:text-3xl">
            {formatCurrency(p2pMetrics.vivekNetPool)}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
            <span className="text-emerald-400 font-semibold">
              +{formatCurrency(p2pMetrics.vivekPoolIn)}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-rose-400 font-semibold">
              {formatCurrency(p2pMetrics.vivekPoolOut)}
            </span>
          </div>
        </div>

        {/* Card 2: This Month (Vivek) */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Monthly Settlement
            </span>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
              Current Tab
            </span>
          </div>

          <h3 className="mt-2 text-base font-bold text-white">This Month (Vivek)</h3>

          <div className="mt-2 text-2xl font-black text-emerald-400 sm:text-3xl">
            +{formatCurrency(p2pMetrics.thisMonthVivekNet)}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
            <div className="flex items-center gap-1 text-rose-400 font-semibold">
              <span className="text-slate-500 font-normal">Out:</span>
              <span>{formatCurrency(p2pMetrics.thisMonthVivekOut)}</span>
            </div>
            <span className="text-slate-500">|</span>
            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="text-slate-500 font-normal">In:</span>
              <span>+{formatCurrency(p2pMetrics.thisMonthVivekIn)}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Mummy / Home */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Family & Home
            </span>
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
              Monthly Support
            </span>
          </div>

          <h3 className="mt-2 text-base font-bold text-white">Mummy / Home</h3>

          <div className="mt-2 text-2xl font-black text-white sm:text-3xl">
            {formatCurrency(p2pMetrics.mummyTotal)}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
            <span className="text-slate-400">Monthly Transfer Total:</span>
            <span className="font-semibold text-slate-200">
              {formatCurrency(p2pMetrics.mummyTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          P2P TRANSACTIONS HISTORY TABLE
          ───────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">P2P Ledger History</h2>
            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
              {p2pMetrics.transactions.length} entries
            </span>
          </div>

          <button
            onClick={() => openAddModal('p2p')}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300"
          >
            + Add Entry
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Person / Account</th>
                <th className="px-5 py-3">Bank</th>
                <th className="px-5 py-3 text-right">Amount (₹)</th>
                <th className="px-5 py-3 text-center">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {p2pMetrics.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    No P2P transactions recorded for this month yet.
                  </td>
                </tr>
              ) : (
                p2pMetrics.transactions.map((tx) => {
                  const isReceived = tx.flow === 'in';
                  return (
                    <tr key={tx.id} className="transition hover:bg-slate-800/40">
                      <td className="whitespace-nowrap px-5 py-3 text-xs font-medium text-slate-300">
                        {tx.date}
                      </td>
                      <td className="px-5 py-3 text-xs text-white">
                        <div className="font-semibold">{tx.person || 'P2P Account'}</div>
                        <div className="text-[11px] text-slate-400">{tx.description}</div>
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
                      <td className="whitespace-nowrap px-5 py-3 text-right text-xs font-bold">
                        <span
                          className={
                            isReceived
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }
                        >
                          {isReceived ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
