import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const QUOTE_SCRIPT_URL = process.env.QUOTE_SCRIPT_URL;
const SHEET_ID = "1j_ya2A8-hyTsR53BZh-pj9jp1163t6tGA2fBjDXmCaM";

const SCREEN_LOGIN_TOKEN = process.env.SCREEN_LOGIN_TOKEN;
const AUTH_COOKIE_SECRET = process.env.AUTH_COOKIE_SECRET;
const AUTH_COOKIE_NAME = "hg_screen_auth";

const MAIN_PATH = "/StudioPLT/PLT-OP-LP/Layer1";
const MESSAGE_PATH = "/StudioPLT/PLT-OP-LP/Message";
const LOGIN_PATH = "/StudioPLT/PLT-OP-LP/Login";

// ------------------------------------
// Auth helpers
// ------------------------------------
function sign(value) {
  return crypto
    .createHmac("sha256", AUTH_COOKIE_SECRET || "")
    .update(value)
    .digest("hex");
}

function createCookieValue() {
  const payload = "authorized";
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function verifyCookie(cookieValue) {
  if (!cookieValue || typeof cookieValue !== "string") return false;

  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) return false;

  return payload === "authorized" && signature === sign(payload);
}

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
// Server-side login route
// Use: /server-login?token=YOUR_SECRET_TOKEN
// ------------------------------------
app.get("/server-login", (req, res) => {
  try {
    const token = String(req.query.token || "");

    if (!SCREEN_LOGIN_TOKEN) {
      return res.status(500).send("Missing SCREEN_LOGIN_TOKEN");
    }

    if (!AUTH_COOKIE_SECRET) {
      return res.status(500).send("Missing AUTH_COOKIE_SECRET");
    }

    if (token !== SCREEN_LOGIN_TOKEN) {
      return res.status(401).send("Invalid token");
    }

    res.cookie(AUTH_COOKIE_NAME, createCookieValue(), {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // change to true if always using HTTPS
      maxAge: 1000 * 60 * 60 * 24 * 30,
      path: "/",
    });

    return res.send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Authorizing Device</title>
          <style>
            body {
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #000;
              color: #fff;
              font-family: Arial, sans-serif;
            }
            .card {
              text-align: center;
              padding: 32px;
              border: 1px solid rgba(255,255,255,0.12);
              background: rgba(255,255,255,0.05);
              border-radius: 24px;
              backdrop-filter: blur(10px);
            }
            .title {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 12px;
            }
            .sub {
              color: rgba(255,255,255,0.7);
              font-size: 18px;
            }
          </style>
          <script>
            setTimeout(() => {
              window.location.replace("${MAIN_PATH}");
            }, 1200);
          </script>
        </head>
        <body>
          <div class="card">
            <div class="title">Device authorized</div>
            <div class="sub">Logging in to main screen...</div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    return res.status(500).send(error.message || "Login error");
  }
});

// ------------------------------------
// Optional logout route
// ------------------------------------
app.get("/server-logout", (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
  return res.redirect(LOGIN_PATH);
});

// ------------------------------------
// Protect ONLY the main page
// Message page stays public
// APIs stay public
// ------------------------------------
app.use((req, res, next) => {
  const requestPath = req.path;

  const isMainPath =
    requestPath === MAIN_PATH || requestPath.startsWith(`${MAIN_PATH}/`);

  const isPublicPath =
    requestPath === MESSAGE_PATH ||
    requestPath.startsWith(`${MESSAGE_PATH}/`) ||
    requestPath === LOGIN_PATH ||
    requestPath.startsWith(`${LOGIN_PATH}/`) ||
    requestPath === "/server-login" ||
    requestPath === "/server-logout" ||
    requestPath.startsWith("/api/");

  if (!isMainPath || isPublicPath) {
    return next();
  }

  const cookieValue = req.cookies[AUTH_COOKIE_NAME];

  if (verifyCookie(cookieValue)) {
    return next();
  }

  return res.redirect(LOGIN_PATH);
});

// ------------------------------------
// API ROUTES
// ------------------------------------
app.get("/api/sheets", async (req, res) => {
  res.set("Cache-Control", "no-store");

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
        return res.json([]);
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
        .filter((q) => q.timeMs >= oneHourAgo && q.timeMs <= now + 300000)
        .sort((a, b) => b.timeMs - a.timeMs);

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

    const scriptUrl = QUOTE_SCRIPT_URL;

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
// SERVE FRONTEND
// ------------------------------------
app.use(express.static(path.join(__dirname, "dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ------------------------------------
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
