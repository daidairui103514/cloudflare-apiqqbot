export async function onRequestDelete({ request, env, params }) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const session = token ? await env.API_DB?.get(`session:${token}`, "json") : null;
  if (session?.role !== "admin") return Response.json({ error: "无权访问" }, { status: 403 });

  const db = env.API_DB;
  let codes = await db.get("registrationCodes", "json") || [];
  codes = codes.filter((c: string) => c !== params.code);
  await db.put("registrationCodes", JSON.stringify(codes));

  return Response.json({ success: true });
}
