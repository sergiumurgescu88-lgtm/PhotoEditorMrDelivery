import { generatePollinations } from './adapters/pollinations.ts';

export async function runFallbackChain(prompt: string, images: string[]) {
  console.log('[FALLBACK] Using Pollinations (sincron & gratuit)...');
  const result = await generatePollinations(prompt);
  return { ...result, provider: 'Pollinations.ai' };
}
