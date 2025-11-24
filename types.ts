
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  size: number;
  children?: FileNode[];
}

export interface ClonedFile {
  name: string;
  language: 'html' | 'css' | 'javascript' | 'json' | 'typescript';
  content: string;
}

export interface AnalysisResult {
  // Legacy fields for local analysis
  techStack?: string[];
  summary?: string;
  
  // New Cloning Fields
  clonedFiles: ClonedFile[];
  verificationLinks?: string[]; // URLs used for grounding
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  READING_FILES = 'READING_FILES',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
