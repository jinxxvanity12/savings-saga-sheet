
import React from 'react';
import { BudgetProvider } from './BudgetContext';
import { useAuth } from './AuthContext';

interface BudgetContextWrapperProps {
  children: React.ReactNode;
}

// This wrapper component ensures that each user's budget data is isolated
const BudgetContextWrapper: React.FC<BudgetContextWrapperProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'anonymous';

  // Prefix all localStorage keys with the user ID to isolate data
  const localStoragePrefix = `user_${userId}_`;

  // Override localStorage getItem and setItem for the budget context
  const originalGetItem = localStorage.getItem.bind(localStorage);
  const originalSetItem = localStorage.setItem.bind(localStorage);
  
  // Override these methods only while the BudgetProvider is mounted
  localStorage.getItem = (key: string) => {
    if (['monthlyData', 'savingsGoals', 'debts', 'categories'].includes(key)) {
      return originalGetItem(`${localStoragePrefix}${key}`);
    }
    return originalGetItem(key);
  };
  
  localStorage.setItem = (key: string, value: string) => {
    if (['monthlyData', 'savingsGoals', 'debts', 'categories'].includes(key)) {
      return originalSetItem(`${localStoragePrefix}${key}`, value);
    }
    return originalSetItem(key, value);
  };
  
  // Restore original methods when component unmounts
  React.useEffect(() => {
    return () => {
      localStorage.getItem = originalGetItem;
      localStorage.setItem = originalSetItem;
    };
  }, [originalGetItem, originalSetItem]);

  return <BudgetProvider>{children}</BudgetProvider>;
};

export default BudgetContextWrapper;
