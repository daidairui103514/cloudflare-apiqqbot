export async function onRequestPost({ request, env }) {
  const db = env.API_DB;
  if (!db) {
    return Response.json({ error: { message: "未绑定 Cloudflare KV: API_DB，请在 Cloudflare Pages 设置中绑定 KV 命名空间" } }, { status: 500 });
  }

  try {
    const rawBody = await request.text();
    const body = rawBody ? JSON.parse(rawBody) : {};
    const requestedModelCode = body.model;

    const models = (await db.get("models", "json")) || [];
    let provider = models.find((m) => m.modelCode === requestedModelCode);

    if (!provider) {
      const settings = (await db.get("settings", "json")) || {};
      provider = models.find((m) => m.id === settings.defaultModelId);
    }

    if (!provider) {
      return Response.json(
        { error: { message: `Model not found and no default selected. Requested: ${requestedModelCode}` } },
        { status: 404 }
      );
    }

    const cleanBase = provider.baseUrl.replace(/\/+$/, "");
    const upstreamUrl = `${cleanBase}/chat/completions`;

    // Construct upstream payload matching OpenAI spec
    const upstreamPayload = {
      ...body,
      model: provider.modelCode,
    };
    
    const settings = (await db.get("settings", "json")) || {};
    // Auto-inject system prompt if missing and not streaming (or modify as needed)
    if (settings.systemPrompt && upstreamPayload.messages) {
       const hasSystem = upstreamPayload.messages.some(m => m.role === "system");
       if (!hasSystem) {
          upstreamPayload.messages.unshift({
             role: "system",
             content: settings.systemPrompt
          });
       }
    }

    const response = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(provider.apiKey ? { Authorization: `Bearer ${provider.apiKey}` } : {}),
      },
      body: JSON.stringify(upstreamPayload),
    });

    // Cloudflare natively handles pipe-through for streaming responses
    // by just returning the response body verbatim.
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (e) {
    return Response.json({ error: { message: e.message } }, { status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
