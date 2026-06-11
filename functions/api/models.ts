export async function onRequestGet({ env }) {
  const db = env.API_DB;
  if (!db) return Response.json({ error: "未绑定 Cloudflare KV: API_DB，请在 Cloudflare Pages 设置中绑定 KV 命名空间" }, { status: 500 });
  const models = await db.get("models", "json") || [];
  return Response.json(models);
}

export async function onRequestPost({ request, env }) {
  const db = env.API_DB;
  if (!db) return Response.json({ error: "未绑定 Cloudflare KV: API_DB，请在 Cloudflare Pages 设置中绑定 KV 命名空间" }, { status: 500 });
  try {
    const data = await request.json();
    // Provide a fallback depending on whether it's wrapped in { models: ... } or just array
    const modelsToSave = Array.isArray(data) ? data : (data.models || []);
    await db.put("models", JSON.stringify(modelsToSave));
    return Response.json({ success: true });
  } catch(e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
