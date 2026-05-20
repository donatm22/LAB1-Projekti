const express = require("express");

const router = express.Router();

const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODELS = [
  "google/gemma-4-26b-a4b-it:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
];
const MAX_MESSAGES = 12;
const MAX_CONTENT_LENGTH = 1200;

const systemPrompt = `
You are the helpful assistant for this event management app.
Help users discover events, understand tickets, registrations, speakers, venues,
payments, feedback, and general app navigation. Keep answers concise and practical.
If users ask for account-specific changes, tell them to use the app controls or contact an organizer.
`.trim();

const cleanMessages = (messages = []) =>
  messages
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: String(message.content || "").trim().slice(0, MAX_CONTENT_LENGTH),
    }))
    .filter((message) => message.content);

const getConfiguredModels = () => {
  const configuredModels = String(process.env.OPENROUTER_MODEL || "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  return [...new Set([...configuredModels, ...DEFAULT_MODELS])];
};

const isRetryableOpenRouterError = (status) =>
  status === 408 || status === 429 || status >= 500;

router.post("/", async (req, res, next) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "OpenRouter is not configured. Add OPENROUTER_API_KEY to backend/.env.",
      });
    }

    const messages = cleanMessages(req.body?.messages);

    if (!messages.length) {
      return res.status(400).json({ message: "Send at least one chat message." });
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL || "http://localhost:5173",
      "X-Title": process.env.APP_NAME || "Event Management App",
    };
    const requestMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];
    let lastError;

    for (const model of getConfiguredModels()) {
      const response = await fetch(OPENROUTER_CHAT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: requestMessages,
          temperature: 0.4,
          max_tokens: 350,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        lastError = {
          status: response.status,
          message: data?.error?.message || "OpenRouter request failed.",
          retryAfter: data?.error?.metadata?.retry_after_seconds,
        };

        if (isRetryableOpenRouterError(response.status)) {
          continue;
        }

        break;
      }

      const reply = data?.choices?.[0]?.message?.content?.trim();

      if (reply) {
        return res.json({ reply, model });
      }

      lastError = {
        status: 502,
        message: "OpenRouter returned an empty response.",
      };
    }

    res.status(lastError?.status || 502).json({
      message: lastError?.retryAfter
        ? `${lastError.message} Try again in ${Math.ceil(lastError.retryAfter)} seconds.`
        : lastError?.message || "OpenRouter request failed.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
