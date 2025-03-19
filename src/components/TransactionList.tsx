
import React, { useState } from 'react';
import { useBudget, Transaction } from '@/context/BudgetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpCircle, ArrowDownCircle, Search, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const TransactionList = () => {
  const { transactions, deleteTransaction } = useBudget();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (filter !== 'all' && transaction.type !== filter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        transaction.description.toLowerCase().includes(term) ||
        transaction.category.toLowerCase().includes(term) ||
        transaction.amount.toString().includes(term)
      );
    }
    
    return true;
  });

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className={cn(
          "flex items-center",
          isMobile ? "flex-col gap-3" : "justify-between"
        )}>
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Your recent financial activity</CardDescription>
          </div>
          
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8 w-full md:w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expense">Expenses</TabsTrigger>
          </TabsList>
          
          <TabsContent value={filter} className="mt-0">
            <ScrollArea className="h-[350px] pr-4">
              {filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <p>No transactions found</p>
                  {searchTerm && <p className="text-sm">Try adjusting your search</p>}
                </div>
              ) : (
                <div className="space-y-1 stagger-animate">
                  {filteredTransactions.map((transaction) => (
                    <TransactionItem 
                      key={transaction.id} 
                      transaction={transaction} 
                      onDelete={deleteTransaction}
                      isMobile={isMobile}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  isMobile?: boolean;
}

const TransactionItem = ({ transaction, onDelete, isMobile }: TransactionItemProps) => {
  const [showDelete, setShowDelete] = useState(false);
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(transaction.id);
  };
  
  const formattedDate = format(parseISO(transaction.date), 'MMM d');
  
  return (
    <div 
      className="transaction-item rounded-md"
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      onTouchStart={() => setShowDelete(true)}
      onTouchEnd={() => setTimeout(() => setShowDelete(false), 3000)}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex items-center justify-center h-9 w-9 rounded-full flex-shrink-0",
          transaction.type === 'income' ? "bg-emerald-100" : "bg-rose-100"
        )}>
          {transaction.type === 'income' ? (
            <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
          ) : (
            <ArrowDownCircle className="h-5 w-5 text-rose-600" />
          )}
        </div>
        
        <div className={isMobile ? "flex-1 truncate" : ""}>
          <p className="font-medium leading-none">{transaction.description}</p>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <span>{transaction.category}</span>
            <span className="mx-1.5">•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <p className={cn(
          "font-medium number-display whitespace-nowrap",
          transaction.type === 'income' ? "text-emerald-600" : "text-rose-600"
        )}>
          {transaction.type === 'income' ? '+' : '-'}
          ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        
        {showDelete && (
          <button
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive transition-colors p-1"
            aria-label="Delete transaction"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
