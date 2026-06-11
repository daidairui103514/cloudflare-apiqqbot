export async function onRequestGet({ env }) {
  const db = env.API_DB;
  if (!db) return Response.json({ error: "未绑定 Cloudflare KV: API_DB" }, { status: 500 });
  const models = await db.get("models", "json") || [];
  return Response.json(models);
}

export async function onRequestPost({ request, env }) {
  const db = env.API_DB;
  if (!db) return Response.json({ error: "未绑定 Cloudflare KV: API_DB" }, { status: 500 });
  try {
    const data = await request.json();
    await db.put("models", JSON.stringify(data));
    return Response.json({ success: true });
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
