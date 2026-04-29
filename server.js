import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const QUOTE_SCRIPT_URL = process.env.QUOTE_SCRIPT_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SHEET_ID = "1j_ya2A8-hyTsR53BZh-pj9jp1163t6tGA2fBjDXmCaM";

const SCREEN_LOGIN_TOKEN = process.env.SCREEN_LOGIN_TOKEN;
const AUTH_COOKIE_SECRET = process.env.AUTH_COOKIE_SECRET;
const AUTH_COOKIE_NAME = "hg_screen_auth";

const MAIN_PATH = "/StudioPLT/PLT-OP-LP/Layer1";
const MESSAGE_PATH = "/StudioPLT/PLT-OP-LP/Message";
const LOGIN_PATH = "/StudioPLT/PLT-OP-LP/Login";

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const bannedWords = [
  "fuck",
  "shit",
  "bitch",
  "bastard",
  "asshole",
  "ashole",
  "cunt",
  "dick",
  "piss",
  "slut",
  "whore",
];

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[!1|]/g, "i")
    .replace(/[$5]/g, "s")
    .replace(/[0]/g, "o")
    .replace(/[^a-z0-9]/g, "");
}

function collapseRepeats(text = "") {
  return text.replace(/(.)\1+/g, "$1");
}

function isMessageSafe(text = "") {
  const cleanText = collapseRepeats(normalizeText(text));
  return !bannedWords.some((word) => cleanText.includes(word));
}

async function isAiMessageSafe(text = "") {
  const cleanText = String(text || "").trim();

  if (!cleanText) return true;

  if (!openai) {
    console.warn("OPENAI_API_KEY missing. Holding for review.");
    return "unknown";
  }

  try {
    const moderation = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: cleanText,
    });

    return !moderation.results?.[0]?.flagged;
  } catch (error) {
    console.error("AI moderation failed:", error?.message || error);
    return "unknown";
  }
}


