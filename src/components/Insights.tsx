import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle, Target, Zap, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FinancialData, CategoryData, ProjectData, MonthlyData } from '../types/financial';
import { GeminiService, GeminiInsight } from '../services/gemini';

interface InsightsProps {
  data: FinancialData;
  categoryData: CategoryData[];
  projectData: ProjectData[];
  monthlyData: MonthlyData[];
}

export const Insights: React.FC<InsightsProps> = ({ data, categoryData, projectData, monthlyData }) => {
  const [insights, setInsights] = useState<GeminiInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        setError(null);
        const geminiService = new GeminiService();
        const geminiInsights = await geminiService.generateInsights(data, categoryData, projectData, monthlyData);
        setInsights(geminiInsights);
      } catch (err) {
        console.error('Failed to generate insights:', err);
        setError('Failed to generate AI insights. Please check your API key configuration.');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [data, categoryData, projectData, monthlyData]);

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
      case 'runway': return AlertTriangle;
      case 'growth': return Target;
      case 'optimization': return Zap;
      case 'risk': return AlertTriangle;
      case 'opportunity': return Target;
      default: return Brain;
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
          Powered by Gemini 2.5 Flash - Advanced AI analysis of your financial data with personalized recommendations.
        </p>
      </div>

      {loading && (
        <Card className="p-8">
          <div className="flex items-center justify-center space-x-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Generating AI insights...</span>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-6 border-destructive">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-destructive">Error Loading Insights</h4>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {!loading && !error && insights.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI-Generated Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 space-y-4">
            {insights.map((insight, index) => {
              const Icon = getCategoryIcon(insight.category);
              const priorityColor = getPriorityColor(insight.priority);
              
              return (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                  <Icon className={`w-6 h-6 flex-shrink-0 mt-1 ${
                    priorityColor === 'destructive' ? 'text-destructive' :
                    priorityColor === 'secondary' ? 'text-muted-foreground' :
                    'text-primary'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge variant={priorityColor as "destructive" | "secondary" | "default" | "outline"} className="text-xs">
                        {insight.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};