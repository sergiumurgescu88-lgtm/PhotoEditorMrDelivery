export async function generateGemini(prompt: string, images: string[], apiKey: string) {
  const parts: any[] = [{ text: prompt }];
  for (const img of images.slice(0, 3)) {
    const mimeMatch = img.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
    parts.push({ inlineData: { mimeType, data: base64Data } });
  }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ['IMAGE'], temperature: 0.4 } })
  });

  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error?.message || `Gemini HTTP ${res.status}`); }
  const data = await res.json();
  for (const c of data.candidates || []) for (const p of c.content?.parts || []) if (p.inlineData?.data) return { imageUrl: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` };
  throw new Error('Gemini did not return an image');
}
