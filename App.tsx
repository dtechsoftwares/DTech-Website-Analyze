
import React, { useState, useRef, useCallback } from 'react';
import { Upload, FolderOpen, Loader2, Sparkles, Terminal, Globe, ArrowRight, Search } from 'lucide-react';
import { FileNode, AnalysisResult, AnalysisStatus } from './types';
import { analyzeProjectStructure, analyzeRemoteSite } from './services/geminiService';
import { FileTree } from './components/FileTree';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { SplashScreen } from './components/SplashScreen';
import { TechLoader } from './components/TechLoader';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to process FileList into a tree structure
  const processFiles = async (fileList: FileList) => {
    setStatus(AnalysisStatus.READING_FILES);
    const rootNodes: FileNode[] = [];
    const map: Record<string, FileNode> = {};
    
    // Sort files to process folders first if needed, but simple path splitting works better
    // Limit processing to prevent browser hanging on massive projects (e.g. node_modules)
    const MAX_FILES_TO_PROCESS = 300; 
    let processedCount = 0;

    const filesArray = Array.from(fileList);
    
    // Preliminary sort to ensure directory creation order isn't strictly necessary but helpful
    filesArray.sort((a, b) => a.webkitRelativePath.localeCompare(b.webkitRelativePath));

    for (const file of filesArray) {
      if (processedCount > MAX_FILES_TO_PROCESS) break;
      
      // Skip node_modules and .git to save resources
      if (file.webkitRelativePath.includes('node_modules') || file.webkitRelativePath.includes('.git')) {
        continue;
      }

      processedCount++;
      const pathParts = file.webkitRelativePath.split('/');
      let currentPath = '';

      // Create directories in path
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!map[currentPath]) {
          const newNode: FileNode = {
            name: part,
            path: currentPath,
            type: 'folder',
            size: 0,
            children: []
          };
          map[currentPath] = newNode;
          
          if (i === 0) {
            rootNodes.push(newNode);
          } else {
            const parent = map[parentPath];
            if (parent && parent.children) {
              // Avoid duplicates
              if (!parent.children.find(c => c.name === part)) {
                parent.children.push(newNode);
              }
            }
          }
        }
      }

      // Handle the file itself
      const fileName = pathParts[pathParts.length - 1];
      const filePath = file.webkitRelativePath;
      
      // Read content for interesting text files
      let content = undefined;
      const isInteresting = /\.(json|php|html|css|js|jsx|ts|tsx|config\.js|xml|txt|md)$/i.test(fileName);
      
      if (isInteresting && file.size < 50000) { // Only read small text files < 50kb
         try {
           content = await file.text();
         } catch (e) {
           console.warn(`Could not read ${fileName}`, e);
         }
      }

      const fileNode: FileNode = {
        name: fileName,
        path: filePath,
        type: 'file',
        size: file.size,
        content: content
      };

      const parentFolder = pathParts.slice(0, -1).join('/');
      if (parentFolder && map[parentFolder]) {
        map[parentFolder].children?.push(fileNode);
      } else {
        // Root file
        rootNodes.push(fileNode);
      }
    }

    setFiles(rootNodes);
    handleAnalysis(rootNodes);
  };

  const handleAnalysis = async (nodes: FileNode[]) => {
    setStatus(AnalysisStatus.ANALYZING);
    try {
      const result = await analyzeProjectStructure(nodes);
      setAnalysisResult(result);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    
    // Create dummy nodes for the visualizer
    const dummyNodes: FileNode[] = [
      { name: 'index.html', path: 'index.html', type: 'file', size: 1024 },
      { name: 'styles.css', path: 'styles.css', type: 'file', size: 1024 },
      { name: 'app.js', path: 'app.js', type: 'file', size: 1024 },
      { name: 'assets', path: 'assets', type: 'folder', size: 0, children: [
         { name: 'logo.png', path: 'assets/logo.png', type: 'file', size: 0 } 
      ]}
    ];
    setFiles(dummyNodes);
    
    setStatus(AnalysisStatus.ANALYZING);
    try {
      const result = await analyzeRemoteSite(urlInput);
      setAnalysisResult(result);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col font-sans selection:bg-brand-500/30 selection:text-brand-100 animate-in fade-in duration-700">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-brand-600 to-purple-600 p-2 rounded-lg shadow-lg shadow-brand-500/20">
              <Terminal className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">DTech <span className="text-brand-500">Analyzer</span></h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-wide uppercase">Reverse Engineering Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {status === AnalysisStatus.COMPLETED && (
               <button 
                 onClick={() => {
                   setStatus(AnalysisStatus.IDLE);
                   setFiles([]);
                   setAnalysisResult(null);
                   setUrlInput('');
                 }}
                 className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
               >
                 New Analysis
               </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Sidebar / File Explorer */}
        <div className={`md:col-span-3 flex flex-col h-[calc(100vh-140px)] rounded-xl border border-slate-800 bg-dark-900/30 overflow-hidden transition-all duration-500 ${status === AnalysisStatus.IDLE ? 'opacity-50 pointer-events-none blur-[1px]' : 'opacity-100'}`}>
          <div className="p-3 border-b border-slate-800 bg-dark-900/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Files</span>
            <span className="text-[10px] text-slate-600 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {files.length > 0 ? 'LOADED' : 'EMPTY'}
            </span>
          </div>
          <div className="flex-1 overflow-hidden p-2">
            <FileTree nodes={files} />
          </div>
        </div>

        {/* Main Workspace */}
        <div className="md:col-span-9 flex flex-col min-h-[calc(100vh-140px)]">
          
          {/* IDLE STATE: Selection Mode */}
          {status === AnalysisStatus.IDLE && (
            <div className="flex-1 flex flex-col justify-center p-4 md:p-8 animate-in fade-in zoom-in duration-500">
               <div className="text-center mb-10">
                 <h2 className="text-3xl font-bold text-white mb-3">Begin Analysis</h2>
                 <p className="text-slate-400">Choose how you want to reverse engineer your project</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
                  {/* Option 1: Upload */}
                  <div 
                    onClick={triggerFileInput}
                    className="relative group bg-dark-900/50 hover:bg-dark-900 border border-slate-700 hover:border-brand-500 rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-brand-500/10"
                  >
                     <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 group-hover:bg-brand-500/10 group-hover:scale-110 transition-all duration-500">
                        <Upload className="w-10 h-10 text-slate-500 group-hover:text-brand-500" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2">Upload Source Code</h3>
                     <p className="text-sm text-slate-400 mb-6">
                       Scan local files (React, WP, HTML) to generate a build guide.
                     </p>
                     <div className="text-brand-400 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       Select Folder <ArrowRight size={14} />
                     </div>
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFolderSelect}
                        className="hidden"
                        /* @ts-ignore: webkitdirectory is non-standard */
                        webkitdirectory=""
                        directory=""
                        multiple
                      />
                  </div>

                  {/* Option 2: URL */}
                  <div className="relative group bg-dark-900/50 hover:bg-dark-900 border border-slate-700 hover:border-purple-500 rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 shadow-lg hover:shadow-purple-500/10">
                     <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 group-hover:bg-purple-500/10 group-hover:scale-110 transition-all duration-500">
                        <Globe className="w-10 h-10 text-slate-500 group-hover:text-purple-500" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2">Clone from URL</h3>
                     <p className="text-sm text-slate-400 mb-6">
                       Enter a website link to simulate a reverse engineering guide.
                     </p>
                     
                     <div className="w-full max-w-xs relative" onClick={(e) => e.stopPropagation()}>
                       <input 
                         type="text" 
                         value={urlInput}
                         onChange={(e) => setUrlInput(e.target.value)}
                         placeholder="https://example.com"
                         className="w-full bg-black/30 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                         onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                       />
                       <button 
                         onClick={handleUrlSubmit}
                         disabled={!urlInput}
                         className="absolute right-1 top-1 bottom-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 rounded-md transition-colors"
                       >
                         <Search size={14} />
                       </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* LOADING STATES */}
          {(status === AnalysisStatus.READING_FILES || status === AnalysisStatus.ANALYZING) && (
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <TechLoader 
                files={files} 
                status={status === AnalysisStatus.READING_FILES ? 'READING' : 'ANALYZING'} 
                targetUrl={urlInput}
              />
            </div>
          )}

          {/* RESULTS DASHBOARD */}
          {status === AnalysisStatus.COMPLETED && analysisResult && (
            <AnalysisDashboard result={analysisResult} />
          )}

          {/* ERROR STATE */}
          {status === AnalysisStatus.ERROR && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                <Sparkles className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Analysis Failed</h2>
              <p className="text-slate-400 mb-6">Something went wrong while communicating with the AI.</p>
              <button 
                onClick={() => setStatus(AnalysisStatus.IDLE)}
                className="text-brand-400 hover:text-brand-300 underline underline-offset-4"
              >
                Try Again
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
