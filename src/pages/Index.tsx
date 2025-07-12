import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Header } from '@/components/Header';
import { Overview } from '@/components/Overview';
import { Expenses } from '@/components/Expenses';
import { Revenue } from '@/components/Revenue';
import { Projects } from '@/components/Projects';
import { Insights } from '@/components/Insights';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { toast } = useToast();
  
  const {
    data,
    loading,
    error,
    loadSampleData,
    uploadCSV,
    getCategoryData,
    getProjectData,
    getMonthlyData
  } = useFinancialData();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h2 className="text-xl font-semibold">Analyzing Financial Healthspan</h2>
            <p className="text-muted-foreground">Parsing transactions and generating insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No Data Loaded</h2>
          <p className="text-muted-foreground">Please upload a CSV file or click "Load Sample" to begin.</p>
          <button onClick={loadSampleData}>Load Sample Data</button>
        </div>
      </div>
    );
  }

  const categoryData = getCategoryData();
  const projectData = getProjectData();
  const monthlyData = getMonthlyData();

  return (
    <div className={`min-h-screen bg-gradient-background transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header
          onUpload={handleUpload}
          onLoadSample={loadSampleData}
          onExport={handleExport}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:w-auto lg:grid-cols-5 bg-card shadow-card">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <Overview 
              data={data}
              monthlyData={monthlyData}
              categoryData={categoryData}
            />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-8">
            <Expenses 
              categoryData={categoryData}
              monthlyData={monthlyData}
              totalExpenses={data.totalExpenses}
            />
          </TabsContent>

          <TabsContent value="revenue" className="space-y-8">
            <Revenue 
              monthlyData={monthlyData}
              projectData={projectData}
              totalRevenue={data.totalRevenue}
            />
          </TabsContent>

          <TabsContent value="projects" className="space-y-8">
            <Projects projectData={projectData} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            <Insights 
              data={data}
              categoryData={categoryData}
              projectData={projectData}
              monthlyData={monthlyData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;