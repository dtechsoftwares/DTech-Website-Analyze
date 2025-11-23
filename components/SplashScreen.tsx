import React, { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate initialization process
    const timer = setInterval(() => {
      setProgress(prev => {
        // Randomize increment for realism
        const increment = Math.random() * 4 + 1; 
        const next = prev + increment;
        
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        onComplete();
      }, 600); // Short delay at 100% before transition
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-dark-950 flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center p-8 max-w-md w-full">
        
        {/* Logo Container */}
        <div className="mb-10 relative group">
           <div className="absolute inset-0 bg-brand-500 blur-2xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity duration-500"></div>
           <div className="bg-gradient-to-tr from-brand-600 to-purple-600 p-8 rounded-3xl shadow-2xl border border-white/10 relative transform transition-transform duration-700 hover:scale-105">
             <Terminal className="w-20 h-20 text-white" strokeWidth={1.5} />
           </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12 space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            DTech <span className="text-brand-500">Analyzer</span>
          </h1>
          <p className="text-slate-500 text-sm font-mono tracking-[0.2em] uppercase">
            Reverse Engineering Suite
          </p>
        </div>

        {/* Progress Section */}
        <div className="w-full space-y-3">
          <div className="flex justify-between text-xs font-mono text-brand-400">
            <span>
              {progress < 30 && "INITIALIZING_CORE..."}
              {progress >= 30 && progress < 60 && "LOADING_NEURAL_MODELS..."}
              {progress >= 60 && progress < 90 && "CONNECTING_GEMINI_API..."}
              {progress >= 90 && "SYSTEM_READY"}
            </span>
            <span>{Math.min(100, Math.floor(progress))}%</span>
          </div>
          
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-500 via-purple-500 to-brand-500 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-8 text-[10px] text-slate-600 font-mono">
          v2.5.0-stable build
        </div>
      </div>
    </div>
  );
};