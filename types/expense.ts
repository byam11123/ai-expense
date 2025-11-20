// types/expense.ts

export type DateOrString = Date | string;

export interface Expense {
  id: string;
  total: number;
  currency: string;
  category: string;
  vendor: string;
  date: Date; // The date when the expense was added to the system
  billingDate?: DateOrString; // The actual billing date from the receipt
}

export interface ExpenseFormData {
  total: number;
  currency: string;
  category: string;
  vendor: string;
  billingDate?: DateOrString;
}