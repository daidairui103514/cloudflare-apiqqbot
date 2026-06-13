export async function onRequestGet({ request, env }) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const session = token ? await env.API_DB?.get(`session:${token}`, "json") : null;
  if (!session) return Response.json({ error: "未登录" }, { status: 401 });

  // Returning an empty object or whatever KV provides
  const tokenUsage = await env.API_DB?.get("tokenUsage", "json") || {};
  return Response.json({ tokenUsage });
}
