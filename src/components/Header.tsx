import React from 'react';
import { Upload, Download, Moon, Sun, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface HeaderProps {
  onUpload: (file: File) => void;
  onExport: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onUpload,
  onExport,
  darkMode,
  onToggleDarkMode
}) => {
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="relative mb-8 overflow-visible">
      <Card className="relative bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow p-0">
        <div className="relative z-10 p-3 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Brand Section */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h1 className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight truncate">
                  LongevAI
                </h1>
                <span className="text-gray-600 dark:text-gray-300 text-xs font-medium mt-0.5 hidden sm:block">
                  Financial Healthspan Dashboard
                </span>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="secondary"
                size="sm"
                className="px-3 h-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
              <Button variant="outline" size="sm" onClick={onExport} className="px-3 h-8">
                <Download className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button 
                onClick={onToggleDarkMode}
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-gray-700 dark:text-gray-200"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};