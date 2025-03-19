
import React from 'react';
import Header from '@/components/Header';
import TransactionList from '@/components/TransactionList';
import BudgetOverview from '@/components/BudgetOverview';
import SavingsGoals from '@/components/SavingsGoals';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import TransactionForm from '@/components/TransactionForm';
import { BudgetProvider } from '@/context/BudgetContext';

const Index = () => {
  return (
    <BudgetProvider>
      <div className="min-h-screen bg-background pb-20">
        <Header />
        
        <main className="container px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TransactionList />
            <BudgetOverview />
            <SavingsGoals />
            <CategoryBreakdown />
          </div>
        </main>
        
        <TransactionForm />
      </div>
    </BudgetProvider>
  );
};

export default Index;
