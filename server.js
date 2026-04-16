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

      const now = Date.now();
      const oneHourAgo = now - 3600000;

      const quotes = rows
        .slice(1)
        .map((r, i) => ({
          id: i + 1,
          time: Date.parse(r[0]),
          displayName: r[1],
          quote: r[3],
        }))
        .filter((q) => q.quote && q.time >= oneHourAgo)
        .sort((a, b) => b.time - a.time);

      return res.json(quotes);
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------- SUBMIT QUOTE ----------------
app.post("/api/submit-quote", async (req, res) => {
  try {
    if (!QUOTE_SCRIPT_URL) {
      return res.status(500).json({ error: "Missing QUOTE_SCRIPT_URL" });
    }

    const r = await fetch(QUOTE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await r.text();
    return res.send(text);
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
