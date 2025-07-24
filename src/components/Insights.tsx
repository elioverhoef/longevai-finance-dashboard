import React from 'react';
import { Brain, AlertTriangle, Target, Zap, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { FinancialData, CategoryData, ProjectData, MonthlyData } from '../types/financial';
import { GeminiInsight } from '../services/gemini';
import { useInsights } from '../hooks/useInsights';

interface InsightsProps {
  data: FinancialData | null;
  categoryData: CategoryData[];
  projectData: ProjectData[];
  monthlyData: MonthlyData[];
}

export const Insights: React.FC<InsightsProps> = (props) => {
  const { insights, loading, error, isCached, recalculateInsights } = useInsights(props.data);

  const getPriorityColor = (priority: GeminiInsight['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: GeminiInsight['category']) => {
    switch (category) {
      case 'runway': return <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1 text-red-500" />;
      case 'growth': return <Target className="w-6 h-6 flex-shrink-0 mt-1 text-green-500" />;
      case 'optimization': return <Zap className="w-6 h-6 flex-shrink-0 mt-1 text-blue-500" />;
      case 'risk': return <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1 text-orange-500" />;
      case 'opportunity': return <Target className="w-6 h-6 flex-shrink-0 mt-1 text-purple-500" />;
      default: return <Brain className="w-6 h-6 flex-shrink-0 mt-1 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          AI Strategic Insights
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Powered by Gemini AI - Advanced analysis of your financial data with personalized recommendations.
        </p>
      </div>

      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI-Generated Recommendations
          </CardTitle>
          {isCached && !loading && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500"/>
              Using Cached Insights
            </Badge>
          )}
        </CardHeader>
        <CardContent className="px-0 pb-0 space-y-4">
          {loading && (
            <div className="flex items-center justify-center space-x-4 py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Generating fresh AI insights... This may take a moment.</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-destructive">Error Loading Insights</h4>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && insights.length > 0 && (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                  {getCategoryIcon(insight.category)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge variant={getPriorityColor(insight.priority) as "destructive" | "secondary" | "default" | "outline"} className="text-xs">
                        {insight.priority} priority
                      </Badge>
                       <Badge variant="outline" className="capitalize text-xs">
                        {insight.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="px-0 pt-6">
          <Button onClick={() => recalculateInsights()} disabled={loading} className="w-full sm:w-auto">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Recalculating...' : 'Recalculate Insights'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};