import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import BottomNav from './BottomNav.jsx';
import AddEditModal from '../modals/AddEditModal.jsx';
import MonthConfigModal from '../modals/MonthConfigModal.jsx';
import PersonLedgerModal from '../modals/PersonLedgerModal.jsx';

/**
 * Mobile & Desktop Responsive App Shell
 * - Mobile (< md): Fixed 100dvh viewport, thumb bottom-nav, single screen fit on Home/P2P.
 * - Desktop (>= md): Full-width dashboard with top header navigation, clean padding, generous spacing.
 */
export default function Layout() {
  const location = useLocation();
  const isScrollableRoute = location.pathname.startsWith('/section');

  return (
    <div className="h-[100dvh] md:h-screen w-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* 1. Header (Responsive desktop navbar & clean mobile header) */}
      <Header />

      {/* 2. Main Viewport */}
      <main
        className={`flex-1 min-h-0 w-full px-3.5 sm:px-6 lg:px-8 py-2.5 md:py-6 ${
          isScrollableRoute
            ? 'overflow-y-auto'
            : 'overflow-hidden md:overflow-y-auto flex flex-col'
        }`}
      >
        <Outlet />
      </main>

      {/* 3. Mobile Bottom Navigation Bar (Hidden on desktop md+) */}
      <BottomNav />

      {/* 4. Global Modals */}
      <AddEditModal />
      <MonthConfigModal />
      <PersonLedgerModal />
    </div>
  );
}
