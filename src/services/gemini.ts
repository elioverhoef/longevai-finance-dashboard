import { GoogleGenerativeAI } from '@google/generative-ai';
import { FinancialData, CategoryData, ProjectData, MonthlyData, Transaction } from '../types/financial';
import { projectKeywords, categoryKeywords } from '../config/categorization';

export interface GeminiInsight {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'runway' | 'growth' | 'optimization' | 'risk' | 'opportunity';
}

const PROMPT_TEMPLATE = `
You are a financial advisor analyzing business data for LongevAI, a longevity-focused AI company operating in the B2B AI consulting and healthcare technology space.

COMPANY PROFILE:
- Industry: Longevity AI & Healthcare Technology
- Business Model: B2B AI consulting, healthcare solutions, custom AI development
- Target Market: Healthcare organizations, biotech companies, wellness providers
- Stage: Early-stage with active client projects

FINANCIAL OVERVIEW:
- Current Balance: €{currentBalance}
- Total Revenue: €{totalRevenue} 
- Total Expenses: €{totalExpenses}
- Net Profit: €{netProfit}
- Monthly Burn Rate: €{monthlyBurnRate}
- Runway: {runway} months
- Outstanding Receivables: €{outstandingReceivables}

REVENUE ANALYSIS:
{revenueAnalysis}

EXPENSE BREAKDOWN & EFFICIENCY:
{expenseAnalysis}

OPERATIONAL METRICS:
{operationalMetrics}

CLIENT & PROJECT INSIGHTS:
{clientProjectInsights}

CASH FLOW PATTERNS:
{cashFlowPatterns}

TECHNOLOGY STACK COSTS:
{techStackAnalysis}

MONTHLY TRENDS (last 6 months):
{monthlyTrends}

Please provide 5-8 actionable insights in JSON format with this structure:
{
  "insights": [
    {
      "title": "Brief insight title",
      "description": "Detailed actionable recommendation (2-3 sentences with specific numbers/percentages when relevant)",
      "priority": "high|medium|low",
      "category": "runway|growth|optimization|risk|opportunity"
    }
  ]
}

Focus on:
1. Runway management and cash flow optimization for AI consulting business
2. Client diversification and revenue stream expansion in longevity sector
3. Technology stack cost optimization for AI development
4. Scaling operational efficiency for project-based work
5. Risk mitigation for consulting business (client concentration, payment delays)
6. Strategic positioning in longevity AI market
7. Talent acquisition and retention cost optimization
8. Seasonal patterns and business development timing

Be specific, data-driven, and tailored to the longevity AI consulting industry. Reference actual spending patterns, client names, and specific metrics from the data.
`;

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
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

    // Revenue Analysis
    const revenueTransactions = data.allTransactions.filter(t => t.amount > 0);
    const avgRevenuePerTransaction = revenueTransactions.length > 0 ? data.totalRevenue / revenueTransactions.length : 0;
    const revenueByProject = [...projectData.filter(p => p.revenue > 0)].sort((a, b) => b.revenue - a.revenue);
    const revenueConcentration = revenueByProject.length > 0 ? (revenueByProject[0].revenue / data.totalRevenue * 100) : 0;

    const revenueAnalysis = [
      `- Average Revenue per Transaction: €${avgRevenuePerTransaction.toFixed(2)}`,
      `- Revenue Concentration: ${revenueConcentration.toFixed(1)}% from top client (${revenueByProject[0]?.name || 'N/A'})`,
      `- Active Revenue Streams: ${revenueByProject.length} projects`,
      `- Revenue Diversity: ${revenueByProject.length >= 3 ? 'Well diversified' : 'Concentrated - risk of client dependency'}`,
    ].join('\n');

    // Enhanced Expense Analysis with vendor insights
    const vendorSpending = new Map<string, { amount: number; count: number; category: string }>();
    data.allTransactions.filter(t => t.amount < 0).forEach(t => {
      const vendor = this.extractVendorName(t.description);
      const existing = vendorSpending.get(vendor) || { amount: 0, count: 0, category: t.category || 'Unknown' };
      existing.amount += Math.abs(t.amount);
      existing.count += 1;
      vendorSpending.set(vendor, existing);
    });

    const topVendors = [...Array.from(vendorSpending.entries())]
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 5)
      .map(([vendor, data]) => `- ${vendor}: €${data.amount.toLocaleString()} (${data.count} transactions, ${data.category})`);

    const expenseAnalysis = [
      'Top Expense Categories:',
      ...[...categoryData.filter(c => c.expenses > 0)].sort((a, b) => b.expenses - a.expenses)
        .slice(0, 5)
        .map(c => `  • ${c.name}: €${c.expenses.toLocaleString()} (${((c.expenses / data.totalExpenses) * 100).toFixed(1)}%)`),
      '',
      'Top Vendors by Spending:',
      ...topVendors.map(v => `  • ${v}`)
    ].join('\n');

    // Operational Metrics
    const softwareExpenses = categoryData.find(c => c.name === 'Software & AI Tools')?.expenses || 0;
    const salaryExpenses = categoryData.find(c => c.name === 'Salaries & Freelancers')?.expenses || 0;
    const travelExpenses = categoryData.find(c => c.name === 'Travel & Transport')?.expenses || 0;
    const taxExpenses = categoryData.find(c => c.name === 'Taxes & Accounting')?.expenses || 0;

    const operationalMetrics = [
      `- Software & AI Tools: €${softwareExpenses.toLocaleString()} (${((softwareExpenses / data.totalExpenses) * 100).toFixed(1)}% of expenses)`,
      `- Personnel Costs: €${salaryExpenses.toLocaleString()} (${((salaryExpenses / data.totalExpenses) * 100).toFixed(1)}% of expenses)`,
      `- Travel & Transport: €${travelExpenses.toLocaleString()} (${((travelExpenses / data.totalExpenses) * 100).toFixed(1)}% of expenses)`,
      `- Tax & Compliance: €${taxExpenses.toLocaleString()} (${((taxExpenses / data.totalExpenses) * 100).toFixed(1)}% of expenses)`,
      `- Software Cost per €1 Revenue: €${data.totalRevenue > 0 ? (softwareExpenses / data.totalRevenue).toFixed(2) : '0.00'}`,
    ].join('\n');

    // Client & Project Insights
    const activeProjects = projectData.filter(p => p.status === 'Active');
    const completedProjects = projectData.filter(p => p.status === 'Completed');
    const avgProjectValue = projectData.length > 0 ? projectData.reduce((sum, p) => sum + p.revenue, 0) / projectData.length : 0;

    const clientProjectInsights = [
      `- Total Projects: ${projectData.length} (${activeProjects.length} active, ${completedProjects.length} completed)`,
      `- Average Project Value: €${avgProjectValue.toLocaleString()}`,
      `- Most Profitable: ${[...projectData].sort((a, b) => b.netProfit - a.netProfit)[0]?.name || 'N/A'} (€${[...projectData].sort((a, b) => b.netProfit - a.netProfit)[0]?.netProfit.toLocaleString() || '0'} profit)`,
      `- Project ROI Range: ${projectData.length > 0 ? `${Math.min(...projectData.map(p => p.roi)).toFixed(1)}% to ${Math.max(...projectData.map(p => p.roi)).toFixed(1)}%` : 'N/A'}`,
      `- Client Concentration Risk: ${revenueConcentration > 50 ? 'HIGH - Over 50% from one client' : revenueConcentration > 30 ? 'MEDIUM - 30-50% from top client' : 'LOW - Well distributed'}`,
    ].join('\n');

    // Cash Flow Patterns
    const paymentGaps = this.analyzePaymentGaps(data.allTransactions);
    const seasonalPatterns = this.analyzeSeasonalPatterns(monthlyData);

    const cashFlowPatterns = [
      `- Outstanding Receivables: €${data.outstandingReceivables.toLocaleString()} (${((data.outstandingReceivables / data.totalRevenue) * 100).toFixed(1)}% of total revenue)`,
      `- Average Payment Gap: ${paymentGaps.avgDays} days`,
      `- Revenue Seasonality: ${seasonalPatterns}`,
      `- Cash Conversion Efficiency: ${data.outstandingReceivables < data.totalRevenue * 0.2 ? 'GOOD' : 'NEEDS IMPROVEMENT'}`,
    ].join('\n');

    // Technology Stack Analysis
    const techTransactions = data.allTransactions.filter(t =>
      t.category === 'Software & AI Tools' && t.amount < 0
    );
    const monthlyTechCost = techTransactions.length > 0 ?
      Math.abs(techTransactions.reduce((sum, t) => sum + t.amount, 0)) / Math.max(monthlyData.length, 1) : 0;

    const techTools = new Map<string, number>();
    techTransactions.forEach(t => {
      const tool = this.extractTechTool(t.description);
      techTools.set(tool, (techTools.get(tool) || 0) + Math.abs(t.amount));
    });

    const topTechCosts = [...Array.from(techTools.entries())]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tool, cost]) => `  • ${tool}: €${cost.toFixed(2)}`);

    const techStackAnalysis = [
      `- Monthly Tech Stack Cost: €${monthlyTechCost.toFixed(2)}`,
      `- Tech Cost as % of Revenue: ${data.totalRevenue > 0 ? ((softwareExpenses / data.totalRevenue) * 100).toFixed(1) : '0'}%`,
      'Top Technology Investments:',
      ...topTechCosts,
      `- Tech ROI Indicator: ${data.totalRevenue > softwareExpenses * 5 ? 'POSITIVE' : 'MONITOR CLOSELY'}`,
    ].join('\n');

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
      .replace('{outstandingReceivables}', data.outstandingReceivables.toLocaleString())
      .replace('{revenueAnalysis}', revenueAnalysis)
      .replace('{expenseAnalysis}', expenseAnalysis)
      .replace('{operationalMetrics}', operationalMetrics)
      .replace('{clientProjectInsights}', clientProjectInsights)
      .replace('{cashFlowPatterns}', cashFlowPatterns)
      .replace('{techStackAnalysis}', techStackAnalysis)
      .replace('{monthlyTrends}', monthlyTrends);
  }

  private extractVendorName(description: string): string {
    const normalized = description.toLowerCase();

    // Extract vendor names from common patterns
    if (normalized.includes('google')) return 'Google';
    if (normalized.includes('slack')) return 'Slack';
    if (normalized.includes('cursor')) return 'Cursor AI';
    if (normalized.includes('render.com')) return 'Render';
    if (normalized.includes('apollo')) return 'Apollo.io';
    if (normalized.includes('hubspot')) return 'HubSpot';
    if (normalized.includes('bunq')) return 'Bunq Bank';
    if (normalized.includes('belastingdienst')) return 'Tax Authority';
    if (normalized.includes('moneybird')) return 'MoneyBird';
    if (normalized.includes('medio zorg')) return 'Medio Zorg';
    if (normalized.includes('hetzner')) return 'Hetzner';
    if (normalized.includes('openai')) return 'OpenAI';
    if (normalized.includes('claude')) return 'Anthropic';

    // Extract first meaningful word from description
    const words = description.split(' ').filter(w => w.length > 2);
    return words[0] || 'Unknown';
  }

  private extractTechTool(description: string): string {
    const normalized = description.toLowerCase();

    if (normalized.includes('google cloud')) return 'Google Cloud';
    if (normalized.includes('google gsuite')) return 'Google Workspace';
    if (normalized.includes('slack')) return 'Slack';
    if (normalized.includes('cursor')) return 'Cursor AI';
    if (normalized.includes('render')) return 'Render';
    if (normalized.includes('apollo')) return 'Apollo.io';
    if (normalized.includes('hubspot')) return 'HubSpot';
    if (normalized.includes('moneybird')) return 'MoneyBird';
    if (normalized.includes('hetzner')) return 'Hetzner';
    if (normalized.includes('openai')) return 'OpenAI';
    if (normalized.includes('claude')) return 'Anthropic Claude';
    if (normalized.includes('koyeb')) return 'Koyeb';
    if (normalized.includes('twilio')) return 'Twilio';
    if (normalized.includes('canva')) return 'Canva';
    if (normalized.includes('coollabs')) return 'Coolify';
    if (normalized.includes('openrouter')) return 'OpenRouter';

    return normalized;
  }

  private analyzePaymentGaps(transactions: Transaction[]): { avgDays: number } {
    // Simplified analysis - in real implementation, you'd match invoices to payments
    const revenueTransactions = transactions.filter(t => t.amount > 0);
    if (revenueTransactions.length === 0) return { avgDays: 0 };

    // Rough estimate based on typical B2B payment terms
    return { avgDays: 30 }; // Placeholder for more sophisticated analysis
  }

  private analyzeSeasonalPatterns(monthlyData: MonthlyData[]): string {
    if (monthlyData.length < 6) return 'Insufficient data for seasonal analysis';

    const revenues = monthlyData.slice(-6).map(m => m.revenue);
    const avgRevenue = revenues.reduce((sum, r) => sum + r, 0) / revenues.length;
    const variance = revenues.reduce((sum, r) => sum + Math.pow(r - avgRevenue, 2), 0) / revenues.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avgRevenue > 0 ? (stdDev / avgRevenue) : 0;

    if (coefficientOfVariation < 0.2) return 'Stable month-to-month';
    if (coefficientOfVariation < 0.4) return 'Moderate variation';
    return 'High volatility - project-based pattern';
  }

  // Helper methods to derive data for the prompt
  private getCategoryData(data: FinancialData): CategoryData[] {
    const categoryMap = new Map<string, { revenue: number; expenses: number; transactions: Transaction[] }>();
    data.allTransactions.forEach(t => {
      const categoryName = t.category || 'Uncategorized';
      const existing = categoryMap.get(categoryName) || { revenue: 0, expenses: 0, transactions: [] };
      if (t.amount > 0) existing.revenue += t.amount;
      else existing.expenses += Math.abs(t.amount);
      existing.transactions.push(t);
      categoryMap.set(categoryName, existing);
    });
    return Array.from(categoryMap.entries()).map(([name, { revenue, expenses, transactions }]) => ({ name, revenue, expenses, transactions, isExpense: expenses > revenue })).sort((a, b) => b.expenses - a.expenses);
  }

  private getProjectData(data: FinancialData): ProjectData[] {
    const projectMap = new Map<string, Transaction[]>();
    data.allTransactions.forEach(t => {
      if (t.project) {
        const existing = projectMap.get(t.project) || [];
        projectMap.set(t.project, [...existing, t]);
      }
    });
    return Array.from(projectMap.entries()).map(([name, transactions]) => {
      const revenue = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
      return { name, revenue, expenses, netProfit: revenue - expenses, roi: 0, status: '', transactions };
    }).sort((a, b) => b.revenue - a.revenue);
  }

  private getMonthlyData(data: FinancialData): MonthlyData[] {
    const monthlyMap = new Map<string, { revenue: number; expenses: number }>();
    data.allTransactions.forEach(t => {
      const month = t.date.substring(0, 7);
      const existing = monthlyMap.get(month) || { revenue: 0, expenses: 0 };
      if (t.amount > 0) existing.revenue += t.amount;
      else existing.expenses += Math.abs(t.amount);
      monthlyMap.set(month, existing);
    });
    return Array.from(monthlyMap.entries()).map(([month, { revenue, expenses }]) => ({ month, revenue, expenses, netProfit: revenue - expenses })).sort((a, b) => a.month.localeCompare(b.month));
  }


  async generateInsights(data: FinancialData): Promise<GeminiInsight[]> {
    try {
      const categoryData = this.getCategoryData(data);
      const projectData = this.getProjectData(data);
      const monthlyData = this.getMonthlyData(data);
      const prompt = this.formatFinancialData(data, categoryData, projectData, monthlyData);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const sortedInsights = (parsed.insights || []).sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
      return sortedInsights;
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