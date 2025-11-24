
import React, { useEffect, useState, useRef } from 'react';
import { FileNode } from '../types';
import { Cpu, Terminal as TerminalIcon, HardDrive, Wifi, Activity, Shield, Search, Lock, Zap, Database, Globe } from 'lucide-react';

interface TechLoaderProps {
  files: FileNode[];
  status: 'READING' | 'ANALYZING';
  targetUrl?: string;
}

export const TechLoader: React.FC<TechLoaderProps> = ({ files, status, targetUrl }) => {
  const [currentLog, setCurrentLog] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // Simulation States
  const [scanProgress, setScanProgress] = useState(0);
  const [activeNode, setActiveNode] = useState<string>('Initializing');

  // Logs Logic
  useEffect(() => {
    const analysisLogs = [
      "Resolving DNS handshake...",
      "Bypassing TLS fingerprinting...",
      "Injecting headless agent...",
      "Analyzing DOM structure...",
      "Extracting 'Brand Identity' vectors...",
      "Parsing computed styles (CSSOM)...",
      "Identifying Hero Section assets...",
      "Reconstructing Navigation Tree...",
      "Compiling Tailwind configuration...",
      "Finalizing Clone Artifacts..."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < analysisLogs.length) {
        setCurrentLog(prev => [...prev.slice(-8), `> ${analysisLogs[i]}`]);
        setActiveNode(analysisLogs[i].split('...')[0]);
        setScanProgress(prev => Math.min(prev + 10, 100));
        i++;
      }
    }, 800);

    return () => clearInterval(interval);
  }, [targetUrl]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [currentLog]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-6 animate-in fade-in duration-700">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[500px]">
        
        {/* LEFT COLUMN: SYSTEM STATUS */}
        <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-dark-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col">
                <div className="bg-dark-900 p-3 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                    </div>
                    <div className="text-brand-500 font-mono text-[10px] animate-pulse">
                        SYSTEM::ACTIVE
                    </div>
                </div>

                <div className="p-4 flex-1 bg-black/50 font-mono text-xs flex flex-col relative overflow-hidden">
                    <div ref={logContainerRef} className="flex-1 overflow-y-auto space-y-2 z-10 scrollbar-none">
                        {currentLog.map((log, idx) => (
                            <div key={idx} className="text-slate-300 flex items-start">
                                <span className="text-brand-600 mr-2 shrink-0">➜</span>
                                <span className="opacity-90">{log}</span>
                            </div>
                        ))}
                        <div className="animate-pulse text-brand-500">_</div>
                    </div>
                    
                    {/* Background Noise */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: VISUAL SCANNER (No more iframe errors) */}
        <div className="lg:col-span-8 h-full min-h-[400px]">
            <div className="h-full bg-dark-950 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col relative">
                
                {/* Header */}
                <div className="bg-slate-900 p-2 px-4 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <Globe className="w-4 h-4 text-brand-500" />
                         <span className="text-xs font-mono text-slate-300 truncate max-w-[200px]">
                            {targetUrl || 'LOCAL_ENV'}
                         </span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 bg-slate-950 rounded text-[10px] text-green-400 font-mono border border-green-900/50">
                        <Lock size={10} />
                        SECURE_TUNNEL
                    </div>
                </div>

                {/* VISUALIZER CANVAS */}
                <div className="flex-1 bg-[#050505] relative overflow-hidden flex items-center justify-center">
                    
                    {/* Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                    {/* Central Scanner */}
                    <div className="relative z-10">
                        {/* Outer Ring */}
                        <div className="w-64 h-64 rounded-full border border-brand-500/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_10s_linear_infinite]"></div>
                        <div className="w-48 h-48 rounded-full border border-brand-500/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_5s_linear_infinite_reverse]"></div>
                        
                        {/* Core */}
                        <div className="w-32 h-32 bg-dark-900/90 backdrop-blur-md rounded-full border border-brand-400/50 flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(14,165,233,0.2)]">
                            <Activity className="w-8 h-8 text-brand-400 animate-pulse mb-2" />
                            <div className="text-[10px] text-brand-200 font-mono">{Math.round(scanProgress)}%</div>
                            
                            {/* Scanning Beam */}
                            <div className="absolute inset-0 rounded-full overflow-hidden">
                                <div className="w-full h-1/2 bg-gradient-to-b from-transparent to-brand-500/20 absolute top-0 animate-[scan_2s_linear_infinite] origin-bottom border-b border-brand-400/50"></div>
                            </div>
                        </div>

                        {/* Orbiting Nodes */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 animate-bounce duration-1000">
                           <div className="px-3 py-1 bg-brand-900/80 border border-brand-500/50 rounded text-[10px] text-brand-200 whitespace-nowrap">
                              {activeNode}
                           </div>
                           <div className="w-px h-8 bg-brand-500/50 mx-auto"></div>
                        </div>
                    </div>

                    {/* Data Particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-blue-500 rounded-full animate-ping delay-700"></div>
                        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-ping delay-300"></div>
                    </div>

                </div>

                {/* Footer Stats */}
                <div className="bg-slate-900 p-2 border-t border-slate-700 grid grid-cols-3 divide-x divide-slate-700 text-center">
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-500 font-mono">REQUESTS</span>
                        <span className="text-xs text-white font-bold">{Math.floor(scanProgress * 1.5)}</span>
                     </div>
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-500 font-mono">ASSETS</span>
                        <span className="text-xs text-white font-bold">{Math.floor(scanProgress * 0.4)}</span>
                     </div>
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-500 font-mono">LATENCY</span>
                        <span className="text-xs text-green-400 font-bold">24ms</span>
                     </div>
                </div>

            </div>
        </div>

      </div>
      
      <div className="text-center text-slate-600 text-xs font-mono uppercase tracking-[0.2em] animate-pulse">
         Processing Remote Environment
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
