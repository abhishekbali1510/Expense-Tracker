import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks';
import { formatCurrency } from '../../utils/helpers';

export default function Header() {
  const {
    activeMonth,
    setActiveMonth,
    availableMonths,
    monthlyBase,
    openAddModal,
    syncStatus,
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const isP2P = location.pathname.startsWith('/p2p');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md pt-[var(--sat)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        {/* Left: App Title, Sheet Badge, Monthly Base */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            onClick={() => navigate('/')}
            className="flex cursor-pointer items-center gap-2 font-bold tracking-tight text-white transition hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30">
              ₹
            </div>
            <span className="text-lg">Expense Manager</span>
          </div>

          {/* Active Sheet Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-950/50 px-2.5 py-0.5 text-xs font-medium text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
            Tab: {activeMonth}
          </span>

          {/* Monthly Base */}
          <div className="hidden sm:flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-xs text-slate-300 ring-1 ring-slate-800">
            <span className="text-slate-500">Base:</span>
            <span className="font-semibold text-white">{formatCurrency(monthlyBase)}</span>
          </div>

          {/* Sync Status Pill */}
          {syncStatus !== 'idle' && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all ${
                syncStatus === 'syncing'
                  ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                  : syncStatus === 'synced'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {syncStatus === 'syncing'
                ? 'Syncing to Sheet...'
                : syncStatus === 'synced'
                ? 'Synced'
                : 'Sync Offline'}
            </span>
          )}
        </div>

        {/* Right: Screen Toggle, Month Selector, Add Button */}
        <div className="flex items-center gap-2">
          {/* Top-level View Toggle (Home / P2P Dashboard) */}
          <div className="flex rounded-lg bg-slate-900 p-1 ring-1 ring-slate-800">
            <button
              onClick={() => navigate('/')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                !isP2P
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/p2p')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                isP2P
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              P2P Dashboard
            </button>
          </div>

          {/* Month Selector */}
          <select
            value={activeMonth}
            onChange={(e) => setActiveMonth(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 outline-none focus:border-sky-500"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* + Add Expense Button */}
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-sm transition hover:bg-sky-400 active:scale-95"
          >
            <span className="text-sm font-bold">+</span>
            <span>Add Expense</span>
          </button>
        </div>
      </div>
    </header>
  );
}
