import React from 'react';
import { AnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { CheckCircle2, Cpu, Layers, Zap, AlertCircle } from 'lucide-react';

interface AnalysisDashboardProps {
  result: AnalysisResult;
}

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result }) => {
  
  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-900 border border-slate-700 p-2 rounded shadow-xl text-xs">
          <p className="font-semibold text-slate-200">{`${payload[0].name} : ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-900/50 border border-slate-800 p-5 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-brand-500" />
            <h3 className="text-slate-300 font-medium">Core Tech Stack</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.techStack.map((tech) => (
              <span key={tech} className="px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-500 text-xs font-semibold border border-brand-500/20">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-dark-900/50 border border-slate-800 p-5 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-purple-500" />
            <h3 className="text-slate-300 font-medium">Architecture</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">{result.architecture}</p>
        </div>

        <div className="bg-dark-900/50 border border-slate-800 p-5 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="text-slate-300 font-medium">AI Confidence</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">{result.confidenceScore}%</span>
            <span className="text-slate-500 text-sm mb-1">match probability</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full rounded-full" 
              style={{ width: `${result.confidenceScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Build Steps Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dark-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-green-500" />
              Reconstruction Guide
            </h3>
            
            <div className="relative border-l border-slate-800 ml-3 space-y-8">
              {result.buildSteps.map((step, idx) => (
                <div key={idx} className="pl-8 relative group">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-800 group-hover:bg-brand-500 transition-colors border border-slate-600 group-hover:border-brand-400"></div>
                  <h4 className="text-slate-200 font-medium text-base mb-1">{step.step}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">{step.description}</p>
                  
                  {step.tools.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {step.tools.map(tool => (
                        <span key={tool} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="text-blue-500" />
              Key Observations
            </h3>
            <ul className="space-y-2">
              {result.keyObservations.map((obs, idx) => (
                <li key={idx} className="text-slate-400 text-sm flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {obs}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Charts & Summary */}
        <div className="space-y-6">
          <div className="bg-dark-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-4">Code Composition</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={result.fileBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="percentage"
                  >
                    {result.fileBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-900/50 to-dark-900 border border-brand-500/20 rounded-xl p-6">
            <h3 className="text-brand-400 font-semibold mb-2 text-sm uppercase tracking-wider">Executive Summary</h3>
            <p className="text-slate-300 text-sm leading-relaxed italic">
              "{result.summary}"
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};