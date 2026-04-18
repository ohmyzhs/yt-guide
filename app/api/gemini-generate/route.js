export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const model = body?.model || "gemini-2.5-flash";
    const payload = body?.payload;

    if (!payload || typeof payload !== "object") {
      return Response.json({ error: "Missing payload" }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return Response.json({ error: "Gemini request failed", details: data }, { status: response.status });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json(
      {
        error: "Unexpected server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
