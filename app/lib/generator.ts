// Centralized generator helper used by server routes.
// Exports a single `generatePlan` function that wraps API calls, retries, extraction, and config.
type GenerateResult = {
  plan: string[];
  modelUsed: string;
  tokenBudget: "low" | "high";
};

type RawApiResponse = any;

async function callModel(
  apiKey: string,
  modelName: string,
  instruction: string,
  temperature: number,
  maxOutputTokens: number,
) {
  const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
    modelName,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [{ parts: [{ text: instruction }] }],
    generationConfig: { temperature, maxOutputTokens },
  };

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/* -- Extraction helpers (conservative) -- */

function collectAllStrings(obj: any, out: string[] = []) {
  if (obj == null) return out;
  if (typeof obj === "string") {
    out.push(obj);
    return out;
  }
  if (Array.isArray(obj)) {
    for (const el of obj) collectAllStrings(el, out);
    return out;
  }
  if (typeof obj === "object") {
    for (const k of Object.keys(obj)) collectAllStrings(obj[k], out);
  }
  return out;
}

function isSentenceLike(s: string): boolean {
  if (!s) return false;
  const t = s.trim();
  if (t.length < 12) return false;
  if (!/\s/.test(t)) return false;
  if (!/[a-zA-Z]/.test(t)) return false;
  if (/[.!?,"']/.test(t)) return true;
  const wordCount = t.split(/\s+/).length;
  return wordCount >= 3;
}

function looksLikeIdentifier(s: string): boolean {
  if (!s) return false;
  const t = s.trim();
  if (/\s/.test(t)) return false;
  if (/^[A-Za-z0-9_\-:.]{8,200}$/.test(t)) return true;
  return false;
}

function chooseBestStringFromResponse(obj: any): string | null {
  const all = collectAllStrings(obj)
    .map((s) => (s || "").trim())
    .filter(Boolean);
  if (all.length === 0) return null;

  const sentenceLike = all.filter(isSentenceLike);
  if (sentenceLike.length > 0) {
    sentenceLike.sort((a, b) => b.length - a.length);
    return sentenceLike[0];
  }

  const shortBlacklist = new Set([
    "model",
    "assistant",
    "user",
    "system",
    "tool",
    "null",
    "undefined",
    "true",
    "false",
    "text",
    "message",
    "TEXT",
  ]);

  const nonId = all
    .filter((s) => !looksLikeIdentifier(s))
    .filter((s) => !shortBlacklist.has(s.toLowerCase()));
  if (nonId.length > 0) {
    nonId.sort((a, b) => b.length - a.length);
    return nonId[0];
  }

  return null;
}

/* -- Public API -- */

export async function generatePlan(
  userPrompt: string,
): Promise<GenerateResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_API_KEY in environment");

  // Configurable via env (defaults safe and sensible)
  const modelName = process.env.MODEL_NAME || "gemini-2.5-flash";
  const fallbackModels = (process.env.FALLBACK_MODELS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const maxOutputTokensLow = Number(process.env.MAX_OUTPUT_TOKENS_LOW ?? 200);
  const maxOutputTokensHigh = Number(process.env.MAX_OUTPUT_TOKENS_HIGH ?? 800);
  const temperature = Number(process.env.TEMPERATURE ?? 0.2);
  const maxRetries = Math.max(1, Number(process.env.MODEL_RETRIES ?? 1));

  const instruction = `You are an AI travel planner. Given a short user idea, produce a short, user-friendly trip itinerary of 3 to 5 concise bullet points. Output only the itinerary lines, each on its own line, with no JSON, metadata, labels, or commentary. Each bullet should be one short sentence. Keep it practical and focused. User idea: "${userPrompt}"`;

  const modelsToTry = [modelName, ...fallbackModels];

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const resLow = await callModel(
        apiKey,
        model,
        instruction,
        temperature,
        maxOutputTokensLow,
      );
      if (!resLow.ok) {
        const text = await resLow.text();
        throw new Error(`Upstream API error (${resLow.status}): ${text}`);
      }
      const dataLow: RawApiResponse = await resLow.json();

      let rawText = null;
      if (dataLow?.candidates?.[0]?.content?.parts?.[0]?.text) {
        rawText = dataLow.candidates[0].content.parts[0].text;
      } else if (dataLow?.candidates?.[0]?.text) {
        rawText = dataLow.candidates[0].text;
      } else if (
        Array.isArray(dataLow?.output) &&
        dataLow.output[0]?.content?.[0]?.text
      ) {
        rawText = dataLow.output[0].content[0].text;
      } else {
        rawText = chooseBestStringFromResponse(dataLow);
      }

      if (rawText) {
        const lines = rawText
          .split(/\r?\n/)
          .map((l: string) => l.trim())
          .filter(Boolean)
          .map((l: string) => l.replace(/^[-•\s]+/, "").trim())
          .slice(0, 5);
        return { plan: lines, modelUsed: model, tokenBudget: "low" as const };
      }

      const finishReasons = (dataLow?.candidates || [])
        .map((c: any) => c.finishReason)
        .filter(Boolean);
      const hadMaxTokens = finishReasons.some((r: string) =>
        (r || "").toUpperCase().includes("MAX_TOKENS"),
      );

      if (hadMaxTokens) {
        const resHigh = await callModel(
          apiKey,
          model,
          instruction,
          temperature,
          maxOutputTokensHigh,
        );
        if (!resHigh.ok) {
          const text = await resHigh.text();
          throw new Error(`Upstream API error (${resHigh.status}): ${text}`);
        }
        const dataHigh: RawApiResponse = await resHigh.json();

        let rawTextHigh = null;
        if (dataHigh?.candidates?.[0]?.content?.parts?.[0]?.text) {
          rawTextHigh = dataHigh.candidates[0].content.parts[0].text;
        } else if (dataHigh?.candidates?.[0]?.text) {
          rawTextHigh = dataHigh.candidates[0].text;
        } else if (
          Array.isArray(dataHigh?.output) &&
          dataHigh.output[0]?.content?.[0]?.text
        ) {
          rawTextHigh = dataHigh.output[0].content[0].text;
        } else {
          rawTextHigh = chooseBestStringFromResponse(dataHigh);
        }

        if (rawTextHigh) {
          const lines = rawTextHigh
            .split(/\r?\n/)
            .map((l: string) => l.trim())
            .filter(Boolean)
            .map((l: string) => l.replace(/^[-•\s]+/, "").trim())
            .slice(0, 5);
          return {
            plan: lines,
            modelUsed: model,
            tokenBudget: "high" as const,
          };
        }
      }
    }
  }

  throw new Error("No usable text found in upstream responses");
}
