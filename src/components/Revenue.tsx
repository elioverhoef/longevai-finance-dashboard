import React from 'react';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { SimpleLineChart, SimpleBarChart } from './SimpleChart';
import { MonthlyData, ProjectData, Transaction } from '../types/financial';

interface RevenueProps {
  monthlyData: MonthlyData[];
  projectData: ProjectData[];
  totalRevenue: number;
  onShowDetails: (title: string, transactions: Transaction[]) => void;
}

export const Revenue: React.FC<RevenueProps> = ({ 
  monthlyData, 
  projectData, 
  totalRevenue,
  onShowDetails 
}) => {

  const activeClients = projectData.filter(p => p.status === 'Active');
  const averageDealSize = projectData.length > 0 ? totalRevenue / projectData.length : 0;
  
  let growthRate = "N/A";
  if (monthlyData.length > 1) {
    const lastMonth = monthlyData[monthlyData.length - 1];
    const prevMonth = monthlyData[monthlyData.length - 2];
    if (prevMonth.revenue > 0) {
      const rate = ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100;
      growthRate = `${rate > 0 ? '+' : ''}${rate.toFixed(1)}%`;
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Revenue Analysis</h2>
          <p className="text-muted-foreground">
            Total Revenue: <span className="font-semibold text-success">€{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
            Avg Deal: €{averageDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </Badge>
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
            {activeClients.length} Active Clients
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Client Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-4">
            {projectData.map((project) => (
              <div
                key={project.name}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onShowDetails(`Project (Revenue): ${project.name}`, project.transactions)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.transactions.length} transaction{project.transactions.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-success">€{project.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <Badge 
                    variant="secondary"
                    className={
                        project.status === 'Active' ? 'bg-success/20 text-success' : 'bg-muted/20'
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};