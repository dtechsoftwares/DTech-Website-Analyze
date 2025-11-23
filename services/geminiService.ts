import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FileNode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a world-class Senior Software Architect and Reverse Engineer. 
Your job is to analyze the file structure and content of a web project to determine:
1. The Tech Stack (e.g., React, WordPress, Elementor, Vue, plain HTML/CSS).
2. The Architecture (e.g., SPA, MPA, Headless CMS, Monolith).
3. A step-by-step "Reverse Engineering" guide on how to build this exact site from scratch.
4. Key observations about the code quality or specific libraries used.

Detailed Rules:
- If you see 'wp-content', 'style.css' with WP headers, it's WordPress. Check for plugins in paths to identify builders like Elementor or Divi.
- If you see 'package.json', analyze dependencies.
- Provide a confidence score (0-100).
`;

// Helper to flatten the file tree into a readable list for the LLM
const flattenFilesForPrompt = (files: FileNode[]): string => {
  let output = "";
  const traverse = (nodes: FileNode[], depth = 0) => {
    for (const node of nodes) {
      const indent = "  ".repeat(depth);
      output += `${indent}- ${node.name} (${node.type})\n`;
      
      // Include content for critical configuration/structure files
      // We limit content length to avoid token limits, focusing on headers/config
      if (node.type === 'file' && node.content) {
        const isCritical = 
          node.name.endsWith('.json') || 
          node.name.endsWith('.php') || 
          node.name.endsWith('.html') || 
          node.name.endsWith('.css') ||
          node.name.endsWith('.js') ||
          node.name.endsWith('.config.js');
          
        if (isCritical) {
          output += `${indent}  >>> START CONTENT PREVIEW (${node.name}) <<<\n`;
          output += `${indent}  ${node.content.slice(0, 1500).replace(/\n/g, `\n${indent}  `)}\n`;
          output += `${indent}  >>> END CONTENT PREVIEW <<<\n`;
        }
      }

      if (node.children) {
        traverse(node.children, depth + 1);
      }
    }
  };
  traverse(files);
  return output;
};

export const analyzeProjectStructure = async (files: FileNode[]): Promise<AnalysisResult> => {
  const fileContext = flattenFilesForPrompt(files);

  const prompt = `
    Analyze this web project structure and file contents.
    
    Files:
    ${fileContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            techStack: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of technologies detected (e.g., React, Tailwind, WordPress, Elementor)"
            },
            architecture: { 
              type: Type.STRING,
              description: "High-level architecture description" 
            },
            confidenceScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            buildSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.STRING },
                  description: { type: Type.STRING },
                  tools: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            fileBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  language: { type: Type.STRING },
                  percentage: { type: Type.NUMBER }
                }
              }
            },
            keyObservations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("Failed to analyze project structure.");
  }
};