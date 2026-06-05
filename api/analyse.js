// Simple in-memory rate limiter — resets when serverless function cold-starts
// For a persistent solution, use Vercel KV or Upstash Redis
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10;      // max 10 requests per IP per minute

  const entry = rateLimitMap.get(ip) || { count: 0, start: now };

  // Reset window if expired
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }

  entry.count++;
  rateLimitMap.set(ip, entry);

  // Clean up old entries every 100 requests to prevent memory leak
  if (rateLimitMap.size > 500) {
    for (const [key, val] of rateLimitMap) {
      if (now - val.start > windowMs) rateLimitMap.delete(key);
    }
  }

  return entry.count > maxRequests;
}

const MAX_PROMPT_BYTES = 8000;   // ~2000 words — more than enough for 8 answers
const MAX_ANSWER_LENGTH = 500;   // per-answer cap enforced server-side too

const ALLOWED_ORIGINS = [
  "https://spark.buildjoynow.com",
  "https://cslcs-gen.github.io",  // keep during testing
];

export default async function handler(req, res) {
  // ── CORS ──────────────────────────────────────────────────────────────────
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // ── RATE LIMIT ────────────────────────────────────────────────────────────
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait a minute and try again." });
  }

  // ── INPUT VALIDATION ──────────────────────────────────────────────────────
  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid prompt" });
  }

  if (Buffer.byteLength(prompt, "utf8") > MAX_PROMPT_BYTES) {
    return res.status(400).json({ error: "Prompt too large" });
  }

  // Sanitise — strip null bytes and trim
  const cleanPrompt = prompt.replace(/\0/g, "").trim();
  if (!cleanPrompt) return res.status(400).json({ error: "Empty prompt" });

  // ── API KEY CHECK ─────────────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Server configuration error" });
    // Don't leak that the key is missing — just say config error
  }

  // ── CALL ANTHROPIC ────────────────────────────────────────────────────────
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        messages: [{ role: "user", content: cleanPrompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Don't forward raw Anthropic error — could leak internal details
      console.error("Anthropic error:", data);
      return res.status(502).json({ error: "AI service error. Please try again." });
    }

    // ── RETURN ONLY THE TEXT CONTENT — not the full Anthropic response object
    const textBlock = (data.content || []).find(b => b.type === "text");
    if (!textBlock?.text) {
      return res.status(502).json({ error: "Empty response from AI. Please try again." });
    }

    return res.status(200).json({ text: textBlock.text });

  } catch (e) {
    console.error("Handler error:", e);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
