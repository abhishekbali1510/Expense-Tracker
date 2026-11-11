import { useState, useEffect } from 'react';
import { useApp } from '../../hooks';
import { BANK_ACCOUNTS, EXPENSE_SECTIONS } from '../../config/constants';
import { formatDisplayDate } from '../../utils/helpers';

export default function AddEditModal() {
  const { modalState, closeModal, saveExpense, deleteExpense } = useApp();
  const { isOpen, mode, defaultSection, editingExpense } = modalState;

  const [date, setDate] = useState('');
  const [section, setSection] = useState('essentials');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('SBI');
  const [person, setPerson] = useState('Vivek');
  const [flow, setFlow] = useState('out'); // 'in' (received) or 'out' (given)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingExpense) {
        setDate(editingExpense.date || formatDisplayDate(new Date()));
        setSection(editingExpense.section?.toLowerCase() || 'essentials');
        setDescription(editingExpense.description || '');
        setAmount(editingExpense.amount ? String(editingExpense.amount) : '');
        setBankAccount(editingExpense.bankAccount || 'SBI');
        setPerson(editingExpense.person || 'Vivek');
        setFlow(editingExpense.flow || 'out');
      } else {
        setDate(formatDisplayDate(new Date()));
        setSection(defaultSection?.toLowerCase() || 'essentials');
        setDescription('');
        setAmount('');
        setBankAccount('SBI');
        setPerson('Vivek');
        setFlow('out');
      }
    }
  }, [isOpen, mode, defaultSection, editingExpense]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    saveExpense({
      date: date.trim() || formatDisplayDate(new Date()),
      section: section.toLowerCase(),
      description: description.trim() || (section === 'p2p' ? `${person} transfer` : 'Expense'),
      amount: Math.abs(Number(amount)),
      bankAccount,
      ...(section === 'p2p' ? { person, flow } : {}),
    });
  };

  const isEditing = mode === 'edit' && editingExpense;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={closeModal}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? 'Edit Expense Record' : 'Log New Expense'}
          </h2>
          <button
            onClick={closeModal}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount (Hero Field) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Amount (₹)
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-sky-400">
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
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-9 pr-4 text-2xl font-bold text-white placeholder-slate-600 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Section Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Budget Section
            </label>
            <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {EXPENSE_SECTIONS.map((sec) => {
                const isSelected = section === sec.key;
                return (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() => setSection(sec.key)}
                    className={`rounded-lg py-2 text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 shadow-md ring-1 ring-sky-400'
                        : 'border border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {sec.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* If P2P Section Selected: Flow & Person */}
          {section === 'p2p' && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Transaction Type
                </label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFlow('out')}
                    className={`rounded-lg py-2 text-xs font-semibold transition ${
                      flow === 'out'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    - Given / Outflow
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlow('in')}
                    className={`rounded-lg py-2 text-xs font-semibold transition ${
                      flow === 'in'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    + Received / Inflow
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Person / Counterparty
                </label>
                <select
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                >
                  <option value="Vivek">Vivek</option>
                  <option value="Mummy / Home">Mummy / Home</option>
                  <option value="Other">Other Contact</option>
                </select>
              </div>
            </div>
          )}

          {/* Description / Item Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Description / Item Name
            </label>
            <input
              type="text"
              required
              placeholder={
                section === 'wants'
                  ? 'e.g. Chicken / Roti / Ras Malai'
                  : section === 'essentials'
                  ? 'e.g. Petrol fuel / Groceries'
                  : 'e.g. Mutual fund SIP / RD transfer'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-sky-500"
            />
          </div>

          {/* Date & Bank Account (Side by Side) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Date (e.g. 11-Nov)
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Bank Account
              </label>
              <div className="mt-1 flex gap-2">
                {BANK_ACCOUNTS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBankAccount(b)}
                    className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition ${
                      bankAccount === b
                        ? 'bg-sky-500 text-slate-950 shadow-sm ring-1 ring-sky-400'
                        : 'border border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {b} Bank
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-between gap-3 pt-2">
            {isEditing ? (
              <button
                type="button"
                onClick={() => deleteExpense(editingExpense.id)}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20"
              >
                Delete Row
              </button>
            ) : (
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="flex-1 rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-400 active:scale-95"
            >
              {isEditing ? 'Save Changes' : 'Confirm & Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
