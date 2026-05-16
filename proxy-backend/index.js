import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const app = new Hono();
app.use("*", cors({ origin: "*", allowHeaders: ["*"], allowMethods: ["*"], exposeHeaders: ["*"], maxAge: 86400 }));

const KIE_KEY = process.env.KIE_AI_KEY || "33cf3cc6cd1d5119326ef30851e4e53a";
const CALLBACK = "https://mrdelivery.shop/api/callback";
const PUBLIC_BASE = "https://mrdelivery.shop/api/uploads";
global.KR = global.KR || {};

const UPLOAD_DIR = "/root/mrdelivery-proxy/uploads";
if (!existsSync(UPLOAD_DIR)) mkdir(UPLOAD_DIR, { recursive: true });

const api = new Hono();

api.post("/upload", async (c) => {
  try {
    const { file, name } = await c.req.json();
    if (!file) return c.json({ err: "no file" }, 400);
    const base64 = file.replace(/^data:image\/\w+;base64,/, "");
    const fileName = `${Date.now()}-${name || "img.png"}`;
    await writeFile(path.join(UPLOAD_DIR, fileName), Buffer.from(base64, "base64"));
    return c.json({ url: `${PUBLIC_BASE}/${fileName}` });
  } catch (e) { return c.json({ err: e.message }, 500); }
});

api.get("/uploads/:file", async (c) => {
  const fp = path.join(UPLOAD_DIR, c.req.param("file"));
  if (!existsSync(fp)) return c.json({ err: "not found" }, 404);
  const ext = path.extname(fp);
  const mime = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "application/octet-stream";
  return new Response(await readFile(fp), { headers: { "Content-Type": mime, "Cache-Control": "public, max-age=3600" } });
});

api.get("/health", (c) => c.json({ ok: true, v: "flux2-pro-v12" }));

api.post("/callback", async (c) => {
  try {
    const d = await c.req.json();
    const tid = d.data?.taskId;
    if (!tid) return c.json({ err: "no taskId" }, 400);
    let url = null;
    if (d.data?.resultJson) {
      try { const rj = JSON.parse(d.data.resultJson); url = rj.resultUrls?.[0] || rj.result_url || rj.images?.[0] || null; } catch(e) {}
    }
    global.KR[tid] = { s: d.data?.state, url };
    console.log("[CB]", tid, d.data?.state, url);
    return c.json({ ok: true, tid });
  } catch (e) { console.error("[CB]", e.message); return c.json({ err: e.message }, 500); }
});

api.get("/status/:tid", (c) => {
  const r = global.KR[c.req.param("tid")];
  return r ? c.json({ tid: c.req.param("tid"), status: r.s, imageUrl: r.url }) : c.json({ status: "pending" });
});

async function runKieTask(c, inputObj, model = 'flux-2/pro-text-to-image') {
  try {
    const payload = { model, callBackUrl: CALLBACK, input: inputObj };
    console.log("[KIE] Payload:", JSON.stringify(payload).slice(0, 300));
    
    const r = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
      method: "POST",
      headers: { "Authorization": "Bearer " + KIE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const rawText = await r.text();
    console.log("[KIE] Raw Response:", rawText);
    
    if (!r.ok) {
      throw new Error(`Kie HTTP ${r.status}: ${rawText.slice(0, 200)}`);
    }
    
    let d;
    try { d = JSON.parse(rawText); } catch(e) { throw new Error("Invalid JSON from Kie: " + rawText.slice(0, 100)); }
    
    if (d.code !== 200) {
      const errMsg = d.msg || d.message || "Kie API Error";
      console.error("[KIE] API Error:", errMsg);
      throw new Error(errMsg);
    }
    
    const tid = d.data?.taskId;
    if (!tid) {
      throw new Error("No taskId in response");
    }
    
    return c.json({ taskId: tid, provider: "kie.ai", status: "processing", model });
  } catch(e) { 
    console.error("[TASK ERROR]", e.message); 
    return c.json({ err: e.message }, 500); 
  }
}

// ✅ GENERATE: Model Switching + Parametru Corect (input_urls)
api.post("/generate", async (c) => {
  const { prompt, aspect_ratio = "1:1", resolution = "1K", image_input = [] } = await c.req.json();
  if (!prompt) return c.json({ err: "no prompt" }, 400);
  
  const hasImages = Array.isArray(image_input) && image_input.length > 0;
  // Dacă avem imagini, folosim modelul care suportă imagini
  const model = hasImages ? 'flux-2/flex-image-to-image' : 'flux-2/pro-text-to-image';
  
  console.log(`[GENERATE] Model: ${model} | Images: ${hasImages}`);
  
  const inputObj = { prompt, aspect_ratio, resolution, nsfw_checker: false };
  if (hasImages) {
    // ✅ FIX CRITIC: Kie.ai cere 'input_urls' pentru modelul flex-image-to-image
    inputObj.input_urls = image_input; 
  }
  
  return runKieTask(c, inputObj, model);
});

// ✅ EDIT: Forțăm modelul de editare + input_urls
api.post("/edit", async (c) => {
  const { imageUrl, editPrompt, aspect_ratio = "1:1", resolution = "1K" } = await c.req.json();
  if (!imageUrl || !editPrompt) return c.json({ err: "missing params" }, 400);
  return runKieTask(c, { prompt: editPrompt, input_urls: [imageUrl], aspect_ratio, resolution, nsfw_checker: false }, 'flux-2/flex-image-to-image');
});

app.route("/api", api);
app.route("/", api);
app.notFound((c) => { console.log("[404]", c.req.path); return c.json({ err: "not found", path: c.req.path }, 404); });

const PORT = parseInt(process.env.PORT || "4900");
console.log("🚀 Proxy Flux-2 Pro v12 on :" + PORT);
serve({ fetch: app.fetch, port: PORT });
