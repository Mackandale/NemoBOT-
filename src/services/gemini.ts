import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface UserProfile {
  displayName: string;
  level: number;
  xp: number;
  badges: string[];
  bio?: string;
  preferences?: {
    tone: 'pedagogical' | 'technical' | 'concise';
    language: string;
  };
}

export interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export async function generateNemoResponse(
  messages: Message[],
  userProfile: UserProfile,
  mode: string = 'brain'
) {
  const modelName = "gemini-3-flash-preview";
  
  const systemInstruction = `Tu es NEMO, une IA ultra-intelligente, directe et sophistiquée.
Ton style est brutaliste, moderne et efficace.
Tu as une mémoire contextuelle vivante. Voici le profil de l'utilisateur actuel :
- Nom : ${userProfile.displayName}
- Niveau : ${userProfile.level}
- XP : ${userProfile.xp}
- Badges : ${userProfile.badges.join(', ')}
- Bio : ${userProfile.bio || 'Non renseignée'}

ADAPTATION DU NIVEAU :
- Si l'utilisateur est débutant, sois pédagogique et structuré.
- Si l'utilisateur est avancé, sois technique, direct et précis.
Analyse le ton et la complexité des messages précédents pour ajuster ta réponse.

MODE ACTUEL : ${mode.toUpperCase()}
- BRAIN : Analyse profonde, réflexion stratégique.
- CODE : Focus sur l'implémentation, la syntaxe et l'architecture.
- TARGET : Focus sur les objectifs, les résultats et l'efficacité.

Réponds toujours en français, sauf si on te demande une autre langue.
Utilise le Markdown pour structurer tes réponses.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: messages,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
}

export async function extractMemories(userId: string, text: string) {
  const modelName = "gemini-3-flash-preview";
  
  const systemInstruction = `Tu es un extracteur de mémoire pour NEMO. 
Analyse le texte suivant et extrais des informations clés sur l'utilisateur (préférences, faits, objectifs, projets).
Retourne uniquement un tableau JSON d'objets avec 'content' et 'type' (short, medium, long, strategic).
Exemple: [{"content": "L'utilisateur préfère le code en TypeScript", "type": "long"}]`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as { content: string; type: string }[];
  } catch (error) {
    console.error("Error extracting memories:", error);
    return [];
  }
}

export async function generateNemoSpeech(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
}
