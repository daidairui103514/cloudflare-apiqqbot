export async function onRequestPost({ request, env }) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  if (token && env.API_DB) {
     await env.API_DB.delete(`session:${token}`);
  }
  return Response.json({ success: true });
}
