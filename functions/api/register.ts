export async function onRequestPost({ request, env }) {
  const db = env.API_DB;
  if (!db) return Response.json({ error: "KV API_DB 未绑定" }, { status: 500 });
  
  const { username, password, registrationCode } = await request.json();
  const adminUser = env.ADMIN_USER || "admin";

  let codes = await db.get("registrationCodes", "json") || [];
  if (!registrationCode || !codes.includes(registrationCode)) {
    return Response.json({ error: "无效或不存在的注册码" }, { status: 400 });
  }

  let users = await db.get("users", "json") || [];
  if (users.some((u: any) => u.username === username) || username === adminUser) {
    return Response.json({ error: "该用户名已被使用或保留" }, { status: 400 });
  }

  codes = codes.filter((c: string) => c !== registrationCode);
  await db.put("registrationCodes", JSON.stringify(codes));

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

  return Response.json({ success: true });
}
