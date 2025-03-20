
import React, { useState } from 'react';
import Header from '@/components/Header';
import TransactionList from '@/components/TransactionList';
import BudgetOverview from '@/components/BudgetOverview';
import SavingsGoals from '@/components/SavingsGoals';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import MonthlyDashboard from '@/components/MonthlyDashboard';
import TransactionForm from '@/components/TransactionForm';
import DebtTracker from '@/components/DebtTracker';
import CategoryEditor from '@/components/CategoryEditor';
import { BudgetProvider } from '@/context/BudgetContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

// Add a CSS class for WordPress embedding
const wpContainerClass = "budget-tracker-wp-container";

const Index = () => {
  const isMobile = useIsMobile();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <BudgetProvider>
      <div className={`min-h-screen bg-background pb-20 ${wpContainerClass}`}>
        <Header />
        
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex justify-end mb-4">
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                  <DialogDescription>
                    Manage your budget categories
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <CategoryEditor />
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <main>
            {isMobile ? (
              <MobileLayout />
            ) : (
              <DesktopLayout />
            )}
          </main>
        </div>
        
        <TransactionForm />
      </div>
    </BudgetProvider>
  );
};

const DesktopLayout = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MonthlyDashboard />
      <TransactionList />
      <BudgetOverview />
      <DebtTracker />
      <SavingsGoals />
      <CategoryBreakdown />
    </div>
  );
};

const MobileLayout = () => {
  return (
    <Tabs defaultValue="monthly" className="w-full">
      <TabsList className="grid grid-cols-6 w-full mb-6">
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="budgets">Budgets</TabsTrigger>
        <TabsTrigger value="debt">Debt</TabsTrigger>
        <TabsTrigger value="savings">Savings</TabsTrigger>
        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
      </TabsList>
      
      <TabsContent value="monthly" className="mt-0">
        <MonthlyDashboard />
      </TabsContent>
      
      <TabsContent value="transactions" className="mt-0">
        <TransactionList />
      </TabsContent>
      
      <TabsContent value="budgets" className="mt-0">
        <BudgetOverview />
      </TabsContent>
      
      <TabsContent value="debt" className="mt-0">
        <DebtTracker />
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
