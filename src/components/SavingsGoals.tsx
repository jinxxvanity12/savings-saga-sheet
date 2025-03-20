import React, { useState } from 'react';
import { useBudget, SavingsGoal } from '@/context/BudgetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Trash2, Target, PiggyBank } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO, isPast } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const SavingsGoals = () => {
  const { savingsGoals, addSavingsGoal, deleteSavingsGoal, contributeSavingsGoal } = useBudget();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showContribute, setShowContribute] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
  });
  const [contribution, setContribution] = useState('');
  const isMobile = useIsMobile();

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGoal.name || !newGoal.targetAmount) return;
    
    addSavingsGoal({
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      deadline: newGoal.deadline || undefined,
    });
    
    setNewGoal({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      deadline: '',
    });
    
    setShowAddGoal(false);
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showContribute || !contribution) return;
    
    contributeSavingsGoal(showContribute, parseFloat(contribution));
    
    setContribution('');
    setShowContribute(null);
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Savings Goals</CardTitle>
            <CardDescription>Track progress towards your financial goals</CardDescription>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => setShowAddGoal(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Goal</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          {savingsGoals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No savings goals yet</p>
              <p className="text-sm mt-1">Add a goal to start tracking your progress</p>
            </div>
          ) : (
            <div className="space-y-4 stagger-animate">
              {savingsGoals.map((goal) => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onDelete={deleteSavingsGoal}
                  onContribute={() => setShowContribute(goal.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Savings Goal</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddGoal} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="goal-name">Goal Name</Label>
              <Input 
                id="goal-name"
                placeholder="e.g., New Car, Vacation"
                value={newGoal.name}
                onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target-amount">Target Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">$</span>
                <Input 
                  id="target-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="current-amount">Current Amount (Optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">$</span>
                <Input 
                  id="current-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, currentAmount: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Target Date (Optional)</Label>
              <Input 
                id="deadline"
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
            
            <DialogFooter>
              <Button type="submit">Add Goal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!showContribute} onOpenChange={(open) => !open && setShowContribute(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contribute to Goal</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleContribute} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="contribution-amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">$</span>
                <Input 
                  id="contribution-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">Contribute</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

interface GoalCardProps {
  goal: SavingsGoal;
  onDelete: (id: string) => void;
  onContribute: () => void;
}

const GoalCard = ({ goal, onDelete, onContribute }: GoalCardProps) => {
  const [showDelete, setShowDelete] = useState(false);
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(goal.id);
  };
  
  const progressPercentage = Math.min(
    100,
    ((goal.currentAmount / goal.targetAmount) * 100)
  );
  
  const isCompleted = progressPercentage >= 100;
  
  return (
    <div 
      className={cn(
        "border rounded-lg p-4 transition-all relative",
        isCompleted ? "bg-emerald-50 border-emerald-100" : "hover:border-primary/50"
      )}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      onTouchStart={() => setShowDelete(true)}
      onTouchEnd={() => setTimeout(() => setShowDelete(false), 3000)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <PiggyBank className="h-5 w-5 text-emerald-500" />
          ) : (
            <Target className="h-5 w-5 text-primary" />
          )}
          <h3 className="font-medium">{goal.name}</h3>
        </div>
        
        {showDelete && (
          <button
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive transition-colors p-1"
            aria-label="Delete goal"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="flex justify-between items-baseline mb-1 text-sm">
        <span className="text-muted-foreground">
          ${goal.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          {' of '}
          ${goal.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="font-medium">{Math.round(progressPercentage)}%</span>
      </div>
      
      <Progress
        value={progressPercentage}
        className={cn("h-1.5 mb-3", isCompleted ? "bg-emerald-100" : "bg-muted")}
      />
      
      {goal.deadline && (
        <div className="text-xs text-muted-foreground mb-2">
          {isPast(parseISO(goal.deadline)) ? 
            <span className="text-amber-500">Deadline passed: {format(parseISO(goal.deadline), 'MMM d, yyyy')}</span> :
            <span>Deadline: {format(parseISO(goal.deadline), 'MMM d, yyyy')}</span>
          }
        </div>
      )}
      
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "w-full mt-1",
          isCompleted && "bg-emerald-100 hover:bg-emerald-200 border-emerald-200"
        )}
        onClick={onContribute}
        disabled={isCompleted}
      >
        {isCompleted ? "Completed!" : "Contribute"}
      </Button>
    </div>
  );
};

export default SavingsGoals;
