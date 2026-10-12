import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 3000;
const API_TOKEN = process.env.JARVIS_API_TOKEN || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "JARVIS AI", model: MODEL });
});

function authorized(req) {
  if (!API_TOKEN) return false;
  const header = req.get("authorization") || "";
  return header === `Bearer ${API_TOKEN}`;
}

app.post("/api/chat", async (req, res) => {
  if (!authorized(req)) {
    return res.status(401).json({ error: "Unauthorized: check JARVIS server token." });
  }
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: "Server owner must set GEMINI_API_KEY." });
  }

  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-8) : [];
  if (!message) return res.status(400).json({ error: "Message is empty." });
  if (message.length > 6000) return res.status(413).json({ error: "Message is too long (max 6000 characters)." });

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: "You are JARVIS, a helpful Android voice assistant. Reply naturally and concisely. When the user writes Hindi or Hinglish, answer in simple Hindi/Hinglish using Roman letters unless they ask for Devanagari. Never claim you performed a phone action unless the app confirms it."
    });
    const validHistory = history
      .filter(x => x && ["user", "model"].includes(x.role) && typeof x.text === "string")
      .map(x => ({ role: x.role, parts: [{ text: x.text.slice(0, 3000) }] }));
    const chat = model.startChat({ history: validHistory });
    const result = await chat.sendMessage(message);
    const text = result.response.text();
    return res.json({ reply: text, model: MODEL });
  } catch (err) {
    console.error("Gemini request failed:", err?.message || err);
    const message = String(err?.message || "");
    if (/429|quota|rate limit/i.test(message)) {
      return res.status(429).json({ error: "AI quota/rate limit reached. Wait and try again, or check your Gemini API quota." });
    }
    return res.status(502).json({ error: "AI provider request failed. Check server logs and API key/model settings." });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`JARVIS AI server listening on ${PORT}; model=${MODEL}`);
});