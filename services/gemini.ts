import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// NOTE: API Key must be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getChessAdvice = async (fen: string, question: string) => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a Grandmaster Chess Coach. 
      The current board position in FEN is: ${fen}.
      User question: ${question}.
      
      Provide a concise, helpful strategic analysis suitable for an intermediate player.
      Keep it under 100 words.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Désolé, le coach est momentanément indisponible.";
  }
};
