export interface Transaction {
  date: string;
  reference: string;
  description: string;
  vat: string;
  amount: number;
  category?: string;
  isRegular?: boolean;
  project?: string;
}

export interface FinancialData {
  accountsReceivable: Transaction[];
  bankTransactions: Transaction[];
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

export interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  transactions: Transaction[];
  isExpense: boolean;
}

export interface ProjectData {
  name: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  weeks: number;
  transactions: Transaction[];
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  netProfit: number;
}