import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import FAB from './FAB.jsx';
import AddEditModal from '../modals/AddEditModal.jsx';

/**
 * Shared App Shell
 * - Persistent responsive Header
 * - Scrollable main viewport with safe-area spacing
 * - Fixed bottom-right Floating Action Button (FAB)
 * - Global Add/Edit Expense Modal
 */
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      {/* Persistent Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-4 pb-24">
        <Outlet />
      </main>

      {/* Floating Action Button */}
      <FAB />

      {/* Global Add / Edit Expense Modal */}
      <AddEditModal />
    </div>
  );
}
