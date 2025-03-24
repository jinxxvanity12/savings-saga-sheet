
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { format, parse, getMonth, getYear, subMonths } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// Types
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: TransactionType;
}

export interface Budget {
  category: string;
  amount: number;
  spent: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  interestRate?: number;
  dueDate?: string;
}

export interface MonthData {
  transactions: Transaction[];
  budgets: Budget[];
}

interface BudgetContextType {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  debts: Debt[];
  categories: string[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (category: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeSavingsGoal: (id: string, amount: number) => void;
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (debt: Debt) => void;
  deleteDebt: (id: string) => void;
  makeDebtPayment: (id: string, amount: number) => void;
  addCategory: (category: string) => void;
  updateCategory: (index: number, newName: string) => void;
  deleteCategory: (index: number) => void;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  allTransactions: Transaction[];
  copyPreviousMonthBudgets: () => void;
}

// Default categories
const DEFAULT_CATEGORIES = [
  'Housing', 'Transportation', 'Food', 'Utilities', 
  'Insurance', 'Healthcare', 'Savings', 'Personal', 
  'Entertainment', 'Debt', 'Education', 'Gifts/Donations',
  'Salary', 'Investments', 'Side Hustle', 'Refunds'
];

// Helper to get a month key string from a date (format: MM/YYYY)
const getMonthKey = (date: Date): string => {
  return format(date, 'MM/yyyy');
};

// Create context
const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

// Provider component
export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Current selected month
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const currentMonthKey = getMonthKey(currentMonth);
  
  // Store data for each month separately (without savings goals now)
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthData>>(() => {
    const saved = localStorage.getItem('monthlyData');
    return saved ? JSON.parse(saved) : {};
  });

  // Store savings goals separately to be shared across all months
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('savingsGoals');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Store debts separately to be shared across all months
  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('debts');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Store categories to be shared across all months
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  // Default empty data for a new month
  const emptyMonthData: MonthData = {
    transactions: [],
    budgets: []
  };

  // Get or initialize current month's data
  const getCurrentMonthData = (): MonthData => {
    if (!monthlyData[currentMonthKey]) {
      return emptyMonthData;
    }
    return monthlyData[currentMonthKey];
  };

  // Shorthand for current month's data
  const currentData = getCurrentMonthData();
  const transactions = currentData.transactions || [];
  const budgets = currentData.budgets || [];

  // Get all transactions across all months for yearly summaries
  const allTransactions = Object.values(monthlyData).flatMap(monthData => monthData.transactions || []);

  // Calculate totals for current month
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Update the monthly data with new values
  const updateMonthData = (newData: MonthData) => {
    setMonthlyData(prev => ({
      ...prev,
      [currentMonthKey]: newData
    }));
  };

  // Function to copy budgets from previous month
  const copyPreviousMonthBudgets = () => {
    // Calculate previous month's key
    const previousMonth = subMonths(currentMonth, 1);
    const previousMonthKey = getMonthKey(previousMonth);
    
    // Check if previous month has data
    if (!monthlyData[previousMonthKey]) {
      toast.error('No budget data found for previous month');
      return;
    }
    
    const previousBudgets = monthlyData[previousMonthKey].budgets || [];
    
    if (previousBudgets.length === 0) {
      toast.error('No budget data found for previous month');
      return;
    }
    
    // Copy previous month's budgets with zeroed spent values
    const copiedBudgets = previousBudgets.map(budget => ({
      ...budget,
      spent: 0
    }));
    
    // Update current month data
    updateMonthData({
      ...currentData,
      budgets: copiedBudgets
    });
    
    toast.success('Budget categories copied from previous month', {
      description: 'Spending has been reset to zero'
    });
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('monthlyData', JSON.stringify(monthlyData));
  }, [monthlyData]);

