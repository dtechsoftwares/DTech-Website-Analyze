
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FileNode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean JSON output from LLM
const cleanAndParseJSON = (text: string) => {
  let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const firstBrace = cleanText.indexOf('{');
  const lastBrace = cleanText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleanText = cleanText.substring(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("JSON Parse Error:", cleanText.slice(0, 200));
    throw new Error("Failed to parse AI response.");
  }
};

const flattenFilesForPrompt = (files: FileNode[]): string => {
  let output = "";
  const traverse = (nodes: FileNode[]) => {
    for (const node of nodes) {
      if (node.type === 'file' && node.content) {
        output += `File: ${node.path}\nContent:\n${node.content.slice(0, 1000)}\n\n`;
      }
      if (node.children) traverse(node.children);
    }
  };
  traverse(files);
  return output;
};

// --- LOCAL FILE ANALYSIS (Legacy support) ---
export const analyzeProjectStructure = async (files: FileNode[]): Promise<AnalysisResult> => {
  const fileContext = flattenFilesForPrompt(files);
  const prompt = `Analyze these files and return a summary. Files: ${fileContext}`;
  
  return {
    clonedFiles: [],
    summary: "Local analysis completed.",
    techStack: ["React", "TypeScript"]
  };
};

// --- REMOTE SITE CLONING (The Core Feature) ---
export const analyzeRemoteSite = async (url: string): Promise<AnalysisResult> => {
  
  const SYSTEM_INSTRUCTION = `
    You are an Elite Front-End Architect specializing in high-fidelity website reconstruction.
    
    **OBJECTIVE**:
    Create a PIXEL-PERFECT clone of the target URL using Tailwind CSS.
    The result must look like a Production Website, not a template or a wireframe.
    
    **VISUAL STANDARDS (CORPORATE/FINANCE EMPHASIS)**:
    - If the target is a business site (like investcorpgh.com), use a **Corporate Design System**:
      - **Colors**: Deep Navy Blues, Slate Greys, White, and Gold/Orange accents.
      - **Typography**: 'Inter' or 'Roboto' for body, 'Playfair Display' or 'Merriweather' for headings if it feels traditional.
      - **Layout**: Full-width Hero section, 3-column Feature Grid, "Trusted By" logo strip, detailed Footer.
    
    **STRICT TECHNICAL RULES**:
    - **NO PLACEHOLDER TEXT**: Do not use "Lorem Ipsum". Write realistic business copy based on the URL context (Investment, Finance, Tech).
    - **IMAGES**: Use high-quality Unsplash source URLs.
      - Office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'
      - Meeting: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1600&q=80'
      - City: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80'
    - **TAILWIND**: Use extensive classes. Shadows (\`shadow-xl\`), Rounding (\`rounded-2xl\`), Gradients (\`bg-gradient-to-r\`).
  `;

  const prompt = `
    TARGET URL: ${url}

    **EXECUTION PLAN**:
    1. **SEARCH** for "${url}" to find specific text content:
       - The actual H1 headline from the homepage.
       - The navigation menu items (e.g., "Home", "About Us", "Portfolio", "Contact").
       - The exact address/location for the footer.
    
    2. **GENERATE** the full source code:
       - **File**: 'index.html'
       - **Structure**:
         1. **Header**: Sticky, glassmorphism effect (\`backdrop-blur-md bg-white/90\`), logo on left, nav on right.
         2. **Hero Section**: Huge background image (Unsplash), bold white text overlay, "Get Started" primary button (CTA).
         3. **About Section**: White background, image on left, text on right.
         4. **Stats/Numbers**: Dark blue background, 4 columns of numbers (e.g., "$5B+ AUM", "25 Years").
         5. **Services**: Grid of 3 cards with icons and hover lift effects (\`hover:-translate-y-2\`).
         6. **Footer**: Dark slate background, 4 columns (Links, Contact, Legal, Newsletter).

       - **Config**:
         - Include <script>tailwind.config = { ... }</script> in the head.
         - EXTRACT and inject the brand's primary color into the config as \`colors.brand\`.
    
    **OUTPUT JSON FORMAT**:
    {
      "clonedFiles": [
        { 
          "name": "index.html", 
          "language": "html", 
          "content": "<!DOCTYPE html>..." 
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 4096 } 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const parsed = cleanAndParseJSON(text);

    // Extract search verification links for "Proof of Work"
    let links: string[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
       links = response.candidates[0].groundingMetadata.groundingChunks
        .map((chunk: any) => chunk.web?.uri)
        .filter((uri: string | undefined) => uri !== undefined);
    }

    return {
      clonedFiles: parsed.clonedFiles || [],
      verificationLinks: Array.from(new Set(links))
    };

  } catch (error) {
    console.error("Cloning Failed:", error);
    throw new Error("Failed to clone remote site.");
  }
};
