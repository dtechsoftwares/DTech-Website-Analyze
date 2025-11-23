export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string; // Only populated for text files we want to analyze
  size: number;
  children?: FileNode[];
}

export interface BuildStep {
  step: string;
  description: string;
  tools: string[];
}

export interface LanguageStat {
  language: string;
  percentage: number;
}

export interface AnalysisResult {
  techStack: string[];
  architecture: string;
  confidenceScore: number;
  summary: string;
  buildSteps: BuildStep[];
  fileBreakdown: LanguageStat[];
  keyObservations: string[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  READING_FILES = 'READING_FILES',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}