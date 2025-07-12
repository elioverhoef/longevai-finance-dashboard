import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Zap, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FinancialData } from '../types/financial';
import { SimpleLineChart, SimpleBarChart } from './SimpleChart';

interface OverviewProps {
  data: FinancialData;
  monthlyData: any[];
  categoryData: any[];
}

export const Overview: React.FC<OverviewProps> = ({ data, monthlyData, categoryData }) => {
  const kpis = [
    {
      title: "Total Revenue",
      value: `€${data.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      trending: "up",
      icon: DollarSign,
      gradient: "from-success to-success/80"
    },
    {
      title: "Total Expenses", 
      value: `€${data.totalExpenses.toLocaleString()}`,
      change: "+8.2%",
      trending: "up",
      icon: TrendingDown,
      gradient: "from-warning to-warning/80"
    },
    {
      title: "Net Profit",
      value: `€${data.netProfit.toLocaleString()}`,
      change: "+18.7%",
      trending: "up",
      icon: Target,
      gradient: "from-primary to-secondary"
    },
    {
      title: "Burn Rate",
      value: `€${Math.round(data.totalExpenses / 12).toLocaleString()}/mo`,
      change: "Optimized for Phase 1",
      trending: "stable",
      icon: Zap,
      gradient: "from-accent to-accent/80"
    }
  ];

  const trendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-success" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Users className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card 
              key={index} 
              className="overflow-hidden hover:shadow-glow transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <div className="flex items-center gap-2">
                      {trendIcon(kpi.trending)}
                      <span className="text-sm text-muted-foreground">
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Monthly Financial Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <SimpleLineChart
              data={monthlyData}
              dataKeys={['revenue', 'expenses', 'netProfit']}
              xAxisKey="month"
              colors={['#10b981', '#f59e0b', '#6366f1']}
            />
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Top Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <SimpleBarChart
              data={categoryData.filter(c => c.isExpense).slice(0, 6)}
              dataKey="amount"
              xAxisKey="name"
              color="#f59e0b"
            />
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            AI Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                Revenue Growth
              </Badge>
              <p className="text-sm text-muted-foreground">
                Strong revenue from Medio Zorg project. Consider scaling similar AI healthcare implementations.
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
                Cost Optimization
              </Badge>
              <p className="text-sm text-muted-foreground">
                Subscription costs optimal for Phase 1. Monitor as team grows toward €1M ARR target.
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                Longevity Hub
              </Badge>
              <p className="text-sm text-muted-foreground">
                Current burn rate aligns with Longevity Hub expansion plans. ROI positive for Netherlands/Portugal setup.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};