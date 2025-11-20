'use client';

import { useState } from 'react';
import { Trash2, Edit3 } from 'lucide-react';
import ExpenseForm from './ExpenseForm';
import { Expense, ExpenseFormData } from '@/types/expense';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ExpenseTableProps {
  expenses: Expense[];
  onRemoveExpense: (id: string) => void;
  onUpdateExpense: (id: string, expense: Expense) => void;
}

export default function ExpenseTable({ expenses, onRemoveExpense, onUpdateExpense }: ExpenseTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Expense | null>(null);

  const startEditing = (expense: Expense) => {
    setEditData(expense);
    setEditingId(expense.id);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleUpdateExpense = (updatedFormData: ExpenseFormData) => {
    if (editData) {
      onUpdateExpense(editData.id, {
        ...editData, // Keep existing id and date
        total: updatedFormData.total,
        currency: updatedFormData.currency,
        category: updatedFormData.category,
        vendor: updatedFormData.vendor,
        billingDate: updatedFormData.billingDate || editData.billingDate
      });
      setEditingId(null);
      setEditData(null);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
    return formatter.format(amount);
  };

  // Group expenses by category for summary
  const categoryTotals = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = { total: 0, count: 0 };
    }
    acc[expense.category].total += expense.total;
    acc[expense.category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.total, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Billing Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No expenses recorded yet
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    {editingId === expense.id ? (
                      <TableCell colSpan={5}>
                        <ExpenseForm
                          initialData={editData}
                          onAddExpense={handleUpdateExpense}
                          onCancelEdit={cancelEditing}
                        />
                      </TableCell>
                    ) : (
                      <>
                        <TableCell className="font-medium">{expense.vendor}</TableCell>
                        <TableCell>{formatCurrency(expense.total, expense.currency)}</TableCell>
                        <TableCell>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300">
                            {expense.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          {expense.billingDate ? (expense.billingDate instanceof Date ? expense.billingDate.toLocaleDateString() : typeof expense.billingDate === 'string' ? new Date(expense.billingDate).toLocaleDateString() : new Date(expense.date).toLocaleDateString()) : new Date(expense.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => startEditing(expense)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onRemoveExpense(expense.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expense Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">By Category</h4>
                <ul className="space-y-2">
                  {Object.entries(categoryTotals).map(([category, data]) => (
                    <li key={category} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{category}</span>
                      <span className="font-medium">
                        {formatCurrency(data.total, expenses[0]?.currency || 'USD')}
                        <span className="text-sm text-gray-500 ml-2">({data.count} items)</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Expenses</span>
                  <span className="text-2xl font-bold">
                    {formatCurrency(totalExpenses, expenses[0]?.currency || 'USD')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}