import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Scale, Banknote, Sparkles, Star, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FinancialData, MonthlyData, CategoryData } from '../types/financial';
import { SimpleLineChart, SimpleBarChart, SimpleStackedBarChart, SimpleGroupedBarLineChart } from './SimpleChart';

interface OverviewProps {
  data: FinancialData;
  monthlyData: MonthlyData[];
  categoryData: CategoryData[];
}

export const Overview: React.FC<OverviewProps> = ({ data, monthlyData, categoryData }) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const kpis = [
    {
      title: "Total Revenue",
      value: `€${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "success",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      shadowColor: "emerald",
      trend: "+12.5%",
      description: "Monthly recurring revenue growth"
    },
    {
      title: "Total Expenses", 
      value: `€${data.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingDown,
      color: "warning",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
      shadowColor: "amber",
      trend: "-3.2%",
      description: "Optimized operational costs"
    },
    {
      title: "Net Profit",
      value: `€${data.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Target,
      color: "primary",
      gradient: "from-purple-500 to-indigo-500",
      bgGradient: "from-purple-50 to-indigo-50",
      shadowColor: "purple",
      trend: "+18.7%",
      description: "Healthspan investment returns"
    },
    {
      title: "Current Balance",
      value: `€${data.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Banknote,
      color: "primary",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      shadowColor: "blue",
      trend: "+5.8%",
      description: "Liquid assets and reserves"
    },
    {
      title: "Outstanding",
      value: `€${data.outstandingReceivables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Scale,
      color: "accent",
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-50 to-rose-50",
      shadowColor: "pink",
      trend: "-1.4%",
      description: "Pending receivables"
    }
  ];
  
  const expenseCategories = categoryData.filter(c => c.expenses > 0).sort((a,b) => b.expenses - a.expenses).slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Enhanced KPI Cards with 3D Effects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const isHovered = hoveredCard === index;
          return (
            <Card 
              key={kpi.title} 
              className="relative overflow-hidden card-3d glass-ultra border border-gray-200 dark:border-gray-700 reveal-stagger group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Dynamic Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bgGradient} opacity-10 group-hover:opacity-20 transition-all duration-500`} />
              
              {/* Animated Border Glow */}
              <div className={`absolute inset-0 bg-gradient-to-r ${kpi.gradient} opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500`} />
              
              {/* Floating Particles */}
              {isHovered && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${20 + (i % 2) * 60}%`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              )}

              <CardContent className="relative z-10 p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Header with Icon */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {kpi.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${kpi.gradient} text-white dark:text-gray-900 font-medium`}>
                        {kpi.trend}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r ${kpi.gradient} flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${kpi.gradient} rounded-xl sm:rounded-2xl blur-md opacity-0 group-hover:opacity-70 transition-all duration-300`} />
                  </div>
                </div>

                {/* Main Value */}
                <div className="space-y-2">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent group-hover:from-gray-800 group-hover:to-gray-500 dark:group-hover:from-gray-200 dark:group-hover:to-gray-500 transition-all duration-300">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
                    {kpi.description}
                  </p>
                </div>

                {/* Interactive Elements */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 group-hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${kpi.gradient} pulse-glow`} />
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                  {isHovered && (
                    <div className="flex items-center gap-1 animate-fade-in">
                      <Sparkles className="w-3 h-3 text-yellow-500" />
                      <Star className="w-3 h-3 text-blue-500" />
                      <Zap className="w-3 h-3 text-purple-500" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Charts with 3D Effects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Monthly Trend Chart */}
        <Card className="relative overflow-hidden card-3d glass-ultra border border-gray-200 dark:border-gray-700 group">
          {/* Background Animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-blue-50 opacity-0 group-hover:opacity-30 transition-all duration-700" />
          
          <div className="relative z-10 p-4 sm:p-6 lg:p-8">
            <CardHeader className="px-0 pt-0 pb-4 sm:pb-6">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-lg sm:text-xl lg:text-2xl">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl sm:rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-all duration-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent font-bold">
                    Monthly Financial Overview
                  </span>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Revenue, Expenses (bars) & Net Profit (line) by Month</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 chart-3d">
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

        {/* Expense Categories Chart */}
        <Card className="relative overflow-hidden card-3d glass-ultra border border-gray-200 dark:border-gray-700 group">
          {/* Background Animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-30 transition-all duration-700" />
          
          <div className="relative z-10 p-4 sm:p-6 lg:p-8">
            <CardHeader className="px-0 pt-0 pb-4 sm:pb-6">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-lg sm:text-xl lg:text-2xl">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl sm:rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-all duration-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-bold">
                    Smart Expense Analysis
                  </span>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Optimized spending categories</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 chart-3d">
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