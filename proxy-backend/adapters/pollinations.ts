export async function generatePollinations(prompt: string) {
  const seed = Math.floor(Math.random() * 99999);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
  console.log(`[POLLINATIONS] Fetching: ${url}`);
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pollinations HTTP ${res.status}`);
  
  const buffer = await res.arrayBuffer();
  return { imageUrl: `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}` };
}
