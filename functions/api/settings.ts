export async function onRequestGet({ request, env }) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const session = token ? await env.API_DB?.get(`session:${token}`, "json") : null;
  if (!session) return Response.json({ error: "无权访问" }, { status: 401 });

  const db = env.API_DB;
  if (!db) return Response.json({ error: "未绑定 Cloudflare KV: API_DB" }, { status: 500 });
  const settings = await db.get("settings", "json") || {
    systemPrompt: "您是一个极具有用处的智能助理。",
    defaultModelId: "",
    streamEnabled: true,
    contextRounds: 10,
  };
  return Response.json(settings);
}

export async function onRequestPost({ request, env }) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const session = token ? await env.API_DB?.get(`session:${token}`, "json") : null;
  if (session?.role !== "admin") return Response.json({ error: "无权访问" }, { status: 403 });

  const db = env.API_DB;
  if (!db) return Response.json({ error: "未绑定 Cloudflare KV: API_DB" }, { status: 500 });

  try {
    const data = await request.json();
    await db.put("settings", JSON.stringify(data));
    return Response.json({ success: true });
  } catch(e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
