import React, { useState } from 'react';
import { FileNode } from '../types';
import { Folder, FileText, ChevronRight, ChevronDown, Code, Image, FileCode, FileJson } from 'lucide-react';

interface FileTreeProps {
  nodes: FileNode[];
  level?: number;
}

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith('.html')) return <Code className="w-4 h-4 text-orange-500" />;
  if (fileName.endsWith('.css')) return <FileCode className="w-4 h-4 text-blue-400" />;
  if (fileName.endsWith('.js') || fileName.endsWith('.ts') || fileName.endsWith('.tsx')) return <FileCode className="w-4 h-4 text-yellow-400" />;
  if (fileName.endsWith('.json')) return <FileJson className="w-4 h-4 text-green-400" />;
  if (fileName.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) return <Image className="w-4 h-4 text-purple-400" />;
  if (fileName.endsWith('.php')) return <FileCode className="w-4 h-4 text-indigo-400" />;
  return <FileText className="w-4 h-4 text-slate-400" />;
};

export const FileTreeNode: React.FC<{ node: FileNode; level: number }> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === 'folder';

  const handleToggle = () => {
    if (isFolder) setIsOpen(!isOpen);
  };

  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-1 px-2 hover:bg-dark-800 rounded cursor-pointer transition-colors ${level === 0 ? 'mb-1' : ''}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleToggle}
      >
        <span className="mr-1.5 text-slate-500">
          {isFolder ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : <span className="w-[14px] inline-block" />}
        </span>
        
        <span className="mr-2">
          {isFolder ? <Folder className={`w-4 h-4 ${isOpen ? 'text-brand-500' : 'text-slate-500'}`} /> : getFileIcon(node.name)}
        </span>
        
        <span className={`text-sm truncate ${isFolder ? 'font-medium text-slate-200' : 'text-slate-400'}`}>
          {node.name}
        </span>
      </div>
      
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child, idx) => (
            <FileTreeNode key={`${child.path}-${idx}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree: React.FC<FileTreeProps> = ({ nodes }) => {
  return (
    <div className="h-full overflow-y-auto">
      {nodes.map((node, idx) => (
        <FileTreeNode key={`${node.path}-${idx}`} node={node} level={0} />
      ))}
      {nodes.length === 0 && (
        <div className="text-slate-500 text-sm italic p-4 text-center">
          No files loaded.
        </div>
      )}
    </div>
  );
};