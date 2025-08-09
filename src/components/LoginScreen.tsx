import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Sparkles, Heart, TrendingUp } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (password: string) => boolean;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const success = onLogin(password);
    if (!success) {
      setIsLoading(false);
      setPassword('');
      const form = e.currentTarget as HTMLFormElement;
      form.classList.add('animate-shake');
      setTimeout(() => form.classList.remove('animate-shake'), 500);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl shadow-purple-500/50">
              <div className="flex items-center space-x-1">
                <Heart className="h-6 w-6 text-white" />
                <TrendingUp className="h-6 w-6 text-white" />
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2">
              LongevAI
            </h1>
            <p className="text-lg text-purple-200 font-medium">Financial Healthspan</p>
            <p className="text-sm text-slate-400 mt-2">Infinite Life • Infinite Possibilities</p>
          </div>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl shadow-black/20">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-white/90">
                    Access Code
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your access code"
                      className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-purple-400 focus:ring-purple-400/50 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-6 text-lg shadow-lg shadow-purple-500/25 transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Accessing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5" />
                      <span>Enter Dashboard</span>
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-center space-x-4 text-white/60">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs">Secure</span>
                  </div>
                  <div className="w-1 h-1 bg-white/30 rounded-full" />
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-xs">Encrypted</span>
                  </div>
                  <div className="w-1 h-1 bg-white/30 rounded-full" />
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    <span className="text-xs">Private</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-xs text-white/40">Powered by LongevAI • Securing Your Financial Future</p>
          </div>
        </div>
      </div>
    </div>
  );
}