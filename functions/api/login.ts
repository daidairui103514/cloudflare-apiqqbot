export async function onRequestPost({ request, env }) {
  const db = env.API_DB;
  if (!db) return Response.json({ error: "KV API_DB 未绑定" }, { status: 500 });

  const { username, password } = await request.json();
  const adminUser = env.ADMIN_USER || "admin";
  const adminPass = env.ADMIN_PASSWORD || "admin";

  if (username === adminUser && password === adminPass) {
    const token = crypto.randomUUID();
    const session = { role: "admin", username, apiKey: "" };
    await db.put(`session:${token}`, JSON.stringify(session), { expirationTtl: 604800 });
    return Response.json({ token, ...session });
  }

  const users = await db.get("users", "json") || [];
  const u = users.find((user: any) => user.username === username && user.password === password);
  
  if (u) {
    const token = crypto.randomUUID();
    const session = { role: u.role, username: u.username, apiKey: u.apiKey };
    await db.put(`session:${token}`, JSON.stringify(session), { expirationTtl: 604800 });
    return Response.json({ token, ...session });
  }

  return Response.json({ error: "账号或密码错误" }, { status: 401 });
}
