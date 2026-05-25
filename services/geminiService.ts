import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

// Initialize the client only if the key is available
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateScript = async (topic: string, tone: string = 'professional'): Promise<string> => {
  if (!ai) {
    throw new Error("API Key is missing. Please configure process.env.API_KEY.");
  }

  try {
    const prompt = `Write a video script about "${topic}". The tone should be ${tone}. 
    Keep it concise (around 200-300 words). 
    Format it as plain text suitable for a teleprompter (no scene descriptions, just spoken text).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Sorry, I couldn't generate a script at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate script. Please try again.");
  }
};

export const polishScript = async (currentText: string): Promise<string> => {
  if (!ai) {
    throw new Error("API Key is missing.");
  }

  try {
    const prompt = `Rewrite the following teleprompter text to be more natural, better flow for speaking, and correct any grammar issues. Keep the meaning identical.
    
    TEXT:
    ${currentText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || currentText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};