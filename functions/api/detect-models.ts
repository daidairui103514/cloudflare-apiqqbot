export async function onRequestPost({ request, env }) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const session = token ? await env.API_DB?.get(`session:${token}`, "json") : null;
  if (session?.role !== "admin") return Response.json({ error: "无权访问" }, { status: 403 });

  try {
     const { baseUrl, apiKey } = await request.json();
     if (!baseUrl) return Response.json({ error: { message: "baseUrl missing" } }, { status: 400 });
     
     const cleanBase = baseUrl.replace(/\/+$/, '');
     const response = await fetch(`${cleanBase}/models`, {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
     });
     
     if (!response.ok) {
        return Response.json({ error: { message: `API Error: ${response.status} ${await response.text()}` } }, { status: response.status });
     }
     
     const data = await response.json();
     return Response.json(data);
  } catch(e) {
     return Response.json({ error: { message: e.message } }, { status: 500 });
  }
}
