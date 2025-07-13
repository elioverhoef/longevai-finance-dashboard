import { GoogleGenerativeAI } from '@google/generative-ai';
import { FinancialData, CategoryData, ProjectData, MonthlyData } from '../types/financial';

export interface GeminiInsight {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'runway' | 'growth' | 'optimization' | 'risk' | 'opportunity';
}

const PROMPT_TEMPLATE = `
You are a financial advisor analyzing business data for LongevAI, a longevity-focused AI company. 

Based on the following financial data, provide strategic insights and actionable recommendations:

FINANCIAL OVERVIEW:
- Current Balance: €{currentBalance}
- Total Revenue: €{totalRevenue} 
- Total Expenses: €{totalExpenses}
- Net Profit: €{netProfit}
- Monthly Burn Rate: €{monthlyBurnRate}
- Runway: {runway} months

TOP EXPENSE CATEGORIES:
{expenseCategories}

PROJECT PERFORMANCE:
{projectPerformance}

MONTHLY TRENDS (last 6 months):
{monthlyTrends}

Please provide 4-6 actionable insights in JSON format with this structure:
{
  "insights": [
    {
      "title": "Brief insight title",
      "description": "Detailed actionable recommendation (2-3 sentences)",
      "priority": "high|medium|low",
      "category": "runway|growth|optimization|risk|opportunity"
    }
  ]
}

Focus on:
1. Runway management and cash flow optimization
2. Growth opportunities and revenue diversification
3. Cost optimization without compromising growth
4. Risk mitigation strategies
5. Strategic recommendations for a longevity AI company

Be specific, actionable, and data-driven. Avoid generic advice.
`;

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  private formatFinancialData(
    data: FinancialData,
    categoryData: CategoryData[],
    projectData: ProjectData[],
    monthlyData: MonthlyData[]
  ): string {
    const lastThreeMonthsExpenses = monthlyData.slice(-3).reduce((sum, m) => sum + m.expenses, 0);
    const monthlyBurnRate = lastThreeMonthsExpenses > 0 ? Math.round(lastThreeMonthsExpenses / Math.min(3, monthlyData.length)) : 0;
    const runway = monthlyBurnRate > 0 ? Math.round(data.currentBalance / monthlyBurnRate) : Infinity;

    const expenseCategories = categoryData
      .filter(c => c.expenses > 0)
      .sort((a, b) => b.expenses - a.expenses)
      .slice(0, 5)
      .map(c => `- ${c.name}: €${c.expenses.toLocaleString()} (${((c.expenses / data.totalExpenses) * 100).toFixed(1)}%)`)
      .join('\n');

    const projectPerformance = projectData
      .sort((a, b) => b.netProfit - a.netProfit)
      .slice(0, 5)
      .map(p => `- ${p.name}: €${p.revenue.toLocaleString()} revenue, €${p.netProfit.toLocaleString()} net profit`)
      .join('\n');

    const monthlyTrends = monthlyData
      .slice(-6)
      .map(m => `- ${m.month}: €${m.revenue.toLocaleString()} revenue, €${m.expenses.toLocaleString()} expenses, €${m.netProfit.toLocaleString()} profit`)
      .join('\n');

    return PROMPT_TEMPLATE
      .replace('{currentBalance}', data.currentBalance.toLocaleString())
      .replace('{totalRevenue}', data.totalRevenue.toLocaleString())
      .replace('{totalExpenses}', data.totalExpenses.toLocaleString())
      .replace('{netProfit}', data.netProfit.toLocaleString())
      .replace('{monthlyBurnRate}', monthlyBurnRate.toLocaleString())
      .replace('{runway}', isFinite(runway) ? runway.toString() : 'Infinite')
      .replace('{expenseCategories}', expenseCategories)
      .replace('{projectPerformance}', projectPerformance)
      .replace('{monthlyTrends}', monthlyTrends);
  }

  async generateInsights(
    data: FinancialData,
    categoryData: CategoryData[],
    projectData: ProjectData[],
    monthlyData: MonthlyData[]
  ): Promise<GeminiInsight[]> {
    try {
      const prompt = this.formatFinancialData(data, categoryData, projectData, monthlyData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.insights || [];
    } catch (error) {
      console.error('Error generating insights:', error);

      // Fallback insights if API fails
      return [
        {
          title: "Monitor Cash Flow",
          description: "Keep track of your monthly burn rate and ensure you have sufficient runway for operations. Consider diversifying revenue streams to improve financial stability.",
          priority: "high" as const,
          category: "runway" as const
        },
        {
          title: "Optimize Largest Expenses",
          description: "Review your top expense categories for potential cost savings. Look for subscription services that can be downgraded or renegotiated.",
          priority: "medium" as const,
          category: "optimization" as const
        }
      ];
    }
  }
}