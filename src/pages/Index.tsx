import React, { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { toast } = useToast();
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; transactions: Transaction[] }>({ title: '', transactions: [] });
  
  const {
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
  } = useFinancialData();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleExport = () => {
    if (!data) return;
    const csvData = [
      ['Date', 'Reference', 'Description', 'Amount', 'Category', 'Project'],
      ...data.allTransactions.map(t => [t.date, t.reference, `"${t.description.replace(/"/g, '""')}"`, t.amount, t.category || '', t.project || ''])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvData.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "longevai-financial-data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export Complete" });
  };

  const handleUpload = (file: File) => {
    uploadCSV(file);
    toast({ title: "Upload Started", description: "Processing your CSV file..." });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleShowDetails = (title: string, transactions: Transaction[]) => {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setModalData({ title, transactions: sortedTransactions });
    setDetailModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-background p-4">
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">No Data Loaded</h2>
                <p className="text-muted-foreground">Upload a CSV file or load the sample data to begin.</p>
                 <label className="group cursor-pointer">
                    <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files[0])} />
                    <div className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90">
                        Upload CSV
                    </div>
                </label>
            </div>
        </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-background`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header onUpload={handleUpload} onLoadSample={() => {}} onExport={handleExport} darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
              <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="expenses">Expenses</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>
              <div className="w-full sm:w-auto flex-grow sm:flex-grow-0">
                  <DateFilter selectedMonth={selectedMonth} availableMonths={availableMonths} onMonthChange={setSelectedMonth} />
              </div>
          </div>

          <TabsContent value="overview">
            <Overview data={filteredData!} monthlyData={monthlyData} categoryData={categoryData} />
          </TabsContent>
          <TabsContent value="expenses">
            <Expenses categoryData={categoryData} monthlyData={monthlyData} totalExpenses={filteredData!.totalExpenses} onShowDetails={handleShowDetails} />
          </TabsContent>
          <TabsContent value="revenue">
            <Revenue monthlyData={monthlyData} projectData={projectData} totalRevenue={filteredData!.totalRevenue} onShowDetails={handleShowDetails} />
          </TabsContent>
          <TabsContent value="projects">
            <Projects projectData={projectData} onShowDetails={handleShowDetails} />
          </TabsContent>
          <TabsContent value="insights">
            <Insights data={data} categoryData={categoryData} projectData={projectData} monthlyData={monthlyData} />
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
            toast({ title: "Category Updated" });
          }}
        />
      </div>
    </div>
  );
};

export default Index;