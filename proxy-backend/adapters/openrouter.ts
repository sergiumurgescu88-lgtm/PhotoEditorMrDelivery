export async function generateOpenRouter(prompt: string, images: string[], apiKey: string) {
  const res = await fetch('https://openrouter.ai/api/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mrdelivery.shop',
      'X-Title': 'MrDelivery AI Studio'
    },
    body: JSON.stringify({
      model: 'black-forest-labs/flux-1-schnell',
      prompt: prompt,
      response_format: 'b64_json'
    })
  });

  const raw = await res.text();
  console.log(`[OR] HTTP ${res.status} | ${raw.slice(0, 300)}`);

  if (!res.ok) {
    throw new Error(`OpenRouter HTTP ${res.status}. Verifică dacă cheia are acces la image generation.`);
  }

  const data = JSON.parse(raw);
  if (data.data?.[0]?.b64_json) {
    return { imageUrl: `data:image/png;base64,${data.data[0].b64_json}` };
  }
  throw new Error('OpenRouter response format unexpected: ' + raw.slice(0, 200));
}
