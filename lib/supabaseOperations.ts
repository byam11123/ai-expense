// lib/supabaseOperations.ts

import { Expense, ExpenseFormData } from '@/types/expense';
import { supabase } from './supabase';

export async function fetchAllExpenses(): Promise<Expense[]> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }

    // Transform the data to ensure date fields are properly formatted
    return data.map(item => ({
      id: item.id,
      total: parseFloat(item.total),
      currency: item.currency,
      category: item.category,
      vendor: item.vendor,
      date: item.date, // Supabase returns this as ISO string
      billingDate: item.billing_date, // Supabase returns this as ISO string
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) as Expense[];
  } catch (error) {
    console.error('Unexpected error fetching expenses:', error);
    throw error;
  }
}

export async function insertExpense(expenseData: ExpenseFormData): Promise<Expense> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        total: expenseData.total,
        currency: expenseData.currency,
        category: expenseData.category,
        vendor: expenseData.vendor,
        billing_date: expenseData.billingDate ? new Date(expenseData.billingDate.toString()).toISOString().split('T')[0] : null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting expense:', error);
      throw new Error(`Failed to insert expense: ${error.message}`);
    }

    // Transform the response to match our Expense type
    return {
      id: data.id,
      total: parseFloat(data.total),
      currency: data.currency,
      category: data.category,
      vendor: data.vendor,
      date: data.date, // Supabase returns this as ISO string
      billingDate: data.billing_date, // Supabase returns this as ISO string
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Expense;
  } catch (error) {
    console.error('Unexpected error inserting expense:', error);
    throw error;
  }
}

export async function updateExpense(id: string, expenseData: ExpenseFormData): Promise<Expense> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        total: expenseData.total,
        currency: expenseData.currency,
        category: expenseData.category,
        vendor: expenseData.vendor,
        billing_date: expenseData.billingDate ? new Date(expenseData.billingDate.toString()).toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      throw new Error(`Failed to update expense: ${error.message}`);
    }

    // Transform the response to match our Expense type
    return {
      id: data.id,
      total: parseFloat(data.total),
      currency: data.currency,
      category: data.category,
      vendor: data.vendor,
      date: data.date, // Supabase returns this as ISO string
      billingDate: data.billing_date, // Supabase returns this as ISO string
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Expense;
  } catch (error) {
    console.error('Unexpected error updating expense:', error);
    throw error;
  }
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
  } catch (error) {
    console.error('Unexpected error deleting expense:', error);
    throw error;
  }
}