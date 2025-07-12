import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Scale, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FinancialData, MonthlyData, CategoryData } from '../types/financial';
import { SimpleLineChart, SimpleBarChart } from './SimpleChart';

interface OverviewProps {
  data: FinancialData;
  monthlyData: MonthlyData[];
  categoryData: CategoryData[];
}

export const Overview: React.FC<OverviewProps> = ({ data, monthlyData, categoryData }) => {
  const kpis = [
    {
      title: "Total Revenue",
      value: `€${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "success"
    },
    {
      title: "Total Expenses", 
      value: `€${data.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingDown,
      color: "warning"
    },
    {
      title: "Net Profit",
      value: `€${data.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Target,
      color: "primary"
    },
    {
      title: "Current Balance",
      value: `€${data.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Banknote,
      color: "primary"
    },
    {
        title: "Outstanding",
        value: `€${data.outstandingReceivables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: Scale,
        color: "accent"
    }
  ];
  
  const expenseCategories = categoryData.filter(c => c.expenses > 0).sort((a,b) => b.expenses - a.expenses).slice(0, 6);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="hover:shadow-glow transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-${kpi.color}/20 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Monthly Financial Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <SimpleLineChart<MonthlyData>
              data={monthlyData}
              dataKeys={['revenue', 'expenses', 'netProfit']}
              xAxisKey="month"
              colors={['#10b981', '#f59e0b', '#6366f1']}
            />
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Top Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <SimpleBarChart<CategoryData>
              data={expenseCategories}
              dataKey="expenses"
              xAxisKey="name"
              color="#f59e0b"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};