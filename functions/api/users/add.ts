export async function onRequestPost({ request, env }) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const session = token ? await env.API_DB?.get(`session:${token}`, "json") : null;
  if (session?.role !== "admin") return Response.json({ error: "无权访问" }, { status: 403 });

  const { username, password } = await request.json();
  const adminUser = env.ADMIN_USER || "admin";
  const db = env.API_DB;
  let users = await db.get("users", "json") || [];

  if (users.some((u: any) => u.username === username) || username === adminUser) {
    return Response.json({ error: "该用户名已被使用或保留" }, { status: 400 });
  }

  const newUser = {
    id: crypto.randomUUID(),
    username,
    password,
    role: "guest",
    apiKey: "sk-" + crypto.randomUUID().replace(/-/g, ""),
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  await db.put("users", JSON.stringify(users));

  return Response.json({ success: true, user: { id: newUser.id, username: newUser.username, createdAt: newUser.createdAt, apiKey: newUser.apiKey } });
}
