import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Header } from '@/components/Header';
import { Overview } from '@/components/Overview';
import { Expenses } from '@/components/Expenses';
import { Revenue } from '@/components/Revenue';
import { Projects } from '@/components/Projects';
import { Insights } from '@/components/Insights';
import { DateFilter } from '@/components/DateFilter';
import { useToast } from '@/hooks/use-toast';
import { TransactionDetailModal } from '@/components/TransactionDetailModal';
import { Transaction } from '@/types/financial';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const { toast } = useToast();
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; transactions: Transaction[] }>({ title: '', transactions: [] });
  
  const {
    data,
    loading,
    error,
    loadSampleData,
    uploadCSV,
    getCategoryData,
    getProjectData,
    getMonthlyData,
    updateTransactionCategory,
    categoryKeywords,
    getFilteredData,
    getAvailableMonths
  } = useFinancialData();

  // Calculate filtered data and derived data (must be at top level before early returns)
  const filteredData = useMemo(() => getFilteredData(selectedMonth), [getFilteredData, selectedMonth]);
  const availableMonths = useMemo(() => getAvailableMonths(), [getAvailableMonths]);
  
  // Use filtered data for calculating category, project, and monthly data
  const categoryData = useMemo(() => {
    if (!filteredData?.allTransactions) return [];
    const categoryMap = new Map<string, { revenue: number; expenses: number; transactions: Transaction[] }>();
    
    filteredData.allTransactions.forEach(t => {
      const categoryName = t.category || 'Uncategorized';
      const existing = categoryMap.get(categoryName) || { revenue: 0, expenses: 0, transactions: [] };
      if (t.amount > 0) {
        existing.revenue += t.amount;
      } else {
        existing.expenses += Math.abs(t.amount);
      }
      existing.transactions.push(t);
      categoryMap.set(categoryName, existing);
    });

    return Array.from(categoryMap.entries()).map(([name, { revenue, expenses, transactions }]) => ({
      name,
      revenue,
      expenses,
      transactions,
      isExpense: expenses > revenue
    })).sort((a, b) => b.expenses - a.expenses);
  }, [filteredData]);

  const projectData = useMemo(() => {
    if (!filteredData?.allTransactions) return [];
    const projectMap = new Map<string, Transaction[]>();

    filteredData.allTransactions.forEach(t => {
      if (t.project) {
        const existing = projectMap.get(t.project) || [];
        projectMap.set(t.project, [...existing, t]);
      }
    });

    return Array.from(projectMap.entries()).map(([name, transactions]) => {
      const revenue = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
      const netProfit = revenue - expenses;
      const roi = expenses > 0 ? (netProfit / expenses) * 100 : revenue > 0 ? Infinity : 0;

      const sortedTransactions = [...transactions].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
        return dateB.getTime() - dateA.getTime();
      });
      const lastTransactionDate = sortedTransactions.length > 0 ? new Date(sortedTransactions[0].date) : new Date(0);
      const daysSinceLastTransaction = (new Date().getTime() - lastTransactionDate.getTime()) / (1000 * 3600 * 24);

      const status = daysSinceLastTransaction <= 60 ? 'Active' : 'Completed';

      return {
        name,
        revenue,
        expenses,
        netProfit,
        roi,
        status,
        transactions,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [filteredData]);

  const monthlyData = useMemo(() => {
    if (!data?.allTransactions) return [];

    const monthlyMap = new Map<string, { revenue: number; expenses: number }>();

    // Always use all data for monthly trend, but only show selected month if filtered
    const transactionsToUse = selectedMonth 
      ? data.allTransactions.filter(t => t.date.startsWith(selectedMonth))
      : data.allTransactions;

    transactionsToUse.forEach(t => {
      const month = t.date.substring(0, 7);
      const existing = monthlyMap.get(month) || { revenue: 0, expenses: 0 };

      if (t.amount > 0) {
        existing.revenue += t.amount;
      } else {
        existing.expenses += Math.abs(t.amount);
      }

      monthlyMap.set(month, existing);
    });

    return Array.from(monthlyMap.entries())
      .map(([month, { revenue, expenses }]) => ({
        month,
        revenue,
        expenses,
        netProfit: revenue - expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [data, selectedMonth]);

  useEffect(() => {
    loadSampleData();
  }, [loadSampleData]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error Parsing Data",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleExport = () => {
    if (!data) return;
    
    const csvData = [
      ['Date', 'Reference', 'Description', 'Amount', 'Category', 'Project'],
      ...data.allTransactions.map(t => [
        t.date, t.reference, t.description, t.amount, t.category || '', t.project || ''
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
a.href = url;
a.download = 'longevai-financial-data.csv';
a.click();
URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Financial data exported successfully!"
    });
  };

  const handleUpload = (file: File) => {
    uploadCSV(file);
    toast({
      title: "Upload Started",
      description: "Processing your CSV file..."
    });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleShowDetails = (title: string, transactions: Transaction[]) => {
    // Create a copy of the array before sorting to avoid mutating read-only arrays
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      // Handle invalid dates safely
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
      return dateB.getTime() - dateA.getTime();
    });
    setModalData({ title, transactions: sortedTransactions });
    setDetailModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-background relative overflow-hidden">
        {/* Enhanced Background */}
        <div className="absolute inset-0 dynamic-grid" />
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-32 h-32 rounded-full opacity-10"
              style={{
                background: `linear-gradient(45deg, hsl(${240 + i * 30}, 70%, 60%), hsl(${270 + i * 30}, 70%, 70%))`,
                left: `${10 + (i % 4) * 25}%`,
                top: `${20 + Math.floor(i / 4) * 60}%`,
                animation: `float-${(i % 3) + 1} ${6 + i}s ease-in-out infinite`
              }}
            />
          ))}
        </div>
        
        <div className="text-center space-y-8 glass-ultra p-12 rounded-3xl backdrop-blur-xl shadow-2xl border-0 max-w-lg mx-4 reveal-stagger">
          <div className="relative">
            {/* Main Spinner */}
            <div className="w-24 h-24 border-4 border-transparent border-t-purple-500 border-r-blue-500 border-b-pink-500 border-l-emerald-500 rounded-full spinner mx-auto glow-intense"></div>
            
            {/* Orbiting Elements */}
            <div className="absolute inset-0 w-24 h-24 mx-auto">
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-purple-400 rounded-full animate-pulse transform -translate-x-1/2" style={{ animation: 'spin 2s linear infinite' }} />
              <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-blue-400 rounded-full animate-pulse transform -translate-x-1/2" style={{ animation: 'spin 2s linear infinite reverse' }} />
            </div>
            
            {/* Pulse Rings */}
            <div className="absolute inset-0 w-32 h-32 border border-purple-300 rounded-full animate-ping mx-auto opacity-20"></div>
            <div className="absolute inset-0 w-40 h-40 border border-blue-300 rounded-full animate-ping mx-auto opacity-10" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Analyzing Financial Healthspan
            </h2>
            <p className="text-gray-600 text-lg font-medium">
              AI is processing your longevity investment data...
            </p>
            
            {/* Enhanced Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 shimmer rounded-full shadow-lg"></div>
            </div>
            
            {/* Status Indicators */}
            <div className="flex justify-center space-x-6 pt-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full pulse-glow"></div>
                <span className="text-sm text-gray-500">Parsing CSV</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full pulse-glow" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-sm text-gray-500">AI Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full pulse-glow" style={{ animationDelay: '1s' }}></div>
                <span className="text-sm text-gray-500">Generating Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-background relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 dynamic-grid" />
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-5"
              style={{
                left: `${15 + i * 15}%`,
                top: `${25 + (i % 2) * 50}%`,
                animation: `float-${(i % 3) + 1} ${8 + i * 2}s ease-in-out infinite`
              }}
            >
              <svg width="60" height="60" viewBox="0 0 60 60" className="text-purple-400">
                <rect x="10" y="10" width="40" height="30" fill="none" stroke="currentColor" strokeWidth="2" rx="4" />
                <rect x="15" y="20" width="8" height="15" fill="currentColor" opacity="0.6" />
                <rect x="26" y="15" width="8" height="20" fill="currentColor" opacity="0.8" />
                <rect x="37" y="25" width="8" height="10" fill="currentColor" opacity="0.4" />
              </svg>
            </div>
          ))}
        </div>
        
        <div className="text-center space-y-8 glass-ultra p-12 rounded-3xl backdrop-blur-xl shadow-2xl border-0 max-w-2xl mx-4 reveal-stagger">
          {/* Icon Section */}
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl opacity-20 blur-xl"></div>
            <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl p-8 shadow-2xl">
              <svg width="64" height="64" viewBox="0 0 64 64" className="text-white mx-auto">
                <rect x="8" y="16" width="48" height="32" fill="none" stroke="currentColor" strokeWidth="3" rx="6" />
                <rect x="16" y="28" width="8" height="12" fill="currentColor" />
                <rect x="28" y="24" width="8" height="16" fill="currentColor" />
                <rect x="40" y="32" width="8" height="8" fill="currentColor" />
                <path d="M20 20 L28 16 L36 20 L44 16" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full float-1 opacity-80"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-400 rounded-full float-2 opacity-60"></div>
            <div className="absolute top-1/2 -right-4 w-3 h-3 bg-yellow-400 rounded-full float-3 opacity-70"></div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Ready to Analyze Your Financial Healthspan?
            </h2>
            <p className="text-gray-600 text-xl font-medium max-w-lg mx-auto leading-relaxed">
              Upload your financial data or explore our sample dataset to unlock AI-powered longevity insights
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button 
                onClick={loadSampleData}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25 btn-morph"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  Load Sample Data
                </span>
              </button>
              
              <div className="text-gray-400 text-sm font-medium">
                or
              </div>
              
              <label className="group cursor-pointer">
                <input type="file" accept=".csv" className="hidden" />
                <div className="border-2 border-dashed border-gray-300 hover:border-purple-400 rounded-2xl px-8 py-4 transition-all duration-300 hover:bg-purple-50 hover:scale-105">
                  <span className="text-gray-600 group-hover:text-purple-600 font-medium flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Upload CSV File
                  </span>
                </div>
              </label>
            </div>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 mt-8 border-t border-gray-200">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto">
                  <svg width="16" height="16" viewBox="0 0 16 16" className="text-emerald-600" fill="currentColor">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800">AI Analysis</h3>
                <p className="text-sm text-gray-600">Smart categorization and insights</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <svg width="16" height="16" viewBox="0 0 16 16" className="text-blue-600" fill="currentColor">
                    <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.58 26.58 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219V8.062Zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.767 24.767 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25.286 25.286 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135Z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800">Secure & Private</h3>
                <p className="text-sm text-gray-600">Your data stays in your browser</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                  <svg width="16" height="16" viewBox="0 0 16 16" className="text-purple-600" fill="currentColor">
                    <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800">Longevity Focus</h3>
                <p className="text-sm text-gray-600">Optimized for health investments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 min-h-screen">
      {/* Advanced Background System */}
      <div className="absolute inset-0 dynamic-grid" />
      
      {/* Floating DNA/Molecular Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* DNA Helix Strands */}
        <div className="absolute top-20 left-10 float-1 opacity-10">
          <svg width="120" height="300" viewBox="0 0 120 300" className="text-purple-500">
            <path d="M20,0 Q60,50 20,100 Q60,150 20,200 Q60,250 20,300" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M100,0 Q60,50 100,100 Q60,150 100,200 Q60,250 100,300" stroke="currentColor" strokeWidth="2" fill="none" />
            {[...Array(6)].map((_, i) => (
              <line key={i} x1="20" y1={i * 50} x2="100" y2={i * 50} stroke="currentColor" strokeWidth="1" />
            ))}
          </svg>
        </div>
        
        {/* Molecular Structures */}
        <div className="absolute top-40 right-20 float-2 opacity-15">
          <svg width="100" height="100" viewBox="0 0 100 100" className="text-blue-400">
            <circle cx="50" cy="50" r="8" fill="currentColor" />
            <circle cx="25" cy="25" r="6" fill="currentColor" />
            <circle cx="75" cy="25" r="6" fill="currentColor" />
            <circle cx="25" cy="75" r="6" fill="currentColor" />
            <circle cx="75" cy="75" r="6" fill="currentColor" />
            <line x1="50" y1="50" x2="25" y2="25" stroke="currentColor" strokeWidth="2" />
            <line x1="50" y1="50" x2="75" y2="25" stroke="currentColor" strokeWidth="2" />
            <line x1="50" y1="50" x2="25" y2="75" stroke="currentColor" strokeWidth="2" />
            <line x1="50" y1="50" x2="75" y2="75" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        
        {/* Financial Growth Arrows */}
        <div className="absolute bottom-40 left-1/4 float-3 opacity-10">
          <svg width="80" height="120" viewBox="0 0 80 120" className="text-emerald-400">
            <path d="M40,120 L40,20 M25,35 L40,20 L55,35" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M15,100 L15,40 M5,50 L15,40 L25,50" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M65,100 L65,30 M55,40 L65,30 L75,40" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>
        
        {/* Circuit Board Pattern */}
        <div className="absolute top-60 right-1/4 float-1 opacity-8">
          <svg width="150" height="100" viewBox="0 0 150 100" className="text-indigo-300">
            <rect x="10" y="10" width="20" height="20" fill="currentColor" />
            <rect x="50" y="30" width="15" height="15" fill="currentColor" />
            <rect x="100" y="15" width="25" height="25" fill="currentColor" />
            <rect x="80" y="60" width="18" height="18" fill="currentColor" />
            <line x1="30" y1="20" x2="50" y2="37" stroke="currentColor" strokeWidth="2" />
            <line x1="65" y1="37" x2="100" y2="27" stroke="currentColor" strokeWidth="2" />
            <line x1="57" y1="45" x2="80" y2="69" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </div>
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl fade-in relative z-10">
        <Header
          onUpload={handleUpload}
          onLoadSample={loadSampleData}
          onExport={handleExport}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        <Tabs defaultValue="overview" className="space-y-6 sm:space-y-8">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <TabsList className="flex w-full overflow-x-auto glass-ultra rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-xl border-0 p-1.5 sm:p-2 reveal-stagger scrollbar-hide">
                <div className="flex gap-1 min-w-max">
                  <TabsTrigger value="overview" className="rounded-xl sm:rounded-2xl btn-morph transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">Overview</TabsTrigger>
                  <TabsTrigger value="revenue" className="rounded-xl sm:rounded-2xl btn-morph transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">Revenue</TabsTrigger>
                  <TabsTrigger value="expenses" className="rounded-xl sm:rounded-2xl btn-morph transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">Expenses</TabsTrigger>
                  <TabsTrigger value="projects" className="rounded-xl sm:rounded-2xl btn-morph transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">Projects</TabsTrigger>
                  <TabsTrigger value="insights" className="rounded-xl sm:rounded-2xl btn-morph transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">Insights</TabsTrigger>
                </div>
              </TabsList>
            </div>
            
            <div className="glass-ultra rounded-2xl sm:rounded-3xl p-3 sm:p-4 backdrop-blur-xl border-0 shadow-2xl reveal-stagger hover:scale-105 transition-all duration-300 w-full" style={{ animationDelay: '0.1s' }}>
              <DateFilter
                selectedMonth={selectedMonth}
                availableMonths={availableMonths}
                onMonthChange={setSelectedMonth}
              />
            </div>
          </div>

          <TabsContent value="overview" className="space-y-8 reveal-stagger">
            <div className="transform transition-all duration-700 hover:scale-[1.01]">
              <Overview 
                data={filteredData || data}
                monthlyData={monthlyData}
                categoryData={categoryData}
              />
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-8 reveal-stagger">
            <div className="transform transition-all duration-700 hover:scale-[1.01]">
              <Expenses 
                categoryData={categoryData}
                monthlyData={monthlyData}
                totalExpenses={filteredData?.totalExpenses || data.totalExpenses}
                onShowDetails={handleShowDetails}
              />
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-8 reveal-stagger">
            <div className="transform transition-all duration-700 hover:scale-[1.01]">
              <Revenue 
                monthlyData={monthlyData}
                projectData={projectData}
                totalRevenue={filteredData?.totalRevenue || data.totalRevenue}
                onShowDetails={handleShowDetails}
              />
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-8 reveal-stagger">
            <div className="transform transition-all duration-700 hover:scale-[1.01]">
              <Projects projectData={projectData} onShowDetails={handleShowDetails} />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-8 reveal-stagger">
            <div className="transform transition-all duration-700 hover:scale-[1.01]">
              <Insights 
                data={filteredData || data}
                categoryData={categoryData}
                projectData={projectData}
                monthlyData={monthlyData}
              />
            </div>
          </TabsContent>
        </Tabs>
        <TransactionDetailModal
          isOpen={isDetailModalOpen}
          onOpenChange={setDetailModalOpen}
          title={modalData.title}
          transactions={modalData.transactions}
          categoryKeywords={categoryKeywords}
          onUpdateCategory={(id, category) => {
            updateTransactionCategory(id, category);
            toast({ title: "Category Updated", description: "The transaction category has been changed." });
          }}
        />
      </div>
    </div>
  );
};

export default Index;