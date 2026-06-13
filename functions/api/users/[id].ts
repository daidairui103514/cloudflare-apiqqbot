export async function onRequestDelete({ request, env, params }) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const session = token ? await env.API_DB?.get(`session:${token}`, "json") : null;
  if (session?.role !== "admin") return Response.json({ error: "无权访问" }, { status: 403 });

  const db = env.API_DB;
  let users = await db.get("users", "json") || [];
  users = users.filter((u: any) => u.id !== params.id);
  await db.put("users", JSON.stringify(users));

  return Response.json({ success: true });
}
