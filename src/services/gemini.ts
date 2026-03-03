import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// We use the environment variable for the API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResult {
  tech_stack: {
    language: string;
  };
  performance: {
    time_complexity: string;
    space_complexity: string;
    bottleneck_analysis: string;
  };
  code_review: {
    score: number;
    positive_observations: string[];
    weaknesses: string[];
    refactoring_suggestions: string[];
  };
  professional_impact: {
    resume_bullets: string[];
  };
  skill_radar: {
    frontend: number;
    backend: number;
    devops: number;
    security: number;
    design: number;
    architecture: number;
  };
  learning_path: {
    focus_area: string;
    reasoning: string;
    roadmap: {
      step: number;
      title: string;
      description: string;
      resources: string[];
    }[];
  };
}

export async function analyzeCode(code: string): Promise<AnalysisResult> {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    You are an expert senior software engineer and technical interviewer. 
    Analyze the following code snippet and generate a structured report.
    
    Return ONLY a valid JSON object with the following structure (no markdown formatting, just raw JSON):
    {
      "tech_stack": { "language": "Language Name" },
      "performance": { 
        "time_complexity": "Big O notation", 
        "space_complexity": "Big O notation", 
        "bottleneck_analysis": "Brief analysis of performance bottlenecks" 
      },
      "code_review": { 
        "score": number (0-100), 
        "positive_observations": ["point 1", "point 2"], 
        "weaknesses": ["weakness 1", "weakness 2"],
        "refactoring_suggestions": ["suggestion 1", "suggestion 2"] 
      },
      "professional_impact": { 
        "resume_bullets": [
          "Action-oriented bullet point for a resume focusing on what this code achieves",
          "Another bullet point highlighting technical skills used",
          "Third bullet point emphasizing optimization or problem-solving"
        ] 
      },
      "skill_radar": {
        "frontend": number (0-100),
        "backend": number (0-100),
        "devops": number (0-100),
        "security": number (0-100),
        "design": number (0-100),
        "architecture": number (0-100)
      },
      "learning_path": {
        "focus_area": "The primary area the user should focus on improving (e.g., Backend, DevOps, Security)",
        "reasoning": "A brief explanation of why this focus area was chosen based on their code and current IT industry trends.",
        "roadmap": [
          {
            "step": 1,
            "title": "Title of the first learning step",
            "description": "Detailed description of what to learn and why it's important.",
            "resources": ["Topic to search 1", "Topic to search 2"]
          },
          {
            "step": 2,
            "title": "Title of the second learning step",
            "description": "Detailed description of what to learn and why it's important.",
            "resources": ["Topic to search 1", "Topic to search 2"]
          },
          {
            "step": 3,
            "title": "Title of the third learning step",
            "description": "Detailed description of what to learn and why it's important.",
            "resources": ["Topic to search 1", "Topic to search 2"]
          }
        ]
      }
    }

    Code to analyze:
    ${code}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

    return JSON.parse(cleanText) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing code:", error);
    throw error;
  }
}
