export default async (req) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const sheetId =
      req.queryStringParameters?.sheetId ||
      "1j_ya2A8-hyTsR53BZh-pj9jp1163t6tGA2fBjDXmCaM";
    const tabName = req.queryStringParameters?.tabName || "Leaderboard";

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Missing GOOGLE_API_KEY environment variable",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const range = encodeURIComponent(`${tabName}!A:C`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({
          error: `Google Sheets API error: ${response.status}`,
          details: errorText,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const data = await response.json();
    const rows = data.values || [];

    if (rows.length < 2) {
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const headers = rows[0].map((h) => String(h).trim());
    const firstNameIndex = headers.indexOf("First name");
    const lastNameIndex = headers.indexOf("Last name");
    const visitsIndex = headers.indexOf("Total visits");

    if (firstNameIndex === -1 || lastNameIndex === -1 || visitsIndex === -1) {
      return new Response(
        JSON.stringify({
          error:
            'Sheet must contain headers exactly named "First Name", "Last Name", and "Total Visits".',
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const leaderboard = rows
      .slice(1)
      .map((row) => ({
        firstName: String(row[firstNameIndex] || "").trim(),
        lastName: String(row[lastNameIndex] || "").trim(),
        visits: Number(row[visitsIndex] || 0),
      }))
      .filter((row) => row.firstName || row.lastName)
      .sort((a, b) => b.visits - a.visits)
      .map((row, index) => ({
        rank: index + 1,
        name: `${row.firstName} ${row.lastName}`.trim(),
        visits: row.visits,
      }));

    return new Response(JSON.stringify(leaderboard), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "Unexpected leaderboard function error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
