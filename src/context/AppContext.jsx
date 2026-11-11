import { createContext } from 'react';

/**
 * AppContext — global app state (budget settings, cached expenses, etc.).
 *
 * The provider and reducer will be fleshed out once we build the
 * Dashboard and AddExpense features. For now this establishes the
 * boundary so components can import from a stable path.
 */
const AppContext = createContext(null);

export default AppContext;
