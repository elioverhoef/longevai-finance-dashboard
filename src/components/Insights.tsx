import React from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, Zap, Users, Banknote, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { FinancialData, CategoryData, ProjectData, MonthlyData } from '../types/financial';

interface InsightsProps {
  data: FinancialData;
  categoryData: CategoryData[];
  projectData: ProjectData[];
  monthlyData: MonthlyData[];
}

export const Insights: React.FC<InsightsProps> = ({ data, categoryData, projectData, monthlyData }) => {
  const lastThreeMonthsExpenses = monthlyData.slice(-3).reduce((sum, m) => sum + m.expenses, 0);
  const monthlyBurnRate = lastThreeMonthsExpenses > 0 ? Math.round(lastThreeMonthsExpenses / Math.min(3, monthlyData.length)) : 0;
  const runway = monthlyBurnRate > 0 ? Math.round(data.currentBalance / monthlyBurnRate) : Infinity;

  const topExpenseCategory = [...categoryData].filter(c => c.expenses > 0).sort((a, b) => b.expenses - a.expenses)[0];
  
  const mostProfitableProject = [...projectData].sort((a, b) => b.netProfit - a.netProfit)[0];

  let growthRate = 0;
  if (monthlyData.length > 1) {
    const lastMonth = monthlyData[monthlyData.length - 1];
    const prevMonth = monthlyData[monthlyData.length - 2];
    if (prevMonth.revenue > 0) {
      growthRate = ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100;
    }
  }

  const insights = [
    {
      icon: TrendingUp,
      title: "Financial Runway",
      value: isFinite(runway) ? `${runway} months` : "Infinite",
      description: `Based on a 3-month average burn rate of €${monthlyBurnRate.toLocaleString()}/month.`,
      color: runway > 12 ? "success" : runway > 6 ? "warning" : "danger",
      progress: Math.min(100, (runway / 24) * 100)
    },
    {
      icon: growthRate >= 0 ? TrendingUp : TrendingDown,
      title: "Monthly Growth",
      value: `${growthRate.toFixed(1)}%`,
      description: "Month-over-month revenue growth.",
      color: growthRate >= 0 ? "success" : "danger",
      progress: Math.abs(growthRate)
    },
    {
      icon: Target,
      title: "Top Expense",
      value: topExpenseCategory?.name || 'N/A',
      description: `Represents ${topExpenseCategory ? (topExpenseCategory.expenses / data.totalExpenses * 100).toFixed(1) : 0}% of total expenses.`,
      color: "warning",
      progress: topExpenseCategory ? (topExpenseCategory.expenses / data.totalExpenses * 100) : 0
    },
    {
      icon: Users,
      title: "Most Profitable Project",
      value: mostProfitableProject?.name || 'N/A',
      description: `Net Profit: €${mostProfitableProject?.netProfit.toLocaleString()}. ROI: ${isFinite(mostProfitableProject?.roi) ? mostProfitableProject.roi.toFixed(1) : '∞'}%`,
      color: "primary",
      progress: mostProfitableProject ? (mostProfitableProject.netProfit / data.netProfit * 100) : 0
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          Strategic Insights
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Automated analysis of your financial data to highlight key trends, risks, and opportunities for LongevAI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <Card key={insight.title} className="p-6 hover:shadow-glow transition-all duration-300 hover:scale-105">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            {insight.title}
                        </p>
                        <p className="text-2xl font-bold">{insight.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg bg-${insight.color}/20 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${insight.color}`} />
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{insight.description}</p>
                <Progress value={insight.progress} className={`mt-4 h-2 bg-${insight.color}/20`} indicatorClassName={`bg-${insight.color}`} />
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Actionable Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50">
            <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold">Review Top Expense Category: {topExpenseCategory?.name}</h4>
              <p className="text-sm text-muted-foreground">
                This category is your largest cost center. Analyze its components for potential savings or efficiency improvements. Can any subscriptions be downgraded or services optimized?
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50">
            <TrendingUp className="w-6 h-6 text-success flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold">Capitalize on {mostProfitableProject?.name}</h4>
              <p className="text-sm text-muted-foreground">
                This project has the highest ROI. Identify what makes it successful and apply those learnings to other projects. Can you upsell or create a follow-up project?
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50">
            <Banknote className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold">Manage Your Runway</h4>
              <p className="text-sm text-muted-foreground">
                With a runway of {isFinite(runway) ? `${runway} months` : 'healthy'}, you have a {runway > 12 ? 'strong' : runway > 6 ? 'moderate' : 'critical'} buffer. Continue to monitor cash flow and align your strategic goals with your financial capacity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};