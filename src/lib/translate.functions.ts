import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  paragraphs: z.array(z.string().min(1).max(4000)).min(1).max(40),
  targetLocale: z.string().min(2).max(10),
  context: z.string().max(200).optional(),
});

/**
 * Translate article paragraphs into the requested locale via the Lovable AI Gateway.
 * Returns the same number of paragraphs in the target language.
 */
export const translateArticle = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => InputSchema.parse(raw))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "AI Gateway not configured", paragraphs: data.paragraphs };
    }

    const sys = `You are a professional editorial translator. Translate the user-provided JSON array of paragraphs into the language for locale code "${data.targetLocale}". Preserve meaning, tone and paragraph order exactly. Do NOT add commentary. Reply ONLY with a JSON object: {"paragraphs": string[]} with the same number of items.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: sys },
            {
              role: "user",
              content: JSON.stringify({
                context: data.context ?? "blog article",
                paragraphs: data.paragraphs,
              }),
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (res.status === 429) {
        return { ok: false as const, error: "Rate limited. Please try again in a moment.", paragraphs: data.paragraphs };
      }
      if (res.status === 402) {
        return { ok: false as const, error: "AI credits exhausted.", paragraphs: data.paragraphs };
      }
      if (!res.ok) {
        const text = await res.text();
        console.error("AI gateway error:", res.status, text);
        return { ok: false as const, error: `Translation failed (${res.status}).`, paragraphs: data.paragraphs };
      }

      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = json.choices?.[0]?.message?.content ?? "";
      let parsed: { paragraphs?: unknown };
      try { parsed = JSON.parse(content); } catch {
        return { ok: false as const, error: "Bad model response.", paragraphs: data.paragraphs };
      }
      const out = Array.isArray(parsed.paragraphs)
        ? parsed.paragraphs.filter((p): p is string => typeof p === "string")
        : [];
      if (out.length !== data.paragraphs.length) {
        // Pad / trim to keep order alignment.
        while (out.length < data.paragraphs.length) out.push(data.paragraphs[out.length] ?? "");
        out.length = data.paragraphs.length;
      }
      return { ok: true as const, paragraphs: out };
    } catch (e) {
      console.error("translate error:", e);
      return { ok: false as const, error: "Translation service unavailable.", paragraphs: data.paragraphs };
    }
  });
