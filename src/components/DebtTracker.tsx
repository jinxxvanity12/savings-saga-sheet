
import React, { useState } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, CreditCard, DollarSign, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const DebtTracker = () => {
  const { debts, addDebt, updateDebt, deleteDebt, makeDebtPayment } = useBudget();
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [isPayingDebt, setIsPayingDebt] = useState<string | null>(null);
  
  const [newDebt, setNewDebt] = useState({
    name: '',
    totalAmount: '',
    interestRate: '',
    dueDate: ''
  });
  
  const [paymentAmount, setPaymentAmount] = useState('');

  const handleAddDebt = () => {
    if (!newDebt.name.trim()) {
      toast.error('Please provide a name for this debt');
      return;
    }
    
    const amount = Number(newDebt.totalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    const interestRate = newDebt.interestRate ? Number(newDebt.interestRate) : 0;
    if (isNaN(interestRate) || interestRate < 0) {
      toast.error('Please enter a valid interest rate');
      return;
    }
    
    addDebt({
      name: newDebt.name.trim(),
      totalAmount: amount,
      paidAmount: 0,
      interestRate: interestRate,
      dueDate: newDebt.dueDate || undefined,
    });
    
    // Reset form
    setNewDebt({
      name: '',
      totalAmount: '',
      interestRate: '',
      dueDate: ''
    });
    
    setIsAddingDebt(false);
  };

  const handleMakePayment = (id: string) => {
    const payment = Number(paymentAmount);
    if (isNaN(payment) || payment <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    
    if (payment > (debt.totalAmount - debt.paidAmount)) {
      toast.error('Payment amount exceeds remaining debt');
      return;
    }
    
    makeDebtPayment(id, payment);
    setPaymentAmount('');
    setIsPayingDebt(null);
  };

  const calculateProgress = (debt: { totalAmount: number; paidAmount: number }) => {
    return (debt.paidAmount / debt.totalAmount) * 100;
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Debt Tracker</CardTitle>
            <CardDescription>Track and manage your debts</CardDescription>
          </div>
          <Dialog open={isAddingDebt} onOpenChange={setIsAddingDebt}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Debt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Debt</DialogTitle>
                <DialogDescription>
                  Enter the details of your debt to start tracking it
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="debt-name" className="text-sm font-medium">Debt Name</label>
                  <Input
                    id="debt-name"
                    placeholder="Credit Card, Mortgage, Student Loan, etc."
                    value={newDebt.name}
                    onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="debt-amount" className="text-sm font-medium">Total Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      id="debt-amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-7"
                      value={newDebt.totalAmount}
                      onChange={(e) => setNewDebt({ ...newDebt, totalAmount: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="interest-rate" className="text-sm font-medium">Interest Rate (%)</label>
                  <div className="relative">
                    <Input
                      id="interest-rate"
                      type="number"
                      placeholder="0.00"
                      value={newDebt.interestRate}
                      onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })}
                    />
                    <span className="absolute right-3 top-2.5">%</span>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="due-date" className="text-sm font-medium">Due Date (Optional)</label>
                  <Input
                    id="due-date"
                    type="date"
                    value={newDebt.dueDate}
                    onChange={(e) => setNewDebt({ ...newDebt, dueDate: e.target.value })}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingDebt(false)}>Cancel</Button>
                <Button onClick={handleAddDebt}>Add Debt</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {debts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="mx-auto h-12 w-12 opacity-20 mb-2" />
            <p>No debts added yet</p>
            <p className="text-sm mt-1">Add a debt to start tracking your payments</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {debts.map((debt) => (
                <div key={debt.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{debt.name}</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-destructive" 
                      onClick={() => deleteDebt(debt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-col space-y-1 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="font-medium">${debt.totalAmount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paid Amount:</span>
                      <span className="font-medium">${debt.paidAmount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span className="font-medium">${(debt.totalAmount - debt.paidAmount).toLocaleString()}</span>
                    </div>
                    
                    {debt.interestRate > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Interest Rate:</span>
                        <span className="font-medium">{debt.interestRate}%</span>
                      </div>
                    )}
                    
                    {debt.dueDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="font-medium">{format(new Date(debt.dueDate), 'PP')}</span>
                      </div>
                    )}
                  </div>
                  
                  <Progress value={calculateProgress(debt)} className="h-2 mb-3" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {calculateProgress(debt).toFixed(1)}% paid
                    </span>
                    
                    <Dialog open={isPayingDebt === debt.id} onOpenChange={(open) => setIsPayingDebt(open ? debt.id : null)}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Make Payment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Make a Payment</DialogTitle>
                          <DialogDescription>
                            Enter the amount you want to pay towards {debt.name}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="py-4">
                          <div className="space-y-2">
                            <label htmlFor="payment-amount" className="text-sm font-medium">Payment Amount</label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5">$</span>
                              <Input
                                id="payment-amount"
                                type="number"
                                placeholder="0.00"
                                className="pl-7"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm text-muted-foreground">
                            Remaining balance: ${(debt.totalAmount - debt.paidAmount).toLocaleString()}
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsPayingDebt(null)}>Cancel</Button>
                          <Button onClick={() => handleMakePayment(debt.id)}>Make Payment</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtTracker;
