
import React from 'react';
import { useBudget } from '@/context/BudgetContext';
import { cn } from '@/lib/utils';
import { ArrowUpCircle, ArrowDownCircle, PiggyBank } from 'lucide-react';

const Header = () => {
  const { totalIncome, totalExpenses, balance } = useBudget();

  return (
    <header className="w-full animate-slide-down">
      <div className="py-6 px-2">
        <h1 className="text-3xl font-semibold tracking-tight text-center mb-1">Financial Dashboard</h1>
        <p className="text-center text-muted-foreground mb-8">Track, budget, and achieve your financial goals</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <OverviewCard 
            title="Income" 
            amount={totalIncome} 
            icon={<ArrowUpCircle className="h-5 w-5 text-emerald-500" />} 
            className="bg-emerald-50 border-emerald-100"
          />
          
          <OverviewCard 
            title="Expenses" 
            amount={totalExpenses} 
            icon={<ArrowDownCircle className="h-5 w-5 text-rose-500" />} 
            className="bg-rose-50 border-rose-100"
          />
          
          <OverviewCard 
            title="Balance" 
            amount={balance} 
            icon={<PiggyBank className="h-5 w-5 text-primary" />} 
            className="bg-blue-50 border-blue-100"
            highlight
          />
        </div>
      </div>
    </header>
  );
};

interface OverviewCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  className?: string;
  highlight?: boolean;
}

const OverviewCard = ({ title, amount, icon, className, highlight }: OverviewCardProps) => {
  return (
    <div className={cn(
      "rounded-xl border p-5 transition-all duration-200 hover:shadow-md",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon}
      </div>
      <p className={cn(
        "text-2xl font-semibold number-display",
        highlight && "text-primary"
      )}>
        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
};

export default Header;
