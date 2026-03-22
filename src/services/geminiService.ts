import { GoogleGenAI, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION, IMAGE_PROMPT_OPTIMIZER, MEMORY_ANALYZER_PROMPT } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async generateChatResponse(prompt: string, history: any[], systemInstruction: string = SYSTEM_INSTRUCTION, tools: any[] = []) {
    const model = "gemini-3.1-pro-preview";
    
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
        tools: tools.length > 0 ? tools : undefined,
      }
    });

    return response;
  },

  async generateImage(prompt: string) {
    // 1. Optimize prompt
    const optimizerResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: IMAGE_PROMPT_OPTIMIZER + prompt }] }]
    });
    
    const optimizedPrompt = optimizerResponse.text || prompt;

    // 2. Generate image
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: optimizedPrompt }] }],
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (imagePart?.inlineData) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }
    throw new Error("Failed to generate image");
  },

  async analyzeMemories(conversation: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: MEMORY_ANALYZER_PROMPT + conversation }] }],
      config: {
        responseMimeType: "application/json"
      }
    });

    try {
      const data = JSON.parse(response.text || '{"memories": []}');
      return data.memories || [];
    } catch (e) {
      console.error("Failed to parse memories", e);
      return [];
    }
  },

  async textToSpeech(text: string, voiceName: string = 'Zephyr') {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    throw new Error("Failed to generate speech");
  }
};
