export async function onRequestGet({ request, env }) {
  const db = env.API_DB;
  if (!db) {
    return Response.json({ error: { message: "未绑定 Cloudflare KV: API_DB" } }, { status: 500 });
  }

  const settings = (await db.get("settings", "json")) || {};

  // Check Gateway API Key if configured
  if (settings.gatewayApiKey) {
    const authHeader = request.headers.get("Authorization");
    const expectedAuth = `Bearer ${settings.gatewayApiKey}`;
    if (!authHeader || authHeader !== expectedAuth) {
      return Response.json({ error: { message: "Invalid Gateway API Key. Unauthorized." } }, { status: 401 });
    }
  }

  const models = await db.get("models", "json") || [];
  
  return Response.json({
    object: "list",
    data: models.map((m: any) => ({
      id: m.modelCode,
      object: "model",
      created: Math.floor(Date.now() / 1000),
      owned_by: m.name
    }))
  });
}
