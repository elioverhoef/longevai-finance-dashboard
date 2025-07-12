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
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5
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
    <div className="relative mb-8 overflow-hidden">
      {/* Floating Navigation Container */}
      <Card className="relative liquid-gradient text-white glass-ultra border-0 shadow-none p-0">
        {/* Particle System */}
        <div className="particles absolute inset-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle absolute opacity-30"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.delay}s`,
                background: 'radial-gradient(circle, rgba(255,255,255,0.8), rgba(99,102,241,0.6))'
              }}
            />
          ))}
        </div>

        {/* Interactive Background Effect */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Compact Header Content */}
        <div className="relative z-10 p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Compact Brand Section */}
            <div className="flex items-center gap-3">
              {/* Simple Logo */}
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>

              {/* Compact Title */}
              <div>
                <h1 className="text-xl font-bold text-white">
                  LongevAI
                </h1>
                <p className="text-white/80 text-xs">
                  Financial Healthspan Dashboard
                </p>
              </div>
            </div>
            
            {/* Compact Action Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                onClick={onLoadSample}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs px-3 py-1 h-8"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Sample
              </Button>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs px-3 py-1 h-8"
                  asChild
                >
                  <span>
                    <Upload className="w-3 h-3 mr-1" />
                    Upload
                  </span>
                </Button>
              </label>
              
              <Button 
                onClick={onExport}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs px-3 py-1 h-8"
              >
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
              
              <Button 
                onClick={onToggleDarkMode}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white w-8 h-8 p-0"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/20 to-transparent" />
      </Card>
    </div>
  );
};