  // Persist savings goals to localStorage
  useEffect(() => {
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);
  
  // Persist debts to localStorage
  useEffect(() => {
    localStorage.setItem('debts', JSON.stringify(debts));
  }, [debts]);
  
  // Persist categories to localStorage
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  // Category functions
  const addCategory = (category: string) => {
    if (categories.includes(category)) {
      toast.error('Category already exists');
      return;
    }
    
    setCategories([...categories, category]);
    toast.success('Category added');
  };
  
  const updateCategory = (index: number, newName: string) => {
    if (index < 0 || index >= categories.length) return;
    
    const oldName = categories[index];
    
    // Update categories array
    const updatedCategories = [...categories];
    updatedCategories[index] = newName;
    setCategories(updatedCategories);
    
    // Update all transactions with this category
    const updatedMonthlyData = { ...monthlyData };
    
    Object.keys(updatedMonthlyData).forEach(monthKey => {
      const monthData = updatedMonthlyData[monthKey];
      
      // Update transactions
      monthData.transactions = monthData.transactions.map(t => 
        t.category === oldName ? { ...t, category: newName } : t
      );
      
      // Update budgets
      monthData.budgets = monthData.budgets.map(b => 
        b.category === oldName ? { ...b, category: newName } : b
      );
    });
    
    setMonthlyData(updatedMonthlyData);
    toast.success('Category updated');
  };
  
  const deleteCategory = (index: number) => {
    if (index < 0 || index >= categories.length) return;
    
    const categoryToDelete = categories[index];
    
    // Check if category is in use
    let isInUse = false;
    
    for (const monthKey in monthlyData) {
      const monthData = monthlyData[monthKey];
      
      if (monthData.transactions.some(t => t.category === categoryToDelete) ||
          monthData.budgets.some(b => b.category === categoryToDelete)) {
        isInUse = true;
        break;
      }
    }
    
    if (isInUse) {
      toast.error('Cannot delete category that is in use');
      return;
    }
    
    // Remove category
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
    
    toast.success('Category deleted');
  };

  // Transaction functions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: uuidv4(),
    };
    
    const updatedTransactions = [newTransaction, ...transactions];
    
    // Update current month data
    updateMonthData({
      ...currentData,
      transactions: updatedTransactions,
      budgets: transaction.type === 'expense' 
        ? budgets.map(budget => 
            budget.category === transaction.category
              ? { ...budget, spent: budget.spent + transaction.amount }
              : budget
          )
        : budgets
    });
    
    toast.success(`${transaction.type === 'income' ? 'Income' : 'Expense'} added`, {
      description: `${transaction.description}: $${transaction.amount.toFixed(2)}`
    });
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    
    if (!transaction) return;
    
    const updatedTransactions = transactions.filter(t => t.id !== id);
    
    // Update current month data
    updateMonthData({
      ...currentData,
      transactions: updatedTransactions,
      budgets: transaction.type === 'expense'
        ? budgets.map(budget => 
            budget.category === transaction.category
              ? { ...budget, spent: Math.max(0, budget.spent - transaction.amount) }
              : budget
          )
        : budgets
    });
    
    toast.success('Transaction deleted');
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    const oldTransaction = transactions.find(t => t.id === updatedTransaction.id);
    
    if (!oldTransaction) return;
    
