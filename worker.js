export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/generate" && request.method === "POST") {
      return new Response(
        JSON.stringify({ error: "API live bandh chhe." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    return env.ASSETS.fetch(request);
  }
};
