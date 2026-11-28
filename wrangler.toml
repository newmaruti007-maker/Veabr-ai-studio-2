
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Gemini API endpoint
    if (url.pathname === "/api/generate") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: corsHeaders
        });
      }

      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
      }

      try {
        // Read Cloudflare Secret
        const apiKey = env.GEMINI_API_KEY;

        if (!apiKey) {
          return json({
            error: "GEMINI_API_KEY secret missing. Check Cloudflare Worker Secrets."
          }, 500);
        }

        const body = await request.json();
        const prompt = body.prompt;

        if (!prompt || typeof prompt !== "string") {
          return json({ error: "Prompt is required." }, 400);
        }

        const model =
          body.model === "gemini-2.5-flash"
            ? body.model
            : "gemini-2.5-flash";

        // Call Google Gemini API
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }]
                }
              ],
              generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 4096
              }
            })
          }
        );

        const result = await response.json();

        if (!response.ok) {
          return json({
            error:
              result?.error?.message ||
              "Gemini API request failed."
          }, response.status);
        }

        return json(result, 200);

      } catch (error) {
        return json({
          error: error.message || "Server error"
        }, 500);
      }
    }

    // Serve website files
    return env.ASSETS.fetch(request);
  }
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}
