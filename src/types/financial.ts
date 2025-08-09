export interface Transaction {
  id: number;
  date: string;
  reference: string;
  description: string;
  vat: string;
  amount: number;
  category?: string;
  isRegular?: boolean;
  project?: string;
}

export interface ReceivableInvoice {
  invoiceId: string;
  client: string;
  issueDate: string;
  invoicedAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  daysOutstanding: number;
}

export interface ReceivablesData {
  totalOutstanding: number;
  invoices: ReceivableInvoice[];
}

export interface FinancialData {
  allTransactions: Transaction[];
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  currentBalance: number;
  outstandingReceivables: number;
  receivables?: ReceivablesData;
}

export interface CategoryData {
  name: string;
  revenue: number;
  expenses: number;
  transactions: Transaction[];
  isExpense: boolean;
}

export interface ProjectData {
  name: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  roi: number;
  status: string;
  transactions: Transaction[];
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  netProfit: number;
}
