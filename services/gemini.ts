
import { GoogleGenAI } from "@google/genai";

export const getChessAdvice = async (fen: string, question: string = "Quelle est la meilleure stratégie dans cette position ?") => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Tu es un Maître International d'échecs. Analyse la position FEN suivante : ${fen}. 
      Réponds à la question suivante de manière concise (3 phrases max) : ${question}. 
      Donne un conseil tactique précis.`,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Désolé, le coach est indisponible pour le moment.";
  }
};
