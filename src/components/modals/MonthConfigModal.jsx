import { useState, useEffect } from 'react';
import { useApp } from '../../hooks';
import { formatCurrency } from '../../utils/helpers';

export default function MonthConfigModal() {
  const {
    isMonthConfigModalOpen,
    setIsMonthConfigModalOpen,
    activeMonth,
    currentMonthData,
    updateCurrentMonthConfig,
    addMonth,
  } = useApp();

  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'add'

  // Edit Tab State
  const [editBase, setEditBase] = useState(142900);
  const [percentages, setPercentages] = useState({
    essentials: 50,
    savings: 30,
    wants: 10,
    invest: 10,
  });
  const [prevCarries, setPrevCarries] = useState({
    essentials: -3179,
    savings: -3292,
    wants: -26,
    invest: 0,
  });

  // Add Month State
  const [newMonthName, setNewMonthName] = useState('Dec-2026');
  const [newMonthBase, setNewMonthBase] = useState(142900);
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

  useEffect(() => {
    if (isMonthConfigModalOpen && currentMonthData) {
      setEditBase(currentMonthData.monthlyBase || 142900);
      setPercentages(
        currentMonthData.percentages || { essentials: 50, savings: 30, wants: 10, invest: 10 }
      );
      setPrevCarries(
        currentMonthData.prevCarries || { essentials: 0, savings: 0, wants: 0, invest: 0 }
      );
    }
  }, [isMonthConfigModalOpen, currentMonthData]);

  if (!isMonthConfigModalOpen) return null;

  const totalPercent = Object.values(percentages).reduce((a, b) => a + Number(b || 0), 0);
  const totalNewPercent = Object.values(newPercentages).reduce((a, b) => a + Number(b || 0), 0);

  const handleSaveCurrentMonth = (e) => {
    e.preventDefault();
    updateCurrentMonthConfig({
      monthlyBase: Number(editBase) || 142900,
      percentages,
      prevCarries,
    });
    setIsMonthConfigModalOpen(false);
  };

  const handleAddNewMonth = (e) => {
    e.preventDefault();
    if (!newMonthName.trim()) return;

    addMonth({
      monthName: newMonthName.trim(),
      monthlyBase: Number(newMonthBase) || 142900,
      percentages: newPercentages,
      prevCarries: newPrevCarries,
      banks: currentMonthData.banks,
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
      <div className="relative w-full max-w-md max-h-[90vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-none p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Month & Budget Settings</h2>
            <p className="text-[11px] text-slate-400">Configure base income and 50/30/10/10 split</p>
          </div>
          <button
            onClick={() => setIsMonthConfigModalOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex-none p-2 bg-slate-950/80 border-b border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition ${
              activeTab === 'edit'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Edit {activeMonth}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition ${
              activeTab === 'add'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            + Add New Month
          </button>
        </div>

        {/* Body (Scrollable form) */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'edit' ? (
            <form onSubmit={handleSaveCurrentMonth} className="space-y-4">
              {/* Monthly Base */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Monthly Base / Income (₹)
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-sky-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    value={editBase}
                    onChange={(e) => setEditBase(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-8 pr-3 text-sm font-bold text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Category Percentages */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Category Division (%)
                  </label>
                  <span
                    className={`text-xs font-bold ${
                      totalPercent === 100 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    Total: {totalPercent}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {['essentials', 'savings', 'wants', 'invest'].map((sec) => {
                    const pct = percentages[sec] || 0;
                    const calculatedAlloc = Math.round((editBase * pct) / 100);
                    return (
                      <div
                        key={sec}
                        className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold capitalize text-white">{sec}</span>
                          <span className="text-[10px] text-slate-400">{formatCurrency(calculatedAlloc)}</span>
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
                            className="w-16 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-bold text-white text-center outline-none focus:border-sky-500"
                          />
                          <span className="text-xs text-slate-400">%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Carry Forwards */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Previous Month Carry Forward (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['essentials', 'savings', 'wants', 'invest'].map((sec) => (
                    <div key={sec} className="rounded-xl border border-slate-800 bg-slate-950/70 p-2">
                      <span className="text-[10px] font-bold capitalize text-slate-300">{sec}</span>
                      <input
                        type="number"
                        value={prevCarries[sec] ?? 0}
                        onChange={(e) =>
                          setPrevCarries((prev) => ({
                            ...prev,
                            [sec]: Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-bold text-white outline-none focus:border-sky-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 hover:bg-sky-400 active:scale-95 transition"
              >
                Save {activeMonth} Configuration
              </button>
            </form>
          ) : (
            <form onSubmit={handleAddNewMonth} className="space-y-4">
              {/* New Month Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  New Month Name (e.g. Dec-2026, Jan-2027)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dec-2026"
                  value={newMonthName}
                  onChange={(e) => setNewMonthName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white outline-none focus:border-sky-500"
                />
              </div>

              {/* Base Income */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Monthly Base Income (₹)
                </label>
                <input
                  type="number"
                  required
                  value={newMonthBase}
                  onChange={(e) => setNewMonthBase(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white outline-none focus:border-sky-500"
                />
              </div>

              {/* Percentages */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Category Division (%)
                  </label>
                  <span
                    className={`text-xs font-bold ${
                      totalNewPercent === 100 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    Total: {totalNewPercent}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {['essentials', 'savings', 'wants', 'invest'].map((sec) => (
                    <div key={sec} className="rounded-xl border border-slate-800 bg-slate-950/70 p-2">
                      <span className="text-[10px] font-bold capitalize text-slate-300">{sec}</span>
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
                          className="w-14 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-bold text-white text-center outline-none focus:border-sky-500"
                        />
                        <span className="text-xs text-slate-400">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 hover:bg-sky-400 active:scale-95 transition"
              >
                Create & Switch to Month
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
