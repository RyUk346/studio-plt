export default async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const displayName = String(body.displayName || "").trim();
    const phoneNumber = String(body.phoneNumber || "").trim();
    const quote = String(body.quote || "").trim();

    if (!displayName || !phoneNumber || !quote) {
      return new Response(
        JSON.stringify({
          error: "Display name, phone number, and quote are required.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const scriptUrl = process.env.QUOTE_SCRIPT_URL;

    if (!scriptUrl) {
      return new Response(
        JSON.stringify({ error: "Missing QUOTE_SCRIPT_URL" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const upstreamRes = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName,
        phoneNumber,
        quote,
      }),
    });

    const text = await upstreamRes.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: upstreamRes.ok, raw: text };
    }

    if (!upstreamRes.ok || data.success === false) {
      return new Response(
        JSON.stringify({
          error: data.error || "Failed to submit quote to Apps Script",
          details: data,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "Unexpected submit-quote error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
