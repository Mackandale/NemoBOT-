import { SYSTEM_INSTRUCTION, IMAGE_PROMPT_OPTIMIZER, MEMORY_ANALYZER_PROMPT } from "../constants";

export const geminiService = {
  async generateChatResponse(prompt: string, history: any[], systemInstruction: string = SYSTEM_INSTRUCTION, tools: any[] = []) {
    const response = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, history, systemInstruction, tools })
    });
    
    if (!response.ok) throw new Error("Failed to generate chat response");
    return await response.json();
  },

  async generateImage(prompt: string) {
    const response = await fetch("/api/gemini/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, optimizerPrompt: IMAGE_PROMPT_OPTIMIZER })
    });
    
    if (!response.ok) throw new Error("Failed to generate image");
    const data = await response.json();
    return data.imageData;
  },

  async analyzeMemories(conversation: string) {
    const response = await fetch("/api/gemini/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation, analyzerPrompt: MEMORY_ANALYZER_PROMPT })
    });
    
    if (!response.ok) throw new Error("Failed to analyze memories");
    return await response.json();
  },

  async textToSpeech(text: string, voiceName: string = 'Zephyr') {
    const response = await fetch("/api/gemini/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceName })
    });
    
    if (!response.ok) throw new Error("Failed to generate speech");
    const data = await response.json();
    return data.audioData;
  }
};
