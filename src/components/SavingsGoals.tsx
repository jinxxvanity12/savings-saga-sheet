
import React, { useState } from 'react';
import { useBudget, SavingsGoal } from '@/context/BudgetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, CalendarIcon, Trash2, PiggyBank, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const SavingsGoals = () => {
  const { savingsGoals, addSavingsGoal, deleteSavingsGoal, contributeSavingsGoal } = useBudget();
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: undefined as Date | undefined
  });
  
  const [contribution, setContribution] = useState('');
  
  const selectedGoal = selectedGoalId 
    ? savingsGoals.find(goal => goal.id === selectedGoalId) 
    : null;
  
  const handleNewGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGoal.name || !newGoal.targetAmount || isNaN(parseFloat(newGoal.targetAmount)) || parseFloat(newGoal.targetAmount) <= 0) {
      return;
    }
    
    addSavingsGoal({
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      deadline: newGoal.deadline ? format(newGoal.deadline, 'yyyy-MM-dd') : undefined
    });
    
    setNewGoal({
      name: '',
      targetAmount: '',
      deadline: undefined
    });
    
    setNewGoalOpen(false);
  };
  
  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGoalId || !contribution || isNaN(parseFloat(contribution)) || parseFloat(contribution) <= 0) {
      return;
    }
    
    contributeSavingsGoal(selectedGoalId, parseFloat(contribution));
    setContribution('');
    setContributeOpen(false);
  };
  
  const openContributeDialog = (id: string) => {
    setSelectedGoalId(id);
    setContributeOpen(true);
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Savings Goals</CardTitle>
          <CardDescription>Track progress towards your financial targets</CardDescription>
        </div>
        
        <Dialog open={newGoalOpen} onOpenChange={setNewGoalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>New Goal</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
              <DialogDescription>Set a target to save towards</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleNewGoalSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  placeholder="e.g., Vacation, Emergency Fund"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-amount">Target Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input
                    id="target-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-7"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Target Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newGoal.deadline ? (
                        format(newGoal.deadline, 'PPP')
                      ) : (
                        <span>Pick a target date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newGoal.deadline}
                      onSelect={(date) => setNewGoal({ ...newGoal, deadline: date })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setNewGoalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Goal</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {savingsGoals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No savings goals yet</p>
            <p className="text-sm mt-1">Create a goal to start tracking your progress</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-5 stagger-animate">
              {savingsGoals.map((goal) => (
                <SavingsGoalItem 
                  key={goal.id} 
                  goal={goal} 
                  onDelete={deleteSavingsGoal}
                  onContribute={() => openContributeDialog(goal.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      
      <Dialog open={contributeOpen} onOpenChange={setContributeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make a Contribution</DialogTitle>
            <DialogDescription>
              Add to your {selectedGoal?.name} savings goal
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleContribute} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="contribution-amount">Contribution Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">$</span>
                <Input
                  id="contribution-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-7"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setContributeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Contribution</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

interface SavingsGoalItemProps {
  goal: SavingsGoal;
  onDelete: (id: string) => void;
  onContribute: () => void;
}

const SavingsGoalItem = ({ goal, onDelete, onContribute }: SavingsGoalItemProps) => {
  const [showActions, setShowActions] = useState(false);
  
  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
  const isComplete = percentage >= 100;
  
  return (
    <div 
      className="rounded-lg border p-4 transition-all"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium">{goal.name}</h4>
          {goal.deadline && (
            <p className="text-xs text-muted-foreground">
              Target: {format(new Date(goal.deadline), 'MMM d, yyyy')}
            </p>
          )}
        </div>
        
        {showActions && (
          <div className="flex gap-1">
            <button
              onClick={onContribute}
              className="p-1 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Contribute to goal"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Delete goal"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Progress 
          value={Math.min(percentage, 100)} 
          className="h-2"
          indicatorClassName={isComplete ? "bg-emerald-500" : undefined}
        />
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <PiggyBank className={cn(
              "h-4 w-4",
              isComplete ? "text-emerald-500" : "text-primary"
            )} />
            <span className="text-sm number-display">
              ${goal.currentAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              <span className="text-muted-foreground mx-1">/</span>
              ${goal.targetAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
          
          <span className={cn(
            "text-xs font-medium",
            isComplete ? "text-emerald-500" : "text-muted-foreground"
          )}>
            {isComplete ? 'Completed!' : `${percentage.toFixed(0)}% complete`}
          </span>
        </div>
        
        {!isComplete && (
          <div className="pt-2">
            <Button onClick={onContribute} size="sm" variant="outline" className="w-full">
              Contribute
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsGoals;
