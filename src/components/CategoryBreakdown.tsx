
import React, { useMemo, useRef } from 'react';
import { useBudget, Transaction } from '@/context/BudgetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import ExpenseExport from './ExpenseExport';

// Define chart colors
const COLORS = [
  '#3b82f6', '#ef4444', '#f97316', '#8b5cf6', 
  '#10b981', '#f59e0b', '#6366f1', '#ec4899',
  '#06b6d4', '#84cc16', '#14b8a6', '#f43f5e',
  '#64748b', '#a855f7', '#0ea5e9', '#d946ef'
];

const CategoryBreakdown = () => {
  const { transactions } = useBudget();
  const isMobile = useIsMobile();
  const chartRef = useRef<HTMLDivElement>(null);

  const expenseData = useMemo(() => {
    // Filter to expenses only
    const expenses = transactions.filter(t => t.type === 'expense');

    // Group by category and sum amounts
    const categorySums: Record<string, number> = {};
    
    expenses.forEach(expense => {
      if (!categorySums[expense.category]) {
        categorySums[expense.category] = 0;
      }
      categorySums[expense.category] += expense.amount;
    });

    // Convert to array for chart
    return Object.entries(categorySums)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="animate-slide-up">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Your spending by category</CardDescription>
        </div>
        <ExpenseExport />
      </CardHeader>
      
      <CardContent>
        {expenseData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No expense data available</p>
            <p className="text-sm mt-1">Add some expenses to see your breakdown</p>
          </div>
        ) : (
          <div className={cn(
            "flex gap-6",
            isMobile ? "flex-col" : "flex-row"
          )}>
            <div className="flex-1 min-h-[250px]" ref={chartRef}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 80 : 100}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={1000}
                    animationBegin={200}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex-1">
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-3 stagger-animate">
                  {expenseData.map((item, index) => (
                    <CategoryItem 
                      key={item.category}
                      category={item.category}
                      amount={item.value}
                      percentage={(item.value / totalExpenses) * 100}
                      color={COLORS[index % COLORS.length]}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface CategoryItemProps {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

const CategoryItem = ({ category, amount, percentage, color }: CategoryItemProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-medium">{category}</span>
      </div>
      <div className="text-right">
        <div className="font-medium number-display">${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
        <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
      </div>
    </div>
  );
};

export default CategoryBreakdown;
