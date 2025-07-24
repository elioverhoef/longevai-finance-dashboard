import React, { useState } from 'react';
import { PieChart, Search, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { SimplePieChart, SimpleBarChart } from './SimpleChart';
import { CategoryData, MonthlyData, Transaction } from '../types/financial';

interface ExpensesProps {
  categoryData: CategoryData[];
  monthlyData: MonthlyData[];
  totalExpenses: number;
  onShowDetails: (title: string, transactions: Transaction[]) => void;
}

export const Expenses: React.FC<ExpensesProps> = ({ categoryData, monthlyData, totalExpenses, onShowDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const expenseCategories = categoryData.filter(c => c.expenses > 0);
  const filteredCategories = expenseCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uncategorizedExpenses = expenseCategories.find(c => c.name === 'Uncategorized');

  const pieData = filteredCategories.map(cat => ({
    name: cat.name,
    value: cat.expenses,
  }));

  const colors = [
    "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#10b981", 
    "#f97316", "#ec4899", "#6366f1", "#84cc16", "#f43f5e"
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Expense Analysis</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Total Expenses: <span className="font-semibold text-warning">€{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      {uncategorizedExpenses && uncategorizedExpenses.transactions.length > 0 && (
        <Card 
            className="p-4 sm:p-6 bg-warning/10 border-warning/30 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onShowDetails('Uncategorized Transactions', uncategorizedExpenses.transactions)}
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex-1">
                    <h3 className="font-semibold text-warning">Action Required</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">{uncategorizedExpenses.transactions.length} transactions are uncategorized.</p>
                </div>
                <Button variant="ghost" className="w-full sm:w-auto">Review & Categorize</Button>
            </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <Card className="p-4 sm:p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Expense Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <SimplePieChart
              data={pieData}
              dataKey="value"
              nameKey="name"
              colors={colors}
            />
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Monthly Expense Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <SimpleBarChart
              data={monthlyData}
              dataKey="expenses"
              xAxisKey="month"
              color="#f59e0b"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Expense Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-4">
            {filteredCategories.map((category, index) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onShowDetails(`Category: ${category.name}`, category.transactions)}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {category.transactions.filter(t => t.amount < 0).length} transactions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-warning">€{category.expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <Badge variant="secondary">
                    {totalExpenses > 0 ? (category.expenses / totalExpenses * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};