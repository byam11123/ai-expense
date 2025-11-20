'use client';

import { useState, useEffect } from 'react';
import UploadReceipt from '@/components/UploadReceipt';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseTable from '@/components/ExpenseTable';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Expense, ExpenseFormData } from '@/types/expense';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { fetchAllExpenses, insertExpense, updateExpense, deleteExpense } from '@/lib/supabaseOperations';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Load expenses from Supabase on component mount
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoadingInitial(true);
        const fetchedExpenses = await fetchAllExpenses();
        setExpenses(fetchedExpenses);
      } catch (error) {
        console.error('Error loading expenses:', error);
        // You might want to show an error message to the user
      } finally {
        setLoadingInitial(false);
      }
    };

    loadExpenses();
  }, []);

  // Function to handle expense extraction from image
  const handleExtractionComplete = async (expenseData: ExpenseFormData) => {
    try {
      const newExpense = await insertExpense(expenseData);
      setExpenses(prev => [newExpense, ...prev]);
    } catch (error) {
      console.error('Error saving extracted expense:', error);
      // You might want to show an error message to the user
    }
  };

  // Function to add a new expense manually
  const handleAddExpense = async (expenseData: ExpenseFormData) => {
    try {
      const newExpense = await insertExpense(expenseData);
      setExpenses(prev => [newExpense, ...prev]);
    } catch (error) {
      console.error('Error saving manual expense:', error);
      // You might want to show an error message to the user
    }
  };

  // Function to remove an expense
  const handleRemoveExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      // You might want to show an error message to the user
    }
  };

  // Function to update an expense
  const handleUpdateExpense = async (id: string, updatedExpense: Expense) => {
    try {
      // Extract the form data from the updated expense
      const expenseFormData: ExpenseFormData = {
        total: updatedExpense.total,
        currency: updatedExpense.currency,
        category: updatedExpense.category,
        vendor: updatedExpense.vendor,
        billingDate: updatedExpense.billingDate
      };

      const updated = await updateExpense(id, expenseFormData);
      setExpenses(prev =>
        prev.map(expense => expense.id === id ? updated : expense)
      );
    } catch (error) {
      console.error('Error updating expense:', error);
      // You might want to show an error message to the user
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex min-h-screen w-full max-w-6xl flex-col items-center mx-auto px-4 py-8 justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4">Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full max-w-6xl flex-col items-center mx-auto px-4 py-8">
      {/* Header */}
      <header className="w-full flex justify-between items-center py-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          AI Expense Snap
        </h1>
        <ThemeToggle />
      </header>

      <main className="w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Receipt</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && (
                  <Alert className="mb-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertTitle>Processing Image</AlertTitle>
                    <AlertDescription>
                      Please wait while we extract the expense data from your receipt. This may take a few seconds.
                    </AlertDescription>
                  </Alert>
                )}
                <UploadReceipt
                  onExtractionComplete={handleExtractionComplete}
                  onLoadingChange={setLoading}
                />
              </CardContent>
            </Card>

            {/* Manual Entry Section */}
            <Card>
              <CardHeader>
                <CardTitle>Add Expense Manually</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseForm onAddExpense={handleAddExpense} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Expenses Table */}
            <ExpenseTable
              expenses={expenses}
              onRemoveExpense={handleRemoveExpense}
              onUpdateExpense={handleUpdateExpense}
            />
          </div>
        </div>
      </main>

      <footer className="w-full py-6 mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>AI Expense Snap &copy; {new Date().getFullYear()} - Automatically extract expense data from receipts</p>
      </footer>
    </div>
  );
}