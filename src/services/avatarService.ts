export async function generateNemoAvatar() {
  const CACHE_KEY = 'nemo_avatar_cache';
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) return cached;

  try {
    const response = await fetch("/api/gemini/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "A stunning high-quality digital art portrait of a futuristic female cyborg. She has short, sleek white hair and striking blue eyes. Her skin is pale and smooth, integrated with advanced white and silver cybernetic plating. Glowing orange and pink lights are embedded in her neck and around her ears, with intricate circuitry visible. She wears a sleek white high-tech suit. The background is a soft, out-of-focus futuristic city with blue and pink bokeh lights. The aesthetic is clean, premium, and highly detailed, similar to high-end 3D character renders. Calm and intelligent expression.",
        aspectRatio: "9:16"
      })
    });

    if (!response.ok) throw new Error("Failed to generate avatar");
    const data = await response.json();
    const base64 = data.imageData;
    localStorage.setItem(CACHE_KEY, base64);
    return base64;
  } catch (error) {
    console.error("Error generating avatar:", error);
  }
  return null;
}
