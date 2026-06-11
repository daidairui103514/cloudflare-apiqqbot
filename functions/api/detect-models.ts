export async function onRequestPost({ request }) {
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
