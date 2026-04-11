export default async (req) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const sheetId = "1j_ya2A8-hyTsR53BZh-pj9jp1163t6tGA2fBjDXmCaM";

    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    console.log("Requested type:", type);

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (type === "leaderboard") {
      const range = encodeURIComponent("Leaderboard!A:C");
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!res.ok) {
        return new Response(
          JSON.stringify({
            error: data.error?.message || "Google Sheets error",
          }),
          {
            status: res.status,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const rows = data.values || [];
      if (rows.length < 2) {
        return new Response(JSON.stringify([]), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const headers = rows[0];
      const firstNameIndex = headers.indexOf("First name");
      const lastNameIndex = headers.indexOf("Last name");
      const visitsIndex = headers.indexOf("Total visits");

      const leaderboard = rows
        .slice(1)
        .map((row) => ({
          firstName: String(row[firstNameIndex] || "").trim(),
          lastName: String(row[lastNameIndex] || "").trim(),
          visits: Number(row[visitsIndex] || 0),
        }))
        .filter((row) => row.firstName || row.lastName)
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10)
        .map((row, index) => ({
          rank: index + 1,
          name: `${row.firstName} ${row.lastName}`.trim(),
          visits: row.visits,
        }));

      return new Response(JSON.stringify(leaderboard), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (type === "routine") {
      const range = encodeURIComponent("Class Routine!A:E");
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!res.ok) {
        return new Response(
          JSON.stringify({
            error: data.error?.message || "Google Sheets error",
          }),
          {
            status: res.status,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const rows = data.values || [];
      if (rows.length < 2) {
        return new Response(JSON.stringify([]), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const headers = rows[0];
      const titleIndex = headers.indexOf("Title");
      const instructorIndex = headers.indexOf("Instructor");
      const startIndex = headers.indexOf("Start");
      const endIndex = headers.indexOf("End");
      const locationIndex = headers.indexOf("Location");

      const routine = rows
        .slice(1)
        .map((row, index) => ({
          id: index + 1,
          title: String(row[titleIndex] || "").trim(),
          instructor: String(row[instructorIndex] || "").trim(),
          start: String(row[startIndex] || "").trim(),
          end: String(row[endIndex] || "").trim(),
          location: String(row[locationIndex] || "").trim(),
        }))
        .filter((item) => item.title);

      return new Response(JSON.stringify(routine), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid type" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Sheets function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
