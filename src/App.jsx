import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import Layout from './components/layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SectionDetail from './pages/SectionDetail.jsx';
import P2PDashboard from './pages/P2PDashboard.jsx';

/**
 * Root Application Component
 * Sets up the Global AppProvider and Client-Side Routing
 */
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* View 1: Home Screen (Strictly 2 Sections) */}
            <Route index element={<Dashboard />} />

            {/* View 2: Separate Section Detail Screen */}
            <Route path="section/:sectionKey" element={<SectionDetail />} />

            {/* View 3: Separate P2P Dashboard Screen */}
            <Route path="p2p" element={<P2PDashboard />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
