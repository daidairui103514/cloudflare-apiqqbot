export async function onRequestGet({ request, env }) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const session = token ? await env.API_DB?.get(`session:${token}`, "json") : null;
  if (!session) return Response.json({ error: "无权访问" }, { status: 401 });

  const db = env.API_DB;
  if (!db) return Response.json({ error: "未绑定 Cloudflare KV: API_DB" }, { status: 500 });
  const models = await db.get("models", "json") || [];
  return Response.json(models);
}

export async function onRequestPost({ request, env }) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const session = token ? await env.API_DB?.get(`session:${token}`, "json") : null;
  if (session?.role !== "admin") return Response.json({ error: "无权访问" }, { status: 403 });

  const db = env.API_DB;
  if (!db) return Response.json({ error: "未绑定 Cloudflare KV: API_DB" }, { status: 500 });

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
