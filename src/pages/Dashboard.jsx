import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks';
import { formatCurrency } from '../utils/helpers';

export default function Dashboard() {
  const { banks, sectionMetrics } = useApp();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — Bank & Account Balance (Strictly HDFC & SBI Only)
          ───────────────────────────────────────────────────────────── */}
      <section aria-labelledby="bank-balances-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="bank-balances-heading" className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Bank & Account Balances
          </h2>
          <span className="text-xs text-slate-500">Live Accounts</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* HDFC Bank Card */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 p-5 shadow-lg shadow-black/40">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  <h3 className="font-bold text-white text-base">{banks.HDFC.name}</h3>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{banks.HDFC.subtitle}</p>
              </div>
              <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
                Primary
              </span>
            </div>

            <div className="mt-4">
              <div className="text-xs font-medium text-slate-400">Available Balance</div>
              <div className="mt-0.5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {formatCurrency(banks.HDFC.balance)}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
              <span className="text-slate-400">Prev Carry Forward:</span>
              <span className="font-semibold text-rose-400">
                {formatCurrency(banks.HDFC.prevCarry)}
              </span>
            </div>
          </div>

          {/* SBI Bank Card */}
          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 p-5 shadow-lg shadow-black/40">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <h3 className="font-bold text-white text-base">{banks.SBI.name}</h3>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{banks.SBI.subtitle}</p>
              </div>
              <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                Daily UPI
              </span>
            </div>

            <div className="mt-4">
              <div className="text-xs font-medium text-slate-400">Available Balance</div>
              <div className="mt-0.5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {formatCurrency(banks.SBI.balance)}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
              <span className="text-slate-400">Status:</span>
              <span className="font-semibold text-emerald-400">Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — Budget Sections & Remaining Balance (2x2 Grid)
          ───────────────────────────────────────────────────────────── */}
      <section aria-labelledby="budget-sections-heading">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 id="budget-sections-heading" className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Budget Sections (50 / 30 / 10 / 10)
            </h2>
            <p className="text-xs text-slate-500">Tap any section card to inspect transactions</p>
          </div>
          <span className="text-xs text-sky-400">Interactive Details →</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.entries(sectionMetrics).map(([key, section]) => {
            const isNegativeRemaining = section.remaining < 0;
            const isNegativeCarry = section.prevCarry < 0;

            return (
              <div
                key={key}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/section/${key}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/section/${key}`);
                  }
                }}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-slate-900/90 p-5 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-sky-500 ${section.borderClass}`}
              >
                {/* Header row: Label + Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white transition group-hover:text-sky-300">
                      {section.label}
                    </h3>
                    <span className="text-xs text-slate-400">({section.percent}%)</span>
                  </div>

                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${section.badgeClass}`}
                  >
                    {section.percent}% Target
                  </span>
                </div>

                {/* Hero Metric: Remaining Balance */}
                <div className="mt-4">
                  <div className="text-xs font-medium text-slate-400">Remaining Balance</div>
                  <div
                    className={`mt-0.5 text-3xl font-black tracking-tight ${
                      isNegativeRemaining ? 'text-rose-400' : 'text-white'
                    }`}
                  >
                    {formatCurrency(section.remaining)}
                  </div>
                </div>

                {/* 3-Column Mini Breakdown Box */}
                <div className="mt-5 grid grid-cols-3 divide-x divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
                  {/* Column 1: Budget */}
                  <div className="px-1">
                    <div className="text-[11px] font-medium text-slate-400">Budget</div>
                    <div className="mt-1 text-xs font-bold text-slate-200 sm:text-sm">
                      {formatCurrency(section.allocated)}
                    </div>
                  </div>

                  {/* Column 2: Prev / Carry (highlighted red if negative) */}
                  <div className="px-1">
                    <div className="text-[11px] font-medium text-slate-400">Prev / Carry</div>
                    <div
                      className={`mt-1 text-xs font-bold sm:text-sm ${
                        isNegativeCarry ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      {formatCurrency(section.prevCarry)}
                    </div>
                  </div>

                  {/* Column 3: Spent / Used */}
                  <div className="px-1">
                    <div className="text-[11px] font-medium text-slate-400">Spent / Used</div>
                    <div className="mt-1 text-xs font-bold text-amber-300 sm:text-sm">
                      {formatCurrency(section.spent)}
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
