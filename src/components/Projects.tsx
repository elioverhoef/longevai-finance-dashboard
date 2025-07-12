import React, { useState } from 'react';
import { Calculator, TrendingUp, Users, DollarSign, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { SimpleBarChart } from './SimpleChart';
import { ProjectData } from '../types/financial';

interface ProjectsProps {
  projectData: ProjectData[];
}

export const Projects: React.FC<ProjectsProps> = ({ projectData }) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    projectName: 'New Longevity Project',
    weeks: 10,
    devs: 1.5,
    devCostPerMonth: 3000,
    overheadPercent: 20
  });

  const calculateProject = () => {
    const revenue = calculatorData.weeks * 2000; // €2K/week net
    const devCosts = calculatorData.devs * calculatorData.devCostPerMonth * (calculatorData.weeks / 4);
    const overhead = revenue * (calculatorData.overheadPercent / 100);
    const netGain = revenue - (devCosts + overhead);
    const roi = ((netGain / (devCosts + overhead)) * 100).toFixed(1);

    return {
      revenue,
      devCosts,
      overhead,
      netGain,
      roi: parseFloat(roi)
    };
  };

  const calc = calculateProject();

  // Enhanced project data with ROI
  const enhancedProjects = projectData.map(project => ({
    ...project,
    roi: project.expenses > 0 ? ((project.netProfit / project.expenses) * 100).toFixed(1) : 'N/A',
    status: project.name === 'Medio Zorg' ? 'Ongoing' : 
             project.name === 'RebelsAI' ? 'Active' : 'Completed'
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Project Portfolio</h2>
          <p className="text-muted-foreground">
            {projectData.length} projects • €{projectData.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()} total revenue
          </p>
        </div>
        
        <Button 
          onClick={() => setShowCalculator(!showCalculator)}
          className="bg-gradient-primary"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Project Calculator
        </Button>
      </div>

      {/* Project Calculator */}
      {showCalculator && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              LongevAI Project Profit Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={calculatorData.projectName}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, projectName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weeks">Duration (weeks)</Label>
                    <Input
                      id="weeks"
                      type="number"
                      value={calculatorData.weeks}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, weeks: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="devs">Developers (FTE)</Label>
                    <Input
                      id="devs"
                      type="number"
                      step="0.5"
                      value={calculatorData.devs}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, devs: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="devCost">Dev Cost/Month (€)</Label>
                    <Input
                      id="devCost"
                      type="number"
                      value={calculatorData.devCostPerMonth}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, devCostPerMonth: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overhead">Overhead (%)</Label>
                  <Input
                    id="overhead"
                    type="number"
                    value={calculatorData.overheadPercent}
                    onChange={(e) => setCalculatorData(prev => ({ ...prev, overheadPercent: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Results */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-success/10 border-success/20">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium">Revenue</span>
                    </div>
                    <p className="text-xl font-bold text-success">€{calc.revenue.toLocaleString()}</p>
                  </Card>
                  
                  <Card className="p-4 bg-warning/10 border-warning/20">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium">Dev Costs</span>
                    </div>
                    <p className="text-xl font-bold text-warning">€{calc.devCosts.toLocaleString()}</p>
                  </Card>
                  
                  <Card className="p-4 bg-destructive/10 border-destructive/20">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium">Overhead</span>
                    </div>
                    <p className="text-xl font-bold text-destructive">€{calc.overhead.toLocaleString()}</p>
                  </Card>
                  
                  <Card className="p-4 bg-primary/10 border-primary/20">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Net Profit</span>
                    </div>
                    <p className="text-xl font-bold text-primary">€{calc.netGain.toLocaleString()}</p>
                  </Card>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-primary text-white">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">ROI</span>
                    <span className="text-2xl font-bold">{calc.roi}%</span>
                  </div>
                  <p className="text-sm text-white/80 mt-2">
                    {calc.roi > 100 ? 'Excellent ROI for Longevity Hub expansion' :
                     calc.roi > 50 ? 'Strong ROI aligns with Phase 1 goals' :
                     'Consider optimizing costs or extending timeline'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold">€{projectData.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
              <p className="text-xl font-bold">€{projectData.reduce((sum, p) => sum + p.netProfit, 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
              <p className="text-xl font-bold">{Math.round(projectData.reduce((sum, p) => sum + p.weeks, 0) / projectData.length)} weeks</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Project Comparison Chart */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Project Revenue Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <SimpleBarChart
            data={enhancedProjects}
            dataKey="revenue"
            xAxisKey="name"
            color="#10b981"
          />
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Project Portfolio Details</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-4">
            {enhancedProjects.map((project) => (
              <div
                key={project.name}
                className="flex items-center justify-between p-6 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{project.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={
                          project.status === 'Ongoing' ? 'bg-success/20 text-success' :
                          project.status === 'Active' ? 'bg-primary/20 text-primary' :
                          'bg-muted/20'
                        }
                      >
                        {project.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{project.weeks} weeks</span>
                      <span className="text-sm text-muted-foreground">{project.transactions.length} transactions</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-success">€{project.revenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Net: €{project.netProfit.toLocaleString()} • ROI: {project.roi}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future Projections */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            LongevAI Growth Projections
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-success">Q3 2025 Target</h4>
              <p className="text-2xl font-bold">€75K</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 2 new healthcare AI projects</li>
                <li>• Qualevita clinic automation</li>
                <li>• V&P Vastgoed tenant bots</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">Longevity Hub Launch</h4>
              <p className="text-2xl font-bold">€250K</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Netherlands/Portugal location</li>
                <li>• 5+ clinic partnerships</li>
                <li>• R&D collaboration revenue</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-accent">€1M ARR Vision</h4>
              <p className="text-2xl font-bold">€1M+</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full ecosystem platform</li>
                <li>• 20+ longevity businesses</li>
                <li>• International expansion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};