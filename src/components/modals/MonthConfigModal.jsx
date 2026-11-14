import { useState, useEffect } from 'react';
import { useApp } from '../../hooks';
import { formatCurrency } from '../../utils/helpers';

export default function MonthConfigModal() {
  const {
    isMonthConfigModalOpen,
    setIsMonthConfigModalOpen,
    activeMonth,
    availableMonths,
    currentMonthData,
    updateCurrentMonthConfig,
    addMonth,
    theme,
    setTheme,
  } = useApp();

  const hasMonths = availableMonths.length > 0 && Boolean(activeMonth);
  const [activeTab, setActiveTab] = useState(hasMonths ? 'edit' : 'add');

  // Edit Tab State
  const [editBase, setEditBase] = useState(0);
  const [percentages, setPercentages] = useState({
    essentials: 50,
    savings: 30,
    wants: 10,
    invest: 10,
  });
  const [prevCarries, setPrevCarries] = useState({
    essentials: 0,
    savings: 0,
    wants: 0,
    invest: 0,
  });
  const [editBanks, setEditBanks] = useState({
    hdfcBalance: 0,
    hdfcCarry: 0,
    sbiBalance: 0,
    sbiCarry: 0,
  });

  // Add Month State
  const [newMonthName, setNewMonthName] = useState('Nov-2026');
  const [newMonthBase, setNewMonthBase] = useState('');
  const [newPercentages, setNewPercentages] = useState({
    essentials: 50,
    savings: 30,
    wants: 10,
    invest: 10,
  });
  const [newPrevCarries, setNewPrevCarries] = useState({
    essentials: 0,
    savings: 0,
    wants: 0,
    invest: 0,
  });
  const [newBanks, setNewBanks] = useState({
    hdfcBalance: '',
    hdfcCarry: '0',
    sbiBalance: '',
    sbiCarry: '0',
  });

  useEffect(() => {
    if (isMonthConfigModalOpen) {
      if (!hasMonths) {
        setActiveTab('add');
      } else if (currentMonthData) {
        setActiveTab('edit');
        setEditBase(currentMonthData.monthlyBase || 0);
        setPercentages(
          currentMonthData.percentages || { essentials: 50, savings: 30, wants: 10, invest: 10 }
        );
        setPrevCarries(
          currentMonthData.prevCarries || { essentials: 0, savings: 0, wants: 0, invest: 0 }
        );
        setEditBanks({
          hdfcBalance: currentMonthData.banks?.HDFC?.balance ?? 0,
          hdfcCarry: currentMonthData.banks?.HDFC?.prevCarry ?? 0,
          sbiBalance: currentMonthData.banks?.SBI?.balance ?? 0,
          sbiCarry: currentMonthData.banks?.SBI?.prevCarry ?? 0,
        });
      }
    }
  }, [isMonthConfigModalOpen, hasMonths, currentMonthData]);

  if (!isMonthConfigModalOpen) return null;

  const totalPercent = Object.values(percentages).reduce((a, b) => a + Number(b || 0), 0);
  const totalNewPercent = Object.values(newPercentages).reduce((a, b) => a + Number(b || 0), 0);

  const handleSaveCurrentMonth = (e) => {
    e.preventDefault();
    updateCurrentMonthConfig({
      monthlyBase: Number(editBase) || 0,
      percentages,
      prevCarries,
      banks: {
        HDFC: {
          name: 'HDFC Bank',
          subtitle: 'Primary & Invest',
          balance: Number(editBanks.hdfcBalance) || 0,
          prevCarry: Number(editBanks.hdfcCarry) || 0,
        },
        SBI: {
          name: 'SBI Bank',
          subtitle: 'Daily UPI & Stocks',
          balance: Number(editBanks.sbiBalance) || 0,
          prevCarry: Number(editBanks.sbiCarry) || 0,
        },
      },
    });
    setIsMonthConfigModalOpen(false);
  };

  const handleAddNewMonth = (e) => {
    e.preventDefault();
    if (!newMonthName.trim()) return;

    addMonth({
      monthName: newMonthName.trim(),
      monthlyBase: Number(newMonthBase) || 0,
      percentages: newPercentages,
      prevCarries: newPrevCarries,
      banks: {
        HDFC: {
          name: 'HDFC Bank',
          subtitle: 'Primary & Invest',
          balance: Number(newBanks.hdfcBalance) || 0,
          prevCarry: Number(newBanks.hdfcCarry) || 0,
        },
        SBI: {
          name: 'SBI Bank',
          subtitle: 'Daily UPI & Stocks',
          balance: Number(newBanks.sbiBalance) || 0,
          prevCarry: Number(newBanks.sbiCarry) || 0,
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={() => setIsMonthConfigModalOpen(false)}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md max-h-[90vh] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex-none p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Settings & Month Config</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Appearance & Google Sheet Config tab
            </p>
          </div>
          <button
            onClick={() => setIsMonthConfigModalOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Appearance / Theme Switch */}
        <div className="flex-none px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Appearance</span>
          <div className="flex rounded-xl bg-slate-200 dark:bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ☀️ Light
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                theme === 'dark'
                  ? 'bg-slate-950 text-sky-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🌙 Dark
            </button>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex-none p-2 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex gap-2">
          {hasMonths && (
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition ${
                activeTab === 'edit'
                  ? 'bg-sky-500 text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Edit {activeMonth}
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition ${
              activeTab === 'add'
                ? 'bg-sky-500 text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            + Add New Month
          </button>
        </div>

        {/* Body (Scrollable form) */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'edit' && hasMonths ? (
            <form onSubmit={handleSaveCurrentMonth} className="space-y-4">
              {/* Monthly Base */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Total Monthly Base / Income (₹)
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-sky-600 dark:text-sky-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    value={editBase}
                    onChange={(e) => setEditBase(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 pl-8 pr-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Bank Balances */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Bank Balances & Carry (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-2">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">HDFC Balance</span>
                    <input
                      type="number"
                      value={editBanks.hdfcBalance}
                      onChange={(e) =>
                        setEditBanks((p) => ({ ...p, hdfcBalance: Number(e.target.value) }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-2">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">HDFC Carry</span>
                    <input
                      type="number"
                      value={editBanks.hdfcCarry}
                      onChange={(e) =>
                        setEditBanks((p) => ({ ...p, hdfcCarry: Number(e.target.value) }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-2">
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">SBI Balance</span>
                    <input
                      type="number"
                      value={editBanks.sbiBalance}
                      onChange={(e) =>
                        setEditBanks((p) => ({ ...p, sbiBalance: Number(e.target.value) }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-2">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">SBI Carry</span>
                    <input
                      type="number"
                      value={editBanks.sbiCarry}
                      onChange={(e) =>
                        setEditBanks((p) => ({ ...p, sbiCarry: Number(e.target.value) }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Category Percentages */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Category Division (%)
                  </label>
                  <span
                    className={`text-xs font-bold ${
                      totalPercent === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    Total: {totalPercent}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {['essentials', 'wants', 'invest', 'savings'].map((sec) => {
                    const pct = percentages[sec] || 0;
                    const calculatedAlloc = Math.round((editBase * pct) / 100);
                    return (
                      <div
                        key={sec}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold capitalize text-slate-900 dark:text-white">{sec}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {formatCurrency(calculatedAlloc)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={pct}
                            onChange={(e) =>
                              setPercentages((prev) => ({
                                ...prev,
                                [sec]: Number(e.target.value),
                              }))
                            }
                            className="w-16 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white text-center outline-none focus:border-sky-500"
                          />
                          <span className="text-xs text-slate-500 dark:text-slate-400">%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Carry Forwards */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Previous Month Carry Forward (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['essentials', 'savings', 'wants', 'invest'].map((sec) => (
                    <div key={sec} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-2">
                      <span className="text-[10px] font-bold capitalize text-slate-700 dark:text-slate-300">{sec}</span>
                      <input
                        type="number"
                        value={prevCarries[sec] ?? 0}
                        onChange={(e) =>
                          setPrevCarries((prev) => ({
                            ...prev,
                            [sec]: Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 hover:bg-sky-400 active:scale-95 transition"
              >
                Save & Sync {activeMonth}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAddNewMonth} className="space-y-4">
              {/* New Month Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Month Tab Name (e.g. Nov-2026, Dec-2026)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nov-2026"
                  value={newMonthName}
                  onChange={(e) => setNewMonthName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                />
              </div>

              {/* Base Income */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Monthly Base Income (₹)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 142900"
                  value={newMonthBase}
                  onChange={(e) => setNewMonthBase(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                />
              </div>

              {/* Starting Bank Balances */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Starting Bank Balances & Carry (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-2">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">HDFC Balance</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={newBanks.hdfcBalance}
                      onChange={(e) => setNewBanks((p) => ({ ...p, hdfcBalance: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-2">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">HDFC Carry</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={newBanks.hdfcCarry}
                      onChange={(e) => setNewBanks((p) => ({ ...p, hdfcCarry: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-2">
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">SBI Balance</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={newBanks.sbiBalance}
                      onChange={(e) => setNewBanks((p) => ({ ...p, sbiBalance: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-2">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">SBI Carry</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={newBanks.sbiCarry}
                      onChange={(e) => setNewBanks((p) => ({ ...p, sbiCarry: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Percentages */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Category Division (%)
                  </label>
                  <span
                    className={`text-xs font-bold ${
                      totalNewPercent === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    Total: {totalNewPercent}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {['essentials', 'savings', 'wants', 'invest'].map((sec) => (
                    <div key={sec} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-2">
                      <span className="text-[10px] font-bold capitalize text-slate-700 dark:text-slate-300">{sec}</span>
                      <div className="mt-1 flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newPercentages[sec]}
                          onChange={(e) =>
                            setNewPercentages((prev) => ({
                              ...prev,
                              [sec]: Number(e.target.value),
                            }))
                          }
                          className="w-14 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white text-center outline-none focus:border-sky-500"
                        />
                        <span className="text-xs text-slate-500 dark:text-slate-400">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carry Forwards */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Previous Carry Forward (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['essentials', 'savings', 'wants', 'invest'].map((sec) => (
                    <div key={sec} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-2">
                      <span className="text-[10px] font-bold capitalize text-slate-700 dark:text-slate-300">{sec}</span>
                      <input
                        type="number"
                        value={newPrevCarries[sec]}
                        onChange={(e) =>
                          setNewPrevCarries((prev) => ({
                            ...prev,
                            [sec]: Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 hover:bg-sky-400 active:scale-95 transition"
              >
                Create Month & Sync to Sheet
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
