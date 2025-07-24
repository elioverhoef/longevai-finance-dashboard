import React, { useState } from 'react';
import { Calculator, TrendingUp, Users, DollarSign, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { SimpleBarChart } from './SimpleChart';
import { ProjectData, Transaction } from '../types/financial';

interface ProjectsProps {
  projectData: ProjectData[];
  onShowDetails: (title: string, transactions: Transaction[]) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ projectData, onShowDetails }) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    projectName: 'New Longevity Project',
    devs: 1.5,
    devCostPerMonth: 3000,
    overheadPercent: 20
  });

  const calculateProject = () => {
    const revenue = 0; // weeks removed
    const devCosts = calculatorData.devs * calculatorData.devCostPerMonth; // weeks removed
    const overhead = 0; // weeks removed
    const netGain = revenue - (devCosts + overhead);

    return {
      revenue,
      devCosts,
      overhead,
      netGain
    };
  };

  const calc = calculateProject();
  const totalProjectRevenue = projectData.reduce((sum, p) => sum + p.revenue, 0);
  const totalNetProfit = projectData.reduce((sum, p) => sum + p.netProfit, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Project Portfolio</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {projectData.length} projects • €{totalProjectRevenue.toLocaleString()} total revenue
          </p>
        </div>
        
        <Button 
          onClick={() => setShowCalculator(!showCalculator)}
          className="bg-gradient-primary w-full sm:w-auto"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Project Calculator
        </Button>
      </div>

      {showCalculator && (
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              LongevAI Project Profit Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="space-y-4 lg:col-span-1">
                    <div className="space-y-2">
                        <Label htmlFor="projectName">Project Name</Label>
                        <Input id="projectName" value={calculatorData.projectName} onChange={(e) => setCalculatorData({ ...calculatorData, projectName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="devs">FTE Developers</Label>
                        <Input id="devs" type="number" step="0.1" value={calculatorData.devs} onChange={(e) => setCalculatorData({ ...calculatorData, devs: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="devCost">Dev Cost per Month (€)</Label>
                        <Input id="devCost" type="number" value={calculatorData.devCostPerMonth} onChange={(e) => setCalculatorData({ ...calculatorData, devCostPerMonth: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="overhead">Overhead (%)</Label>
                        <Input id="overhead" type="number" value={calculatorData.overheadPercent} onChange={(e) => setCalculatorData({ ...calculatorData, overheadPercent: Number(e.target.value) })} />
                    </div>
                </div>
                <div className="lg:col-span-3 p-4 sm:p-6 rounded-lg bg-background flex flex-col justify-center">
                    <h4 className="text-base sm:text-lg font-semibold mb-4">Calculated Profit for "{calculatorData.projectName}"</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
                        <div className="p-3 sm:p-4 rounded-lg bg-muted">
                            <p className="text-xs sm:text-sm text-muted-foreground">Revenue</p>
                            <p className="text-lg sm:text-2xl font-bold text-success">€{calc.revenue.toLocaleString()}</p>
                        </div>
                        <div className="p-3 sm:p-4 rounded-lg bg-muted">
                            <p className="text-xs sm:text-sm text-muted-foreground">Dev Costs</p>
                            <p className="text-lg sm:text-2xl font-bold text-warning">€{calc.devCosts.toLocaleString()}</p>
                        </div>
                        <div className="p-3 sm:p-4 rounded-lg bg-muted">
                            <p className="text-xs sm:text-sm text-muted-foreground">Overhead</p>
                            <p className="text-lg sm:text-2xl font-bold text-warning">€{calc.overhead.toLocaleString()}</p>
                        </div>
                        <div className="p-3 sm:p-4 rounded-lg bg-muted">
                            <p className="text-xs sm:text-sm text-muted-foreground">Net Gain</p>
                            <p className="text-lg sm:text-2xl font-bold text-primary">€{calc.netGain.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-lg sm:text-xl font-bold truncate">€{totalProjectRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
            </div>
        </Card>
        <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Net Profit</p>
                    <p className="text-lg sm:text-xl font-bold truncate">€{totalNetProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
            </div>
        </Card>
      </div>

      <Card className="p-4 sm:p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-base sm:text-lg">Project Portfolio Details</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-3 sm:space-y-4">
            {projectData.map((project) => (
              <div
                key={project.name}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-6 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onShowDetails(`Project: ${project.name}`, project.transactions)}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-base sm:text-lg truncate">{project.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={
                          project.status === 'Active' ? 'bg-primary/20 text-primary' : 'bg-muted'
                        }
                      >
                        {project.status}
                      </Badge>
                      <span className="text-xs sm:text-sm text-muted-foreground">{project.transactions.length} transactions</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:text-right space-y-1 flex-shrink-0">
                  <p className="text-lg sm:text-xl font-bold text-success">€{project.revenue.toLocaleString()}</p>
                  <div className="flex flex-col sm:block text-xs sm:text-sm text-muted-foreground">
                    <span>Net: €{project.netProfit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};