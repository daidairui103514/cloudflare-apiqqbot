export async function onRequestGet({ request, env }) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const session = token ? await env.API_DB?.get(`session:${token}`, "json") : null;
  if (session?.role !== "admin") return Response.json({ error: "无权访问" }, { status: 403 });

  const users = await env.API_DB?.get("users", "json") || [];
  return Response.json(users.filter((u: any) => u.role === "guest").map((u: any) => ({ id: u.id, username: u.username, createdAt: u.createdAt, apiKey: u.apiKey })));
}
