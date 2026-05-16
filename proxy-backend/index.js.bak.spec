// mrdelivery-proxy/index.js — MINIMAL JS, NO TYPESCRIPT
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";

const app = new Hono();
app.use("*", cors());

const KIE_KEY = process.env.KIE_AI_KEY || "";
const CALLBACK = "https://mrdelivery.shop/api/callback";

// Global cache for webhook results
global.KR = global.KR || {};

// Health
app.get("/health", (c) => c.json({ ok: true }));

// Callback webhook from Kie.ai
app.post("/callback", async (c) => {
  try {
    const d = await c.req.json();
    const tid = d.data?.taskId;
    if (!tid) return c.json({ err: "no taskId" }, 400);
    global.KR[tid] = {
      s: d.data?.state,
      url: d.data?.resultJson ? JSON.parse(d.data.resultJson).resultUrls?.[0] : null
    };
    return c.json({ ok: true, tid });
  } catch (e) {
    console.error("[CB]", e);
    return c.json({ err: e.message }, 500);
  }
});

// Poll status
app.get("/status/:tid", (c) => {
  const tid = c.req.param("tid");
  const r = global.KR[tid];
  if (!r) return c.json({ err: "not found" }, 404);
  return c.json({ tid, status: r.s, imageUrl: r.url });
});

// Generate — sync wait max 90s
app.post("/generate", async (c) => {
  try {
    const { prompt } = await c.req.json();
    if (!prompt) return c.json({ err: "no prompt" }, 400);
    const inp = JSON.stringify({ prompt, aspect_ratio: "16:9", resolution: "1K", output_format: "png" });
    const r = await fetch("https://api.kie.ai/v1/playground/task", {
      method: "POST",
      headers: { "Authorization": "Bearer " + KIE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ input: inp, callBackUrl: CALLBACK, model: "nano-banana-2" })
    });
    if (!r.ok) throw new Error("Kie HTTP " + r.status);
    const d = await r.json();
    const tid = d.data?.taskId;
    // Poll sync
    for (let i = 0; i < 90; i++) {
      await new Promise((res) => setTimeout(res, 1000));
      const res = global.KR[tid];
      if (res?.url) return c.json({ imageUrl: res.url, provider: "kie.ai" });
    }
    return c.json({ err: "timeout" }, 504);
  } catch (e) {
    console.error("[GEN]", e.message);
    return c.json({ err: e.message }, 500);
  }
});

// Edit — async return taskId
app.post("/edit", async (c) => {
  try {
    const { imageUrl, editPrompt } = await c.req.json();
    if (!imageUrl || !editPrompt) return c.json({ err: "missing" }, 400);
    const inp = JSON.stringify({ prompt: editPrompt, image_input: [imageUrl], aspect_ratio: "16:9", resolution: "1K", output_format: "png" });
    const r = await fetch("https://api.kie.ai/v1/playground/task", {
      method: "POST",
      headers: { "Authorization": "Bearer " + KIE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ input: inp, callBackUrl: CALLBACK, model: "nano-banana-2" })
    });
    if (!r.ok) throw new Error("Kie HTTP " + r.status);
    const d = await r.json();
    return c.json({ taskId: d.data?.taskId, provider: "kie.ai" });
  } catch (e) {
    console.error("[EDIT]", e.message);
    return c.json({ err: e.message }, 500);
  }
});

// Logo — async return taskId
app.post("/logo", async (c) => {
  try {
    const { imageUrl, logoUrl, placement } = await c.req.json();
    if (!imageUrl || !logoUrl) return c.json({ err: "missing" }, 400);
    const pos = placement || "napkin";
    const prm = "Place restaurant logo naturally on a " + pos + ", realistic texture, correct lighting, photorealistic";
    const inp = JSON.stringify({ prompt: prm, image_input: [imageUrl, logoUrl], aspect_ratio: "16:9", resolution: "1K", output_format: "png" });
    const r = await fetch("https://api.kie.ai/v1/playground/task", {
      method: "POST",
      headers: { "Authorization": "Bearer " + KIE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ input: inp, callBackUrl: CALLBACK, model: "nano-banana-2" })
    });
    if (!r.ok) throw new Error("Kie HTTP " + r.status);
    const d = await r.json();
    return c.json({ taskId: d.data?.taskId, provider: "kie.ai" });
  } catch (e) {
    console.error("[LOGO]", e.message);
    return c.json({ err: e.message }, 500);
  }
});

// 404 handler
app.notFound((c) => c.json({ err: "not found", routes: ["/health","/callback","/status/:tid","/generate","/edit","/logo"] }, 404));

const PORT = parseInt(process.env.PORT || "4900");
console.log("🚀 Proxy JS on :" + PORT);
serve({ fetch: app.fetch, port: PORT });
