
import React, { useState } from 'react';
import { useBudget, Budget } from '@/context/BudgetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const BudgetOverview = () => {
  const { budgets, categories, addBudget } = useBudget();
  const [open, setOpen] = useState(false);
  
  const [newBudget, setNewBudget] = useState<Partial<Budget>>({
    category: '',
    amount: 0,
    spent: 0
  });
  
  const [error, setError] = useState('');
  
  const availableCategories = categories
    .filter(category => !['Salary', 'Investments', 'Side Hustle', 'Refunds'].includes(category))
    .filter(category => !budgets.some(budget => budget.category === category));
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBudget.category) {
      setError('Please select a category');
      return;
    }
    
    if (!newBudget.amount || newBudget.amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    addBudget({
      category: newBudget.category,
      amount: Number(newBudget.amount),
      spent: 0
    });
    
    setNewBudget({
      category: '',
      amount: 0,
      spent: 0
    });
    
    setOpen(false);
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Track your spending against budget limits</CardDescription>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>Add Budget</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>Set a spending limit for a category</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newBudget.category}
                  onValueChange={(value) => {
                    setNewBudget({ ...newBudget, category: value });
                    setError('');
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.length === 0 ? (
                      <SelectItem value="" disabled>
                        All categories have budgets
                      </SelectItem>
                    ) : (
                      availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Monthly Budget Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-7"
                    value={newBudget.amount || ''}
                    onChange={(e) => {
                      setNewBudget({ ...newBudget, amount: parseFloat(e.target.value) || 0 });
                      setError('');
                    }}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Budget</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No budgets set yet</p>
            <p className="text-sm mt-1">Add a budget to start tracking your spending</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4 stagger-animate">
              {budgets.map((budget) => (
                <BudgetItem key={budget.category} budget={budget} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

interface BudgetItemProps {
  budget: Budget;
}

const BudgetItem = ({ budget }: BudgetItemProps) => {
  const percentage = (budget.spent / budget.amount) * 100;
  const isOverBudget = percentage > 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="font-medium">{budget.category}</span>
          {isOverBudget && (
            <span className="ml-2 bg-destructive/10 text-destructive text-xs px-1.5 py-0.5 rounded-full">
              Over Budget
            </span>
          )}
        </div>
        <div className="text-sm number-display">
          <span className={cn(isOverBudget ? "text-destructive" : "text-muted-foreground")}>
            ${budget.spent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
          <span className="mx-1 text-muted-foreground">/</span>
          <span>${budget.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
        </div>
      </div>
      
      <Progress 
        value={Math.min(percentage, 100)} 
        className={cn(
          isOverBudget ? "bg-destructive/20" : "bg-muted", 
          "h-2"
        )}
        indicatorClassName={cn(
          isOverBudget ? "bg-destructive" : percentage > 80 ? "bg-amber-500" : "bg-primary"
        )}
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{percentage.toFixed(0)}% used</span>
        <span>${(budget.amount - budget.spent).toLocaleString('en-US', { maximumFractionDigits: 0 })} remaining</span>
      </div>
    </div>
  );
};

export default BudgetOverview;
