import React, { useState } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { Button } from '@/components/ui/button';
import { FileDown, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type SortOption = 'category' | 'date' | 'amount';
type SortDirection = 'asc' | 'desc';

const ExpenseExport = () => {
  const { transactions, categories, currentMonth } = useBudget();
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories);
  const [includeChart, setIncludeChart] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  
  const handleSelectAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...categories]);
    }
  };
  
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  const filterAndSortTransactions = () => {
    const expenses = transactions.filter(t => 
      t.type === 'expense' && selectedCategories.includes(t.category)
    );
    
    return expenses.sort((a, b) => {
      if (sortBy === 'category') {
        const categoryCompare = a.category.localeCompare(b.category);
        return sortDirection === 'asc' ? categoryCompare : -categoryCompare;
      } else if (sortBy === 'amount') {
        return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      } else { // date
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  };
  
  const calculateCategorySums = () => {
    const expenses = transactions.filter(t => 
      t.type === 'expense' && selectedCategories.includes(t.category)
    );
    
    const sums: Record<string, number> = {};
    expenses.forEach(exp => {
      if (!sums[exp.category]) sums[exp.category] = 0;
      sums[exp.category] += exp.amount;
    });
    
    return sums;
  };
  
  const generatePDF = async () => {
    toast.info('Preparing PDF export...');
    
    try {
      const element = document.getElementById('export-content');
      if (!element) {
        toast.error('Could not find content to export');
        return;
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const filename = `expenses_${format(currentMonth, 'yyyy_MM')}.pdf`;
      
      pdf.save(filename);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };
  
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Expenses</DialogTitle>
            <DialogDescription>
              Customize and export your expense breakdown as a PDF
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Sort By</Label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as SortDirection)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Categories</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-8"
                  onClick={handleSelectAllCategories}
                >
                  {selectedCategories.length === categories.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {categories
                  .filter(category => {
                    return transactions.some(t => t.type === 'expense' && t.category === category);
                  })
                  .map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-${category}`} 
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <label 
                        htmlFor={`category-${category}`}
                        className="text-sm cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))
                }
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Include</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-chart" 
                    checked={includeChart}
                    onCheckedChange={() => setIncludeChart(!includeChart)}
                  />
                  <label htmlFor="include-chart" className="text-sm cursor-pointer">Pie Chart</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-summary" 
                    checked={includeSummary}
                    onCheckedChange={() => setIncludeSummary(!includeSummary)}
                  />
                  <label htmlFor="include-summary" className="text-sm cursor-pointer">Category Summary</label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Preview</h3>
            
            <div id="export-content" className="bg-white p-6 rounded-lg">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Expense Report</h2>
                <p className="text-sm text-muted-foreground">
                  {format(currentMonth, 'MMMM yyyy')}
                </p>
              </div>
              
              {includeSummary && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-2">Category Summary</h3>
                  <div className="space-y-2">
                    {Object.entries(calculateCategorySums()).map(([category, sum]) => (
                      <div key={category} className="flex justify-between text-sm">
                        <span>{category}</span>
                        <span className="font-medium">${sum.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
                      <span>Total</span>
                      <span>
                        ${Object.values(calculateCategorySums()).reduce((a, b) => a + b, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {includeChart && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-2">Expense Breakdown</h3>
                  <div className="text-center py-6 text-muted-foreground text-sm italic">
                    [Pie chart will be included in the PDF]
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-md font-semibold mb-2">Expense Details</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Description</th>
                      <th className="text-left py-2">Category</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterAndSortTransactions().slice(0, 5).map((expense, index) => (
                      <tr key={index} className="border-b border-dashed">
                        <td className="py-2">{format(new Date(expense.date), 'MMM d, yyyy')}</td>
                        <td className="py-2">{expense.description}</td>
                        <td className="py-2">{expense.category}</td>
                        <td className="py-2 text-right">${expense.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                    {filterAndSortTransactions().length > 5 && (
                      <tr>
                        <td colSpan={4} className="text-center py-3 text-muted-foreground italic">
                          [Full transaction list will be included in the PDF]
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={generatePDF} className="gap-2">
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpenseExport;
