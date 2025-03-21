
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TransactionList from '@/components/TransactionList';
import BudgetOverview from '@/components/BudgetOverview';
import SavingsGoals from '@/components/SavingsGoals';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import MonthlyDashboard from '@/components/MonthlyDashboard';
import TransactionForm from '@/components/TransactionForm';
import DebtTracker from '@/components/DebtTracker';
import CategoryEditor from '@/components/CategoryEditor';
import BudgetContextWrapper from '@/context/BudgetContextWrapper';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings, Layout, ArrowDown, ArrowUp, X } from 'lucide-react';
import UserHeader from '@/components/UserHeader';

// Add a CSS class for WordPress embedding
const wpContainerClass = "budget-tracker-wp-container";

// Define the widget components for customizing the dashboard
const widgets = {
  monthly: { component: MonthlyDashboard, title: "Monthly Dashboard" },
  transactions: { component: TransactionList, title: "Transactions" },
  budgets: { component: BudgetOverview, title: "Budget Overview" },
  debt: { component: DebtTracker, title: "Debt Tracker" },
  savings: { component: SavingsGoals, title: "Savings Goals" },
  breakdown: { component: CategoryBreakdown, title: "Category Breakdown" },
};

type WidgetKey = keyof typeof widgets;

const Index = () => {
  const isMobile = useIsMobile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [widgetOrder, setWidgetOrder] = useState<WidgetKey[]>(() => {
    const saved = localStorage.getItem('dashboardLayout');
    return saved ? JSON.parse(saved) : ['monthly', 'transactions', 'budgets', 'debt', 'savings', 'breakdown'];
  });

  // Save layout to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('dashboardLayout', JSON.stringify(widgetOrder));
  }, [widgetOrder]);

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === widgetOrder.length - 1)) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newOrder = [...widgetOrder];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setWidgetOrder(newOrder);
  };

  const resetLayout = () => {
    setWidgetOrder(['monthly', 'transactions', 'budgets', 'debt', 'savings', 'breakdown']);
  };

  return (
    <BudgetContextWrapper>
      <div className={`min-h-screen bg-background pb-20 ${wpContainerClass}`}>
        <Header />
        
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex justify-between gap-2 mb-4 items-center">
            <UserHeader />
            
            <div className="flex gap-2">
              <Dialog open={layoutOpen} onOpenChange={setLayoutOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Layout className="h-4 w-4" />
                    Customize Layout
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Customize Dashboard Layout</DialogTitle>
                    <DialogDescription>
                      Drag and drop or use arrows to reorder widgets
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="space-y-2">
                      {widgetOrder.map((widget, index) => (
                        <div 
                          key={widget} 
                          className="flex items-center justify-between p-2 bg-secondary/50 rounded-md"
                        >
                          <span>{widgets[widget].title}</span>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => moveWidget(index, 'up')} 
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => moveWidget(index, 'down')} 
                              disabled={index === widgetOrder.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" onClick={resetLayout}>
                        Reset to Default
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
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
          </div>
          
          <main>
            {isMobile ? (
              <MobileLayout widgetOrder={widgetOrder} />
            ) : (
              <DesktopLayout widgetOrder={widgetOrder} />
            )}
          </main>
        </div>
        
        <TransactionForm />
      </div>
    </BudgetContextWrapper>
  );
};

const DesktopLayout = ({ widgetOrder }: { widgetOrder: WidgetKey[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {widgetOrder.map((widget) => {
        const Widget = widgets[widget].component;
        return <Widget key={widget} />;
      })}
    </div>
  );
};

const MobileLayout = ({ widgetOrder }: { widgetOrder: WidgetKey[] }) => {
  return (
    <Tabs defaultValue={widgetOrder[0]} className="w-full">
      <TabsList className="grid grid-cols-6 w-full mb-6">
        {widgetOrder.map((widget) => (
          <TabsTrigger key={widget} value={widget}>
            {widget === 'monthly' ? 'Monthly' : 
             widget === 'transactions' ? 'Transactions' : 
             widget === 'budgets' ? 'Budgets' : 
             widget === 'debt' ? 'Debt' : 
             widget === 'savings' ? 'Savings' : 'Breakdown'}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {widgetOrder.map((widget) => {
        const Widget = widgets[widget].component;
        return (
          <TabsContent key={widget} value={widget} className="mt-0">
            <Widget />
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default Index;
