import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AddExpense from './pages/AddExpense.jsx';
import History from './pages/History.jsx';
import Settings from './pages/Settings.jsx';

/**
 * Root application component.
 * Sets up client-side routing and the shared layout shell.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add" element={<AddExpense />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
