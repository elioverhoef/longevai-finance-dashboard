import { useState, useEffect, useRef, type DragEvent } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Header } from '@/components/Header';
import { Overview } from '@/components/Overview';
import { Expenses } from '@/components/Expenses';
import { Revenue } from '@/components/Revenue';
import { Projects } from '@/components/Projects';
import { Insights } from '@/components/Insights';
import { Receivables } from '@/components/Receivables';
import { DateFilter } from '@/components/DateFilter';
import { useToast } from '@/hooks/use-toast';
import { TransactionDetailModal } from '@/components/TransactionDetailModal';
import { Transaction } from '@/types/financial';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; transactions: Transaction[] }>({ title: '', transactions: [] });
  const [isDragOver, setIsDragOver] = useState(false);
  
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
    loadSample,
  } = useFinancialData();

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

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

  const handleUpload = async (file: File) => {
    toast({ title: "Upload Started", description: "Processing your file..." });
    const ok = await uploadCSV(file);
    if (ok) {
      toast({ title: "Upload Complete", description: "Your data has been imported." });
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleShowDetails = (title: string, transactions: Transaction[]) => {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setModalData({ title, transactions: sortedTransactions });
    setDetailModalOpen(true);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleUpload(file);
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
        <div className="text-center space-y-5 max-w-lg">
          <h2 className="text-3xl font-bold">No Data Loaded</h2>
          <p className="text-muted-foreground">Upload a CSV/XLSX file or load the sample data to begin exploring your financial health.</p>

          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-3`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleUpload(e.target.files[0]);
                }
                // reset to allow re-upload of same file
                e.currentTarget.value = '';
              }}
            />
            <div
              className={`w-full sm:w-auto`}
            >
              <Button
                className={`w-56 ${isDragOver ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload File
              </Button>
            </div>
            
            <Button
              variant="secondary"
              className="w-56"
              onClick={async () => {
                const ok = await loadSample();
                if (ok) {
                  toast({ title: 'Sample Data Loaded' });
                } else {
                  toast({ title: 'Failed to Load Sample', variant: 'destructive' });
                }
              }}
            >
              Load Sample Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header onUpload={handleUpload} onExport={handleExport} darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="receivables">Receivables</TabsTrigger>
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
          <TabsContent value="receivables">
            {data && <Receivables data={data} />}
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
            toast({ title: 'Category Updated' });
          }}
        />
      </div>
    </div>
  );
};

export default Index;