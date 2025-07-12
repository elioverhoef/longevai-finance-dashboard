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
        weeks: Math.ceil(transactions.length / 2),
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-background">
        <div className="text-center space-y-6 glass p-8 rounded-3xl backdrop-blur-md shadow-modern-lg">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full spinner mx-auto pulse-glow"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary/30 rounded-full animate-ping mx-auto"></div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gradient">Analyzing Financial Healthspan</h2>
            <p className="text-muted-foreground text-lg">Parsing transactions and generating insights...</p>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-primary shimmer rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-background">
        <div className="text-center space-y-6 glass p-8 rounded-3xl backdrop-blur-md shadow-modern-lg floating">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gradient">No Data Loaded</h2>
            <p className="text-muted-foreground text-lg">Please upload a CSV file or click "Load Sample" to begin your financial journey.</p>
            <button 
              onClick={loadSampleData}
              className="btn-modern bg-gradient-primary hover:bg-gradient-primary/90 text-white px-8 py-3 rounded-2xl font-semibold shadow-modern transition-all hover:scale-105 hover:shadow-modern-lg"
            >
              Load Sample Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-background transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl fade-in">
        <Header
          onUpload={handleUpload}
          onLoadSample={loadSampleData}
          onExport={handleExport}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        <Tabs defaultValue="overview" className="space-y-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:w-auto lg:grid-cols-5 glass rounded-2xl shadow-modern-lg backdrop-blur-md border-gradient">
              <TabsTrigger value="overview" className="rounded-xl btn-modern">Overview</TabsTrigger>
              <TabsTrigger value="revenue" className="rounded-xl btn-modern">Revenue</TabsTrigger>
              <TabsTrigger value="expenses" className="rounded-xl btn-modern">Expenses</TabsTrigger>
              <TabsTrigger value="projects" className="rounded-xl btn-modern">Projects</TabsTrigger>
              <TabsTrigger value="insights" className="rounded-xl btn-modern">Insights</TabsTrigger>
            </TabsList>
            
            <div className="glass rounded-2xl p-3 backdrop-blur-md border-gradient">
              <DateFilter
                selectedMonth={selectedMonth}
                availableMonths={availableMonths}
                onMonthChange={setSelectedMonth}
              />
            </div>
          </div>

          <TabsContent value="overview" className="space-y-8 fade-in">
            <div className="stagger-child">
              <Overview 
                data={filteredData || data}
                monthlyData={monthlyData}
                categoryData={categoryData}
              />
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-8 fade-in">
            <div className="stagger-child">
              <Expenses 
                categoryData={categoryData}
                monthlyData={monthlyData}
                totalExpenses={filteredData?.totalExpenses || data.totalExpenses}
                onShowDetails={handleShowDetails}
              />
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-8 fade-in">
            <div className="stagger-child">
              <Revenue 
                monthlyData={monthlyData}
                projectData={projectData}
                totalRevenue={filteredData?.totalRevenue || data.totalRevenue}
                onShowDetails={handleShowDetails}
              />
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-8 fade-in">
            <div className="stagger-child">
              <Projects projectData={projectData} onShowDetails={handleShowDetails} />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-8 fade-in">
            <div className="stagger-child">
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