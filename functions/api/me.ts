export async function onRequestGet({ request, env }) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  if (!token) return Response.json({ error: "未登录" }, { status: 401 });
  
  const session = await env.API_DB?.get(`session:${token}`, "json");
  if (!session) return Response.json({ error: "未登录，或登录已过期" }, { status: 401 });
  
  return Response.json(session);
}
