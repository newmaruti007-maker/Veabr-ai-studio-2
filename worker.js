export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/generate" && request.method === "POST") {
      try {
        if (!env.GEMINI_API_KEY) {
          return new Response(
            JSON.stringify({ error: "GEMINI_API_KEY secret set nahi hai." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        const body = await request.json();
        const promptText = body.prompt || "";
        const model = body.model || "gemini-2.5-flash";

        const apiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: promptText }]
                }
              ]
            })
          }
        );

        const data = await apiRes.json();
        return new Response(JSON.stringify(data), {
          status: apiRes.status,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message || "Server error" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};

