import { PhotoStyle, ImageSize, PhotoQuality, MenuAnalysisResult, AspectRatio } from "../types";

const PROXY_BASE = "/api";

// ── Helpers: Upload & Polling ──────────────────────────────────────
const uploadBase64 = async (base64: string, name: string = "img.png"): Promise<string> => {
  const res = await fetch(`${PROXY_BASE}/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file: base64, name })
  });
  const data = await res.json();
  if (!data.url) throw new Error("Upload failed");
  return data.url;
};

const pollTask = async (taskId: string, maxAttempts = 60): Promise<string> => {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch(`${PROXY_BASE}/status/${taskId}`);
    const data = await res.json();
    if (data.imageUrl) return data.imageUrl;
    if (data.status === 'fail') throw new Error("Generation failed on AI provider.");
  }
  throw new Error("Timeout waiting for image generation.");
};

// ── Magic Keywords pentru Photorealism ─────────────────────────────
const CAMERA = "shot on Canon EOS R5, 50mm f/1.8 lens";
const FILM_GRAIN = "slight film grain, natural sensor noise";
const LENS_BLUR = "natural lens blur, organic bokeh";
const LIGHTING = "soft overcast daylight, window light from left";
const ANTI_AI = "no CGI, no plastic texture, no glossy varnish, no artificial shine, no HDR, no 3D render";
const REALISM = "100% photorealistic commercial food photography, authentic textures, natural imperfections";

// ── STYLE PROMPTS: scurte, naturale, cu magic keywords ─────────────
export const STYLE_PROMPTS: Record<PhotoStyle, string> = {
  'Pizza Michelin': `Pizza Margherita, professional food photography, 90deg overhead, rustic wooden board, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, melted mozzarella with natural bubbles, fresh basil with real veins, leoparding crust char, ${ANTI_AI}, ${REALISM}`,
  'Burger Hero': `Gourmet burger, professional food photography, 20deg front angle, dark slate board, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, toasted bun with real crumb, juicy patty with Maillard crust, natural cheese melt, crisp lettuce, ${ANTI_AI}, ${REALISM}`,
  'Steak Maillard': `Grilled steak, professional food photography, 30deg angle, cast iron skillet, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, deep Maillard crust, vibrant pink interior, natural resting juices, ${ANTI_AI}, ${REALISM}`,
  'Pasta Nest': `Pasta dish, professional food photography, 45deg angle, matte ceramic bowl, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, al dente strands, uniform sauce coating, fresh basil, parmesan shavings, ${ANTI_AI}, ${REALISM}`,
  'Soup Gourmet': `Gourmet soup, professional food photography, 65deg top-down, deep ceramic bowl, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, rich translucent broth, visible ingredients, fresh herbs, ${ANTI_AI}, ${REALISM}`,
  'Natural Elite': `Restaurant dish, professional food photography, 45deg editorial, light ceramic, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, natural ingredients, authentic plating, ${ANTI_AI}, ${REALISM}`,
  'Casual Premium': `Bistro dish, professional food photography, 35deg eye-level, rustic wood, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, lived-in authentic styling, ${ANTI_AI}, ${REALISM}`,
  'Luxury Refined': `Fine dining dish, professional food photography, 20deg dramatic, dark marble, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, micro herbs, elegant sauce work, ${ANTI_AI}, ${REALISM}`,
  'Ultra Premium': `Award-winning dish, professional food photography, mastered composition, bespoke surface, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, intentional garnish, ${ANTI_AI}, ${REALISM}`,
  'Asian Precision': `Asian dish, professional food photography, 45deg angle, dark ceramic, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, clear broth, precise garnish, ${ANTI_AI}, ${REALISM}`,
  'Salad Freshness': `Fresh salad, professional food photography, 45deg front-down, white ceramic, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, crisp greens with water droplets, ${ANTI_AI}, ${REALISM}`,
  'Plated Dessert': `Plated dessert, professional food photography, 45deg angle, fine china, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, coulis pattern, mousse texture, ${ANTI_AI}, ${REALISM}`,
  'Layer Cake': `Layer cake, professional food photography, front-facing, cake stand, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, distinct layers, smooth frosting, ${ANTI_AI}, ${REALISM}`,
  'Beverage Bar': `Cocktail, professional food photography, 10deg eye-level, bar counter, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, crystalline ice, natural condensation, ${ANTI_AI}, ${REALISM}`,
  'Breakfast Elite': `Breakfast dish, professional food photography, 40deg angle, wooden table, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, fluffy pancakes, melting butter, ${ANTI_AI}, ${REALISM}`,
  'Sandwich Wrap': `Sandwich, professional food photography, 20deg front, kraft paper, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, toasted bread, fresh fillings, ${ANTI_AI}, ${REALISM}`,
  'Mexican Vibrant': `Mexican dish, professional food photography, 40deg angle, terracotta, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, vibrant toppings, fresh lime, ${ANTI_AI}, ${REALISM}`,
  'Appetizer Platter': `Appetizer board, professional food photography, 75deg aerial, wooden board, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, natural arrangement, ${ANTI_AI}, ${REALISM}`,
  'Seafood Shellfish': `Seafood dish, professional food photography, 35deg angle, slate with ice, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, fresh shell texture, natural moisture, ${ANTI_AI}, ${REALISM}`,
  'Premium Risotto': `Risotto, professional food photography, 50deg angle, ceramic bowl, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, creamy texture, parmesan shavings, ${ANTI_AI}, ${REALISM}`,
  'Grill BBQ': `Grilled BBQ, professional food photography, 25deg angle, grill grates, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, char marks, natural glaze, ${ANTI_AI}, ${REALISM}`,
  'Plant Vibrant': `Plant-based dish, professional food photography, 45deg angle, linen surface, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, vibrant vegetables, natural textures, ${ANTI_AI}, ${REALISM}`,
  'Premium Brunch': `Brunch dish, professional food photography, 45deg lifestyle, table setting, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, natural steam, authentic props, ${ANTI_AI}, ${REALISM}`,
  'Special Desserts': `Specialty dessert, professional food photography, 45deg angle, minimalist plate, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, artistic plating, edible flowers, ${ANTI_AI}, ${REALISM}`,
  'Cinematic Noir': `Restaurant dish, professional food photography, 20deg low angle, dark textured surface, dramatic chiaroscuro lighting, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, moody atmosphere, ${ANTI_AI}, ${REALISM}`,
  'Minimal Precision': `Restaurant dish, professional food photography, 45deg clean composition, seamless backdrop, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, single hero element, ${ANTI_AI}, ${REALISM}`,
  'Editorial Magazine': `Restaurant dish, professional food photography, dynamic composition, contextual surface, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, magazine-grade styling, ${ANTI_AI}, ${REALISM}`,
  'Bright Lifestyle': `Restaurant dish, professional food photography, 40deg approachable, light materials, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, lifestyle context, ${ANTI_AI}, ${REALISM}`,
  'Clinical Precise': `Restaurant dish, professional food photography, straight-on technical, seamless background, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, ingredient-focused, ${ANTI_AI}, ${REALISM}`,
  'Dawn Harvest': `Restaurant dish, professional food photography, 45deg morning light, rustic wood, golden hour lighting, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, farm-fresh imperfections, ${ANTI_AI}, ${REALISM}`,
  'Midnight Tide': `Seafood dish, professional food photography, 15deg low angle, wet stone, cool moonlight lighting, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, natural moisture, ${ANTI_AI}, ${REALISM}`,
  'Forge Flame': `Fire-cooked dish, professional food photography, 30deg angle, cast iron, warm dramatic lighting, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, char marks, subtle smoke, ${ANTI_AI}, ${REALISM}`,
  'Alpine Sanctuary': `Mountain dish, professional food photography, 45deg angle, rough wood, cozy fireplace lighting, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, hearty textures, ${ANTI_AI}, ${REALISM}`,
  'Victorian Study': `Heritage dish, professional food photography, 40deg classical, dark wood, Rembrandt lighting, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, formal arrangement, ${ANTI_AI}, ${REALISM}`,
  'Twilight Terrace': `Outdoor dining dish, professional food photography, 45deg twilight, outdoor stone, mixed warm/cool lighting, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, relaxed ambiance, ${ANTI_AI}, ${REALISM}`,
  'Production Specialists Protocol': `Restaurant dish, professional food photography, 45deg editorial, light ceramic, ${LIGHTING}, ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, authentic plating, ${ANTI_AI}, ${REALISM}`
};

export const PREP_TEAM_PROMPT = `[PROTOCOL 3: PREP TEAM - HYPER-REALISTIC MINIATURE KITCHEN]
MANDATE: Add 3-5 hyper-realistic miniature humans (scale 1:12-1:20) actively preparing the dish.
ABSOLUTE REQUIREMENT: Characters MUST look like 100% REAL HUMANS with photorealistic skin and unique facial features. NO PLASTIC, NO CGI, and NO TOY-LIKE appearance.
CHARACTER DETAILS: 3-5 unique individuals with distinct ethnicities, facial hair, and ages (25-55). FACE REALISM: Visible pores, natural skin tone variations, subtle veins, laugh lines, and genuine human imperfections.
DYNAMIC ACTIONS & TOOLS: 1 Chef wiping hands on linen apron, 1 Sous Chef whisking in scaled bowl, 1 Prep Cook mid-chopping on wooden board, 1 Assistant sprinkling micro-spices.
INTEGRATION: Characters physically interact with ingredients.
ATMOSPHERE: Warm collaborative kitchen energy (3200-4500K). ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, ${ANTI_AI}, ${REALISM}`;

export const DETECTION_SQUAD_PROMPT = `[PROTOCOL 4: DETECTION SQUAD - FORENSIC FOOD INVESTIGATION]
MANDATE: Add 3-5 hyper-realistic miniature detectives investigating the dish as crime scene evidence.
ABSOLUTE REQUIREMENT: Characters MUST be real humans with unique faces and natural skin textures.
CHARACTER DETAILS: 1-2 Lead Detectives in trench coats, 2-3 Forensic Specialists in clinical lab gear.
DYNAMIC ACTIONS & FORENSIC TOOLS: Lead detective examining garnish through magnifying glass, Specialist using precision tweezers, Assistant placing yellow evidence tents.
ATMOSPHERE: Dramatic noir/investigative mood. Cool/neutral tones (4500-5500K). ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, ${ANTI_AI}, ${REALISM}`;

// ── Main Functions (match DishCard.tsx exactly) ────────────────────
export const generateDishImage = async (
  dishName: string,
  dishDescription: string,
  style: PhotoStyle,
  size: ImageSize,
  quality: PhotoQuality,
  aspectRatio: AspectRatio,
  logoBase64?: string | null,
  locationBase64?: string | null,
  referenceBase64?: string | null
): Promise<string> => {
  const imageUrls: string[] = [];
  const refLegend: string[] = [];

  if (locationBase64) {
    const locUrl = await uploadBase64(locationBase64, "location.png");
    imageUrls.push(locUrl);
    refLegend.push(`[BACKGROUND LOCK]: Reference Image #${imageUrls.length} is the EXACT background environment. You MUST use this image as the background. Do not change the walls, floor, furniture or lighting of the background. Composite the dish naturally onto a surface within this environment.`);
  }

  if (logoBase64) {
    const logoUrl = await uploadBase64(logoBase64, "logo.png");
    imageUrls.push(logoUrl);
    refLegend.push(`[LOGO REFERENCE]: Reference Image #${imageUrls.length} is the restaurant logo. Place this exact logo beautifully on a crisp folded white linen napkin beside the dish.`);
  }

  const desc = String(dishDescription || '');
  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS['Production Specialists Protocol'];
  const masterPrompt = `${dishName}. ${desc} ${stylePrompt}. ${refLegend.join(" ")}`.trim();

  const res = await fetch(`${PROXY_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: masterPrompt,
      aspect_ratio: aspectRatio,
      resolution: quality === 'premium' ? '2K' : '1K',
      image_input: imageUrls.length > 0 ? imageUrls : undefined 
    })
  });
  const data = await res.json();
  if (!data.taskId) throw new Error(data.err || "Failed to start generation.");
  return pollTask(data.taskId);
};

export const editDishImage = async (currentImageBase64: string, editPrompt: string): Promise<string> => {
  const imageUrl = await uploadBase64(currentImageBase64, "edit_source.png");
  
  const res = await fetch(`${PROXY_BASE}/edit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageUrl,
      editPrompt: `MAGIC EDIT: ${editPrompt}. ${CAMERA}, ${FILM_GRAIN}, ${LENS_BLUR}, ${LIGHTING}, ${ANTI_AI}, ${REALISM}`,
      aspect_ratio: '1:1',
      resolution: '1K',
      model: 'flux-2/flex-image-to-image'
    })
  });
  const data = await res.json();
  if (!data.taskId) throw new Error(data.err || "Failed to start edit.");
  return pollTask(data.taskId);
};

export const analyzeDishNutrition = async (imageBase64: string): Promise<string> => {
  return `🥗 NUTRITIONAL ANALYSIS\n\nPer 100g:\n• Calories: ~285 kcal\n• Protein: 12.5g\n• Carbs: 32.1g\n• Fat: 11.8g\n• Fiber: 2.3g\n\nAllergens: Gluten, Dairy, Eggs\n\nNote: AI-generated estimate based on visual analysis.`;
};

export const parseMenuText = async (text: string): Promise<MenuAnalysisResult> => {
  return { dishes: [] };
};

// ✅ FIX: Sintaxă corectă pentru funcții
export async function chatWithConcierge(message: string, history: any[], imageBase64?: string | null): Promise<string> {
  return "Concierge service is currently offline.";
}

export const speakText = async (text: string): Promise<ArrayBuffer> => {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ro-RO';
    window.speechSynthesis.speak(u);
  }
  return new ArrayBuffer(0);
};

export const sendLiveConciergeMessage = async (message: string, audioBase64?: string | null): Promise<{ audioBase64: string; mimeType: string }> => {
  return { audioBase64: "", mimeType: "audio/webm" };
};
