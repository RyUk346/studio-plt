export default async (req) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const sheetId = "1j_ya2A8-hyTsR53BZh-pj9jp1163t6tGA2fBjDXmCaM";
    const type = req.queryStringParameters?.type;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
      });
    }

    // ---------------- LEADERBOARD ----------------
    if (type === "leaderboard") {
      const range = encodeURIComponent("Leaderboard!A:C");
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

      const res = await fetch(url);
      const data = await res.json();
      const rows = data.values || [];

      const headers = rows[0];
      const firstNameIndex = headers.indexOf("First Name");
      const lastNameIndex = headers.indexOf("Last Name");
      const visitsIndex = headers.indexOf("Total Visits");

      const leaderboard = rows
        .slice(1)
        .map((row) => ({
          firstName: row[firstNameIndex],
          lastName: row[lastNameIndex],
          visits: Number(row[visitsIndex] || 0),
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10)
        .map((row, index) => ({
          rank: index + 1,
          name: `${row.firstName} ${row.lastName}`,
          visits: row.visits,
        }));

      return new Response(JSON.stringify(leaderboard));
    }

    // ---------------- CLASS ROUTINE ----------------
    if (type === "routine") {
      const range = encodeURIComponent("Class Routine!A:E");
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

      const res = await fetch(url);
      const data = await res.json();
      const rows = data.values || [];

      const headers = rows[0];

      const titleIndex = headers.indexOf("Title");
      const instructorIndex = headers.indexOf("Instructor");
      const startIndex = headers.indexOf("Start");
      const endIndex = headers.indexOf("End");
      const locationIndex = headers.indexOf("Location");

      const routine = rows
        .slice(1)
        .map((row, index) => ({
          id: index,
          title: row[titleIndex],
          instructor: row[instructorIndex],
          start: row[startIndex],
          end: row[endIndex],
          location: row[locationIndex],
        }))
        .filter((item) => item.title);

      return new Response(JSON.stringify(routine));
    }

    return new Response(JSON.stringify({ error: "Invalid type" }), {
      status: 400,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};
