
import React, { useState } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, X, Edit, Save } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const CategoryEditor = () => {
  const { categories, updateCategory, addCategory, deleteCategory } = useBudget();
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{index: number, value: string} | null>(null);

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    if (categories.includes(newCategory.trim())) {
      toast.error('Category already exists');
      return;
    }
    
    addCategory(newCategory.trim());
    setNewCategory('');
  };

  const handleUpdateCategory = (index: number) => {
    if (!editingCategory) return;
    
    if (!editingCategory.value.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    if (categories.includes(editingCategory.value.trim()) && editingCategory.value.trim() !== categories[index]) {
      toast.error('Category already exists');
      return;
    }
    
    updateCategory(index, editingCategory.value.trim());
    setEditingCategory(null);
  };

  const handleDeleteCategory = (index: number) => {
    const category = categories[index];
    deleteCategory(index);
    toast.success(`Category "${category}" deleted`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Management</CardTitle>
        <CardDescription>Add, edit or remove transaction categories</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Input
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" onClick={handleAddCategory}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                {editingCategory?.index === index ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      value={editingCategory.value}
                      onChange={(e) => setEditingCategory({ ...editingCategory, value: e.target.value })}
                      className="flex-1"
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={() => setEditingCategory(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => handleUpdateCategory(index)}>
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span>{category}</span>
                    <div>
                      <Button size="sm" variant="ghost" onClick={() => setEditingCategory({ index, value: category })}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive" 
                        onClick={() => handleDeleteCategory(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CategoryEditor;
