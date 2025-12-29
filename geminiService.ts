import { GoogleGenAI, Type } from "@google/genai";
import { Job, AIAnalysis } from "./types";

const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

const API_KEY = getApiKey();

export const isApiConfigured = () => !!API_KEY;

/**
 * Searches for real job listings using Google Search Grounding.
 * Uses groundingChunks to extract verified external links.
 */
export const searchRealJobs = async (title: string, country: string): Promise<Job[]> => {
  if (!API_KEY) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-3-flash-preview";
  
  const prompt = `Find 15+ current, real-world job listings for "${title}" in "${country}" posted in the last 30 days. 
  For each job, provide:
  - Exact job title
  - Company name
  - Location
  - Mention the platform it was found on (LinkedIn, Indeed, etc.)
  
  Focus on high-quality, direct-to-company or major job board listings.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1, // Lower temperature for more factual results
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const text = response.text || "";

    // If grounding chunks exist, we try to map them to "Jobs"
    // Since groundingChunks often provide the cleanest verified URLs
    if (groundingChunks.length > 0) {
      return groundingChunks
        .filter(chunk => chunk.web && chunk.web.uri && chunk.web.title)
        .map((chunk, index) => {
          const web = chunk.web!;
          // Clean up titles that look like "Job Title at Company - Platform"
          let titlePart = web.title || "Job Opportunity";
          let companyPart = "Verified Listing";
          
          if (titlePart.includes(" at ")) {
            const parts = titlePart.split(" at ");
            titlePart = parts[0];
            companyPart = parts[1].split(" | ")[0].split(" - ")[0];
          }

          return {
            id: `job-${Date.now()}-${index}`,
            title: titlePart,
            company: companyPart,
            location: country,
            source: new URL(web.uri).hostname.replace('www.', ''),
            url: web.uri
          };
        });
    }

    // Fallback: If no grounding chunks (rare for search), try parsing the text loosely
    return [];
  } catch (error) {
    console.error("Error searching jobs:", error);
    throw error;
  }
};

/**
 * Provides deep analysis for a specific job title and location.
 */
export const getJobInsights = async (title: string, country: string): Promise<AIAnalysis> => {
  if (!API_KEY) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze the current job market for "${title}" in "${country}".
  Provide realistic salary ranges, core skills, and specific interview preparation tips for this role.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            salaryRange: { type: Type.STRING },
            interviewTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["requirements", "skills", "salaryRange", "interviewTips"]
        }
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error getting insights:", error);
    throw error;
  }
};