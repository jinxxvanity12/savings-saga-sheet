
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { format, parse, getMonth, getYear } from 'date-fns';

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

export interface MonthData {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
}

interface BudgetContextType {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
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
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
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
  
  // Store data for each month separately
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthData>>(() => {
    const saved = localStorage.getItem('monthlyData');
    return saved ? JSON.parse(saved) : {};
  });

  // Default empty data for a new month
  const emptyMonthData: MonthData = {
    transactions: [],
    budgets: [],
    savingsGoals: []
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
  const savingsGoals = currentData.savingsGoals || [];

  const [categories] = useState<string[]>(DEFAULT_CATEGORIES);

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

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('monthlyData', JSON.stringify(monthlyData));
  }, [monthlyData]);

  // Transaction functions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
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

  // Savings goal functions
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: crypto.randomUUID(),
    };
    
    const updatedGoals = [...savingsGoals, newGoal];
    
    // Update current month data
    updateMonthData({
      ...currentData,
      savingsGoals: updatedGoals
    });
    
    toast.success('Savings goal added', {
      description: `${goal.name}: $${goal.targetAmount.toFixed(2)}`
    });
  };

  const updateSavingsGoal = (updatedGoal: SavingsGoal) => {
    const updatedGoals = savingsGoals.map(g => 
      g.id === updatedGoal.id ? updatedGoal : g
    );
    
    // Update current month data
    updateMonthData({
      ...currentData,
      savingsGoals: updatedGoals
    });
    
    toast.success('Savings goal updated');
  };

  const deleteSavingsGoal = (id: string) => {
    const updatedGoals = savingsGoals.filter(g => g.id !== id);
    
    // Update current month data
    updateMonthData({
      ...currentData,
      savingsGoals: updatedGoals
    });
    
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
    
    // Update current month data
    updateMonthData({
      ...currentData,
      savingsGoals: updatedGoals
    });
    
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

  const value = {
    transactions,
    budgets,
    savingsGoals,
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
    totalIncome,
    totalExpenses,
    balance,
    currentMonth,
    setCurrentMonth
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
