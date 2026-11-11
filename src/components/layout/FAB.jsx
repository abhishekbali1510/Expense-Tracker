import { useApp } from '../../hooks';

export default function FAB() {
  const { openAddModal } = useApp();

  return (
    <button
      onClick={() => openAddModal()}
      aria-label="Add Expense"
      className="fixed bottom-6 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-slate-950 shadow-xl shadow-sky-500/25 ring-2 ring-sky-400 transition hover:bg-sky-400 hover:scale-105 active:scale-95"
    >
      <svg
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </button>
  );
}
