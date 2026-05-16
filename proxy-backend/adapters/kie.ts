export async function generateKie(prompt: string, images: string[], apiKey: string, callbackBaseUrl: string): Promise<{taskId: string}> {
  const urlImages = images.filter(i => i.startsWith('http')).slice(0, 5);
  console.log('[KIE] Creating task with callback...');
  const createRes = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'nano-banana-2',
      callBackUrl: `${callbackBaseUrl}/api/callback`,
      input: {
        prompt,
        image_input: urlImages,
        aspect_ratio: 'auto',
        resolution: '1K',
        output_format: 'png'
      }
    })
  });
  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.msg || `Kie create HTTP ${createRes.status}`);
  }
  const createData = await createRes.json();
  const taskId = createData.data?.taskId;
  if (!taskId) throw new Error('Kie did not return taskId');
  console.log(`[KIE] Task created: ${taskId}`);
  return { taskId };
}
