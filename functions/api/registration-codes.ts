export async function onRequestGet({ request, env }) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const session = token ? await env.API_DB?.get(`session:${token}`, "json") : null;
  if (session?.role !== "admin") return Response.json({ error: "无权访问" }, { status: 403 });

  const codes = await env.API_DB?.get("registrationCodes", "json") || [];
  return Response.json({ codes });
}
