import React, { useEffect, useState } from 'react';
import { Upload, Download, Moon, Sun, Sparkles, Activity } from 'lucide-react';
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
  // Minimal, elegant particles
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1.5,
      delay: Math.random() * 3
    }));
    setParticles(newParticles);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="relative mb-8 overflow-visible">
      {/* Glassmorphism Card */}
      <Card className="relative bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-lg p-0">
        {/* Subtle Particle System */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full opacity-20"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size * 8}px`,
                height: `${particle.size * 8}px`,
                background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)',
                filter: 'blur(2px)',
                animation: `floatY 6s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`
              }}
            />
          ))}
        </div>

        {/* Header Content */}
        <div className="relative z-10 p-3 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Brand Section */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h1 className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight truncate">
                  LongevAI
                </h1>
                <span className="text-gray-500 dark:text-gray-300 text-xs font-medium mt-0.5 hidden sm:block">
                  Financial Healthspan Dashboard
                </span>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Button 
                onClick={onLoadSample}
                className="bg-purple-100 hover:bg-purple-200 border border-purple-200 text-purple-700 text-xs px-2 sm:px-3 py-1 h-7 sm:h-8 font-semibold shadow-sm flex-shrink-0"
              >
                <Sparkles className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">Sample</span>
              </Button>
              <label className="cursor-pointer flex-shrink-0">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  className="bg-blue-100 hover:bg-blue-200 border border-blue-200 text-blue-700 text-xs px-2 sm:px-3 py-1 h-7 sm:h-8 font-semibold shadow-sm"
                  asChild
                >
                  <span>
                    <Upload className="w-3 h-3 sm:mr-1" />
                    <span className="hidden sm:inline">Upload</span>
                  </span>
                </Button>
              </label>
              <Button 
                onClick={onExport}
                className="bg-emerald-100 hover:bg-emerald-200 border border-emerald-200 text-emerald-700 text-xs px-2 sm:px-3 py-1 h-7 sm:h-8 font-semibold shadow-sm flex-shrink-0"
              >
                <Download className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button 
                onClick={onToggleDarkMode}
                className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 dark:text-gray-200 w-7 h-7 sm:w-8 sm:h-8 p-0 shadow-sm dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 flex-shrink-0"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 dark:text-yellow-400" /> : <Moon className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};