async function moderateMessage(text = "") {
  if (!openai) return { status: "unknown", filtered: "" };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a strict moderator for a public LED display.

Step 1: Correct spelling and grammar.
Step 2: Evaluate if the message is suitable.

Allow ONLY:
- positive
- motivational
- encouraging

Reject anything negative, critical, inappropriate.

Respond in JSON format ONLY:
{
  "status": "approved" OR "rejected",
  "filtered": "corrected message"
}
          `,
        },
        { role: "user", content: text },
      ],
      temperature: 0,
    });

    const raw = response.choices[0].message.content.trim();

    try {
      return JSON.parse(raw);
    } catch {
      console.error("LLM JSON parse failed:", raw);
      return { status: "unknown", filtered: "" };
    }

  } catch (error) {
    console.error("LLM failed:", error.message);
    return { status: "unknown", filtered: "" };
  }
}

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

function parseSheetDate(dateStr) {
  if (!dateStr) return NaN;

  const raw = String(dateStr).trim();

  const normalDate = new Date(raw).getTime();
  if (!Number.isNaN(normalDate)) return normalDate;

  const parts = raw.split(/[\s/:]+/).map(Number);

  if (parts.length < 5) return NaN;

  const [day, month, year, hour, minute, second = 0] = parts;

  return new Date(year, month - 1, day, hour, minute, second).getTime();
}

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
      secure: false,
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

app.get("/server-logout", (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
  return res.redirect(LOGIN_PATH);
});

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

app.get("/api/sheets", async (req, res) => {
  res.set("Cache-Control", "no-store");

  try {
    const type = req.query.type;

    if (!GOOGLE_API_KEY) {
      return res.status(500).json({ error: "Missing API key" });
    }

    if (type === "leaderboard") {
      const rows = await fetchSheetRange("Leaderboard!A:F");

      if (rows.length < 4) {
        return res.json({
          heading: "",
          subheading: "",
          leaders: [],
          milestones: {
            gold: 40,
            silver: 25,
            bronze: 10,
          },
        });
      }

      const heading = String(rows[0]?.[1] || "").trim();
      const subheading = String(rows[1]?.[1] || "").trim();

      const milestones = {
        gold: Number(rows[0]?.[5] || 40),
        silver: Number(rows[1]?.[5] || 25),
        bronze: Number(rows[2]?.[5] || 10),
      };

      const headers = rows[3];

      const firstNameIndex = headers.indexOf("First Name");
      const lastNameIndex = headers.indexOf("Last Name");
      const visitsIndex = headers.indexOf("Total Visits");

      const sorted = rows
        .slice(4)
        .map((r) => ({
          name: `${r[firstNameIndex] || ""} ${r[lastNameIndex] || ""}`.trim(),
          visits: Number(r[visitsIndex] || 0),
        }))
        .filter((r) => r.name && r.visits > 0)
        .sort((a, b) => b.visits - a.visits);

      return res.json({
        heading,
        subheading,
        leaders: sorted,
        milestones,
      });
    }

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

    if (type === "quotes") {
      const rows = await fetchSheetRange("Quotes!A:G");

      if (rows.length < 2) {
        return res.json([]);
      }

      const headers = rows[0].map((h) => String(h || "").trim());

      const timestampIndex = headers.indexOf("Timestamp");
      const displayNameIndex = headers.indexOf("Display Name");
      const filteredIndex = headers.indexOf("Filtered Message");
      const statusIndex = headers.indexOf("Status");

      const quotes = rows
        .slice(1)
        .map((row, index) => {
          const rawTime = String(row[timestampIndex] || "").trim();
          const timeMs = parseSheetDate(rawTime);

          return {
            id: index + 1,
            timeMs,
            displayName: String(row[displayNameIndex] || "").trim(),
            quote: String(row[filteredIndex] || "").trim(),
            status:
              statusIndex !== -1 && row.length > statusIndex
                ? String(row[statusIndex] || "").trim().toLowerCase()
                : "approved",
          };
        })
        .filter((q) => q.quote)
        .filter((q) => q.status === "approved")
        .filter((q) => isMessageSafe(q.quote) && isMessageSafe(q.displayName))
        .filter((q) => !Number.isNaN(q.timeMs))
        .filter((q) => q.timeMs >= Date.now() - 120 * 60 * 1000)
        .sort((a, b) => b.timeMs - a.timeMs);

      return res.json(quotes);
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/submit-quote", async (req, res) => {
  try {
    const body = req.body || null;

    if (!body) {
      return res.status(400).json({
        success: false,
        error: "Invalid JSON body",
      });
    }

    const displayName = String(body.displayName || "").trim();
    const email = String(body.email || "").trim();
    const quote = String(body.quote || "").trim();

    if (!displayName || !email || !quote) {
      return res.status(400).json({
        success: false,
        error: "Display name, email, and quote are required.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address.",
      });
    }

    if (!isMessageSafe(displayName) || !isMessageSafe(quote)) {
      return res.status(400).json({
        success: false,
        error: "This message is against our policy.",
      });
    }

    const aiNameSafe = await isAiMessageSafe(displayName);
    const aiQuoteSafe = await isAiMessageSafe(quote);
    const llmResult = await moderateMessage(quote);

const filteredQuote = llmResult.filtered;
const llmStatus = llmResult.status;

   let status = "approved";
let reason = "";

// Safety filter
if (aiNameSafe === false || aiQuoteSafe === false) {
  status = "rejected";
  reason = "ai_rejected";
}

// AI failure
if (aiNameSafe === "unknown" || aiQuoteSafe === "unknown") {
  status = "pending";
  reason = "ai_unknown";
}

// 🔴 LLM decision
if (llmStatus === "rejected") {
  status = "rejected";
  reason = "llm_rejected";
}

if (llmStatus === "unknown") {
  status = "pending";
  reason = "llm_unknown";
}

    if (!QUOTE_SCRIPT_URL) {
      return res.status(500).json({
        success: false,
        error: "Missing QUOTE_SCRIPT_URL",
      });
    }

    const upstreamRes = await fetch(QUOTE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  displayName,
  email,
  originalMessage: quote,
  filteredMessage: status === "approved" ? filteredQuote : "",
  status,
  reason,
})
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
        success: false,
        error: data.error || "Failed to submit quote to Apps Script",
        details: data,
      });
    }

    if (status === "rejected") {
      return res.status(400).json({
        success: false,
        error: "This message is against our policy.",
      });
    }

    if (status === "pending") {
      return res.json({
        success: true,
        message: "Your message has been submitted for review.",
      });
    }

    return res.json({
      success: true,
      message: "Thank you! Your message has been submitted.",
    });
  } catch (error) {
    console.error("submit-quote error:", error);

    return res.status(500).json({
      success: false,
      error: "Moderation check failed. Please try again.",
    });
  }
});

app.use(express.static(path.join(__dirname, "dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});