import { NavLink } from 'react-router-dom';
import { useApp } from '../../hooks';
import { formatCurrency } from '../../utils/helpers';

export default function Header() {
  const {
    activeMonth,
    setActiveMonth,
    availableMonths,
    currentMonthData,
    syncStatus,
    openAddModal,
    setIsMonthConfigModalOpen,
  } = useApp();

  return (
    <header className="flex-none border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 sm:py-4 pt-[max(0.75rem,env(safe-area-inset-top))] transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-sm sm:text-base font-black text-white dark:text-slate-950 shadow-md shadow-sky-500/20">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Expense Manager
              </h1>
              {/* Monthly Base Badge on Desktop */}
              <span className="hidden sm:inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-900 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                Base: {formatCurrency(currentMonthData.monthlyBase)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  syncStatus === 'syncing'
                    ? 'bg-amber-400 animate-ping'
                    : syncStatus === 'synced'
                    ? 'bg-emerald-500 dark:bg-emerald-400'
                    : syncStatus === 'error'
                    ? 'bg-rose-500'
                    : 'bg-slate-400 dark:bg-slate-500'
                }`}
              />
              <span
                className={
                  syncStatus === 'synced'
                    ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                    : syncStatus === 'error'
                    ? 'text-rose-600 dark:text-rose-400 font-medium'
                    : ''
                }
              >
                {syncStatus === 'syncing'
                  ? 'Syncing...'
                  : syncStatus === 'synced'
                  ? 'Synced to Sheet'
                  : syncStatus === 'error'
                  ? 'Sync Error'
                  : 'Sheet Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Links (Hidden on Mobile, shown on md+) */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 p-1 border border-slate-200 dark:border-slate-800">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                isActive
                  ? 'bg-sky-500 text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <span>📊</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/p2p"
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                isActive
                  ? 'bg-sky-500 text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <span>🤝</span>
            <span>P2P Hub</span>
          </NavLink>
        </nav>

        {/* Right: Month Selector + Desktop Add Button + Settings Button */}
        <div className="flex items-center gap-2.5">
          {/* Clean Month Selector or Add Month CTA */}
          {availableMonths.length > 0 ? (
            <div className="relative">
              <select
                value={activeMonth}
                onChange={(e) => setActiveMonth(e.target.value)}
                className="cursor-pointer appearance-none rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900/90 py-1.5 sm:py-2 pl-3 sm:pl-3.5 pr-7 sm:pr-8 text-xs font-bold text-sky-600 dark:text-sky-400 shadow-sm outline-none transition hover:border-sky-500/50 focus:ring-1 focus:ring-sky-500"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {m}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                ▼
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsMonthConfigModalOpen(true)}
              className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 transition"
            >
              + Add Month
            </button>
          )}

          {/* Desktop "+ Add Expense" Button (Visible only on md+ when a month exists) */}
          {availableMonths.length > 0 && (
            <button
              onClick={() => openAddModal()}
              className="hidden md:flex items-center gap-1.5 rounded-xl bg-sky-500 px-3.5 py-2 text-xs font-bold text-white dark:text-slate-950 shadow-md shadow-sky-500/20 hover:bg-sky-400 active:scale-95 transition"
            >
              <span className="text-sm font-black">+</span>
              <span>Add Expense</span>
            </button>
          )}

          {/* Settings / Month Config Button */}
          <button
            onClick={() => setIsMonthConfigModalOpen(true)}
            title="Budget & Month Settings"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 transition hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white active:scale-95"
          >
            <span className="text-sm sm:text-base">⚙️</span>
          </button>
        </div>
      </div>
    </header>
  );
}
