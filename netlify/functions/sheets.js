export default async (req) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const sheetId = "1j_ya2A8-hyTsR53BZh-pj9jp1163t6tGA2fBjDXmCaM";

    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    const fetchSheetRange = async (range) => {
      const encodedRange = encodeURIComponent(range);
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodedRange}?key=${apiKey}`;

      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Google Sheets error");
      }

      return data.values || [];
    };
    // --------------------------------------------------
    // LEADERBOARD
    // --------------------------------------------------

    if (type === "leaderboard") {
      const rows = await fetchSheetRange("Leaderboard!A:C");

      if (rows.length < 4) {
        return new Response(
          JSON.stringify({
            heading: "",
            subheading: "",
            leaders: [],
          }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const heading = String(rows[0]?.[1] || "").trim(); // B1
      const subheading = String(rows[1]?.[1] || "").trim(); // B2

      const headers = (rows[3] || []).map((h) => String(h || "").trim()); // row 4 = A4:C4

      const firstNameIndex = headers.indexOf("First Name");
      const lastNameIndex = headers.indexOf("Last Name");
      const visitsIndex = headers.indexOf("Total Visits");

      if (firstNameIndex === -1 || lastNameIndex === -1 || visitsIndex === -1) {
        return new Response(
          JSON.stringify({
            error:
              'Leaderboard tab must have headers on row 4 named exactly "First Name", "Last Name", and "Total Visits".',
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const sortedRows = rows
        .slice(4)
        .map((row) => ({
          firstName: String(row[firstNameIndex] || "").trim(),
          lastName: String(row[lastNameIndex] || "").trim(),
          visits: Number(row[visitsIndex] || 0),
        }))
        .filter((row) => row.firstName || row.lastName)
        .sort((a, b) => b.visits - a.visits);

      let previousVisits = null;
      let currentDenseRank = 0;

      const rankedRows = sortedRows.map((row) => {
        if (row.visits !== previousVisits) {
          currentDenseRank += 1;
        }

        previousVisits = row.visits;

        return {
          rank: currentDenseRank,
          name: `${row.firstName} ${row.lastName}`.trim(),
          visits: row.visits,
        };
      });

      const leaders = rankedRows.filter((row) => row.rank <= 10);

      return new Response(
        JSON.stringify({
          heading,
          subheading,
          leaders,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
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

      const headers = rows[0].map((h) => String(h || "").trim());
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

    // --------------------------------------------------
    // QUOTES (LAST 1 HOUR ONLY)
    // --------------------------------------------------
    if (type === "quotes") {
      const rows = await fetchSheetRange("Quotes!A:D");

      if (rows.length < 2) {
        return new Response(JSON.stringify([]), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const headers = rows[0].map((h) => String(h || "").trim());

      const timestampIndex = headers.indexOf("Timestamp");
      const displayNameIndex = headers.indexOf("Display Name");
      const quoteIndex = headers.indexOf("Quote");

      if (
        timestampIndex === -1 ||
        displayNameIndex === -1 ||
        quoteIndex === -1
      ) {
        return new Response(
          JSON.stringify({ error: "Invalid Quotes sheet format" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      const quotes = rows
        .slice(1)
        .map((row, index) => {
          const rawTime = String(row[timestampIndex] || "").trim();

          // 🔥 IMPORTANT: Use ISO parsing (reliable)
          const timeMs = Date.parse(rawTime);

          return {
            id: index + 1,
            timeMs,
            displayName: String(row[displayNameIndex] || "").trim(),
            quote: String(row[quoteIndex] || "").trim(),
          };
        })
        .filter((q) => q.quote)
        .filter((q) => !Number.isNaN(q.timeMs))
        .filter((q) => q.timeMs >= oneHourAgo && q.timeMs <= now)
        .sort((a, b) => b.timeMs - a.timeMs);

      return new Response(JSON.stringify(quotes), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Invalid type" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "Unexpected sheets function error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
