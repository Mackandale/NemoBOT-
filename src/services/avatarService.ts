import { GoogleGenAI } from "@google/genai";

export async function generateNemoAvatar() {
  const CACHE_KEY = 'nemo_avatar_cache';
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) return cached;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: "A stunning high-quality digital art portrait of a futuristic female cyborg. She has short, sleek white hair and striking blue eyes. Her skin is pale and smooth, integrated with advanced white and silver cybernetic plating. Glowing orange and pink lights are embedded in her neck and around her ears, with intricate circuitry visible. She wears a sleek white high-tech suit. The background is a soft, out-of-focus futuristic city with blue and pink bokeh lights. The aesthetic is clean, premium, and highly detailed, similar to high-end 3D character renders. Calm and intelligent expression.",
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64 = `data:image/png;base64,${part.inlineData.data}`;
        localStorage.setItem(CACHE_KEY, base64);
        return base64;
      }
    }
  } catch (error) {
    console.error("Error generating avatar:", error);
  }
  return null;
}
