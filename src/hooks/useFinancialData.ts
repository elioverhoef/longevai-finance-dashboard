import { useState, useCallback, useEffect, useMemo } from 'react';
import { Transaction, FinancialData } from '../types/financial';
import { useSQLiteDB } from './useSQLiteDB';
import { parseCSVData } from '../lib/data-processor';
import { categoryKeywords } from '../config/categorization';

export const useFinancialData = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const { isReady, saveFinancialData, loadFinancialData, updateTransactionCategory: updateTransactionCategoryInDB, clearDatabase } = useSQLiteDB();

  const loadSampleData = useCallback(async () => {
    try {
      // First try to load pre-processed data
      const response = await fetch('/sample-db.json');
      if (response.ok) {
        const sampleData = await response.json();
        // Check if the sample data has actual transactions
        if (sampleData.allTransactions && sampleData.allTransactions.length > 1) {
          await saveFinancialData(sampleData);
          setData(sampleData);
          localStorage.setItem('longevai_sample_loaded', 'true');
          console.log('✅ Sample data loaded successfully');
          return true;
        }
      }

      // If pre-processed data is not available or empty, load CSV directly
      const csvResponse = await fetch('/export_202501..202512.csv');
      if (csvResponse.ok) {
        const csvContent = await csvResponse.text();
        const financialData = parseCSVData(csvContent);
        if (financialData.allTransactions.length > 0) {
          await saveFinancialData(financialData);
          setData(financialData);
          localStorage.setItem('longevai_sample_loaded', 'true');
          console.log('✅ Sample CSV data loaded successfully');
          return true;
        }
      }
    } catch (error) {
      console.warn('Sample data not available:', error);
      return false;
    }
    return false;
  }, [saveFinancialData]);

  const loadDataFromDB = useCallback(async () => {
    if (isReady) {
      setLoading(true);
      const dbData = loadFinancialData();

      if (!dbData && !localStorage.getItem('longevai_sample_loaded')) {
        // Try to load sample data if no data exists
        const sampleLoaded = await loadSampleData();
        if (!sampleLoaded) {
          setData(null);
        }
      } else {
        setData(dbData);
      }
      setLoading(false);
    }
  }, [isReady, loadFinancialData, loadSampleData]);

  useEffect(() => {
    loadDataFromDB();
  }, [isReady, loadDataFromDB]);

  const processAndSaveData = useCallback(async (csvContent: string) => {
    if (!isReady) {
      setError("Database not ready.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await clearDatabase();
      const financialData = parseCSVData(csvContent);
      await saveFinancialData(financialData);
      setData(financialData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse and save data';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isReady, saveFinancialData, clearDatabase]);

  const uploadCSV = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      await processAndSaveData(content);
      localStorage.removeItem('longevai_sample_loaded');
    };
    reader.readAsText(file);
  }, [processAndSaveData]);

  const updateTransactionCategory = useCallback((transactionId: number, newCategory: string) => {
    if (isReady) {
      updateTransactionCategoryInDB(transactionId, newCategory);
    }
    setData(currentData => {
      if (!currentData) return null;
      const updatedTransactions = currentData.allTransactions.map(t =>
        t.id === transactionId ? { ...t, category: newCategory } : t
      );
      return { ...currentData, allTransactions: updatedTransactions };
    });
  }, [isReady, updateTransactionCategoryInDB]);

  const filteredData = useMemo(() => {
    if (!data || !selectedMonth) return data;

    const filteredTransactions = data.allTransactions.filter(t => t.date.startsWith(selectedMonth));
    const totalRevenue = filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = Math.abs(filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

    return {
      ...data,
      allTransactions: filteredTransactions,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      currentBalance: totalRevenue - totalExpenses, // Note: This is balance for the period, not running balance
    };
  }, [data, selectedMonth]);

  const getDerivedData = useCallback((sourceData: FinancialData | null) => {
    if (!sourceData) {
      return { categoryData: [], projectData: [], monthlyData: [] };
    }

    const categoryMap = new Map<string, { revenue: number; expenses: number; transactions: Transaction[] }>();
    sourceData.allTransactions.forEach(t => {
      const categoryName = t.category || 'Uncategorized';
      const existing = categoryMap.get(categoryName) || { revenue: 0, expenses: 0, transactions: [] };
      if (t.amount > 0) existing.revenue += t.amount;
      else existing.expenses += Math.abs(t.amount);
      existing.transactions.push(t);
      categoryMap.set(categoryName, existing);
    });

    const categoryData = Array.from(categoryMap.entries()).map(([name, { revenue, expenses, transactions }]) => ({
      name, revenue, expenses, transactions, isExpense: expenses > revenue
    })).sort((a, b) => b.expenses - a.expenses);

    const projectMap = new Map<string, Transaction[]>();
    sourceData.allTransactions.forEach(t => {
      if (t.project) {
        const existing = projectMap.get(t.project) || [];
        projectMap.set(t.project, [...existing, t]);
      }
    });

    const projectData = Array.from(projectMap.entries()).map(([name, transactions]) => {
      const revenue = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
      const netProfit = revenue - expenses;
      const roi = expenses > 0 ? (netProfit / expenses) * 100 : revenue > 0 ? Infinity : 0;
      const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const lastTransactionDate = sortedTransactions.length > 0 ? new Date(sortedTransactions[0].date) : new Date(0);
      const daysSinceLastTransaction = (new Date().getTime() - lastTransactionDate.getTime()) / (1000 * 3600 * 24);
      const status = daysSinceLastTransaction <= 60 ? 'Active' : 'Completed';
      return { name, revenue, expenses, netProfit, roi, status, transactions };
    }).sort((a, b) => b.revenue - a.revenue);

    const monthlyMap = new Map<string, { revenue: number; expenses: number }>();
    sourceData.allTransactions.forEach(t => {
      const month = t.date.substring(0, 7);
      const existing = monthlyMap.get(month) || { revenue: 0, expenses: 0 };
      if (t.amount > 0) existing.revenue += t.amount;
      else existing.expenses += Math.abs(t.amount);
      monthlyMap.set(month, existing);
    });

    const monthlyData = Array.from(monthlyMap.entries())
      .map(([month, { revenue, expenses }]) => ({ month, revenue, expenses, netProfit: revenue - expenses }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { categoryData, projectData, monthlyData };
  }, []);

  const { categoryData, projectData, monthlyData } = useMemo(() => getDerivedData(filteredData), [filteredData, getDerivedData]);

  const availableMonths = useMemo(() => {
    if (!data?.allTransactions) return [];
    const months = new Set<string>();
    data.allTransactions.forEach(t => months.add(t.date.substring(0, 7)));
    return Array.from(months).sort().reverse();
  }, [data]);

  const loadSample = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const ok = await loadSampleData();
      if (!ok) setError('Failed to load sample data.');
      return ok;
    } finally {
      setLoading(false);
    }
  }, [loadSampleData]);

  return {
    data,
    filteredData,
    loading,
    error,
    uploadCSV,
    updateTransactionCategory,
    categoryData,
    projectData,
    monthlyData,
    availableMonths,
    selectedMonth,
    setSelectedMonth,
    categoryKeywords,
    loadSample,
  };
};