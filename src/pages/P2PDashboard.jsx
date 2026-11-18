import { useState } from 'react';
import { useApp } from '../hooks';
import { formatCurrency, formatDisplayDate } from '../utils/helpers';

/**
 * View 3: P2P Dashboard
 * - Mobile: Responsive, scrollable counterparty cards with on-click ledger.
 * - Desktop: Full-width grid of counterparty cards, responsive filters, and quick ledger drawers.
 */
export default function P2PDashboard() {
  const {
    people,
    peopleMetrics,
    p2pScope,
    setP2pScope,
    activeMonth,
    addPerson,
    deletePerson,
    setActivePersonLedger,
    openAddModal,
    saveExpense,
  } = useApp();
  const [newPersonName, setNewPersonName] = useState('');
  const [isAddingPerson, setIsAddingPerson] = useState(false);

  // One-time opening / previous balance state for newly added counterparty
  const [hasPrevBalance, setHasPrevBalance] = useState(false);
  const [prevAmount, setPrevAmount] = useState('');
  const [prevFlow, setPrevFlow] = useState('out'); // 'out' = They Owe Me, 'in' = I Owe Them
  const [prevBank, setPrevBank] = useState('None'); // 'None' (historical, doesn't touch bank) | 'SBI' | 'HDFC'

  const handleAddPerson = (e) => {
    e.preventDefault();
    const name = newPersonName.trim();
    if (!name) return;

    addPerson(name);

    if (hasPrevBalance && Number(prevAmount) > 0) {
      saveExpense({
        section: 'p2p',
        person: name,
        description: 'Previous / Opening Balance',
        amount: Math.abs(Number(prevAmount)),
        flow: prevFlow,
        bankAccount: prevBank,
        budgetImpact: 'none', // Opening balances are historical; never impact current month's savings budget
        date: formatDisplayDate(new Date()),
      });
    }

    setNewPersonName('');
    setHasPrevBalance(false);
    setPrevAmount('');
    setPrevFlow('out');
    setPrevBank('None');
    setIsAddingPerson(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto h-full min-h-0 flex flex-col gap-2 md:gap-3 overflow-hidden py-1 md:py-2">
      {/* ─────────────────────────────────────────────────────────────
          HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex-none flex items-center justify-between mb-1 md:mb-2 px-1 gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm md:text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">
              P2P Counterparty Hub
            </h2>
            <span className="hidden sm:inline-flex rounded-md bg-slate-100 dark:bg-slate-900 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              {people.length} counterparties
            </span>
          </div>
          <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select a counterparty to view settlements, loans, and transfers
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Scope Toggle: Overall (All-Time) vs This Month */}
          <div className="flex items-center rounded-xl bg-slate-200/70 dark:bg-slate-900/90 p-0.5 border border-slate-300/80 dark:border-slate-800 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setP2pScope('overall')}
              title="Show all-time cumulative P2P balance across all months"
              className={`px-2.5 py-1 rounded-lg transition-all ${
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
              title={`Show only ${activeMonth || 'active month'} P2P transactions`}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                p2pScope === 'month'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {activeMonth || 'This Month'}
            </button>
          </div>

          <button
            onClick={() => openAddModal('p2p')}
            className="hidden md:flex items-center gap-1.5 rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-bold text-white dark:text-slate-950 shadow hover:bg-sky-400 active:scale-95 transition"
          >
            <span>+</span>
            <span>New P2P Entry</span>
          </button>

          <button
            onClick={() => setIsAddingPerson(true)}
            className="flex items-center gap-1 rounded-xl bg-sky-500/10 border border-sky-500/30 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 active:scale-95 transition"
          >
            <span>+</span>
            <span>Add Person</span>
          </button>
        </div>
      </div>

      {/* Quick Add Person Form (with optional Previous/Opening Balance) */}
      {isAddingPerson && (
        <form
          onSubmit={handleAddPerson}
          className="flex-none mb-3 rounded-2xl border border-sky-500/40 bg-white dark:bg-slate-900 p-3.5 sm:p-5 flex flex-col gap-3 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Add New Counterparty
            </span>
            <button
              type="button"
              onClick={() => {
                setIsAddingPerson(false);
                setHasPrevBalance(false);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              autoFocus
              required
              placeholder="Person name (e.g. Rahul, Sister, Amit)"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              className="flex-1 min-w-[200px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-sky-500"
            />

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 select-none bg-slate-100 dark:bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                checked={hasPrevBalance}
                onChange={(e) => setHasPrevBalance(e.target.checked)}
                className="rounded accent-sky-500 h-4 w-4"
              />
              <span>Has previous / opening balance?</span>
            </label>
          </div>

          {/* Conditional Previous Balance Section */}
          {hasPrevBalance && (
            <div className="p-3 rounded-xl border border-sky-500/25 bg-sky-50/50 dark:bg-sky-950/25 flex flex-wrap items-center gap-3 text-xs">
              {/* Amount */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600 dark:text-slate-300">Amount: ₹</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required={hasPrevBalance}
                  placeholder="0"
                  value={prevAmount}
                  onChange={(e) => setPrevAmount(e.target.value)}
                  className="w-28 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                />
              </div>

              {/* Position Selector */}
              <div className="flex items-center rounded-lg bg-slate-200 dark:bg-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setPrevFlow('out')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition ${
                    prevFlow === 'out'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  They Owe Me (I gave)
                </button>
                <button
                  type="button"
                  onClick={() => setPrevFlow('in')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition ${
                    prevFlow === 'in'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  I Owe Them (I received)
                </button>
              </div>

              {/* Bank Account Impact */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Bank Impact:</span>
                <select
                  value={prevBank}
                  onChange={(e) => setPrevBank(e.target.value)}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                >
                  <option value="None">None (Historical - don't touch bank)</option>
                  <option value="SBI">SBI Bank</option>
                  <option value="HDFC">HDFC Bank</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsAddingPerson(false);
                setHasPrevBalance(false);
              }}
              className="rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-sky-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-sky-400 transition shadow"
            >
              Save Counterparty
            </button>
          </div>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PERSON CARDS SCROLLABLE VIEWPORT
          (Enables smooth vertical scroll for any number of counterparties)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-10 overscroll-contain">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-5">
          {people.map((personName) => {
            const metric = peopleMetrics[personName] || {
              name: personName,
              inflow: 0,
              outflow: 0,
              net: 0,
              count: 0,
            };

            return (
              <div
                key={personName}
                role="button"
                tabIndex={0}
                onClick={() => setActivePersonLedger(personName)}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3.5 md:p-5 shadow-sm md:shadow-lg transition duration-200 hover:-translate-y-1 hover:border-sky-500/50 active:scale-[0.98] cursor-pointer"
              >
                {/* Person Name & Initials */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500/20 to-blue-500/20 border border-sky-500/30 text-xs sm:text-sm font-black text-sky-600 dark:text-sky-400">
                      {personName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {personName}
                      </h3>
                      <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">
                        {metric.count} {metric.count === 1 ? 'record' : 'records'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Remove ${personName} from counterparties?`)) {
                          deletePerson(personName);
                        }
                      }}
                      title={`Remove ${personName}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <span className="text-[10px] md:text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                      Ledger →
                    </span>
                  </div>
                </div>

                {/* Net Position Hero */}
                <div className="my-2.5 md:my-5">
                  <div className="text-[10px] md:text-xs font-semibold flex items-center justify-between">
                    <span
                      className={
                        metric.net > 0
                          ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                          : metric.net < 0
                          ? 'text-rose-600 dark:text-rose-400 font-bold'
                          : 'text-slate-500 font-medium'
                      }
                    >
                      {metric.net > 0 ? 'They Owe You' : metric.net < 0 ? 'You Owe Them' : 'Settled'}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                      {p2pScope === 'overall' ? 'All-Time' : activeMonth}
                    </span>
                  </div>
                  <div
                    className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight ${
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

                {/* Breakdown Footnote */}
                <div className="border-t border-slate-200 dark:border-slate-800/80 pt-2 flex items-center justify-between text-[10px] md:text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-normal">Given:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(metric.outflow)}</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-normal">Received:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(metric.inflow)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Person Card placeholder */}
          {!isAddingPerson && (
            <button
              onClick={() => setIsAddingPerson(true)}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 p-4 min-h-[140px] text-slate-500 hover:border-sky-500/40 hover:text-sky-600 dark:hover:text-sky-400 transition"
            >
              <span className="text-2xl mb-1">+</span>
              <span className="text-xs sm:text-sm font-bold">Add Another Person</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Info Pill on mobile */}
      <div className="flex-none mt-1 md:hidden text-center text-[10px] text-slate-500">
        Tap any card to view detailed settlement history & log new entries
      </div>
    </div>
  );
}
