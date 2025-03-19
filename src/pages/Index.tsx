
import React from 'react';
import Header from '@/components/Header';
import TransactionList from '@/components/TransactionList';
import BudgetOverview from '@/components/BudgetOverview';
import SavingsGoals from '@/components/SavingsGoals';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import TransactionForm from '@/components/TransactionForm';
import { BudgetProvider } from '@/context/BudgetContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <BudgetProvider>
      <div className="min-h-screen bg-background pb-20">
        <Header />
        
        <main className="container px-4 mx-auto max-w-7xl">
          {isMobile ? (
            <MobileLayout />
          ) : (
            <DesktopLayout />
          )}
        </main>
        
        <TransactionForm />
      </div>
    </BudgetProvider>
  );
};

const DesktopLayout = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TransactionList />
      <BudgetOverview />
      <SavingsGoals />
      <CategoryBreakdown />
    </div>
  );
};

const MobileLayout = () => {
  return (
    <Tabs defaultValue="transactions" className="w-full">
      <TabsList className="grid grid-cols-4 w-full mb-6">
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="budgets">Budgets</TabsTrigger>
        <TabsTrigger value="savings">Savings</TabsTrigger>
        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
      </TabsList>
      
      <TabsContent value="transactions" className="mt-0">
        <TransactionList />
      </TabsContent>
      
      <TabsContent value="budgets" className="mt-0">
        <BudgetOverview />
      </TabsContent>
      
      <TabsContent value="savings" className="mt-0">
        <SavingsGoals />
      </TabsContent>
      
      <TabsContent value="breakdown" className="mt-0">
        <CategoryBreakdown />
      </TabsContent>
    </Tabs>
  );
};

export default Index;
