import { useState } from 'react';
import { useApp } from '../hooks';
import { formatCurrency } from '../utils/helpers';

/**
 * View 3: P2P Dashboard
 * - Mobile: Fits screen without scrolling, person cards with on-click ledger.
 * - Desktop: Full-width grid of counterparty cards, responsive filters, and quick ledger drawers.
 */
export default function P2PDashboard() {
  const { people, peopleMetrics, addPerson, setActivePersonLedger, openAddModal } = useApp();
  const [newPersonName, setNewPersonName] = useState('');
  const [isAddingPerson, setIsAddingPerson] = useState(false);

  const handleAddPerson = (e) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    addPerson(newPersonName.trim());
    setNewPersonName('');
    setIsAddingPerson(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto h-full flex flex-col justify-between md:justify-start md:space-y-6 overflow-hidden md:overflow-visible py-1 md:py-2">
      {/* ─────────────────────────────────────────────────────────────
          HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex-none flex items-center justify-between mb-2 md:mb-4 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm md:text-xl font-black tracking-tight text-white uppercase tracking-wider">
              P2P Counterparty Hub
            </h2>
            <span className="hidden sm:inline-flex rounded-md bg-slate-900 px-2 py-0.5 text-xs text-slate-400 border border-slate-800">
              {people.length} counterparties
            </span>
          </div>
          <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">
            Select a counterparty to view settlements, loans, and transfers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openAddModal('p2p')}
            className="hidden md:flex items-center gap-1.5 rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow hover:bg-sky-400 active:scale-95 transition"
          >
            <span>+</span>
            <span>New P2P Entry</span>
          </button>

          <button
            onClick={() => setIsAddingPerson(true)}
            className="flex items-center gap-1 rounded-xl bg-sky-500/10 border border-sky-500/30 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/20 active:scale-95 transition"
          >
            <span>+</span>
            <span>Add Person</span>
          </button>
        </div>
      </div>

      {/* Quick Add Person Form (if open) */}
      {isAddingPerson && (
        <form
          onSubmit={handleAddPerson}
          className="flex-none mb-3 rounded-2xl border border-sky-500/30 bg-slate-900 p-3 sm:p-4 flex flex-wrap items-center gap-2.5 shadow-xl"
        >
          <input
            type="text"
            autoFocus
            required
            placeholder="Enter counterparty name (e.g. Rahul, Sister, Amit)"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            className="flex-1 min-w-[200px] rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-sky-500 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 hover:bg-sky-400 transition"
          >
            Add Person
          </button>
          <button
            type="button"
            onClick={() => setIsAddingPerson(false)}
            className="rounded-xl border border-slate-700 px-3 py-2 text-xs sm:text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PERSON CARDS GRID
          (Mobile: Compact, Non-scrollable; Desktop: Spacious 3-column grid)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-5 overflow-hidden md:overflow-visible">
        {people.map((personName) => {
          const metric = peopleMetrics[personName] || {
            name: personName,
            inflow: 0,
            outflow: 0,
            net: 0,
            count: 0,
          };
          const isNetPositive = metric.net >= 0;

          return (
            <div
              key={personName}
              role="button"
              tabIndex={0}
              onClick={() => setActivePersonLedger(personName)}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 md:p-5 shadow-md md:shadow-lg transition duration-200 hover:-translate-y-1 hover:border-sky-500/50 active:scale-[0.98] cursor-pointer"
            >
              {/* Person Name & Initials */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500/20 to-blue-500/20 border border-sky-500/30 text-xs sm:text-sm font-black text-sky-400">
                    {personName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {personName}
                    </h3>
                    <span className="text-[10px] md:text-xs text-slate-400">
                      {metric.count} {metric.count === 1 ? 'record' : 'records'}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] md:text-xs font-bold text-sky-400 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  Ledger →
                </span>
              </div>

              {/* Net Position Hero */}
              <div className="my-2.5 md:my-5">
                <div className="text-[10px] md:text-xs text-slate-400 font-medium">Net Position</div>
                <div
                  className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight ${
                    isNetPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isNetPositive ? '+' : ''}
                  {formatCurrency(metric.net)}
                </div>
              </div>

              {/* Breakdown Footnote */}
              <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[10px] md:text-xs">
                <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="text-slate-500 font-normal">In:</span>
                  <span>+{formatCurrency(metric.inflow)}</span>
                </div>
                <span className="text-slate-600">|</span>
                <div className="flex items-center gap-1 text-rose-400 font-semibold">
                  <span className="text-slate-500 font-normal">Out:</span>
                  <span>-{formatCurrency(metric.outflow)}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Person Card placeholder */}
        {!isAddingPerson && (
          <button
            onClick={() => setIsAddingPerson(true)}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-4 min-h-[140px] text-slate-500 hover:border-sky-500/40 hover:text-sky-400 transition"
          >
            <span className="text-2xl mb-1">+</span>
            <span className="text-xs sm:text-sm font-bold">Add Another Person</span>
          </button>
        )}
      </div>

      {/* Footer Info Pill on mobile */}
      <div className="flex-none mt-2 md:hidden text-center text-[10px] text-slate-500">
        Tap any card to view detailed settlement history & log new entries
      </div>
    </div>
  );
}
