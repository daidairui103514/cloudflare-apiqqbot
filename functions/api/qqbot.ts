export async function onRequestGet({ env }) {
  const db = env.API_DB;
  if (!db) return Response.json({ error: "未绑定 Cloudflare KV: API_DB，请在 Cloudflare Pages 设置中绑定 KV 命名空间" }, { status: 500 });
  const config = await db.get("qqbot", "json") || {
    appId: "",
    token: "",
    sandbox: false,
    botId: "",
  };
  return Response.json(config);
}

export async function onRequestPost({ request, env }) {
  const db = env.API_DB;
  if (!db) return Response.json({ error: "未绑定 Cloudflare KV: API_DB，请在 Cloudflare Pages 设置中绑定 KV 命名空间" }, { status: 500 });
  try {
    const data = await request.json();
    await db.put("qqbot", JSON.stringify(data));
    return Response.json({ success: true });
  } catch(e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
