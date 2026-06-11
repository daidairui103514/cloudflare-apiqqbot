export async function onRequestGet({ env }) {
  const db = env.API_DB;
  if (!db) return Response.json({ error: "未绑定 Cloudflare KV: API_DB" }, { status: 500 });
  const settings = await db.get("settings", "json") || {
    systemPrompt: "您是一个极具备帮助的智能助理。",
    defaultModelId: "",
    streamEnabled: true,
    contextRounds: 10,
  };
  return Response.json(settings);
}

export async function onRequestPost({ request, env }) {
  const db = env.API_DB;
  if (!db) return Response.json({ error: "未绑定 Cloudflare KV: API_DB" }, { status: 500 });
  try {
    const data = await request.json();
    await db.put("settings", JSON.stringify(data));
    return Response.json({ success: true });
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
