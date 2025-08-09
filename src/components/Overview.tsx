import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Target, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FinancialData, MonthlyData, CategoryData } from '../types/financial';
import { SimpleBarChart, SimpleGroupedBarLineChart } from './SimpleChart';

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
      gradient: "from-emerald-500 to-teal-500",
      trend: "+12.5%",
      description: "Monthly recurring revenue growth"
    },
    {
      title: "Total Expenses", 
      value: `€${data.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingDown,
      gradient: "from-amber-500 to-orange-500",
      trend: "-3.2%",
      description: "Optimized operational costs"
    },
    {
      title: "Net Profit",
      value: `€${data.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Target,
      gradient: "from-purple-500 to-indigo-500",
      trend: "+18.7%",
      description: "Healthspan investment returns"
    },
    {
      title: "Current Balance",
      value: `€${data.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Banknote,
      gradient: "from-blue-500 to-cyan-500",
      trend: "+5.8%",
      description: "Liquid assets and reserves"
    }
  ];

  // Decision KPIs: Burn rate and runway
  const last3 = monthlyData.slice(-3);
  const avgBurn = last3.length > 0 ? Math.round(last3.reduce((s, m) => s + m.expenses, 0) / last3.length) : 0;
  const runwayMonths = avgBurn > 0 ? Math.floor(data.currentBalance / avgBurn) : Infinity;

  const decisionCards = [
    { title: 'Avg Burn (3 mo)', value: `€${avgBurn.toLocaleString()}`, desc: 'Average monthly expenses' },
    { title: 'Runway', value: isFinite(runwayMonths) ? `${runwayMonths} mo` : '∞', desc: 'Months until cash-out' },
  ];
  
  const expenseCategories = categoryData.filter(c => c.expenses > 0).sort((a,b) => b.expenses - a.expenses).slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="relative overflow-hidden border border-gray-200 dark:border-gray-700">
              <CardContent className="relative p-4 sm:p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <span className={`inline-block text-xs px-2 py-1 rounded-full bg-gradient-to-r ${kpi.gradient} text-white`}>{kpi.trend}</span>
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${kpi.gradient} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {decisionCards.map(card => (
          <Card key={card.title} className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="text-xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <Card className="border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6 lg:p-8">
            <CardHeader className="px-0 pt-0 pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl lg:text-2xl">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="font-bold">Monthly Financial Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <SimpleGroupedBarLineChart<MonthlyData>
                data={monthlyData}
                barKeys={['revenue', 'expenses']}
                lineKey="netProfit"
                xAxisKey="month"
                colors={["#10b981", "#f59e0b"]}
                lineColor="#6366f1"
                showAllLabels={true}
                title="Revenue & Expenses (bars), Net Profit (line)"
              />
            </CardContent>
          </div>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6 lg:p-8">
            <CardHeader className="px-0 pt-0 pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl lg:text-2xl">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="font-bold">Smart Expense Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <SimpleBarChart<CategoryData>
                data={expenseCategories}
                dataKey="expenses"
                xAxisKey="name"
                color="#f59e0b"
                showAllLabels={true}
              />
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
};