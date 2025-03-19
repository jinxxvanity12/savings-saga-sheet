
import React, { useState, useMemo } from 'react';
import { useBudget, Transaction } from '@/context/BudgetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parse, isValid, getYear, getMonth, startOfMonth, endOfMonth } from 'date-fns';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';

type MonthData = {
  name: string;
  income: number;
  expenses: number;
  savings: number;
  month: string;
};

const MonthlyDashboard = () => {
  const { transactions } = useBudget();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const isMobile = useIsMobile();
  
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
    return Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort descending
  }, [transactions]);

  // If no transactions or selected year not in available years, default to current year
  const currentYear = new Date().getFullYear().toString();
  const yearToUse = availableYears.includes(selectedYear) ? selectedYear : 
                    (availableYears.length > 0 ? availableYears[0] : currentYear);
                   
  // Calculate monthly data
  const monthlyData = useMemo(() => {
    // Initialize array for all 12 months
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(parseInt(yearToUse), i, 1);
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
      if (year.toString() !== yearToUse) return;
      
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
  }, [transactions, yearToUse]);

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

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>Track your finances over time</CardDescription>
          </div>
          
          <Select
            value={yearToUse}
            onValueChange={setSelectedYear}
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
                <SelectItem value={currentYear}>{currentYear}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
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
              <p>No data available for {yearToUse}</p>
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
