import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks';
import { formatCurrency } from '../utils/helpers';

/**
 * View 1: Home Dashboard Screen
 * - Mobile (< md): Compact, single-screen fit, zero scrolling, thumb-friendly.
 * - Desktop (>= md): Full-width professional financial overview with 4-column portfolio grid.
 */
export default function Dashboard() {
  const { banks, sectionMetrics } = useApp();
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-7xl mx-auto h-full flex flex-col justify-between md:justify-start md:space-y-8 overflow-hidden md:overflow-visible py-1 md:py-2">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — Bank & Account Balance (Strictly HDFC & SBI Only)
          ───────────────────────────────────────────────────────────── */}
      <section className="flex-none">
        <div className="flex items-center justify-between mb-1.5 md:mb-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
              Bank Accounts & Liquid Balances
            </h2>
          </div>
          <span className="text-[10px] md:text-xs text-slate-500 font-medium">HDFC & SBI Accounts</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 md:gap-6">
          {/* HDFC Bank Card */}
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 p-3 md:p-6 shadow-md md:shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400 hidden md:inline-block" />
                  <span className="text-xs md:text-base font-bold text-white tracking-tight">
                    {banks.HDFC.name}
                  </span>
                </div>
                <span className="rounded bg-blue-500/10 px-1.5 md:px-2.5 py-0.2 md:py-0.5 text-[10px] md:text-xs font-semibold text-blue-400 border border-blue-500/20">
                  Primary
                </span>
              </div>
              <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 leading-tight">
                {banks.HDFC.subtitle}
              </p>
            </div>

            <div className="my-2 md:my-5">
              <div className="text-[10px] md:text-xs text-slate-400 font-medium">Available Balance</div>
              <div className="text-lg sm:text-xl md:text-3xl font-black text-white tracking-tight">
                {formatCurrency(banks.HDFC.balance)}
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-1.5 md:pt-3 flex items-center justify-between text-[10px] md:text-xs">
              <span className="text-slate-400">Prev Carry Forward:</span>
              <span className="font-bold text-rose-400">
                {formatCurrency(banks.HDFC.prevCarry)}
              </span>
            </div>
          </div>

          {/* SBI Bank Card */}
          <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 p-3 md:p-6 shadow-md md:shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 hidden md:inline-block" />
                  <span className="text-xs md:text-base font-bold text-white tracking-tight">
                    {banks.SBI.name}
                  </span>
                </div>
                <span className="rounded bg-cyan-500/10 px-1.5 md:px-2.5 py-0.2 md:py-0.5 text-[10px] md:text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                  Daily UPI
                </span>
              </div>
              <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 leading-tight">
                {banks.SBI.subtitle}
              </p>
            </div>

            <div className="my-2 md:my-5">
              <div className="text-[10px] md:text-xs text-slate-400 font-medium">Available Balance</div>
              <div className="text-lg sm:text-xl md:text-3xl font-black text-white tracking-tight">
                {formatCurrency(banks.SBI.balance)}
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-1.5 md:pt-3 flex items-center justify-between text-[10px] md:text-xs">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-emerald-400">Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — Budget Sections & Remaining Balance
          (Mobile: 2x2 Grid fitting screen; Desktop: 4-Column Grid)
          ───────────────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col justify-between min-h-0 pt-2 md:pt-0">
        <div className="flex items-center justify-between mb-1.5 md:mb-3 px-1 flex-none">
          <div>
            <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
              50 / 30 / 10 / 10 Budget Framework
            </h2>
          </div>
          <span className="text-[10px] md:text-xs text-sky-400 font-medium">
            Tap card to inspect ledger →
          </span>
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
                className={`relative flex flex-col justify-between rounded-2xl border bg-slate-900/90 p-3 md:p-5 shadow-md md:shadow-lg transition duration-200 hover:-translate-y-1 hover:border-sky-500/60 active:scale-[0.98] cursor-pointer ${sec.borderClass}`}
              >
                {/* Header: Label & Percent Badge */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm md:text-lg">{sec.icon}</span>
                      <span className="text-xs md:text-base font-bold text-white">{sec.label}</span>
                    </div>
                    <span
                      className={`rounded-full px-1.5 md:px-2.5 py-0.5 text-[10px] md:text-xs font-bold border ${sec.badgeClass}`}
                    >
                      {sec.percent}%
                    </span>
                  </div>

                  {/* Desktop Progress Bar */}
                  <div className="hidden md:block mt-3">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Used: {percentUsed}%</span>
                      <span>Target: {sec.percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentUsed > 90
                            ? 'bg-rose-500'
                            : percentUsed > 70
                            ? 'bg-amber-400'
                            : 'bg-sky-400'
                        }`}
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Metric: Remaining */}
                <div className="my-1.5 md:my-4">
                  <div className="text-[10px] md:text-xs text-slate-400 font-medium">
                    Remaining Balance
                  </div>
                  <div
                    className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight ${
                      isNegativeRemaining ? 'text-rose-400' : 'text-white'
                    }`}
                  >
                    {formatCurrency(sec.remaining)}
                  </div>
                </div>

                {/* 3-Column Mini Breakdown */}
                <div className="grid grid-cols-3 divide-x divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/80 p-1.5 md:p-2.5 text-center">
                  <div className="px-0.5 md:px-1">
                    <div className="text-[9px] md:text-[11px] text-slate-400 font-medium">Budget</div>
                    <div className="text-[10px] md:text-xs font-bold text-slate-200">
                      {formatCurrency(sec.allocated)}
                    </div>
                  </div>
                  <div className="px-0.5 md:px-1">
                    <div className="text-[9px] md:text-[11px] text-slate-400 font-medium">Carry</div>
                    <div
                      className={`text-[10px] md:text-xs font-bold ${
                        isNegativeCarry ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      {formatCurrency(sec.prevCarry)}
                    </div>
                  </div>
                  <div className="px-0.5 md:px-1">
                    <div className="text-[9px] md:text-[11px] text-slate-400 font-medium">Spent</div>
                    <div className="text-[10px] md:text-xs font-bold text-amber-300">
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
