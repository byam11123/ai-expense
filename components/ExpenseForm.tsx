'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { ExpenseFormData } from '@/types/expense';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExpenseFormProps {
  onAddExpense: (expense: ExpenseFormData) => void;
  initialData?: ExpenseFormData | null;
  onCancelEdit?: () => void;
}

const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Other'
];

export default function ExpenseForm({ onAddExpense, initialData = null, onCancelEdit }: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    total: initialData?.total || 0,
    currency: initialData?.currency || 'USD',
    category: initialData?.category || 'Food',
    vendor: initialData?.vendor || '',
    billingDate: initialData?.billingDate || undefined
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'total' ? Number(value) : name === 'billingDate' ? value || undefined : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense(formData);
    
    // Reset form if not in edit mode
    if (!initialData) {
      setFormData({
        total: 0,
        currency: 'USD',
        category: 'Food',
        vendor: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor Name</Label>
          <Input
            type="text"
            id="vendor"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            required
            placeholder="Enter vendor name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="total">Total Amount</Label>
          <Input
            type="number"
            id="total"
            name="total"
            value={formData.total || ''}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select name="currency" value={formData.currency} onValueChange={(value) => handleSelectChange('currency', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="JPY">JPY (¥)</SelectItem>
              <SelectItem value="CAD">CAD (C$)</SelectItem>
              <SelectItem value="AUD">AUD (A$)</SelectItem>
              <SelectItem value="INR">INR (₹)</SelectItem>
              <SelectItem value="CNY">CNY (¥)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="billingDate">Billing Date</Label>
          <Input
            type="date"
            id="billingDate"
            name="billingDate"
            value={typeof formData.billingDate === 'string' ? formData.billingDate : formData.billingDate instanceof Date ? formData.billingDate.toISOString().split('T')[0] : ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        {onCancelEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelEdit}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
        >
          {initialData ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
}