import React from 'react';
import { Upload, Download, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface HeaderProps {
  onUpload: (file: File) => void;
  onLoadSample: () => void;
  onExport: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onUpload,
  onLoadSample,
  onExport,
  darkMode,
  onToggleDarkMode
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <Card className="mb-8 p-6 bg-gradient-primary text-white shadow-glow">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">∞</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
              LongevAI Money Dashboard
            </h1>
            <p className="text-white/80 text-sm">
              Empowering Longevity Through AI Financial Insights
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={onLoadSample}
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 border-white/30"
          >
            Load Sample Data
          </Button>
          
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 border-white/30"
              asChild
            >
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </span>
            </Button>
          </label>
          
          <Button 
            onClick={onExport}
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 border-white/30"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button 
            onClick={onToggleDarkMode}
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 border-white/30"
            title="Healthspan Mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
};