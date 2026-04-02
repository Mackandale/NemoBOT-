export const addWavHeader = (pcmBase64: string, sampleRate: number) => {
  const pcmData = Uint8Array.from(atob(pcmBase64), c => c.charCodeAt(0));
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  /* RIFF identifier */
  view.setUint32(0, 0x52494646, false);
  /* file length */
  view.setUint32(4, 36 + pcmData.length, true);
  /* RIFF type */
  view.setUint32(8, 0x57415645, false);
  /* format chunk identifier */
  view.setUint32(12, 0x666d7420, false);
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw PCM) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  view.setUint32(36, 0x64617461, false);
  /* data chunk length */
  view.setUint32(40, pcmData.length, true);

  const blob = new Blob([header, pcmData], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const cleanTextForSpeech = (text: string) => {
  return text
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
    .replace(/\.\.\./g, " , ") // Natural pause
    .replace(/[!?.]{2,}/g, ".")
    .replace(/[*_`~]/g, "")
    .replace(/\[.*?\]/g, "") // remove system tags like [✔]
    .trim();
};

export const cleanTextForCopy = (text: string) => {
  return text
    .replace(/[*_`~]/g, "")
    .replace(/^\s*[-•]\s?/gm, "") // remove lists
    .trim();
};

export const stripMarkdown = (text: string) => {
  return text
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(\*|_)(.*?)\1/g, '$2')     // italic
    .replace(/`{3}[\s\S]*?`{3}/g, '')    // code blocks
    .replace(/`(.+?)`/g, '$1')           // inline code
    .replace(/#+\s+(.+)/g, '$1')         // headers
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')  // links
    .replace(/---\n/g, '')               // horizontal rules
    .trim();
};