    const updatedTransactions = transactions.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    );
    
    // Create updated budgets
    let updatedBudgets = [...budgets];
    
    // Remove old expense amount if it was an expense
    if (oldTransaction.type === 'expense') {
      updatedBudgets = updatedBudgets.map(budget => 
        budget.category === oldTransaction.category
          ? { ...budget, spent: Math.max(0, budget.spent - oldTransaction.amount) }
          : budget
      );
    }
    
    // Add new expense amount if it's an expense
    if (updatedTransaction.type === 'expense') {
      updatedBudgets = updatedBudgets.map(budget => 
        budget.category === updatedTransaction.category
          ? { ...budget, spent: budget.spent + updatedTransaction.amount }
          : budget
      );
    }
    
    // Update current month data
    updateMonthData({
      ...currentData,
      transactions: updatedTransactions,
      budgets: updatedBudgets
    });
    
    toast.success('Transaction updated');
  };

  // Budget functions
  const addBudget = (budget: Budget) => {
    // Check if budget already exists for category
    const existingBudget = budgets.find(b => b.category === budget.category);
    
    let updatedBudgets;
    if (existingBudget) {
      updatedBudgets = budgets.map(b => 
        b.category === budget.category ? budget : b
      );
      toast.success('Budget updated', {
        description: `${budget.category}: $${budget.amount.toFixed(2)}`
      });
    } else {
      updatedBudgets = [...budgets, budget];
      toast.success('Budget added', {
        description: `${budget.category}: $${budget.amount.toFixed(2)}`
      });
    }
    
    // Update current month data
    updateMonthData({
      ...currentData,
      budgets: updatedBudgets
    });
  };

  const updateBudget = (updatedBudget: Budget) => {
    const updatedBudgets = budgets.map(b => 
      b.category === updatedBudget.category ? updatedBudget : b
    );
    
    // Update current month data
    updateMonthData({
      ...currentData,
      budgets: updatedBudgets
    });
    
    toast.success('Budget updated');
  };

  const deleteBudget = (category: string) => {
    const updatedBudgets = budgets.filter(b => b.category !== category);
    
    // Update current month data
    updateMonthData({
      ...currentData,
      budgets: updatedBudgets
    });
    
    toast.success('Budget deleted');
  };

  // Savings goal functions - global across all months
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: uuidv4(),
    };
    
    const updatedGoals = [...savingsGoals, newGoal];
    setSavingsGoals(updatedGoals);
    
    toast.success('Savings goal added', {
      description: `${goal.name}: $${goal.targetAmount.toFixed(2)}`
    });
  };

  const updateSavingsGoal = (updatedGoal: SavingsGoal) => {
    const updatedGoals = savingsGoals.map(g => 
      g.id === updatedGoal.id ? updatedGoal : g
    );
    
    setSavingsGoals(updatedGoals);
    
    toast.success('Savings goal updated');
  };

  const deleteSavingsGoal = (id: string) => {
    const updatedGoals = savingsGoals.filter(g => g.id !== id);
    
    setSavingsGoals(updatedGoals);
    
    toast.success('Savings goal deleted');
  };

  const contributeSavingsGoal = (id: string, amount: number) => {
    const goal = savingsGoals.find(g => g.id === id);
    
    if (!goal) return;
    
    const updatedGoals = savingsGoals.map(g => 
      g.id === id
        ? { ...g, currentAmount: g.currentAmount + amount }
        : g
    );
    
    setSavingsGoals(updatedGoals);
    
    // Add as expense transaction
    addTransaction({
      amount,
      description: `Contribution to ${goal.name}`,
      category: 'Savings',
      date: new Date().toISOString().split('T')[0],
      type: 'expense'
    });
    
    toast.success('Contribution made', {
      description: `$${amount.toFixed(2)} added to savings goal`
    });
  };
  
  // Debt functions - global across all months
  const addDebt = (debt: Omit<Debt, 'id'>) => {
    const newDebt: Debt = {
      ...debt,
      id: uuidv4(),
    };
    
    const updatedDebts = [...debts, newDebt];
    setDebts(updatedDebts);
    
    toast.success('Debt added', {
      description: `${debt.name}: $${debt.totalAmount.toFixed(2)}`
    });
  };
  
  const updateDebt = (updatedDebt: Debt) => {
    const updatedDebts = debts.map(d => 
      d.id === updatedDebt.id ? updatedDebt : d
    );
    
    setDebts(updatedDebts);
    
    toast.success('Debt updated');
  };
  
  const deleteDebt = (id: string) => {
    const updatedDebts = debts.filter(d => d.id !== id);
    
    setDebts(updatedDebts);
    
    toast.success('Debt deleted');
  };
  
  const makeDebtPayment = (id: string, amount: number) => {
    const debt = debts.find(d => d.id === id);
    
    if (!debt) return;
    
    const updatedDebts = debts.map(d => 
      d.id === id
        ? { ...d, paidAmount: d.paidAmount + amount }
        : d
    );
    
    setDebts(updatedDebts);
    
    // Add as expense transaction
    addTransaction({
      amount,
      description: `Payment to ${debt.name}`,
      category: 'Debt',
      date: new Date().toISOString().split('T')[0],
      type: 'expense'
    });
    
    toast.success('Payment made', {
      description: `$${amount.toFixed(2)} paid toward ${debt.name}`
    });
  };

  const value = {
    transactions,
    budgets,
    savingsGoals,
    debts,
    categories,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    contributeSavingsGoal,
    addDebt,
    updateDebt,
    deleteDebt,
    makeDebtPayment,
    addCategory,
    updateCategory,
    deleteCategory,
    totalIncome,
    totalExpenses,
    balance,
    currentMonth,
    setCurrentMonth,
    allTransactions,
    copyPreviousMonthBudgets
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

// Hook for accessing context
export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
