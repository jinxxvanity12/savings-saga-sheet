
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

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
}

// Default categories
const DEFAULT_CATEGORIES = [
  'Housing', 'Transportation', 'Food', 'Utilities', 
  'Insurance', 'Healthcare', 'Savings', 'Personal', 
  'Entertainment', 'Debt', 'Education', 'Gifts/Donations',
  'Salary', 'Investments', 'Side Hustle', 'Refunds'
];

// Create context
const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

// Provider component
export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('savingsGoals');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories] = useState<string[]>(DEFAULT_CATEGORIES);

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  // Transaction functions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update budget spent if it's an expense
    if (transaction.type === 'expense') {
      setBudgets(prev => prev.map(budget => 
        budget.category === transaction.category
          ? { ...budget, spent: budget.spent + transaction.amount }
          : budget
      ));
    }
    
    toast.success(`${transaction.type === 'income' ? 'Income' : 'Expense'} added`, {
      description: `${transaction.description}: $${transaction.amount.toFixed(2)}`
    });
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    
    if (transaction && transaction.type === 'expense') {
      // Update budget spent when deleting an expense
      setBudgets(prev => prev.map(budget => 
        budget.category === transaction.category
          ? { ...budget, spent: Math.max(0, budget.spent - transaction.amount) }
          : budget
      ));
    }
    
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success('Transaction deleted');
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    const oldTransaction = transactions.find(t => t.id === updatedTransaction.id);
    
    setTransactions(prev => prev.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    ));
    
    // Update budget spent if necessary
    if (oldTransaction && oldTransaction.type === 'expense') {
      // Remove old expense amount
      setBudgets(prev => prev.map(budget => 
        budget.category === oldTransaction.category
          ? { ...budget, spent: Math.max(0, budget.spent - oldTransaction.amount) }
          : budget
      ));
    }
    
    if (updatedTransaction.type === 'expense') {
      // Add new expense amount
      setBudgets(prev => prev.map(budget => 
        budget.category === updatedTransaction.category
          ? { ...budget, spent: budget.spent + updatedTransaction.amount }
          : budget
      ));
    }
    
    toast.success('Transaction updated');
  };

  // Budget functions
  const addBudget = (budget: Budget) => {
    // Check if budget already exists for category
    const existingBudget = budgets.find(b => b.category === budget.category);
    
    if (existingBudget) {
      setBudgets(prev => prev.map(b => 
        b.category === budget.category ? budget : b
      ));
      toast.success('Budget updated', {
        description: `${budget.category}: $${budget.amount.toFixed(2)}`
      });
    } else {
      setBudgets(prev => [...prev, budget]);
      toast.success('Budget added', {
        description: `${budget.category}: $${budget.amount.toFixed(2)}`
      });
    }
  };

  const updateBudget = (updatedBudget: Budget) => {
    setBudgets(prev => prev.map(b => 
      b.category === updatedBudget.category ? updatedBudget : b
    ));
    toast.success('Budget updated');
  };

  const deleteBudget = (category: string) => {
    setBudgets(prev => prev.filter(b => b.category !== category));
    toast.success('Budget deleted');
  };

  // Savings goal functions
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: crypto.randomUUID(),
    };
    
    setSavingsGoals(prev => [...prev, newGoal]);
    toast.success('Savings goal added', {
      description: `${goal.name}: $${goal.targetAmount.toFixed(2)}`
    });
  };

  const updateSavingsGoal = (updatedGoal: SavingsGoal) => {
    setSavingsGoals(prev => prev.map(g => 
      g.id === updatedGoal.id ? updatedGoal : g
    ));
    toast.success('Savings goal updated');
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
    toast.success('Savings goal deleted');
  };

  const contributeSavingsGoal = (id: string, amount: number) => {
    setSavingsGoals(prev => prev.map(g => 
      g.id === id
        ? { ...g, currentAmount: g.currentAmount + amount }
        : g
    ));
    
    // Add as expense transaction
    const goal = savingsGoals.find(g => g.id === id);
    if (goal) {
      addTransaction({
        amount,
        description: `Contribution to ${goal.name}`,
        category: 'Savings',
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
      });
    }
    
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
    balance
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
