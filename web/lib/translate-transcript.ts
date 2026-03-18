/**
 * Translates call transcript lines to English for the iOS "English / Original" toggle.
 * Set OPENAI_API_KEY in the deployment environment (e.g. Vercel).
 */

type TranscriptLine = { role: string; message: string };

export async function translateTranscriptToEnglish(
  messages: TranscriptLine[]
): Promise<string[]> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key || messages.length === 0) {
    return messages.map((m) => m.message);
  }

  const payload = messages.map((m, i) => ({ index: i, text: m.message }));

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TRANSLATE_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You translate restaurant phone call transcript lines into clear, natural English.
Preserve speaker intent, names, numbers, dates, and times accurately.
Output ONLY valid JSON: {"translations":[{"index":number,"text":"English here"},...]}
Include one entry per input index, same order as input.`,
          },
          {
            role: "user",
            content: JSON.stringify(payload),
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[translate-transcript] OpenAI error:", res.status, err);
      return messages.map((m) => m.message);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) {
      return messages.map((m) => m.message);
    }

    const parsed = JSON.parse(raw) as {
      translations?: { index: number; text: string }[];
    };
    const list = parsed.translations;
    if (!Array.isArray(list) || list.length === 0) {
      return messages.map((m) => m.message);
    }

    const byIndex = new Map<number, string>();
    for (const item of list) {
      if (typeof item.index === "number" && typeof item.text === "string") {
        byIndex.set(item.index, item.text);
      }
    }

    return messages.map((m, i) => byIndex.get(i)?.trim() || m.message);
  } catch (e) {
    console.error("[translate-transcript] Failed:", e);
    return messages.map((m) => m.message);
  }
}
