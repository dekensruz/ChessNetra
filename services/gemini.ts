import { GoogleGenAI } from "@google/genai";

// Fonction sécurisée pour récupérer la clé API (Compatible Vite et CRA)
const getApiKey = () => {
  // 1. Essayer d'accéder via import.meta.env (Standard Vite / Vercel moderne)
  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignorer si import.meta n'existe pas
  }

  // 2. Essayer d'accéder via process.env (Standard Node / CRA)
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.REACT_APP_API_KEY || process.env.API_KEY;
    }
  } catch (e) {
    // Ignorer erreur process
  }

  return '';
};

// Initialize Gemini
const API_KEY = getApiKey();
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getChessAdvice = async (fen: string, question: string) => {
  if (!API_KEY) {
    console.warn("Clé API Gemini manquante. Veuillez configurer VITE_API_KEY sur Vercel.");
    return "L'IA n'est pas configurée correctement (Clé API manquante).";
  }

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