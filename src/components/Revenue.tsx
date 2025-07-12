import React from 'react';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { SimpleLineChart, SimpleBarChart } from './SimpleChart';
import { CategoryData, MonthlyData, ProjectData } from '../types/financial';

interface RevenueProps {
  categoryData: CategoryData[];
  monthlyData: MonthlyData[];
  projectData: ProjectData[];
  totalRevenue: number;
}

export const Revenue: React.FC<RevenueProps> = ({ 
  categoryData, 
  monthlyData, 
  projectData, 
  totalRevenue 
}) => {
  const revenueCategories = categoryData.filter(c => !c.isExpense);
  
  const clientMetrics = [
    {
      name: "Medio Zorg",
      revenue: projectData.find(p => p.name === "Medio Zorg")?.revenue || 0,
      projects: 3,
      status: "Active",
      growth: "+25%"
    },
    {
      name: "RebelsAI",
      revenue: projectData.find(p => p.name === "RebelsAI")?.revenue || 0,
      projects: 1,
      status: "Active", 
      growth: "New"
    },
    {
      name: "Patrick Burgermeister",
      revenue: projectData.find(p => p.name === "Patrick Burgermeister")?.revenue || 0,
      projects: 1,
      status: "Completed",
      growth: "One-time"
    }
  ];

  const monthlyGrowth = monthlyData.map((month, index) => {
    const previousMonth = monthlyData[index - 1];
    const growth = previousMonth 
      ? ((month.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 
      : 0;
    return {
      ...month,
      growth: growth.toFixed(1)
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Revenue Analysis</h2>
          <p className="text-muted-foreground">
            Total Revenue: <span className="font-semibold text-success">€{totalRevenue.toLocaleString()}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
            Average Deal: €{Math.round(totalRevenue / projectData.length).toLocaleString()}
          </Badge>
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
            {projectData.length} Active Projects
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly ARR</p>
              <p className="text-xl font-bold">€{Math.round(totalRevenue / 12).toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
              <p className="text-xl font-bold">{clientMetrics.filter(c => c.status === "Active").length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
              <p className="text-xl font-bold">+18.7%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Project</p>
              <p className="text-xl font-bold">10 weeks</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Revenue Growth Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <SimpleLineChart
              data={monthlyData}
              dataKeys={['revenue']}
              xAxisKey="month"
              colors={['#10b981']}
            />
          </CardContent>
        </Card>

        {/* Project Revenue */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Revenue by Project
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <SimpleBarChart
              data={projectData}
              dataKey="revenue"
              xAxisKey="name"
              color="#10b981"
            />
          </CardContent>
        </Card>
      </div>

      {/* Client Details */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Client Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-4">
            {clientMetrics.map((client) => (
              <div
                key={client.name}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">{client.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {client.projects} project{client.projects > 1 ? 's' : ''} • {client.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-success">€{client.revenue.toLocaleString()}</p>
                  <Badge 
                    variant="secondary" 
                    className={
                      client.growth === "New" ? "bg-primary/20 text-primary" :
                      client.growth.includes("+") ? "bg-success/20 text-success" :
                      "bg-muted/20"
                    }
                  >
                    {client.growth}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Forecast */}
      <Card className="p-6 bg-gradient-to-r from-success/5 to-primary/5 border-success/20">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            Revenue Forecast & Longevity Hub Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-success">Phase 1: Current</h4>
              <p className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">
                Sustainable growth with Medio Zorg and emerging AI healthcare clients
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Phase 2: Scale</h4>
              <p className="text-2xl font-bold">€250K</p>
              <p className="text-sm text-muted-foreground">
                Longevity Hub launch in Netherlands/Portugal with 5+ clinic partnerships
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-accent">Phase 3: €1M ARR</h4>
              <p className="text-2xl font-bold">€1M+</p>
              <p className="text-sm text-muted-foreground">
                Full ecosystem: R&D, clinics, wellness, and community platform
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};