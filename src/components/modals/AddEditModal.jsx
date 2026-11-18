import { useState, useEffect } from 'react';
import { useApp } from '../../hooks';
import { BANK_ACCOUNTS, EXPENSE_SECTIONS } from '../../config/constants';
import { toInputDate, fromInputDate } from '../../utils/helpers';

export default function AddEditModal() {
  const { modalState, closeModal, saveExpense, saveTransfer, deleteExpense, people, addPerson, activeMonth } = useApp();
  const { isOpen, mode, defaultSection, defaultPerson, editingExpense } = modalState;

  const [date, setDate] = useState('');
  const [section, setSection] = useState('essentials');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('HDFC');
  const [person, setPerson] = useState('Vivek');
  const [isCustomPerson, setIsCustomPerson] = useState(false);
  const [customPersonName, setCustomPersonName] = useState('');
  const [flow, setFlow] = useState('out'); // 'in' (received) or 'out' (given)
  const [transferDir, setTransferDir] = useState('HDFC_TO_SBI'); // 'HDFC_TO_SBI' | 'SBI_TO_HDFC'
  const [budgetImpact, setBudgetImpact] = useState('savings'); // 'savings' (default) | 'none'

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingExpense) {
        setDate(toInputDate(editingExpense.date, editingExpense.month || activeMonth));
        setSection(editingExpense.section?.toLowerCase() || 'essentials');
        setDescription(editingExpense.description || '');
        setAmount(editingExpense.amount ? String(editingExpense.amount) : '');
        setBankAccount(editingExpense.bankAccount || 'HDFC');
        setPerson(editingExpense.person || defaultPerson || 'Vivek');
        setFlow(editingExpense.flow || 'out');
        setIsCustomPerson(false);

        const defaultImp = editingExpense.budgetImpact
          ? editingExpense.budgetImpact
          : editingExpense.section?.toLowerCase() === 'p2p' &&
            editingExpense.description !== 'Previous / Opening Balance' &&
            String(editingExpense.bankAccount || '').toUpperCase() === 'HDFC'
          ? 'savings'
          : 'none';
        setBudgetImpact(defaultImp);

        if (editingExpense.bankAccount === 'SBI' && editingExpense.person === 'HDFC') {
          setTransferDir('HDFC_TO_SBI');
        } else if (editingExpense.bankAccount === 'HDFC' && editingExpense.person === 'SBI') {
          setTransferDir('SBI_TO_HDFC');
        }
      } else {
        const initialSec = defaultSection?.toLowerCase() || 'essentials';
        setDate(toInputDate(new Date(), activeMonth));
        setSection(initialSec);
        setDescription(initialSec === 'transfer' ? 'Self Transfer (HDFC ➔ SBI)' : '');
        setAmount('');
        setBankAccount('HDFC');
        setPerson(defaultPerson || (people[0] || 'Vivek'));
        setFlow('out');
        setTransferDir('HDFC_TO_SBI');
        setBudgetImpact('savings');
        setIsCustomPerson(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, defaultSection, defaultPerson, editingExpense, activeMonth]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    if (section === 'transfer') {
      const fromBank = transferDir === 'HDFC_TO_SBI' ? 'HDFC' : 'SBI';
      const toBank = transferDir === 'HDFC_TO_SBI' ? 'SBI' : 'HDFC';
      saveTransfer({
        date: fromInputDate(date),
        fromBank,
        toBank,
        amount: Math.abs(Number(amount)),
        description:
          description.trim() || `Self Transfer: ${fromBank} ➔ ${toBank}`,
      });
      return;
    }

    let finalPerson = person;
    if (section === 'p2p') {
      if (isCustomPerson && customPersonName.trim()) {
        finalPerson = customPersonName.trim();
        addPerson(finalPerson);
      }
    }

    saveExpense({
      date: fromInputDate(date),
      section: section.toLowerCase(),
      description: description.trim() || (section === 'p2p' ? `${finalPerson} transfer` : 'Expense'),
      amount: Math.abs(Number(amount)),
      bankAccount,
      flow,
      ...(section === 'p2p'
        ? {
            person: finalPerson,
            budgetImpact: bankAccount === 'HDFC' ? budgetImpact : 'none',
          }
        : {}),
    });
  };

  const isEditing = mode === 'edit' && editingExpense;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={closeModal}
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-2xl shadow-black/20 dark:shadow-black/80 max-h-[92vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Header */}
        <div className="mb-2.5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Expense Record' : 'Quick Expense Entry'}
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Single transaction row</p>
          </div>
          <button
            onClick={closeModal}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Amount (Hero Input) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Amount (₹)
            </label>
            <div className="relative mt-0.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-sky-600 dark:text-sky-400">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-1.5 pl-7 pr-3 text-xl font-black text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Section Picker */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Section
            </label>
            <div className="mt-0.5 grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {EXPENSE_SECTIONS.map((sec) => {
                const isSelected = section === sec.key;
                return (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() => {
                      setSection(sec.key);
                      if (sec.key === 'transfer') {
                        if (!description || description.startsWith('Self Transfer')) {
                          setDescription(
                            transferDir === 'HDFC_TO_SBI'
                              ? 'Self Transfer (HDFC ➔ SBI)'
                              : 'Self Transfer (SBI ➔ HDFC)'
                          );
                        }
                      }
                    }}
                    className={`rounded-xl py-1.5 text-[11px] font-bold transition ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 shadow-md ring-1 ring-sky-400'
                        : 'border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {sec.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section-Specific Selector: Self Transfer Direction VS Transaction Flow */}
          {section === 'transfer' ? (
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 dark:bg-sky-950/20 p-2.5 space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Transfer Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTransferDir('HDFC_TO_SBI');
                    setDescription('Self Transfer (HDFC ➔ SBI)');
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold transition ${
                    transferDir === 'HDFC_TO_SBI'
                      ? 'bg-sky-500 text-slate-950 shadow-md ring-2 ring-sky-400'
                      : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-blue-500 font-black">HDFC</span>
                  <span>➔</span>
                  <span className="text-cyan-500 font-black">SBI</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTransferDir('SBI_TO_HDFC');
                    setDescription('Self Transfer (SBI ➔ HDFC)');
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold transition ${
                    transferDir === 'SBI_TO_HDFC'
                      ? 'bg-sky-500 text-slate-950 shadow-md ring-2 ring-sky-400'
                      : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-cyan-500 font-black">SBI</span>
                  <span>➔</span>
                  <span className="text-blue-500 font-black">HDFC</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {transferDir === 'HDFC_TO_SBI'
                  ? 'Debits HDFC and credits SBI. Budget categories remain untouched.'
                  : 'Debits SBI and credits HDFC. Budget categories remain untouched.'}
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Transaction Flow
              </label>
              <div className="mt-0.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFlow('out')}
                  className={`rounded-xl py-1.5 text-xs font-bold transition ${
                    flow === 'out'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {section === 'p2p' ? '- Given / Outflow' : '- Outflow / Expense'}
                </button>
                <button
                  type="button"
                  onClick={() => setFlow('in')}
                  className={`rounded-xl py-1.5 text-xs font-bold transition ${
                    flow === 'in'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {section === 'p2p' ? '+ Received / Inflow' : '+ Inflow / Add'}
                </button>
              </div>
            </div>
          )}

          {/* If P2P Section Selected: Counterparty */}
          {section === 'p2p' && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-2.5">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Person / Account
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomPerson(!isCustomPerson)}
                    className="text-[10px] text-sky-600 dark:text-sky-400 font-bold hover:underline"
                  >
                    {isCustomPerson ? '← Select Existing' : '+ New Person'}
                  </button>
                </div>

                {isCustomPerson ? (
                  <input
                    type="text"
                    required
                    placeholder="Type new person name..."
                    value={customPersonName}
                    onChange={(e) => setCustomPersonName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                  />
                ) : (
                  <select
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                  >
                    {people.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Budget Impact Bucket: Savings vs None */}
              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Budget Impact
                  </label>
                  <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">
                    {bankAccount === 'HDFC'
                      ? budgetImpact === 'savings'
                        ? 'Debits / Credits HDFC Savings'
                        : 'Pure bank cashflow only'
                      : bankAccount === 'None'
                      ? 'No bank or budget impact'
                      : 'SBI Daily UPI (No savings impact)'}
                  </span>
                </div>
                {bankAccount === 'HDFC' ? (
                  <div className="mt-1 grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBudgetImpact('savings')}
                      className={`rounded-lg py-1 px-2 text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${
                        budgetImpact === 'savings'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-sm'
                          : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>🏦</span>
                      <span>HDFC Savings (Default)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetImpact('none')}
                      className={`rounded-lg py-1 px-2 text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${
                        budgetImpact === 'none'
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm'
                          : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>🚫</span>
                      <span>None (Pure Cash)</span>
                    </button>
                  </div>
                ) : bankAccount === 'None' ? (
                  <div className="mt-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <span>💡</span>
                    <span>Off-the-books: Updates person's balance only without touching SBI or HDFC.</span>
                  </div>
                ) : (
                  <div className="mt-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 px-2.5 py-1.5 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span>ℹ️</span>
                    <span>SBI is your daily UPI account — P2P does not touch HDFC Savings.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Description / Item
            </label>
            <input
              type="text"
              required
              placeholder={
                section === 'wants'
                  ? 'e.g. Chicken / Roti / Ras Malai'
                  : section === 'essentials'
                  ? 'e.g. Petrol / Groceries'
                  : 'e.g. SIP / RD / Transfer'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-0.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-sky-500"
            />
          </div>

          {/* Date & Bank Account */}
          <div className={section === 'transfer' ? 'space-y-1' : 'grid grid-cols-2 gap-2'}>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker?.();
                  } catch {
                    // Fallback for browsers that disallow programmatic showPicker
                  }
                }}
                className="mt-0.5 w-full cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-sky-500 [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            {section !== 'transfer' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Bank Account
                </label>
                <div className="mt-0.5 flex gap-1.5">
                  {(section === 'p2p' ? ['HDFC', 'SBI', 'None'] : BANK_ACCOUNTS).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setBankAccount(b);
                        if (section === 'p2p') {
                          setBudgetImpact(b === 'HDFC' ? 'savings' : 'none');
                        }
                      }}
                      className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition ${
                        bankAccount === b
                          ? 'bg-sky-500 text-slate-950 ring-1 ring-sky-400'
                          : 'border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {b === 'None' ? 'None (Cash)' : b}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-2.5 flex items-center justify-between gap-2.5 pt-1.5">
            {isEditing ? (
              <button
                type="button"
                onClick={() => deleteExpense(editingExpense.id)}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition"
              >
                Delete
              </button>
            ) : (
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="flex-1 rounded-xl bg-sky-500 py-2 text-xs font-bold text-slate-950 shadow-md shadow-sky-500/20 hover:bg-sky-400 active:scale-95 transition"
            >
              {section === 'transfer'
                ? '⇄ Confirm Transfer'
                : isEditing
                ? 'Save Changes'
                : 'Confirm & Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
