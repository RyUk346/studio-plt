import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const QUOTE_SCRIPT_URL = process.env.QUOTE_SCRIPT_URL;
const SHEET_ID = "1j_ya2A8-hyTsR53BZh-pj9jp1163t6tGA2fBjDXmCaM";

// ------------------------------------
// Fetch Google Sheets
// ------------------------------------
const fetchSheetRange = async (range) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    range,
  )}?key=${GOOGLE_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Google Sheets error");
  }

  return data.values || [];
};

// ------------------------------------
// API ROUTES
// ------------------------------------
app.get("/api/sheets", async (req, res) => {
  res.set("Cache-Control", "no-store"); // Force VPS to always get fresh data
  try {
    const type = req.query.type;

    if (!GOOGLE_API_KEY) {
      return res.status(500).json({ error: "Missing API key" });
    }

    // ---------------- LEADERBOARD ----------------
    if (type === "leaderboard") {
      const rows = await fetchSheetRange("Leaderboard!A:C");

      if (rows.length < 4) {
        return res.json({ heading: "", subheading: "", leaders: [] });
      }

      const heading = String(rows[0]?.[1] || "").trim();
      const subheading = String(rows[1]?.[1] || "").trim();
      const headers = rows[3];

      const firstNameIndex = headers.indexOf("First Name");
      const lastNameIndex = headers.indexOf("Last Name");
      const visitsIndex = headers.indexOf("Total Visits");

      let sorted = rows
        .slice(4)
        .map((r) => ({
          name: `${r[firstNameIndex] || ""} ${r[lastNameIndex] || ""}`.trim(),
          visits: Number(r[visitsIndex] || 0),
        }))
        .filter((r) => r.name)
        .sort((a, b) => b.visits - a.visits);

      let prev = null;
      let rank = 0;

      const leaders = sorted
        .map((r) => {
          if (r.visits !== prev) rank++;
          prev = r.visits;
          return { ...r, rank };
        })
        .filter((r) => r.rank <= 10);

      return res.json({ heading, subheading, leaders });
    }

    // ---------------- ROUTINE ----------------
    if (type === "routine") {
      const rows = await fetchSheetRange("Class Routine!A:E");

      if (rows.length < 2) {
        return res.json([]);
      }

      const headers = rows[0].map((h) => String(h || "").trim());

      const dayIndex = headers.indexOf("DayOfWeek");
      const classNameIndex = headers.indexOf("ClassName");
      const instructorIndex = headers.indexOf("Instructor");
      const startTimeIndex = headers.indexOf("StartTime");
      const durationIndex = headers.indexOf("Duration");

      if (
        dayIndex === -1 ||
        classNameIndex === -1 ||
        instructorIndex === -1 ||
        startTimeIndex === -1 ||
        durationIndex === -1
      ) {
        return res.status(400).json({
          error:
            'Class Routine tab must contain headers exactly named "DayOfWeek", "ClassName", "Instructor", "StartTime", and "Duration".',
          headersFound: headers,
        });
      }

      const routine = rows
        .slice(1)
        .map((row, i) => ({
          id: i + 1,
          dayOfWeek: String(row[dayIndex] || "").trim(),
          title: String(row[classNameIndex] || "").trim(),
          instructor: String(row[instructorIndex] || "").trim(),
          startTime: String(row[startTimeIndex] || "").trim(),
          duration: Number(row[durationIndex] || 0),
        }))
        .filter(
          (item) =>
            item.dayOfWeek &&
            item.title &&
            item.startTime &&
            !Number.isNaN(item.duration) &&
            item.duration > 0,
        );

      return res.json(routine);
    }

    // ---------------- QUOTES ----------------
    if (type === "quotes") {
      const rows = await fetchSheetRange("Quotes!A:D");

      if (rows.length < 2) {
        return res.json([]); // ✅ Fixed: Use res.json instead of new Response
      }

      const headers = rows[0].map((h) => String(h || "").trim());
      const timestampIndex = headers.indexOf("Timestamp");
      const displayNameIndex = headers.indexOf("Display Name");
      const quoteIndex = headers.indexOf("Quote");

      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      const quotes = rows
        .slice(1)
        .map((row, index) => {
          const rawTime = String(row[timestampIndex] || "").trim();

          // We try to parse the time.
          // If it's UTC from Apps Script, Date.parse handles it.
          let timeMs = Date.parse(rawTime);

          return {
            id: index + 1,
            timeMs,
            displayName: String(row[displayNameIndex] || "").trim(),
            quote: String(row[quoteIndex] || "").trim(),
          };
        })
        .filter((q) => q.quote)
        .filter((q) => !Number.isNaN(q.timeMs))
        // Filter for last 1 hour, allowing 5 mins future buffer for clock sync
        .filter((q) => q.timeMs >= oneHourAgo && q.timeMs <= now + 300000)
        .sort((a, b) => b.timeMs - a.timeMs);

      return res.json(quotes); // ✅ Fixed: Use res.json
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------- SUBMIT QUOTE ----------------
app.post("/api/submit-quote", async (req, res) => {
  try {
    const body = req.body || null;

    if (!body) {
      return res.status(400).json({ error: "Invalid JSON body" });
    }

    const displayName = String(body.displayName || "").trim();
    const phoneNumber = String(body.phoneNumber || "").trim();
    const quote = String(body.quote || "").trim();

    if (!displayName || !phoneNumber || !quote) {
      return res.status(400).json({
        error: "Display name, phone number, and quote are required.",
      });
    }

    const scriptUrl = process.env.QUOTE_SCRIPT_URL;

    if (!scriptUrl) {
      return res.status(500).json({ error: "Missing QUOTE_SCRIPT_URL" });
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
      return res.status(500).json({
        error: data.error || "Failed to submit quote to Apps Script",
        details: data,
      });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unexpected submit-quote error",
    });
  }
});

// ------------------------------------
// SERVE FRONTEND (IMPORTANT FIX HERE)
// ------------------------------------
app.use(express.static(path.join(__dirname, "dist")));

// ✅ Express 5 SAFE wildcard route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ------------------------------------
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
