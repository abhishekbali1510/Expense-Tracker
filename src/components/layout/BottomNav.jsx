import { NavLink } from 'react-router-dom';
import { useApp } from '../../hooks';

export default function BottomNav() {
  const { openAddModal } = useApp();

  return (
    <nav className="md:hidden flex-none border-t border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg pb-[var(--sab)] z-30 transition-colors duration-200">
      <div className="mx-auto flex max-w-lg items-center justify-around px-6 py-2">
        {/* Home Tab */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition ${
              isActive
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`
          }
        >
          <span className="text-xl">📊</span>
          <span className="text-[11px] tracking-wide">Home</span>
        </NavLink>

        {/* Center Thumb + Action Button */}
        <button
          onClick={() => openAddModal()}
          aria-label="Add Expense"
          className="-mt-5 flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 text-white dark:text-slate-950 shadow-lg shadow-sky-500/30 ring-4 ring-slate-50 dark:ring-slate-950 transition hover:scale-105 active:scale-95"
        >
          <span className="text-2xl font-black leading-none">+</span>
        </button>

        {/* P2P Tab */}
        <NavLink
          to="/p2p"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition ${
              isActive
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`
          }
        >
          <span className="text-xl">🤝</span>
          <span className="text-[11px] tracking-wide">P2P Hub</span>
        </NavLink>
      </div>
    </nav>
  );
}
