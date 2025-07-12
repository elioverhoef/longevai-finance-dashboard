import React, { useState } from 'react';
import { PieChart, BarChart3, Calendar, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { SimplePieChart, SimpleBarChart } from './SimpleChart';
import { CategoryData, MonthlyData } from '../types/financial';

interface ExpensesProps {
  categoryData: CategoryData[];
  monthlyData: MonthlyData[];
}

export const Expenses: React.FC<ExpensesProps> = ({ categoryData, monthlyData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const expenseCategories = categoryData.filter(c => c.isExpense);
  const filteredCategories = expenseCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const monthlyExpenses = monthlyData.map(m => ({
    month: m.month,
    ...expenseCategories.reduce((acc, cat) => {
      const monthTransactions = cat.transactions.filter(t => 
        t.date.startsWith(m.month) && t.amount < 0
      );
      acc[cat.name.replace(/\s+/g, '')] = monthTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return acc;
    }, {} as Record<string, number>)
  }));

  const pieData = filteredCategories.map(cat => ({
    name: cat.name,
    value: cat.amount,
    percentage: cat.percentage
  }));

  const colors = [
    "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#10b981", 
    "#f97316", "#ec4899", "#6366f1", "#84cc16", "#f43f5e"
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expense Analysis</h2>
          <p className="text-muted-foreground">
            Total Expenses: <span className="font-semibold text-warning">€{expenseCategories.reduce((sum, cat) => sum + cat.amount, 0).toLocaleString()}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Regular Expenses</p>
              <p className="text-xl font-bold">
                €{expenseCategories.filter(c => c.name.includes('Subscriptions') || c.name.includes('Salaries')).reduce((sum, cat) => sum + cat.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">One-time Expenses</p>
              <p className="text-xl font-bold">
                €{expenseCategories.filter(c => c.name.includes('Hardware') || c.name.includes('Events')).reduce((sum, cat) => sum + cat.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Categories</p>
              <p className="text-xl font-bold">{expenseCategories.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
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

        {/* Monthly Trend */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
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

      {/* Category Details */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-4">
            {filteredCategories.map((category, index) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {category.transactions.length} transactions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">€{category.amount.toLocaleString()}</p>
                  <Badge variant="secondary">
                    {category.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details */}
      {selectedCategory && (
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>{selectedCategory} Transactions</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="space-y-2">
              {expenseCategories
                .find(c => c.name === selectedCategory)
                ?.transactions.filter(t => t.amount < 0)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded border">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-destructive">
                        €{Math.abs(transaction.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{transaction.reference}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};