export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/generate" && request.method === "POST") {
      try {
        if (!env.GEMINI_API_KEY) {
          return Response.json(
            { error: "GEMINI_API_KEY secret missing" },
            { status: 500 }
          );
        }

        const body = await request.json();

        const prompt =
          body.prompt ||
          body.topic ||
          body.text ||
          "";

        if (!prompt.trim()) {
          return Response.json(
            { error: "Prompt is empty" },
            { status: 400 }
          );
        }

        const instruction = `
You are Vabra AI Studio.
Create a high-quality AI result for the user's request.

Mode: ${body.mode || "AI Content"}
Language: ${body.language || "Gujarati"}
Length: ${body.length || "10 seconds"}
Aspect ratio: ${body.ratio || "16:9"}
Style: ${body.style || "Cinematic"}

User request:
${prompt}

Give a useful, creative and ready-to-use output.
`;

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: instruction }]
                }
              ],
              generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 2048
              }
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return Response.json(
            {
              error: data.error?.message || "Gemini API error"
            },
            { status: response.status }
          );
        }

        const result =
          data.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("") || "AI response empty";

        return Response.json({ result });

      } catch (error) {
        return Response.json(
          { error: error.message || "Server error" },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
