
import React, { useState, useMemo } from 'react';
import { useBudget, Transaction } from '@/context/BudgetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parse, isValid, getYear, getMonth, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type MonthData = {
  name: string;
  income: number;
  expenses: number;
  savings: number;
  month: string;
};

const MonthlyDashboard = () => {
  const { transactions, currentMonth, setCurrentMonth } = useBudget();
  const selectedYear = currentMonth.getFullYear().toString();
  const selectedMonth = currentMonth.getMonth();
  const isMobile = useIsMobile();
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Get current month name for display
  const currentMonthName = format(currentMonth, 'MMMM yyyy');
  
  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    transactions.forEach(transaction => {
      if (transaction.date) {
        const date = new Date(transaction.date);
        if (isValid(date)) {
          years.add(getYear(date).toString());
        }
      }
    });
    
    // Always include the current selected year
    years.add(selectedYear);
    
    return Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort descending
  }, [transactions, selectedYear]);

  // Calculate monthly data
  const monthlyData = useMemo(() => {
    // Initialize array for all 12 months
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(parseInt(selectedYear), i, 1);
      return {
        name: format(monthDate, 'MMM'),
        income: 0,
        expenses: 0,
        savings: 0,
        month: format(monthDate, 'MM/yyyy'),
      };
    });

    // Fill with actual data
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (!isValid(date)) return;
      
      const year = getYear(date);
      if (year.toString() !== selectedYear) return;
      
      const monthIndex = getMonth(date);
      
      if (transaction.type === 'income') {
        months[monthIndex].income += transaction.amount;
      } else {
        months[monthIndex].expenses += transaction.amount;
      }
    });

    // Calculate savings (income - expenses)
    months.forEach(month => {
      month.savings = month.income - month.expenses;
    });

    return months;
  }, [transactions, selectedYear]);

  // Calculate totals for the selected year
  const yearlyTotals = useMemo(() => {
    return monthlyData.reduce(
      (acc, month) => {
        acc.income += month.income;
        acc.expenses += month.expenses;
        acc.savings += month.savings;
        return acc;
      },
      { income: 0, expenses: 0, savings: 0 }
    );
  }, [monthlyData]);

  // Calculate data for the currently selected month
  const currentMonthData = useMemo(() => {
    const income = transactions
      .filter(t => {
        const date = new Date(t.date);
        return isValid(date) && 
               getMonth(date) === selectedMonth && 
               getYear(date) === parseInt(selectedYear) && 
               t.type === 'income';
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return isValid(date) && 
               getMonth(date) === selectedMonth && 
               getYear(date) === parseInt(selectedYear) && 
               t.type === 'expense';
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = income - expenses;
    
    return { income, expenses, savings };
  }, [transactions, selectedMonth, selectedYear]);

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>Track your finances over time</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Select
              value={selectedYear}
              onValueChange={(value) => {
                const newDate = new Date(currentMonth);
                newDate.setFullYear(parseInt(value));
                setCurrentMonth(newDate);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.length > 0 ? (
                  availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))
                ) : (
                  <SelectItem value={new Date().getFullYear().toString()}>
                    {new Date().getFullYear()}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousMonth}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          
          <h3 className="text-lg font-medium">{currentMonthName}</h3>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextMonth}
            className="flex items-center gap-1"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Current Month Summary */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4">
            <YearlySummaryCard 
              title="Month Income" 
              amount={currentMonthData.income} 
              className="bg-emerald-50 border-emerald-100" 
            />
            <YearlySummaryCard 
              title="Month Expenses" 
              amount={currentMonthData.expenses} 
              className="bg-rose-50 border-rose-100" 
            />
            <YearlySummaryCard 
              title="Month Savings" 
              amount={currentMonthData.savings} 
              className={currentMonthData.savings >= 0 
                ? "bg-blue-50 border-blue-100" 
                : "bg-amber-50 border-amber-100"
              } 
            />
          </div>
        </div>
        
        {/* Year Summary */}
        <div className="mb-6 pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Year Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <YearlySummaryCard 
              title="Total Income" 
              amount={yearlyTotals.income} 
              className="bg-emerald-50 border-emerald-100" 
            />
            <YearlySummaryCard 
              title="Total Expenses" 
              amount={yearlyTotals.expenses} 
              className="bg-rose-50 border-rose-100" 
            />
            <YearlySummaryCard 
              title="Net Savings" 
              amount={yearlyTotals.savings} 
              className={yearlyTotals.savings >= 0 
                ? "bg-blue-50 border-blue-100" 
                : "bg-amber-50 border-amber-100"
              } 
            />
          </div>
        </div>

        <div className="h-[300px] mt-4">
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No data available for {selectedYear}</p>
            </div>
          ) : (
            <ChartContainer
              className="h-full"
              config={{
                income: {
                  label: "Income",
                  theme: {
                    light: "#10b981",
                    dark: "#10b981"
                  }
                },
                expenses: {
                  label: "Expenses",
                  theme: {
                    light: "#ef4444",
                    dark: "#ef4444"
                  }
                },
                savings: {
                  label: "Savings",
                  theme: {
                    light: "#3b82f6",
                    dark: "#3b82f6"
                  }
                }
              }}
            >
              <BarChart
                data={monthlyData}
                margin={{
                  top: 20,
                  right: 30,
                  left: isMobile ? 0 : 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => `$${Math.abs(value) >= 1000 
                    ? `${(value / 1000).toFixed(0)}k` 
                    : value}`} 
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10b981" />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                <Bar dataKey="savings" name="Savings" fill="#3b82f6" />
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface YearlySummaryCardProps {
  title: string;
  amount: number;
  className?: string;
}

const YearlySummaryCard = ({ title, amount, className }: YearlySummaryCardProps) => {
  return (
    <div className={`rounded-xl border p-3 transition-all ${className}`}>
      <div className="text-sm font-medium text-muted-foreground mb-1">{title}</div>
      <p className="text-lg font-semibold number-display">
        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
};

export default MonthlyDashboard;
