import { GoogleGenAI } from "@google/genai";

export const getChessAdvice = async (fen: string, question: string) => {
  try {
    // Initialisation LAZY (paresseuse) : On initialise le client seulement quand on en a besoin.
    // Cela empêche l'application de planter au démarrage (White Screen) si process.env.API_KEY
    // est indéfini ou provoque une erreur lors du chargement initial du module.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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
    return "Désolé, le coach est momentanément indisponible (Vérifiez la clé API).";
  }
};