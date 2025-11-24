
import React, { useState, useEffect } from 'react';
import { AnalysisResult, ClonedFile } from '../types';
import { Code, Eye, Download, FileCode, FileJson, FileText, Globe, Layout, MonitorPlay, ShieldCheck, ChevronRight, Copy, Check, Smartphone, Tablet, Monitor } from 'lucide-react';

interface AnalysisDashboardProps {
  result: AnalysisResult;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result }) => {
  const [activeFile, setActiveFile] = useState<ClonedFile | null>(null);
  const [viewMode, setViewMode] = useState<'code' | 'preview' | 'split'>('split');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  // Set initial file
  useEffect(() => {
    if (result.clonedFiles && result.clonedFiles.length > 0) {
      // Prefer index.html as default
      const indexHtml = result.clonedFiles.find(f => f.name === 'index.html');
      setActiveFile(indexHtml || result.clonedFiles[0]);
    }
  }, [result]);

  // Handle Copy
  const handleCopyCode = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.html')) return <Code className="w-4 h-4 text-orange-500" />;
    if (name.endsWith('.css')) return <FileCode className="w-4 h-4 text-blue-400" />;
    if (name.endsWith('.js')) return <FileCode className="w-4 h-4 text-yellow-400" />;
    if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-green-400" />;
    if (name.endsWith('.md')) return <FileText className="w-4 h-4 text-slate-400" />;
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  const getPreviewWidth = () => {
    switch (deviceMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  // Safe Preview Render
  const PreviewFrame = () => {
    const htmlFile = result.clonedFiles.find(f => f.name === 'index.html');
    
    if (!htmlFile) return <div className="p-10 text-slate-500">No index.html found to render.</div>;

    return (
      <div className={`h-full transition-all duration-300 mx-auto border-x border-slate-300 bg-white shadow-xl ${deviceMode !== 'desktop' ? 'my-4 rounded-lg overflow-hidden ring-4 ring-slate-800' : ''}`} style={{ width: getPreviewWidth() }}>
        <iframe
          title="Live Preview"
          className="w-full h-full bg-white"
          srcDoc={htmlFile.content}
          sandbox="allow-scripts allow-same-origin" 
        />
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col animate-in fade-in duration-500">
      
      {/* Top Bar: Controls */}
      <div className="h-14 bg-dark-900 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-brand-600 flex items-center justify-center">
              <Layout className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Clone Studio</h2>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-green-400 flex items-center gap-0.5">
                   <ShieldCheck size={10} /> Live Data Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggles */}
        <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
          <button 
            onClick={() => setViewMode('code')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${viewMode === 'code' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Code size={14} /> Code
          </button>
          <button 
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all hidden md:flex ${viewMode === 'split' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Layout size={14} /> Split
          </button>
          <button 
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${viewMode === 'preview' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Eye size={14} /> Preview
          </button>
        </div>

        <button className="bg-white hover:bg-slate-200 text-slate-900 text-xs font-bold px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
          <Download size={14} /> Export Project
        </button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar: File Explorer */}
        <div className="w-64 bg-dark-950 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-dark-900 border-b border-slate-800">
            Explorer
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {result.clonedFiles.map((file) => (
              <button
                key={file.name}
                onClick={() => setActiveFile(file)}
                className={`w-full text-left px-4 py-2 flex items-center gap-2 text-sm transition-colors border-l-2 ${activeFile?.name === file.name ? 'bg-slate-800 border-brand-500 text-white' : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
              >
                {getFileIcon(file.name)}
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </div>
          
          {/* Verification Links Footer */}
          {result.verificationLinks && result.verificationLinks.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-dark-900/50">
               <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1">
                 <Globe size={10} /> Source Data
               </div>
               <div className="space-y-1">
                 {result.verificationLinks.slice(0, 3).map((link, i) => (
                   <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="block text-[10px] text-brand-400 truncate hover:underline">
                     {new URL(link).hostname}
                   </a>
                 ))}
               </div>
            </div>
          )}
        </div>

        {/* Center: Content */}
        <div className="flex-1 flex bg-[#1e1e1e] overflow-hidden">
          
          {/* Code Editor View */}
          {(viewMode === 'code' || viewMode === 'split') && (
            <div className={`flex flex-col border-r border-slate-800 ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
              
              {/* Editor Header */}
              {activeFile && (
                <div className="h-9 bg-[#2d2d2d] flex items-center justify-between px-4 select-none shrink-0">
                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    {getFileIcon(activeFile.name)}
                    {activeFile.name}
                  </div>
                  <button onClick={handleCopyCode} className="text-slate-400 hover:text-white transition-colors">
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              )}

              {/* Code Area */}
              <div className="flex-1 overflow-auto custom-scrollbar p-0 relative group">
                {activeFile ? (
                  <pre className="text-[13px] leading-6 font-mono text-slate-300 p-4 tab-4 min-w-max">
                    <code>{activeFile.content}</code>
                  </pre>
                ) : (
                   <div className="flex items-center justify-center h-full text-slate-600 text-sm">Select a file to view source</div>
                )}
              </div>
            </div>
          )}

          {/* Preview View */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={`flex flex-col ${viewMode === 'split' ? 'w-1/2' : 'w-full'} bg-slate-100`}>
               <div className="h-9 bg-white border-b border-slate-300 flex items-center px-4 justify-between shrink-0">
                  <div className="flex items-center gap-2">
                     <button 
                       onClick={() => setDeviceMode('desktop')}
                       className={`p-1 rounded ${deviceMode === 'desktop' ? 'bg-slate-200 text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                       title="Desktop View"
                     >
                       <Monitor size={14} />
                     </button>
                     <button 
                       onClick={() => setDeviceMode('tablet')}
                       className={`p-1 rounded ${deviceMode === 'tablet' ? 'bg-slate-200 text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                       title="Tablet View"
                     >
                       <Tablet size={14} />
                     </button>
                     <button 
                       onClick={() => setDeviceMode('mobile')}
                       className={`p-1 rounded ${deviceMode === 'mobile' ? 'bg-slate-200 text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                       title="Mobile View"
                     >
                       <Smartphone size={14} />
                     </button>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] text-slate-500">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                     Live Preview
                  </div>
               </div>
               <div className="flex-1 relative bg-slate-200/50 overflow-hidden">
                 <PreviewFrame />
               </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};
