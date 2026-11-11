import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav.jsx';

/**
 * Shared app shell: safe-area-aware wrapper + bottom navigation.
 * All page routes render inside <Outlet />.
 */
export default function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      {/* Scrollable page content */}
      <main className="flex-1 overflow-y-auto px-4 pt-[var(--sat)] pb-20">
        <Outlet />
      </main>

      {/* Fixed bottom navigation — thumb-friendly */}
      <BottomNav />
    </div>
  );
}
