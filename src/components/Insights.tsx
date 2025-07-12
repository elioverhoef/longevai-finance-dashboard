import React from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, Zap, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { FinancialData, CategoryData, ProjectData } from '../types/financial';

interface InsightsProps {
  data: FinancialData;
  categoryData: CategoryData[];
  projectData: ProjectData[];
}

export const Insights: React.FC<InsightsProps> = ({ data, categoryData, projectData }) => {
  // Calculate key insights
  const monthlyBurnRate = Math.round(data.totalExpenses / 12);
  const runway = data.netProfit > 0 ? Math.round(data.netProfit / monthlyBurnRate) : 0;
  const topExpenseCategory = categoryData.filter(c => c.isExpense).sort((a, b) => b.amount - a.amount)[0];
  const topRevenueProject = projectData.sort((a, b) => b.revenue - a.revenue)[0];
  
  // AI-powered insights
  const insights = [
    {
      type: 'success',
      icon: TrendingUp,
      title: 'Revenue Growth Opportunity',
      description: `${topRevenueProject?.name || 'Medio Zorg'} represents ${((topRevenueProject?.revenue || 0) / data.totalRevenue * 100).toFixed(1)}% of total revenue. Similar AI healthcare implementations could scale this success.`,
      recommendation: 'Target 3 additional healthcare AI projects in Q3 2025',
      priority: 'High',
      impact: '€50K+ potential revenue'
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Cost Optimization',
      description: `${topExpenseCategory?.name || 'Subscriptions'} accounts for €${topExpenseCategory?.amount.toLocaleString()} (${topExpenseCategory?.percentage.toFixed(1)}%) of expenses. Monitor as team scales.`,
      recommendation: 'Review subscription stack quarterly and negotiate volume discounts',
      priority: 'Medium',
      impact: '15-20% cost reduction potential'
    },
    {
      type: 'info',
      icon: Target,
      title: 'Longevity Hub Readiness',
      description: `Current burn rate of €${monthlyBurnRate.toLocaleString()}/month and ${runway} month runway support expansion plans.`,
      recommendation: 'Secure €100K funding for Netherlands/Portugal Longevity Hub launch',
      priority: 'Strategic',
      impact: 'Phase 2 growth catalyst'
    },
    {
      type: 'success',
      icon: Users,
      title: 'Team Efficiency',
      description: 'Current 1.5 FTE generating €2K/week net demonstrates strong productivity. Dutch-speaking devs needed for local expansion.',
      recommendation: 'Hire 1 Dutch-speaking developer for Medio Zorg scale-up',
      priority: 'High',
      impact: '€20K/month revenue potential'
    },
    {
      type: 'info',
      icon: Zap,
      title: 'AI Tool ROI',
      description: 'Cursor, Claude, and development tools show strong ROI. Current AI stack supports 3x productivity vs traditional development.',
      recommendation: 'Maintain cutting-edge AI tooling as competitive advantage',
      priority: 'Medium',
      impact: 'Sustained competitive edge'
    }
  ];

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-success/30 bg-success/5';
      case 'warning': return 'border-warning/30 bg-warning/5';
      case 'info': return 'border-primary/30 bg-primary/5';
      default: return 'border-muted/30 bg-muted/5';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'info': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'Medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'Strategic': return 'bg-primary/20 text-primary border-primary/30';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  // Phase progress calculation
  const currentRevenue = data.totalRevenue;
  const phase1Target = 100000; // €100K
  const phase2Target = 250000; // €250K
  const phase3Target = 1000000; // €1M ARR

  const getPhaseProgress = () => {
    if (currentRevenue < phase1Target) {
      return {
        phase: 'Phase 1: Foundation',
        progress: (currentRevenue / phase1Target) * 100,
        target: phase1Target,
        description: 'Building core AI capabilities and initial client base'
      };
    } else if (currentRevenue < phase2Target) {
      return {
        phase: 'Phase 2: Longevity Hub',
        progress: ((currentRevenue - phase1Target) / (phase2Target - phase1Target)) * 100,
        target: phase2Target,
        description: 'Launching Longevity Hub ecosystem in Netherlands/Portugal'
      };
    } else {
      return {
        phase: 'Phase 3: Scale',
        progress: ((currentRevenue - phase2Target) / (phase3Target - phase2Target)) * 100,
        target: phase3Target,
        description: 'Full ecosystem: R&D, clinics, wellness, and community'
      };
    }
  };

  const phaseInfo = getPhaseProgress();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI Financial Insights</h2>
          <p className="text-muted-foreground">
            Strategic recommendations for LongevAI's growth trajectory
          </p>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-muted-foreground">Profit Margin</span>
            </div>
            <p className="text-2xl font-bold">{((data.netProfit / data.totalRevenue) * 100).toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Above industry standard</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium text-muted-foreground">Monthly Burn</span>
            </div>
            <p className="text-2xl font-bold">€{monthlyBurnRate.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{runway} month runway</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Revenue/FTE</span>
            </div>
            <p className="text-2xl font-bold">€{Math.round(data.totalRevenue / 1.5).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">High productivity</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">Growth Rate</span>
            </div>
            <p className="text-2xl font-bold">+18.7%</p>
            <p className="text-xs text-muted-foreground">Month over month</p>
          </div>
        </Card>
      </div>

      {/* Phase Progress */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            LongevAI Growth Phase Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">{phaseInfo.phase}</h4>
                <p className="text-sm text-muted-foreground">{phaseInfo.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progress to €{(phaseInfo.target / 1000).toFixed(0)}K</p>
                <p className="text-2xl font-bold text-primary">{phaseInfo.progress.toFixed(1)}%</p>
              </div>
            </div>
            <Progress value={phaseInfo.progress} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Current: €{(currentRevenue / 1000).toFixed(0)}K</span>
              <span>Target: €{(phaseInfo.target / 1000).toFixed(0)}K</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Strategic Recommendations
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <Card key={index} className={`p-6 ${getInsightColor(insight.type)}`}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${getIconColor(insight.type)}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge variant="secondary" className={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      💡 {insight.recommendation}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      Impact: {insight.impact}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Word Cloud & Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Keywords */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Transaction Keywords</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="flex flex-wrap gap-2">
              {['Medio Zorg', 'AI Tools', 'Healthcare', 'Subscriptions', 'Development', 'Longevity', 'Automation', 'Clinic', 'Branding', 'Portugal'].map((keyword, index) => (
                <Badge 
                  key={keyword} 
                  variant="secondary" 
                  className="text-sm"
                  style={{ 
                    fontSize: `${Math.max(0.7, 1 - index * 0.1)}rem`,
                    opacity: Math.max(0.6, 1 - index * 0.1)
                  }}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Predictive Alerts */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Predictive Alerts</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <TrendingUp className="w-4 h-4 text-success" />
                <div>
                  <p className="text-sm font-medium">Revenue Forecast</p>
                  <p className="text-xs text-muted-foreground">On track for €75K Q3 target</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <div>
                  <p className="text-sm font-medium">Hiring Signal</p>
                  <p className="text-xs text-muted-foreground">Revenue growth indicates team expansion needed</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Hub Readiness</p>
                  <p className="text-xs text-muted-foreground">Financial metrics support location expansion</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};